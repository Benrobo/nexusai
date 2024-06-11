-- Create function responsible for similarity search on embeddings.
-- The function is based on the cosine similarity between two vectors.

-- Drop function
DROP FUNCTION IF EXISTS match_embeddings;
-- Create function
CREATE OR REPLACE FUNCTION match_embeddings (
  query_embedding text,
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  result json
)
LANGUAGE SQL STABLE
AS $$
  SELECT json_build_object(
    'id', public."knowledge_base_data".id,
    'similarity', 1 - (public."knowledge_base_data".embedding <=> query_embedding::vector),
    'content', string_to_array(public."knowledge_base_data".content, '.')
    -- 'metadata', public."DatasourceMetaData".metadata::json,
  ) AS result
  FROM
    public."knowledge_base_data"
    -- Metadata wasn't included in our schema, but would give this a try.
--   INNER JOIN 
--     public."DatasourceMetaData" ON public."Datasource".id = public."DatasourceMetaData".data_source_id
  WHERE
    1 - (public."knowledge_base_data".embedding <=> query_embedding::vector) > match_threshold
  ORDER BY
    1 - (public."knowledge_base_data".embedding <=> query_embedding::vector) DESC
  LIMIT
    match_count;
$$;
