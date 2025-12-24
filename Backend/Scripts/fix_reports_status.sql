-- Fix reports.status enum to match code requirements
-- Run this SQL in your MySQL database

ALTER TABLE reports 
MODIFY COLUMN status ENUM('pending', 'active', 'approved', 'closed') 
DEFAULT 'pending';

-- Also ensure rescue_tasks.id can be set (if it's not auto_increment, we use report_id)
-- The current code uses report_id as the id, which should work if id is not auto_increment

