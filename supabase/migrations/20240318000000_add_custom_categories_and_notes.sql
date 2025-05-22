-- Add custom_categories and notes columns to books table
ALTER TABLE public.books 
ADD COLUMN custom_categories TEXT[] DEFAULT '{}',
ADD COLUMN notes TEXT DEFAULT '';

-- Add comments to explain the columns
COMMENT ON COLUMN public.books.custom_categories IS 'Array of user-defined book categories';
COMMENT ON COLUMN public.books.notes IS 'User notes and thoughts about the book'; 