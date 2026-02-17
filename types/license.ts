export interface License {
  id: number;
  product_id: number;
  user_id: number;
  license_key: string;
  is_active: boolean;
  created_at: Date;
  revoked_at: Date | null;
}
