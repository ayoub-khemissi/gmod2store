export interface ApiKey {
  id: number;
  user_id: number;
  name: string;
  key_hash: string;
  key_prefix: string;
  rate_limit: number;
  is_active: boolean;
  created_at: Date;
}
