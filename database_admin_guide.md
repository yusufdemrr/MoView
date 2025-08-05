# MoView Database Administration Guide

## Database Management Tool

You have **Adminer** - a lightweight, web-based database administration tool running:

### **Adminer** - Port 8080
- **URL**: http://localhost:8080
- **Best for**: Database viewing, queries, data management, lightweight operations
- **Advantage**: Simple setup, no additional configuration needed

---

## Getting Started

### **Access Adminer**

1. **Open**: http://localhost:8080
2. **Fill the form**:
   - System: `PostgreSQL`
   - Server: `db`
   - Username: `postgres`
   - Password: `postgres` 
   - Database: `moview_db`
3. Click **Login**

---

## What You Can Do

### Data Visualization & Exploration

**In pgAdmin:**
- **Query Tool**: Advanced SQL editor with syntax highlighting
- **Table Browser**: Visual data exploration with filters
- **ERD Tool**: Generate database relationship diagrams
- **Statistics**: Table sizes, row counts, index usage

**In Adminer:**
- **Simple Table View**: Clean, fast data browsing
- **Export/Import**: Easy data backup and restore
- **SQL Command**: Quick query execution
- **Database Structure**: Visual schema overview

### Data Manipulation

**Both tools allow you to:**
- **Browse Tables**: Click through your users and reviews
- **Run Queries**: Execute complex SQL with visual results
- **Edit Data**: Add, update, delete records with forms
- **Export Data**: Download tables as CSV, SQL, JSON
- **Import Data**: Upload data from files
- **Create Tables**: Design new database structures
- **Manage Users**: Database user administration

### Advanced Features (pgAdmin)

- **Query Planner**: Optimize slow queries
- **Backup/Restore**: Full database backup management
- **Maintenance**: VACUUM, ANALYZE, REINDEX operations
- **Monitoring**: Real-time database performance
- **Graphical Query Builder**: Visual query creation
- **Debugging**: PL/pgSQL debugger

---

## Common Tasks

### **View Your MoView Data**

1. **Navigate to Tables**:
   - pgAdmin: Servers → MoView Database → Databases → moview_db → Schemas → public → Tables
   - Adminer: Click on table names in the left sidebar

2. **Browse Users Table**:
   - Click on `users` table
   - View all registered users with their details

3. **Browse Reviews Table**:
   - Click on `reviews` table  
   - See all movie reviews with ratings and sentiment

### **Run Custom Queries**

**pgAdmin**: Tools → Query Tool
**Adminer**: Click "SQL command"

```sql
-- Example queries to try:
SELECT COUNT(*) FROM users;
SELECT u.username, COUNT(r.id) as reviews 
FROM users u 
LEFT JOIN reviews r ON u.id = r.user_id 
GROUP BY u.username;
```

### **Export Your Data**

**pgAdmin**: Right-click table → Import/Export → Export
**Adminer**: Click table → "Export" button

### **Add Sample Data**

You can use the form interfaces to add users and reviews, or run SQL:

```sql
INSERT INTO users (id, username, email, password, created_at) 
VALUES (gen_random_uuid(), 'webuser', 'web@example.com', '$2b$12$dummy', NOW());
```

---

## Visual Features

### pgAdmin Dashboard
- **Database Size Charts**
- **Query Performance Graphs** 
- **Real-time Activity Monitoring**
- **Table Relationship Diagrams**

### Adminer Interface
- **Clean, Minimal Design**
- **Fast Table Browsing**
- **One-Click Operations**
- **Mobile-Friendly**

---

## Important Notes

### Security
- These tools are for **development only**
- Don't expose them in production without proper authentication
- The default passwords are simple for development ease

### Performance
- **pgAdmin**: More resource-intensive, feature-rich
- **Adminer**: Lightweight, faster for simple tasks

### Persistence
- pgAdmin settings are saved in Docker volume `pgadmin_data`
- Your database connections will persist between restarts

---

## Quick Access Links

| Tool | URL | Purpose |
|------|-----|---------|
| **pgAdmin** | http://localhost:5050 | Full database administration |
| **Adminer** | http://localhost:8080 | Quick data management |
| **Your App** | http://localhost:3000 | MoView frontend |
| **API Docs** | http://localhost:8000/docs | Backend API documentation |

---

## Troubleshooting

### Can't Connect to Database
```bash
# Check if database is running
docker-compose ps db

# Check database logs
docker-compose logs db
```

### pgAdmin Login Issues
- Use exact credentials: `admin@moview.com` / `admin123`
- Clear browser cache if needed

### Adminer Connection Failed
- Server should be `db` (not `localhost`)
- Use `postgres` / `postgres` credentials

### Reset Everything
```bash
# Stop and remove admin tools
docker-compose down pgadmin adminer

# Restart with fresh data
docker-compose up -d pgadmin adminer
```

---