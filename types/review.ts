export interface Review {
  id: number;
  product_id: number;
  user_id: number;
  rating: Rating;
  comment: string;
  created_at: Date;
  updated_at: Date;
}

export type Rating = 1 | 2 | 3 | 4 | 5;
