-- Migration: Convert existing timestamps from Europe/Berlin (UTC+2) to UTC
-- Run this ONCE to migrate existing data
-- VPS timezone: Europe/Berlin (CEST = UTC+2 during summer)
-- 
-- IMPORTANT: Run this AFTER restarting the backend with new entity definitions
-- The backend will auto-update column types via synchronize: true

-- Disable safe update mode temporarily
SET SQL_SAFE_UPDATES = 0;

-- luck_spins: subtract 2 hours to convert local time to UTC
UPDATE luck_spins 
SET created_at = DATE_SUB(created_at, INTERVAL 2 HOUR)
WHERE created_at IS NOT NULL;

-- votes: subtract 2 hours  
UPDATE votes 
SET created_at = DATE_SUB(created_at, INTERVAL 2 HOUR)
WHERE created_at IS NOT NULL;

-- orders: subtract 2 hours from both timestamps
UPDATE orders 
SET 
  createdAt = DATE_SUB(createdAt, INTERVAL 2 HOUR),
  updatedAt = DATE_SUB(updatedAt, INTERVAL 2 HOUR)
WHERE createdAt IS NOT NULL;

-- server_status_logs: subtract 2 hours
UPDATE server_status_logs 
SET created_at = DATE_SUB(created_at, INTERVAL 2 HOUR)
WHERE created_at IS NOT NULL;

-- server_status_hourly: subtract 2 hours
UPDATE server_status_hourly 
SET hour = DATE_SUB(hour, INTERVAL 2 HOUR)
WHERE hour IS NOT NULL;

-- Re-enable safe update mode
SET SQL_SAFE_UPDATES = 1;

-- Verify migration (check a few records)
SELECT 'luck_spins' as table_name, COUNT(*) as count, MIN(created_at) as min_date, MAX(created_at) as max_date FROM luck_spins
UNION ALL
SELECT 'votes', COUNT(*), MIN(created_at), MAX(created_at) FROM votes
UNION ALL
SELECT 'orders', COUNT(*), MIN(createdAt), MAX(createdAt) FROM orders
UNION ALL
SELECT 'server_status_logs', COUNT(*), MIN(created_at), MAX(created_at) FROM server_status_logs;
