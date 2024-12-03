-- Function to get recently visited items across all types
CREATE OR REPLACE FUNCTION get_recent_items(
    p_user_id UUID,
    p_limit INT DEFAULT 10
)
RETURNS TABLE (
    item_id UUID,
    item_type TEXT,
    name VARCHAR(100),
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    (
        -- Notes
        SELECT 
            n.note_id as item_id,
            'note' as item_type,
            n.name,
            n.created_at,
            n.updated_at
        FROM notes n
        WHERE n.user_id = p_user_id
        
        UNION ALL
        
        -- Projects
        SELECT 
            p.project_id,
            'project' as item_type,
            p.name,
            p.created_at,
            p.updated_at
        FROM projects p
        WHERE p.user_id = p_user_id
        
        UNION ALL
        
        -- Areas
        SELECT 
            a.area_id,
            'area' as item_type,
            a.name,
            a.created_at,
            a.updated_at
        FROM areas a
        WHERE a.user_id = p_user_id
        
        UNION ALL
        
        -- Resources
        SELECT 
            r.resource_id,
            'resource' as item_type,
            r.name,
            r.created_at,
            r.updated_at
        FROM resources r
        WHERE r.user_id = p_user_id
    )
    ORDER BY updated_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;