-- Update the base content to remove all style attributes
UPDATE blog_posts 
SET content = regexp_replace(content, 'style="[^"]*"', '', 'g');

-- Update all translations to remove all style attributes from their content
UPDATE blog_posts
SET translations = (
  SELECT jsonb_object_agg(
    key,
    jsonb_set(
      value,
      '{content}',
      to_jsonb(regexp_replace(value->>'content', 'style="[^"]*"', '', 'g'))
    )
  )
  FROM jsonb_each(translations)
)
WHERE translations IS NOT NULL AND translations != '{}'::jsonb;
