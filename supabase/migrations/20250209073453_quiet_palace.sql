-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_modules_course_id ON modules(course_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_module_id ON user_progress(module_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);

-- Add composite index for user progress lookups
CREATE INDEX IF NOT EXISTS idx_user_progress_user_module ON user_progress(user_id, module_id);

-- Ensure proper cascade behavior
ALTER TABLE user_progress
DROP CONSTRAINT IF EXISTS user_progress_module_id_fkey,
ADD CONSTRAINT user_progress_module_id_fkey 
  FOREIGN KEY (module_id) 
  REFERENCES modules(id) 
  ON DELETE CASCADE;

-- Create function to get course progress
CREATE OR REPLACE FUNCTION get_course_progress(p_course_id uuid, p_user_id uuid)
RETURNS TABLE (
  total_modules bigint,
  completed_modules bigint,
  progress numeric
) AS $$
BEGIN
  RETURN QUERY
  WITH module_counts AS (
    SELECT 
      COUNT(m.id) as total,
      COUNT(CASE WHEN up.completed THEN 1 END) as completed
    FROM modules m
    LEFT JOIN user_progress up ON up.module_id = m.id AND up.user_id = p_user_id
    WHERE m.course_id = p_course_id
  )
  SELECT 
    total,
    completed,
    CASE 
      WHEN total > 0 THEN (completed::numeric / total::numeric) * 100
      ELSE 0
    END as progress
  FROM module_counts;
END;
$$ LANGUAGE plpgsql;