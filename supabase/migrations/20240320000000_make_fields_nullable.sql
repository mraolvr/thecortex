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
ALTER COLUMN completed_date DROP NOT NULL,
ALTER COLUMN created_at DROP NOT NULL,
ALTER COLUMN updated_at DROP NOT NULL,
ALTER COLUMN last_ai_analysis DROP NOT NULL,
ALTER COLUMN actionable_items_text DROP NOT NULL;

-- Add comments
COMMENT ON TABLE public.books IS 'Books table with all fields nullable'; 