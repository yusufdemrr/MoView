-- MoView Database Queries
-- Use these commands with: docker-compose exec db psql -U postgres -d moview_db -c "QUERY_HERE"

-- ================================
-- VIEWING DATA
-- ================================

-- List all tables
\dt

-- View all users
SELECT id, username, email, created_at FROM users;

-- View all reviews with user info
SELECT 
    r.id,
    u.username,
    r.movie_id,
    r.content,
    r.rating,
    r.sentiment,
    r.created_at
FROM reviews r
JOIN users u ON r.user_id = u.id
ORDER BY r.created_at DESC;

-- Count users and reviews
SELECT 
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM reviews) as total_reviews;

-- ================================
-- CREATING SAMPLE USERS
-- ================================

-- Create a sample user (manually)
INSERT INTO users (id, username, email, password, created_at) 
VALUES (
    gen_random_uuid(),
    'sampleuser1',
    'sample1@example.com',
    '$2b$12$dummyhashedpassword123456789',  -- This is just a dummy hash
    NOW()
);

-- Create multiple sample users
INSERT INTO users (id, username, email, password, created_at) VALUES
    (gen_random_uuid(), 'moviefan', 'fan@movies.com', '$2b$12$dummyhash1', NOW()),
    (gen_random_uuid(), 'cinephile', 'cinema@lover.com', '$2b$12$dummyhash2', NOW()),
    (gen_random_uuid(), 'reviewer', 'review@master.com', '$2b$12$dummyhash3', NOW());

-- ================================
-- SAMPLE REVIEWS
-- ================================

-- Add sample reviews (use existing user IDs)
INSERT INTO reviews (id, user_id, movie_id, content, rating, sentiment, created_at) VALUES
    (gen_random_uuid(), '12345678-1234-5678-9012-123456789012', 755898, 'Amazing movie with great visuals!', 4.5, 'positive', NOW()),
    (gen_random_uuid(), '12345678-1234-5678-9012-123456789012', 1087192, 'How to Train Your Dragon is fantastic!', 5.0, 'positive', NOW());

-- ================================
-- USEFUL QUERIES
-- ================================

-- Find users by username pattern
SELECT * FROM users WHERE username LIKE '%demo%';

-- Get average rating per movie
SELECT 
    movie_id,
    COUNT(*) as review_count,
    ROUND(AVG(rating), 2) as avg_rating
FROM reviews 
GROUP BY movie_id
ORDER BY avg_rating DESC;

-- Get user review statistics
SELECT 
    u.username,
    COUNT(r.id) as total_reviews,
    ROUND(AVG(r.rating), 2) as avg_rating_given,
    MAX(r.created_at) as last_review
FROM users u
LEFT JOIN reviews r ON u.id = r.user_id
GROUP BY u.id, u.username
ORDER BY total_reviews DESC;

-- Delete a user (CASCADE will also delete their reviews)
-- DELETE FROM users WHERE username = 'username_to_delete';

-- ================================
-- DATABASE MAINTENANCE
-- ================================

-- Check table sizes
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats
WHERE schemaname = 'public';

-- Show database size
SELECT pg_size_pretty(pg_database_size('moview_db')) as database_size; 