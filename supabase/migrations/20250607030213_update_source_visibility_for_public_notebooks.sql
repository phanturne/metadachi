-- Add trigger to sync visibility when sources are added to notebooks
CREATE OR REPLACE FUNCTION sync_source_visibility_on_add()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the source's visibility based on the notebook's visibility
    UPDATE sources
    SET visibility = (
        SELECT visibility
        FROM notebooks
        WHERE id = NEW.notebook_id
    )
    WHERE id = NEW.source_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for when sources are added to notebooks
CREATE TRIGGER sync_source_visibility_on_add
    AFTER INSERT ON notebook_sources
    FOR EACH ROW
    EXECUTE FUNCTION sync_source_visibility_on_add(); 