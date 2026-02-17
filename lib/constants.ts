export const USER_ROLES = ["buyer", "creator", "admin"] as const;

export const PRODUCT_STATUSES = [
  "draft",
  "pending",
  "published",
  "rejected",
] as const;

export const PRODUCT_CATEGORIES = [
  "gamemodes",
  "tools",
  "entities",
  "ui",
  "maps",
  "weapons",
] as const;

export const TICKET_STATUSES = [
  "open",
  "in_progress",
  "resolved",
  "escalated",
] as const;

export const TICKET_CATEGORIES = [
  "general",
  "bug_report",
  "partnership",
  "other",
] as const;

export const TRANSACTION_STATUSES = [
  "pending",
  "completed",
  "refunded",
  "failed",
] as const;

export const PLATFORM_FEE_PERCENTAGE = 10;
