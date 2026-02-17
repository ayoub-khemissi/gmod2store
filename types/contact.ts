export interface Contact {
  id: number;
  user_id: number | null;
  email: string;
  name: string;
  category: string;
  subject: string;
  message: string;
  is_resolved: boolean;
  created_at: Date;
}
