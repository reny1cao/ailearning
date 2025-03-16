export interface CourseAnalytics {
  id: string;
  course_id: string;
  total_enrollments: number;
  active_students: number;
  completion_rate: number;
  average_rating: number;
  total_revenue: number;
  updated_at: string;
}