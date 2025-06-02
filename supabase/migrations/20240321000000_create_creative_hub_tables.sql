-- Create enum types for song and book statuses
CREATE TYPE song_status AS ENUM ('draft', 'in_progress', 'completed');
CREATE TYPE book_status AS ENUM ('draft', 'in_progress', 'completed', 'published');

-- Create songs table
CREATE TABLE songs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    lyrics TEXT,
    status song_status DEFAULT 'draft',
    tempo INTEGER,
    key TEXT,
    mood TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create song_ideas table
CREATE TABLE song_ideas (
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

-- Create books table
CREATE TABLE books (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status book_status DEFAULT 'draft',
    genre TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create characters table
CREATE TABLE characters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
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

-- Create chapters table
CREATE TABLE chapters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    chapter_number INTEGER,
    status book_status DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create world_building table
CREATE TABLE world_building (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT CHECK (type IN ('setting', 'lore', 'map', 'culture', 'other')),
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create character_relationships table
CREATE TABLE character_relationships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    character1_id UUID REFERENCES characters(id) ON DELETE CASCADE,
    character2_id UUID REFERENCES characters(id) ON DELETE CASCADE,
    relationship_type TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    UNIQUE(character1_id, character2_id)
);

-- Create RLS policies
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE song_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE world_building ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_relationships ENABLE ROW LEVEL SECURITY;

-- Create policies for songs
CREATE POLICY "Users can view their own songs"
    ON songs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own songs"
    ON songs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own songs"
    ON songs FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own songs"
    ON songs FOR DELETE
    USING (auth.uid() = user_id);

-- Create policies for song_ideas
CREATE POLICY "Users can view their own song ideas"
    ON song_ideas FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own song ideas"
    ON song_ideas FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own song ideas"
    ON song_ideas FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own song ideas"
    ON song_ideas FOR DELETE
    USING (auth.uid() = user_id);

-- Create policies for books
CREATE POLICY "Users can view their own books"
    ON books FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own books"
    ON books FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own books"
    ON books FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own books"
    ON books FOR DELETE
    USING (auth.uid() = user_id);

-- Create policies for characters
CREATE POLICY "Users can view characters from their books"
    ON characters FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM books
        WHERE books.id = characters.book_id
        AND books.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert characters to their books"
    ON characters FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM books
        WHERE books.id = characters.book_id
        AND books.user_id = auth.uid()
    ));

CREATE POLICY "Users can update characters from their books"
    ON characters FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM books
        WHERE books.id = characters.book_id
        AND books.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete characters from their books"
    ON characters FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM books
        WHERE books.id = characters.book_id
        AND books.user_id = auth.uid()
    ));

-- Create policies for chapters
CREATE POLICY "Users can view chapters from their books"
    ON chapters FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM books
        WHERE books.id = chapters.book_id
        AND books.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert chapters to their books"
    ON chapters FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM books
        WHERE books.id = chapters.book_id
        AND books.user_id = auth.uid()
    ));

CREATE POLICY "Users can update chapters from their books"
    ON chapters FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM books
        WHERE books.id = chapters.book_id
        AND books.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete chapters from their books"
    ON chapters FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM books
        WHERE books.id = chapters.book_id
        AND books.user_id = auth.uid()
    ));

-- Create policies for world_building
CREATE POLICY "Users can view world building from their books"
    ON world_building FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM books
        WHERE books.id = world_building.book_id
        AND books.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert world building to their books"
    ON world_building FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM books
        WHERE books.id = world_building.book_id
        AND books.user_id = auth.uid()
    ));

CREATE POLICY "Users can update world building from their books"
    ON world_building FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM books
        WHERE books.id = world_building.book_id
        AND books.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete world building from their books"
    ON world_building FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM books
        WHERE books.id = world_building.book_id
        AND books.user_id = auth.uid()
    ));

-- Create policies for character_relationships
CREATE POLICY "Users can view character relationships from their books"
    ON character_relationships FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM books
        WHERE books.id = character_relationships.book_id
        AND books.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert character relationships to their books"
    ON character_relationships FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM books
        WHERE books.id = character_relationships.book_id
        AND books.user_id = auth.uid()
    ));

CREATE POLICY "Users can update character relationships from their books"
    ON character_relationships FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM books
        WHERE books.id = character_relationships.book_id
        AND books.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete character relationships from their books"
    ON character_relationships FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM books
        WHERE books.id = character_relationships.book_id
        AND books.user_id = auth.uid()
    )); 