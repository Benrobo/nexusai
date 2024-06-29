-- Drop function
DROP FUNCTION IF EXISTS match_embeddings;

-- Create function
CREATE OR REPLACE FUNCTION match_embeddings (
  query_embedding text,
  match_threshold float,
  match_count int,
  kb_ids text[]
)
RETURNS TABLE (
  result json
)
LANGUAGE SQL STABLE
AS $$
  SELECT json_build_object(
    'id', public."knowledge_base_data".id,
    'similarity', 1 - (public."knowledge_base_data".embedding <=> query_embedding::vector),
    'content', string_to_array(public."knowledge_base_data".content, '.'),
    'metadata', public."knowledge_base_data".title
  ) AS result
  FROM
    public."knowledge_base_data"
  WHERE
    public."knowledge_base_data".kb_id = ANY(kb_ids) AND
    1 - (public."knowledge_base_data".embedding <=> query_embedding::vector) > match_threshold
  ORDER BY
    1 - (public."knowledge_base_data".embedding <=> query_embedding::vector) DESC
  LIMIT
    match_count;
$$;
