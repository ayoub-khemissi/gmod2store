export type TransactionStatus = "pending" | "completed" | "refunded" | "failed";

export interface Transaction {
  id: number;
  buyer_id: number;
  product_id: number;
  amount: number;
  platform_fee: number;
  seller_amount: number;
  status: TransactionStatus;
  stripe_payment_id: string | null;
  stripe_session_id: string | null;
  created_at: Date;
}

export interface Payout {
  id: number;
  seller_id: number;
  amount: number;
  status: "pending" | "processing" | "completed" | "failed";
  stripe_payout_id: string | null;
  created_at: Date;
  completed_at: Date | null;
}
