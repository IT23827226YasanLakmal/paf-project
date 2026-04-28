-- ============================================================
-- Clean up Canteens and Gyms from Resources
-- ============================================================

DELETE FROM resources 
WHERE name LIKE '%Canteen%' 
   OR name LIKE '%Gym%' 
   OR name LIKE '%Cafe%';
