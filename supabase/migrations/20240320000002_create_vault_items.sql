-- Create vault_items table
CREATE TABLE IF NOT EXISTS vault_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    details TEXT,
    file_path TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS vault_items_user_id_idx ON vault_items(user_id);
CREATE INDEX IF NOT EXISTS vault_items_category_idx ON vault_items(category);
CREATE INDEX IF NOT EXISTS vault_items_created_at_idx ON vault_items(created_at);

-- Enable Row Level Security
ALTER TABLE vault_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own vault items"
    ON vault_items FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vault items"
    ON vault_items FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vault items"
    ON vault_items FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vault items"
    ON vault_items FOR DELETE
    USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_vault_items_updated_at
    BEFORE UPDATE ON vault_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 