# MoView - Movie Review Website

A modern movie review website built with React, FastAPI, and TMDB API integration.

## Live Demo

- **Frontend**: [https://moview-frontend-five.vercel.app/](https://moview-frontend-five.vercel.app/)
- **Backend API**: [https://moview-backend.onrender.com/](https://moview-backend.onrender.com/)
- **API Documentation**: [https://moview-backend.onrender.com/docs](https://moview-backend.onrender.com/docs)



## Features

- **Movie Search & Discovery**: Browse popular movies and search by title
- **Movie Details**: View comprehensive movie information including cast, synopsis, and ratings
- **User Reviews**: Submit and read movie reviews from other users
- **Rating System**: Rate movies and view average ratings
- **Sentiment Analysis**: AI-powered sentiment analysis of reviews using Groq API
- **User Profiles**: Personal "My Ratings" page to track your movie reviews
- **Responsive Design**: Modern UI built with TailwindCSS

## Technology Stack

### Frontend
- **React.js** - Modern UI framework with React Router
- **TailwindCSS** - Utility-first CSS framework with custom animations
- **Axios** - HTTP client for API requests

### Backend
- **FastAPI** - Modern Python web framework with automatic API documentation
- **SQLAlchemy** - SQL toolkit and ORM with PostgreSQL support
- **Pydantic** - Data validation using Python type hints

### Database
- **PostgreSQL** - Primary database (compatible with NeonDB)
- **UUID Primary Keys** - For better scalability and security

### External APIs
- **TMDB API** - Movie data and images
- **Groq API** - AI-powered sentiment analysis

### Deployment & DevOps
- **Render** - Backend hosting (FastAPI)
- **Vercel** - Frontend hosting (React)
- **NeonDB** - PostgreSQL database hosting
- **Docker & Docker Compose** - Local development containerization
- **GitHub Actions** - CI/CD pipeline

## Quick Start

### Prerequisites
- Docker and Docker Compose
- TMDB API key ([Get it here](https://www.themoviedb.org/settings/api))
- Groq API key ([Get it here](https://groq.com/))

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yusufdemrr/MoView.git
   cd MoView
   ```

2. **Environment Configuration**
   ```bash
   cp env.example .env
   # Edit .env with your API keys:
   # TMDB_API_KEY=your_tmdb_api_key_here
   # GROQ_API_KEY=your_groq_api_key_here
   # SECRET_KEY=your-secret-key-here
   ```

3. **Start with Docker Compose**
   ```bash
   docker-compose up --build
   ```

4. **Populate Sample Data (Optional)**
   ```bash
   # Wait for services to start (about 30 seconds), then:
   python3 -m venv sample_env
   source sample_env/bin/activate
   pip install requests
   python3 create_sample_data.py
   deactivate && rm -rf sample_env
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs
   - Database Admin: http://localhost:8080 (Adminer)

### Manual Setup (Development)

#### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Tables are created automatically on startup

# Start the server
uvicorn main:app --reload
```

#### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## Database Schema

### Users Table
- `id`: UUID - Primary key
- `username`: TEXT - User's username (unique)
- `email`: TEXT - User's email (unique)
- `password`: TEXT - Hashed password
- `created_at`: TIMESTAMP - Account creation date

### Reviews Table
- `id`: UUID - Primary key
- `user_id`: FK → users.id
- `movie_id`: INT - TMDB movie ID
- `content`: TEXT - Review content (10-1000 characters)
- `rating`: FLOAT - User rating (1.0 - 5.0)
- `sentiment`: TEXT - AI sentiment analysis result (positive/negative/neutral)
- `created_at`: TIMESTAMP - Review creation date

## API Endpoints

### Movies
- `GET /movies/popular` - Get popular movies 
- `GET /movies/search?q={query}` - Search movies by title 
- `GET /movies/{id}` - Get movie details by ID 

### Reviews
- `POST /reviews/` - Create a new review 
- `GET /reviews/{movie_id}` - Get all reviews for a movie 
- `GET /reviews/user/{user_id}` - Get user's reviews 
- `GET /reviews/stats/{movie_id}` - Get movie rating statistics 

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login (returns JWT token)
- `GET /auth/me` - Get current user info
- `POST /auth/verify-token` - Verify JWT token

### Sentiment Analysis
- `POST /sentiment/analyze` - Analyze review sentiment with Groq AI

## Project Structure

```
MoView/
├── backend/                     # FastAPI Backend
│   ├── main.py                 # FastAPI app entry point
│   ├── database.py             # Database configuration
│   ├── models/                 # SQLAlchemy models
│   │   ├── __init__.py
│   │   ├── user.py            # User model
│   │   └── review.py          # Review model
│   ├── routers/               # API route handlers
│   │   ├── __init__.py
│   │   ├── auth.py           # Authentication endpoints
│   │   ├── movies.py         # Movie data endpoints
│   │   ├── reviews.py        # Review CRUD endpoints
│   │   └── sentiment.py      # AI sentiment analysis
│   ├── requirements.txt       # Python dependencies
│   └── Dockerfile            # Backend Docker config
├── frontend/                   # React Frontend
│   ├── public/               # Static files & favicon
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── LandingPage.js      # Welcome page
│   │   │   ├── MainDashboard.js    # Main app dashboard
│   │   │   ├── MovieDetail.js      # Movie details & reviews
│   │   │   ├── MoviePosterCarousel.js
│   │   │   ├── MyRatings.js        # User's reviews page
│   │   │   ├── Login.js           # Login form
│   │   │   └── Register.js        # Registration form
│   │   ├── contexts/         # React Context API
│   │   │   └── AuthContext.js     # Authentication state
│   │   ├── services/         # API service layer
│   │   │   └── api.js            # Axios API client
│   │   ├── App.js            # Main app with routing
│   │   └── index.js          # App entry point
│   ├── package.json          # Node.js dependencies
│   ├── Dockerfile           # Frontend Docker config
│   └── vercel.json          # Vercel deployment config
├── .github/workflows/        # GitHub Actions CI/CD
├── create_sample_data.py     # Sample data creation script
├── deploy_check.py          # Deployment readiness checker
├── docker-compose.yml       # Local development setup
├── render.yaml             # Render deployment config
├── DEPLOYMENT_GUIDE.md     # Complete deployment instructions
├── database_admin_guide.md # Database management guide
├── useful_queries.md       # Database query reference
├── env.example            # Environment variables template
└── README.md             # Project documentation
```

## Development

### Adding New Features
1. Create feature branch
2. Implement backend endpoints in `/backend/routers/`
3. Create database models in `/backend/models/`
4. Build React components in `/frontend/src/components/`
5. Update API service layer in `/frontend/src/services/`
6. Test thoroughly
7. Submit pull request

### Database Management
```bash
# Start local development
docker-compose up -d

# Access database admin interface
open http://localhost:8080  # Adminer

# Run sample data script
python3 create_sample_data.py

# Check deployment readiness
python3 deploy_check.py
```

## Deployment

The application is currently deployed using modern cloud services:

### Production Stack
- **Frontend**: [Vercel](https://vercel.com) - React hosting with auto-deployment
- **Backend**: [Render](https://render.com) - FastAPI hosting (750 hours/month free)
- **Database**: [NeonDB](https://neon.tech) - Serverless PostgreSQL
- **CI/CD**: GitHub Actions for automated deployments

### Quick Deployment
1. **Follow the comprehensive guide**: See `DEPLOYMENT_GUIDE.md`
2. **Check readiness**: Run `python3 deploy_check.py`
3. **Deploy in minutes**: All services have free tiers!

### Cost: **$0/month** for MVP usage 

## Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `TMDB_API_KEY` | TMDB API access key | Yes | `eyJhbGciOiJIUzI1NiJ9...` |
| `GROQ_API_KEY` | Groq AI API key | Yes | `gsk_...` |
| `DATABASE_URL` | PostgreSQL connection string | Yes | `postgresql://user:pass@host:5432/db` |
| `SECRET_KEY` | JWT signing secret | Yes | `your-super-secret-key` |
| `REACT_APP_API_URL` | Backend API URL for frontend | Production | `https://your-backend.onrender.com` |

### Local Development
- All variables have sensible defaults for local development
- Only API keys need to be configured in `.env` file

### Production Deployment
- Set environment variables in your hosting service dashboards
- See `DEPLOYMENT_GUIDE.md` for step-by-step instructions

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code structure
- Test locally with Docker before submitting PR
- Update documentation if needed
- Use meaningful commit messages

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Sample Data

The application comes with sample users and reviews for testing:
- **Email**: `john@example.com` | **Password**: `password123`
- **Email**: `jane@example.com` | **Password**: `password123`
- **Email**: `critic@movies.com` | **Password**: `password123`

Create your own sample data: `python3 create_sample_data.py`

## Acknowledgments

- [The Movie Database (TMDB)](https://www.themoviedb.org/) for comprehensive movie data
- [Groq](https://groq.com/) for lightning-fast AI sentiment analysis
- [FastAPI](https://fastapi.tiangolo.com/) for the excellent Python web framework
- [React](https://reactjs.org/) for the powerful frontend framework
- [TailwindCSS](https://tailwindcss.com/) for beautiful utility-first CSS
- [Render](https://render.com/) for reliable backend hosting
- [Vercel](https://vercel.com/) for seamless frontend deployment
- [NeonDB](https://neon.tech/) for serverless PostgreSQL hosting
