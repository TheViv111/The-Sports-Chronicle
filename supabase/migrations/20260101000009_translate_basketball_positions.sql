UPDATE blog_posts
SET translations = $json$::jsonb
WHERE slug = 'basketball-positions-and-their-roles-a-complete-guide';