-- Create enum types for song and creative writing statuses
CREATE TYPE creative_song_status AS ENUM ('draft', 'in_progress', 'completed');
CREATE TYPE creative_writing_status AS ENUM ('draft', 'in_progress', 'completed', 'published');

-- Create creative_songs table
CREATE TABLE creative_songs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    lyrics TEXT,
    status creative_song_status DEFAULT 'draft',
    tempo INTEGER,
    key TEXT,
    mood TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create song_ideas table
CREATE TABLE creative_song_ideas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('melody', 'chord_progression', 'title', 'other')),
    audio_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create creative_writing table
CREATE TABLE creative_writing (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status creative_writing_status DEFAULT 'draft',
    genre TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create creative_characters table
CREATE TABLE creative_characters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    writing_id UUID REFERENCES creative_writing(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT CHECK (role IN ('main', 'supporting', 'minor')),
    description TEXT,
    background TEXT,
    physical_description TEXT,
    personality TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create creative_chapters table
CREATE TABLE creative_chapters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    writing_id UUID REFERENCES creative_writing(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    chapter_number INTEGER,
    status creative_writing_status DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create creative_world_building table
CREATE TABLE creative_world_building (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    writing_id UUID REFERENCES creative_writing(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT CHECK (type IN ('setting', 'lore', 'map', 'culture', 'other')),
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create creative_character_relationships table
CREATE TABLE creative_character_relationships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    writing_id UUID REFERENCES creative_writing(id) ON DELETE CASCADE,
    character1_id UUID REFERENCES creative_characters(id) ON DELETE CASCADE,
    character2_id UUID REFERENCES creative_characters(id) ON DELETE CASCADE,
    relationship_type TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    UNIQUE(character1_id, character2_id)
);

-- Create RLS policies
ALTER TABLE creative_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE creative_song_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE creative_writing ENABLE ROW LEVEL SECURITY;
ALTER TABLE creative_characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE creative_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE creative_world_building ENABLE ROW LEVEL SECURITY;
ALTER TABLE creative_character_relationships ENABLE ROW LEVEL SECURITY;

-- Create policies for creative_songs
CREATE POLICY "Users can view their own creative songs"
    ON creative_songs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own creative songs"
    ON creative_songs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own creative songs"
    ON creative_songs FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own creative songs"
    ON creative_songs FOR DELETE
    USING (auth.uid() = user_id);

-- Create policies for creative_song_ideas
CREATE POLICY "Users can view their own creative song ideas"
    ON creative_song_ideas FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own creative song ideas"
    ON creative_song_ideas FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own creative song ideas"
    ON creative_song_ideas FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own creative song ideas"
    ON creative_song_ideas FOR DELETE
    USING (auth.uid() = user_id);

-- Create policies for creative_writing
CREATE POLICY "Users can view their own creative writing"
    ON creative_writing FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own creative writing"
    ON creative_writing FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own creative writing"
    ON creative_writing FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own creative writing"
    ON creative_writing FOR DELETE
    USING (auth.uid() = user_id);

-- Create policies for creative_characters
CREATE POLICY "Users can view characters from their creative writing"
    ON creative_characters FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM creative_writing
        WHERE creative_writing.id = creative_characters.writing_id
        AND creative_writing.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert characters to their creative writing"
    ON creative_characters FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM creative_writing
        WHERE creative_writing.id = creative_characters.writing_id
        AND creative_writing.user_id = auth.uid()
    ));

CREATE POLICY "Users can update characters from their creative writing"
    ON creative_characters FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM creative_writing
        WHERE creative_writing.id = creative_characters.writing_id
        AND creative_writing.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete characters from their creative writing"
    ON creative_characters FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM creative_writing
        WHERE creative_writing.id = creative_characters.writing_id
        AND creative_writing.user_id = auth.uid()
    ));

-- Create policies for creative_chapters
CREATE POLICY "Users can view chapters from their creative writing"
    ON creative_chapters FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM creative_writing
        WHERE creative_writing.id = creative_chapters.writing_id
        AND creative_writing.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert chapters to their creative writing"
    ON creative_chapters FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM creative_writing
        WHERE creative_writing.id = creative_chapters.writing_id
        AND creative_writing.user_id = auth.uid()
    ));

CREATE POLICY "Users can update chapters from their creative writing"
    ON creative_chapters FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM creative_writing
        WHERE creative_writing.id = creative_chapters.writing_id
        AND creative_writing.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete chapters from their creative writing"
    ON creative_chapters FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM creative_writing
        WHERE creative_writing.id = creative_chapters.writing_id
        AND creative_writing.user_id = auth.uid()
    ));

-- Create policies for creative_world_building
CREATE POLICY "Users can view world building from their creative writing"
    ON creative_world_building FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM creative_writing
        WHERE creative_writing.id = creative_world_building.writing_id
        AND creative_writing.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert world building to their creative writing"
    ON creative_world_building FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM creative_writing
        WHERE creative_writing.id = creative_world_building.writing_id
        AND creative_writing.user_id = auth.uid()
    ));

CREATE POLICY "Users can update world building from their creative writing"
    ON creative_world_building FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM creative_writing
        WHERE creative_writing.id = creative_world_building.writing_id
        AND creative_writing.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete world building from their creative writing"
    ON creative_world_building FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM creative_writing
        WHERE creative_writing.id = creative_world_building.writing_id
        AND creative_writing.user_id = auth.uid()
    ));

-- Create policies for creative_character_relationships
CREATE POLICY "Users can view character relationships from their creative writing"
    ON creative_character_relationships FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM creative_writing
        WHERE creative_writing.id = creative_character_relationships.writing_id
        AND creative_writing.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert character relationships to their creative writing"
    ON creative_character_relationships FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM creative_writing
        WHERE creative_writing.id = creative_character_relationships.writing_id
        AND creative_writing.user_id = auth.uid()
    ));

CREATE POLICY "Users can update character relationships from their creative writing"
    ON creative_character_relationships FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM creative_writing
        WHERE creative_writing.id = creative_character_relationships.writing_id
        AND creative_writing.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete character relationships from their creative writing"
    ON creative_character_relationships FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM creative_writing
        WHERE creative_writing.id = creative_character_relationships.writing_id
        AND creative_writing.user_id = auth.uid()
    )); 