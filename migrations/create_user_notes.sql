-- Create user_notes table
CREATE TABLE IF NOT EXISTS public.user_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL,
  module_id UUID NOT NULL,
  content TEXT NOT NULL,
  type TEXT CHECK (type IN ('note', 'highlight', 'bookmark')),
  selection TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.user_notes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see only their own notes
CREATE POLICY "Users can view their own notes" ON public.user_notes
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own notes
CREATE POLICY "Users can insert their own notes" ON public.user_notes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own notes
CREATE POLICY "Users can update their own notes" ON public.user_notes
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to delete their own notes
CREATE POLICY "Users can delete their own notes" ON public.user_notes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX user_notes_user_id_idx ON public.user_notes(user_id);
CREATE INDEX user_notes_course_id_idx ON public.user_notes(course_id);
CREATE INDEX user_notes_module_id_idx ON public.user_notes(module_id); 