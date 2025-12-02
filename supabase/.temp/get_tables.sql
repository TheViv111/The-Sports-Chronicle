-- Query to get all tables in the public schema
SELECT 
    table_name,
    table_type
FROM 
    information_schema.tables
WHERE 
    table_schema = 'public'
ORDER BY 
    table_name;
