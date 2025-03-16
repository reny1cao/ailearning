# Database Migrations

This directory contains SQL migrations for the ailearning application.

## How to Apply Migrations

Since we're not using the Supabase CLI in this project, you'll need to apply migrations manually through the Supabase dashboard.

### Applying Migration for `user_notes` Table

1. Log in to your [Supabase dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to the SQL Editor section
4. Create a new query
5. Paste the contents of `create_user_notes.sql` into the query editor
6. Click "Run" to execute the migration

## Migration Files

- `create_user_notes.sql`: Creates the `user_notes` table for storing user notes, highlights, and bookmarks for course modules

## Table Structure: user_notes

The `user_notes` table stores user-created annotations for course content:

| Column     | Type      | Description                              |
| ---------- | --------- | ---------------------------------------- |
| id         | UUID      | Primary key                              |
| user_id    | UUID      | Reference to auth.users(id)              |
| course_id  | UUID      | Course ID                                |
| module_id  | UUID      | Module ID                                |
| content    | TEXT      | Note content                             |
| type       | TEXT      | Type: 'note', 'highlight', or 'bookmark' |
| selection  | TEXT      | Selected text (for highlights)           |
| created_at | TIMESTAMP | Creation timestamp                       |
| updated_at | TIMESTAMP | Last update timestamp                    |

## Row-Level Security (RLS) Policies

The following policies are applied to the `user_notes` table:

- Users can only view their own notes
- Users can only insert notes with their own user_id
- Users can only update their own notes
- Users can only delete their own notes 