-- Add category field to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Other';

-- Create index for category field
CREATE INDEX IF NOT EXISTS tasks_category_idx ON tasks(category); 