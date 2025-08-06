# Project Requirements Document - MoView

## 1. Project Objective

The primary objective of this project is to develop a comprehensive web application that enables users to search for films, rate them, and share their reviews. The system integrates film data from the TMDb API, provides local keyword-based sentiment analysis and AI-powered movie recommendations, and includes a complete user authentication system. This application serves as a portfolio piece demonstrating full-stack development capabilities with modern cloud deployment.

## 2. Technology Stack

The technology stack is designed with a modern, scalable architecture encompassing frontend, backend, database, API integrations, AI services, and cloud deployment.

### Frontend Technologies
- **React.js 18.x** - Modern UI framework with hooks and context API
- **React Router 6.x** - Client-side routing and navigation
- **TailwindCSS 3.x** - Utility-first CSS framework with custom animations
- **Axios** - HTTP client for API communication
- **Context API** - State management for authentication

### Backend Technologies
- **FastAPI 0.104.x** - Modern Python web framework with automatic API documentation
- **SQLAlchemy 2.0.x** - SQL toolkit and ORM with PostgreSQL support
- **Pydantic 2.5.x** - Data validation using Python type hints
- **Uvicorn** - ASGI server for high-performance async applications
- **Python-JOSE** - JWT token handling and cryptography
- **Passlib** - Password hashing with bcrypt
- **Python-dotenv** - Environment variable management

### Database
- **PostgreSQL 15** - Primary relational database
- **NeonDB** - Serverless PostgreSQL hosting for production
- **UUID Primary Keys** - Enhanced scalability and security

### External API Integrations
- **TMDb API v3** - Comprehensive movie data and metadata
- **Groq API** - AI-powered movie recommendations (sentiment analysis now uses local keyword-based approach)

### Deployment and DevOps
- **Render.com** - Backend hosting with 750 hours/month free tier
- **Render** - Frontend static site hosting with free tier
- **Docker** - Local development containerization
- **Docker Compose** - Multi-service orchestration
- **GitHub Actions** - Continuous integration and deployment

## 3. Functional Requirements

### 3.1 User Interface Requirements
- Landing page with animated movie poster carousel
- Popular movies display with infinite scrolling
- Advanced search functionality with real-time results
- Detailed movie information pages including cast, synopsis, and ratings
- User authentication forms (registration and login)
- Main dashboard for authenticated users
- Personal "My Ratings" page displaying user review history
- Responsive design supporting desktop and mobile devices
- Custom favicon and branding elements

### 3.2 User Authentication and Authorization
- JWT-based authentication system with 24-hour token expiration
- User registration with email validation
- Secure login with bcrypt password hashing
- Protected routes requiring authentication
- User session management with persistent login
- Profile dropdown with settings and logout functionality
- Token validation and refresh mechanisms

### 3.3 Review and Rating System
- Review submission for authenticated users only
- Rating system with 1.0 to 5.0 scale
- Review content validation (10-1000 characters)
- Duplicate review prevention per user-movie combination
- Average rating calculation and display
- Review listing with user attribution
- Sentiment analysis integration for submitted reviews

### 3.4 API Integration
- TMDb API integration for movie data retrieval
- Image optimization using TMDb CDN (image.tmdb.org/t/p/w500/)
- Adult content filtering for appropriate content
- Real-time search with query parameter support
- Pagination support for large datasets

### 3.5 Artificial Intelligence Features
- **Sentiment Analysis**: Local keyword-based analysis with no external dependencies
- **Movie Recommendations**: AI-powered personalized recommendations using Groq API
- Sentiment classification: positive, negative, neutral with confidence scoring
- Enhanced keyword matching with 23+ positive and negative terms
- Confidence calculation based on keyword density and text length
- Graceful fallback for recommendation system when API is unavailable

## 4. API Endpoint Specifications

### 4.1 Movie Endpoints
- `GET /movies/popular?page={n}` - Retrieve popular movies with pagination
- `GET /movies/search?q={query}&page={n}` - Search movies by title with pagination
- `GET /movies/{id}` - Retrieve detailed movie information by TMDb ID

### 4.2 Authentication Endpoints
- `POST /auth/register` - User registration with validation
- `POST /auth/login` - User authentication returning JWT token  
- `GET /auth/me` - Retrieve current authenticated user information
- `POST /auth/verify-token` - Validate JWT token status

### 4.3 Review Management Endpoints
- `POST /reviews/` - Create new review with sentiment analysis
- `GET /reviews/{movie_id}` - Retrieve all reviews for specific movie
- `GET /reviews/user/{user_id}` - Retrieve user-specific reviews
- `GET /reviews/stats/{movie_id}` - Calculate movie rating statistics

### 4.4 Sentiment Analysis Endpoints
- `POST /sentiment/analyze` - Analyze text sentiment using local keyword-based analysis

### 4.5 Movie Recommendation Endpoints
- `GET /reviews/recommendations/{user_id}` - Generate AI-powered personalized movie recommendations

### 4.6 Health and Monitoring
- `GET /health` - Application health check endpoint
- `GET /` - API welcome message and status

## 5. Database Schema Design

### 5.1 Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL, -- bcrypt hashed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 5.2 Reviews Table  
```sql
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    movie_id INTEGER NOT NULL,
    content TEXT NOT NULL CHECK (length(content) BETWEEN 10 AND 1000),
    rating DECIMAL(2,1) NOT NULL CHECK (rating BETWEEN 1.0 AND 5.0),
    sentiment TEXT CHECK (sentiment IN ('positive', 'negative', 'neutral')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, movie_id)
);
```

## 6. Containerization and Development

### 6.1 Docker Configuration
- **Backend Dockerfile** - Python 3.11 slim with optimized layer caching
- **Frontend Dockerfile** - Node.js 18 Alpine with multi-stage build
- **docker-compose.yml** - PostgreSQL, Backend, Frontend, and Adminer services
- **Volume persistence** - Database data persistence across container restarts

### 6.2 Development Environment
- **Adminer** - Lightweight database administration interface
- **Hot reloading** - Automatic code reload during development
- **Environment variable management** - Separate configurations for development/production

## 7. Security Implementation

### 7.1 Authentication Security
- JWT tokens with secure secret key rotation
- Password hashing using bcrypt with salt rounds
- Token expiration management (24-hour validity)
- CORS configuration for cross-origin requests

### 7.2 Data Validation
- Pydantic models for request/response validation
- SQL injection prevention through ORM usage
- Input sanitization and length restrictions
- Adult content filtering for movie data

### 7.3 Production Security
- Environment variable protection
- SSL/TLS encryption via hosting providers
- Rate limiting through hosting provider features
- Secure headers and HTTPS enforcement

## 8. Deployment Architecture

### 8.1 Production Stack
- **Frontend Hosting** - Render static site with automatic SSL and CDN
- **Backend Hosting** - Render with health checks and auto-scaling
- **Database Hosting** - NeonDB with connection pooling and SSL
- **Asset Delivery** - TMDb CDN for movie images

### 8.2 CI/CD Pipeline
- **GitHub Actions** - Automated testing and deployment
- **Branch Protection** - Main branch deployment triggers
- **Environment Management** - Separate staging and production configs
- **Health Monitoring** - Automated health checks and alerts

## 9. Testing Strategy

### 9.1 Backend Testing
- API endpoint functionality validation
- Database model integrity testing
- Authentication flow verification
- Sentiment analysis accuracy testing
- Error handling and edge case coverage

### 9.2 Frontend Testing
- User interface component testing
- Authentication flow validation
- API integration testing
- Cross-browser compatibility verification
- Responsive design validation

### 9.3 Integration Testing
- End-to-end user workflows
- Database transaction integrity
- External API integration reliability
- Performance under load testing

## 10. Project Structure

```
MoView/
├── backend/                     # FastAPI Backend
│   ├── main.py                 # Application entry point
│   ├── database.py             # Database configuration
│   ├── models/                 # SQLAlchemy data models
│   │   ├── __init__.py
│   │   ├── user.py            # User model
│   │   └── review.py          # Review model
│   ├── routers/               # API route handlers
│   │   ├── __init__.py
│   │   ├── auth.py           # Authentication endpoints
│   │   ├── movies.py         # Movie data endpoints
│   │   ├── reviews.py        # Review CRUD operations
│   │   └── sentiment.py      # Local keyword-based sentiment analysis
│   ├── requirements.txt       # Python dependencies
│   └── Dockerfile            # Backend containerization
├── frontend/                   # React Frontend
│   ├── public/               # Static assets
│   │   ├── index.html        # HTML template
│   │   ├── Logo.png         # Application logo
│   │   └── favicon.ico      # Browser favicon
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── LandingPage.js      # Welcome page
│   │   │   ├── MainDashboard.js    # Main application
│   │   │   ├── MovieDetail.js      # Movie information
│   │   │   ├── MyRatings.js        # User reviews
│   │   │   ├── Login.js           # Authentication
│   │   │   └── Register.js        # User registration
│   │   ├── contexts/         # React Context
│   │   │   └── AuthContext.js     # Authentication state
│   │   ├── services/         # API clients
│   │   │   └── api.js            # HTTP requests
│   │   ├── App.js            # Main application
│   │   └── index.js          # Application entry
│   ├── package.json          # Node.js dependencies and scripts
│   └── Dockerfile           # Frontend containerization
├── .github/workflows/        # CI/CD automation
├── create_sample_data.py     # Database seeding
├── deploy_check.py          # Deployment validation
├── docker-compose.yml       # Development orchestration
├── render.yaml             # Production deployment
├── DEPLOYMENT_GUIDE.md     # Deployment instructions
└── README.md              # Project documentation
```

## 11. Current Implementation Status

### 11.1 Completed Features (MVP)
- Complete user authentication system with JWT
- Movie search and discovery functionality
- Review and rating system with persistence
- Local keyword-based sentiment analysis (fast, reliable, no external dependencies)
- AI-powered movie recommendations with intelligent fallback
- Responsive user interface with modern design
- Production deployment on cloud infrastructure
- Database administration and management tools

### 11.2 Performance Characteristics
- Frontend response time: <200ms (cached)
- Backend API response: <500ms average
- Database query performance: <100ms typical
- Image loading: Optimized through TMDb CDN
- Search functionality: Real-time with pagination

### 11.3 Scalability Considerations
- Horizontal scaling through cloud providers
- Database connection pooling and optimization
- CDN utilization for static assets
- Caching strategies for frequently accessed data
- Load balancing capabilities through hosting providers

## 12. Maintenance and Support

### 12.1 Monitoring and Logging
- Application health monitoring through hosting providers
- Error tracking and notification systems
- Performance metrics and usage analytics
- Database performance monitoring

### 12.2 Backup and Recovery
- Automated database backups through NeonDB
- Code repository backup through GitHub
- Configuration management through environment variables
- Disaster recovery procedures and documentation

### 12.3 Updates and Maintenance
- Dependency security updates and monitoring
- API version compatibility maintenance
- Database schema evolution and migration
- Performance optimization and monitoring

## 13. Cost Analysis

### 13.1 Current Operational Costs
- **Database (NeonDB)**: $0/month (0.5GB free tier)
- **Backend (Render)**: $0/month (750 hours free tier)
- **Frontend (Render)**: $0/month (750 hours free tier)
- **Total Monthly Cost**: $0 for MVP usage

### 13.2 Scaling Costs
- **NeonDB Pro**: $19/month (unlimited storage)
- **Render Starter**: $7/month (no sleep, custom domains)
- **Render Pro**: $25/month (enhanced performance and priority support)

This requirements document reflects the current state of the MoView application as a fully functional, production-ready movie review platform with modern architecture and deployment practices.