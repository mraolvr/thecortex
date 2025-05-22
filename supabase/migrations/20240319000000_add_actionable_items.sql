-- Make all fields nullable
ALTER TABLE public.books
ALTER COLUMN title DROP NOT NULL,
ALTER COLUMN author DROP NOT NULL,
ALTER COLUMN total_pages DROP NOT NULL,
ALTER COLUMN current_page DROP NOT NULL,
ALTER COLUMN progress DROP NOT NULL,
ALTER COLUMN status DROP NOT NULL,
ALTER COLUMN cover_url DROP NOT NULL,
ALTER COLUMN synopsis DROP NOT NULL,
ALTER COLUMN google_books_id DROP NOT NULL,
ALTER COLUMN categories DROP NOT NULL,
ALTER COLUMN custom_categories DROP NOT NULL,
ALTER COLUMN notes DROP NOT NULL,
ALTER COLUMN rating DROP NOT NULL,
ALTER COLUMN start_date DROP NOT NULL,
ALTER COLUMN last_read_date DROP NOT NULL,
ALTER COLUMN completed_date DROP NOT NULL;

-- Add actionable_items column
ALTER TABLE public.books
ADD COLUMN actionable_items JSONB DEFAULT '[]'::jsonb,
ADD COLUMN last_ai_analysis TIMESTAMP WITH TIME ZONE;

-- Add comments
COMMENT ON COLUMN public.books.actionable_items IS 'Array of actionable items extracted from the book';
COMMENT ON COLUMN public.books.last_ai_analysis IS 'Timestamp of the last AI analysis of the book'; 