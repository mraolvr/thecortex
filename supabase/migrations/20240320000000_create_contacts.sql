-- Create enum for communication cadence
CREATE TYPE communication_cadence AS ENUM (
    'daily',
    'weekly',
    'biweekly',
    'monthly',
    'quarterly',
    'annually',
    'as-needed'
);

-- Create categories table first
CREATE TABLE contact_categories (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    color TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default categories
INSERT INTO contact_categories (id, name, icon, color, is_default) VALUES
    ('all', 'All Contacts', 'Users', '#6366f1', true),
    ('family', 'Family', 'Heart', '#ef4444', true),
    ('friends', 'Friends', 'Users', '#10b981', true),
    ('work', 'Work', 'Briefcase', '#f59e0b', true),
    ('church', 'Church', 'Church', '#8b5cf6', true);

-- Create contacts table with proper foreign key reference
CREATE TABLE contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    company TEXT,
    category TEXT NOT NULL DEFAULT 'friends' REFERENCES contact_categories(id) ON DELETE RESTRICT,
    communication_cadence communication_cadence NOT NULL DEFAULT 'monthly',
    last_contact_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    photo_url TEXT,
    favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX contacts_user_id_idx ON contacts(user_id);
CREATE INDEX contacts_category_idx ON contacts(category);
CREATE INDEX contacts_favorite_idx ON contacts(favorite);
CREATE INDEX contact_categories_user_id_idx ON contact_categories(user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_contacts_updated_at
    BEFORE UPDATE ON contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contact_categories_updated_at
    BEFORE UPDATE ON contact_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create RLS (Row Level Security) policies
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_categories ENABLE ROW LEVEL SECURITY;

-- Create policies for contacts
CREATE POLICY "Users can view their own contacts"
    ON contacts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contacts"
    ON contacts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contacts"
    ON contacts FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contacts"
    ON contacts FOR DELETE
    USING (auth.uid() = user_id);

-- Create policies for contact categories
CREATE POLICY "Users can view their own categories"
    ON contact_categories FOR SELECT
    USING (auth.uid() = user_id OR is_default = true);

CREATE POLICY "Users can insert their own categories"
    ON contact_categories FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories"
    ON contact_categories FOR UPDATE
    USING (auth.uid() = user_id AND is_default = false);

CREATE POLICY "Users can delete their own categories"
    ON contact_categories FOR DELETE
    USING (auth.uid() = user_id AND is_default = false);

-- Create function to get contacts with category information
CREATE OR REPLACE FUNCTION get_contacts_with_categories()
RETURNS TABLE (
    id UUID,
    user_id UUID,
    name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    company TEXT,
    category TEXT,
    category_name TEXT,
    category_icon TEXT,
    category_color TEXT,
    communication_cadence communication_cadence,
    last_contact_date DATE,
    notes TEXT,
    photo_url TEXT,
    favorite BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.*,
        cc.name as category_name,
        cc.icon as category_icon,
        cc.color as category_color
    FROM contacts c
    LEFT JOIN contact_categories cc ON c.category = cc.id
    WHERE c.user_id = auth.uid()
    ORDER BY c.favorite DESC, c.name ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 