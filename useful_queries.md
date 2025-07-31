# MoView Database Queries Reference

## Basic Queries

### View All Data
```sql
-- All users
SELECT id, username, email, created_at FROM users ORDER BY created_at DESC;

-- All reviews with user info
SELECT u.username, r.movie_id, r.content, r.rating, r.sentiment, r.created_at 
FROM reviews r 
JOIN users u ON r.user_id = u.id 
ORDER BY r.created_at DESC;

-- Database summary
SELECT 'Users' as table_name, COUNT(*) as count FROM users 
UNION 
SELECT 'Reviews' as table_name, COUNT(*) as count FROM reviews;
```

### User Statistics
```sql
-- User review statistics
SELECT 
    u.username,
    COUNT(r.id) as total_reviews,
    CAST(AVG(r.rating) AS DECIMAL(3,2)) as avg_rating_given,
    MAX(r.created_at) as last_review_date
FROM users u
LEFT JOIN reviews r ON u.id = r.user_id
GROUP BY u.id, u.username
ORDER BY total_reviews DESC;

-- Find active users
SELECT u.username, u.email 
FROM users u 
WHERE u.id IN (SELECT DISTINCT user_id FROM reviews);
```

### Movie Statistics
```sql
-- Movies with most reviews
SELECT 
    movie_id,
    COUNT(*) as review_count,
    CAST(AVG(rating) AS DECIMAL(3,2)) as avg_rating
FROM reviews 
GROUP BY movie_id 
ORDER BY review_count DESC;

-- Sentiment analysis summary
SELECT 
    sentiment,
    COUNT(*) as count,
    CAST(AVG(rating) AS DECIMAL(3,2)) as avg_rating
FROM reviews 
WHERE sentiment IS NOT NULL
GROUP BY sentiment;
```

## Data Manipulation

### Create Sample Users
```sql
-- Create multiple users at once
INSERT INTO users (id, username, email, password, created_at) VALUES
    (gen_random_uuid(), 'alice', 'alice@example.com', '$2b$12$dummy1', NOW()),
    (gen_random_uuid(), 'bob', 'bob@example.com', '$2b$12$dummy2', NOW()),
    (gen_random_uuid(), 'charlie', 'charlie@example.com', '$2b$12$dummy3', NOW());
```

### Create Sample Reviews
```sql
-- Add reviews for existing users
INSERT INTO reviews (id, user_id, movie_id, content, rating, sentiment, created_at) VALUES
    (gen_random_uuid(), (SELECT id FROM users WHERE username = 'alice'), 755898, 'Great movie!', 4.5, 'positive', NOW()),
    (gen_random_uuid(), (SELECT id FROM users WHERE username = 'bob'), 1087192, 'Amazing animation!', 5.0, 'positive', NOW());
```

## Maintenance Queries

### Cleanup
```sql
-- Delete user and all their reviews (CASCADE)
DELETE FROM users WHERE username = 'username_to_delete';

-- Delete reviews older than 30 days
DELETE FROM reviews WHERE created_at < NOW() - INTERVAL '30 days';

-- Update sentiment for reviews that don't have it
UPDATE reviews SET sentiment = 'neutral' WHERE sentiment IS NULL;
```

### Database Info
```sql
-- Table sizes
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public';

-- Database size
SELECT pg_size_pretty(pg_database_size('moview_db')) as database_size;
```

## Running These Queries

### One-off commands:
```bash
docker-compose exec db psql -U postgres -d moview_db -c "YOUR_QUERY_HERE"
```

### Interactive session:
```bash
docker-compose exec db psql -U postgres -d moview_db
# Then paste queries inside the psql prompt
```

### From a file:
```bash
# Save queries in queries.sql, then run:
docker-compose exec db psql -U postgres -d moview_db -f queries.sql
``` 