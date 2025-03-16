export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  price: number;
  is_premium: boolean;
  duration_weeks: number;
  thumbnail_url: string;
  instructor_name: string;
  instructor_bio: string;
  instructor_avatar: string;
  created_at: string;
  status: 'draft' | 'published' | 'archived';
  visibility: string;
  what_you_will_learn: string[];
  requirements: string[];
  target_audience: string[];
  estimated_hours: number;
  has_lifetime_access: boolean;
  has_assignments: boolean;
  has_projects: boolean;
  has_certificate: boolean;
  has_mentorship: boolean;
  rating: number;
  total_reviews: number;
  total_students: number;
  last_updated: string;
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  description: string;
  order_number: number;
  content: string;
  duration_minutes: number;
  created_at: string;
  status: 'draft' | 'published' | 'archived';
  estimated_time?: number;
  user_progress?: {
    id: string;
    user_id: string;
    completed: boolean;
    updated_at: string;
  }[];
}

export interface UserProgress {
  id: string;
  user_id: string;
  module_id: string;
  completed: boolean;
  quiz_score?: number;
  created_at: string;
  updated_at: string;
}

export interface Certificate {
  id: string;
  user_id: string;
  course_id: string;
  issued_at: string;
  certificate_url: string;
}

export interface CoursePurchase {
  id: string;
  user_id: string;
  course_id: string;
  purchase_date: string;
  amount_paid: number;
  payment_status: 'pending' | 'completed' | 'failed';
  payment_method: string;
  transaction_id: string;
}