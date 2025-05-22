-- Function to search contacts
CREATE OR REPLACE FUNCTION search_contacts(search_term TEXT)
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
    AND (
        c.name ILIKE '%' || search_term || '%'
        OR c.email ILIKE '%' || search_term || '%'
        OR c.phone ILIKE '%' || search_term || '%'
        OR c.company ILIKE '%' || search_term || '%'
    )
    ORDER BY c.favorite DESC, c.name ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get contacts by category
CREATE OR REPLACE FUNCTION get_contacts_by_category(category_id TEXT)
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
    AND (category_id = 'all' OR c.category = category_id)
    ORDER BY c.favorite DESC, c.name ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get favorite contacts
CREATE OR REPLACE FUNCTION get_favorite_contacts()
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
    AND c.favorite = true
    ORDER BY c.name ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get contacts by communication cadence
CREATE OR REPLACE FUNCTION get_contacts_by_cadence(cadence communication_cadence)
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
    AND c.communication_cadence = cadence
    ORDER BY c.favorite DESC, c.name ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get contacts due for follow-up
CREATE OR REPLACE FUNCTION get_contacts_due_for_followup()
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
    updated_at TIMESTAMPTZ,
    days_since_last_contact INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.*,
        cc.name as category_name,
        cc.icon as category_icon,
        cc.color as category_color,
        EXTRACT(DAY FROM (CURRENT_DATE - c.last_contact_date))::INTEGER as days_since_last_contact
    FROM contacts c
    LEFT JOIN contact_categories cc ON c.category = cc.id
    WHERE c.user_id = auth.uid()
    AND (
        (c.communication_cadence = 'daily' AND CURRENT_DATE - c.last_contact_date >= 1)
        OR (c.communication_cadence = 'weekly' AND CURRENT_DATE - c.last_contact_date >= 7)
        OR (c.communication_cadence = 'biweekly' AND CURRENT_DATE - c.last_contact_date >= 14)
        OR (c.communication_cadence = 'monthly' AND CURRENT_DATE - c.last_contact_date >= 30)
        OR (c.communication_cadence = 'quarterly' AND CURRENT_DATE - c.last_contact_date >= 90)
        OR (c.communication_cadence = 'annually' AND CURRENT_DATE - c.last_contact_date >= 365)
    )
    ORDER BY c.favorite DESC, days_since_last_contact DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 