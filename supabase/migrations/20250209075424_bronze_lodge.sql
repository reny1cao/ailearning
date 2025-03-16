-- Add estimated_time to modules if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'modules' AND column_name = 'estimated_time'
  ) THEN
    ALTER TABLE modules ADD COLUMN estimated_time integer;
  END IF;
END $$;

-- Update existing modules with estimated time
UPDATE modules 
SET estimated_time = 60 -- Default 60 minutes
WHERE estimated_time IS NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_modules_order_number 
ON modules(course_id, order_number);

-- Ensure proper status values
ALTER TABLE modules 
DROP CONSTRAINT IF EXISTS modules_status_check,
ADD CONSTRAINT modules_status_check 
CHECK (status IN ('draft', 'published', 'archived'));