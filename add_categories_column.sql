-- Add categories column to books table
ALTER TABLE public.books 
ADD COLUMN categories TEXT[] DEFAULT '{}';

-- Add comment to explain the column
COMMENT ON COLUMN public.books.categories IS 'Array of book categories/genres from Google Books API'; 