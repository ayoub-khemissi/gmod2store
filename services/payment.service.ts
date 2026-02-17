import Stripe from "stripe";
import { RowDataPacket } from "mysql2/promise";

import { query, execute, transaction } from "@/lib/db";
import { PLATFORM_FEE_PERCENTAGE } from "@/lib/constants";
import { createLicense } from "@/services/license.service";
import { createNotification } from "@/services/notification.service";
import type { Transaction } from "@/types/payment";

interface TransactionRow extends RowDataPacket, Transaction {}

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-01-28.clover",
  });
}

export async function createCheckoutSession(
  buyerId: number,
  productId: number,
  productTitle: string,
  price: number,
  sellerId: number,
): Promise<string> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const platformFee = Math.round(price * (PLATFORM_FEE_PERCENTAGE / 100) * 100);

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: productTitle },
          unit_amount: Math.round(price * 100),
        },
        quantity: 1,
      },
    ],
    metadata: {
      buyer_id: buyerId.toString(),
      product_id: productId.toString(),
      seller_id: sellerId.toString(),
      platform_fee: platformFee.toString(),
    },
    success_url: `${appUrl}/library?purchased=true`,
    cancel_url: `${appUrl}/product/${productTitle}`,
  });

  // Record pending transaction
  const sellerAmount = price - price * (PLATFORM_FEE_PERCENTAGE / 100);

  await execute(
    `INSERT INTO transactions (buyer_id, product_id, amount, platform_fee, seller_amount, status, stripe_session_id)
     VALUES (?, ?, ?, ?, ?, 'pending', ?)`,
    [
      buyerId,
      productId,
      price,
      price * (PLATFORM_FEE_PERCENTAGE / 100),
      sellerAmount,
      session.id,
    ],
  );

  return session.url!;
}

export async function handleWebhook(
  payload: string,
  signature: string,
): Promise<void> {
  const event = getStripe().webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET ?? "",
  );

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    await fulfillPurchase(session);
  }
}

async function fulfillPurchase(
  session: Stripe.Checkout.Session,
): Promise<void> {
  const buyerId = Number(session.metadata?.buyer_id);
  const productId = Number(session.metadata?.product_id);

  if (!buyerId || !productId) return;

  await transaction(async (conn) => {
    // Update transaction status
    await conn.execute(
      "UPDATE transactions SET status = 'completed', stripe_payment_id = ? WHERE stripe_session_id = ?",
      [session.payment_intent, session.id],
    );

    // Create license
    await createLicense(productId, buyerId);

    // Increment sales count
    await conn.execute(
      "UPDATE products SET sales_count = sales_count + 1 WHERE id = ?",
      [productId],
    );
  });

  // Get product title for notification
  const products = await query<(RowDataPacket & { title: string })[]>(
    "SELECT title FROM products WHERE id = ?",
    [productId],
  );

  if (products[0]) {
    await createNotification({
      user_id: buyerId,
      type: "purchase",
      title: "Purchase Complete",
      message: `You now own "${products[0].title}". Check your library to download.`,
      link: "/library",
    });
  }
}

export async function getTransactionHistory(
  userId: number,
  type: "buyer" | "seller" = "buyer",
): Promise<Transaction[]> {
  const column = type === "buyer" ? "buyer_id" : "product_id IN (SELECT id FROM products WHERE seller_id = ?)";
  const sql =
    type === "buyer"
      ? "SELECT * FROM transactions WHERE buyer_id = ? ORDER BY created_at DESC"
      : `SELECT t.* FROM transactions t JOIN products p ON p.id = t.product_id WHERE p.seller_id = ? ORDER BY t.created_at DESC`;

  return query<TransactionRow[]>(sql, [userId]);
}

export async function requestPayout(
  sellerId: number,
  amount: number,
): Promise<void> {
  await execute(
    "INSERT INTO payouts (seller_id, amount, status) VALUES (?, ?, 'pending')",
    [sellerId, amount],
  );
}
