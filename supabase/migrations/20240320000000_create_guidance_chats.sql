-- Create guidance_chats table
CREATE TABLE IF NOT EXISTS guidance_chats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    agent_type TEXT NOT NULL,
    title TEXT NOT NULL,
    messages JSONB DEFAULT '[]'::jsonb,
    favorite BOOLEAN DEFAULT false,
    archived BOOLEAN DEFAULT false,
    archived_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_guidance_chats_user_id ON guidance_chats(user_id);
CREATE INDEX IF NOT EXISTS idx_guidance_chats_agent_type ON guidance_chats(agent_type);
CREATE INDEX IF NOT EXISTS idx_guidance_chats_favorite ON guidance_chats(favorite);
CREATE INDEX IF NOT EXISTS idx_guidance_chats_archived ON guidance_chats(archived);

-- Enable Row Level Security
ALTER TABLE guidance_chats ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own chats"
    ON guidance_chats FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chats"
    ON guidance_chats FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chats"
    ON guidance_chats FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chats"
    ON guidance_chats FOR DELETE
    USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_guidance_chats_updated_at
    BEFORE UPDATE ON guidance_chats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 