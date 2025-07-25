# MoView - Movie Review Website

A modern movie review website built with React, FastAPI, and TMDB API integration.

## 🎬 Features

- **Movie Search & Discovery**: Browse popular movies and search by title
- **Movie Details**: View comprehensive movie information including cast, synopsis, and ratings
- **User Reviews**: Submit and read movie reviews from other users
- **Rating System**: Rate movies and view average ratings
- **Sentiment Analysis**: AI-powered sentiment analysis of reviews using Groq API
- **User Profiles**: Personal "My Ratings" page to track your movie reviews
- **Responsive Design**: Modern UI built with TailwindCSS

## 🛠️ Technology Stack

### Frontend
- **React.js** - Modern UI framework
- **TailwindCSS** - Utility-first CSS framework
- **Axios** - HTTP client for API requests
- **React Router** - Client-side routing

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - SQL toolkit and ORM
- **Pydantic** - Data validation using Python type hints
- **PostgreSQL** - Primary database (via NeonDB)

### External APIs
- **TMDB API** - Movie data and images
- **Groq API** - AI-powered sentiment analysis

### DevOps
- **Docker & Docker Compose** - Containerization
- **PostgreSQL** - Database

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- TMDB API key ([Get it here](https://www.themoviedb.org/settings/api))
- Groq API key ([Get it here](https://groq.com/))

### Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd moview
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. **Start with Docker Compose**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Manual Setup (Development)

#### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

#### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## 📊 Database Schema

### Users Table
- `id`: UUID - Primary key
- `username`: TEXT - User's username
- `email`: TEXT - User's email
- `password`: TEXT - Hashed password
- `created_at`: TIMESTAMP - Account creation date

### Reviews Table
- `id`: UUID - Primary key
- `user_id`: FK → users.id
- `movie_id`: INT - TMDB movie ID
- `content`: TEXT - Review content
- `rating`: FLOAT - User rating (1.0 - 5.0)
- `sentiment`: TEXT - AI sentiment analysis result
- `created_at`: TIMESTAMP - Review creation date

## 🔌 API Endpoints

### Movies
- `GET /movies/popular` - Get popular movies
- `GET /movies/search?q={query}` - Search movies by title
- `GET /movies/{id}` - Get movie details by ID

### Reviews
- `POST /reviews/` - Create a new review
- `GET /reviews/{movie_id}` - Get all reviews for a movie
- `GET /reviews/user/{user_id}` - Get user's reviews

### Sentiment Analysis
- `POST /sentiment` - Analyze review sentiment

### Authentication (Future)
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user info

## 🏗️ Project Structure

```
project-root/
├── backend/
│   ├── main.py              # FastAPI app entry point
│   ├── database.py          # Database configuration
│   ├── models/              # SQLAlchemy models
│   ├── routers/             # API route handlers
│   ├── requirements.txt     # Python dependencies
│   └── Dockerfile           # Backend Docker config
├── frontend/
│   ├── public/              # Static files
│   ├── src/                 # React source code
│   ├── package.json         # Node.js dependencies
│   └── Dockerfile           # Frontend Docker config
├── docker-compose.yml       # Multi-container Docker app
├── .env.example             # Environment variables template
└── README.md               # Project documentation
```

## 🔧 Development

### Adding New Features
1. Create feature branch
2. Implement backend endpoints in `/backend/routers/`
3. Create database models in `/backend/models/`
4. Build React components in `/frontend/src/components/`
5. Test thoroughly
6. Submit pull request

### Running Tests
```bash
# Backend tests
cd backend
pytest

# Frontend tests  
cd frontend
npm test
```

## 🌐 Deployment

The application is designed to be deployed on:
- **Railway.app** - Full stack deployment
- **Render.com** - Backend deployment
- **Heroku** - Alternative deployment
- **NeonDB** - PostgreSQL database hosting

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `TMDB_API_KEY` | TMDB API access key | Yes |
| `GROQ_API_KEY` | Groq AI API key | Yes |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `SECRET_KEY` | JWT signing secret | Yes |
| `REACT_APP_API_URL` | Backend API URL for frontend | Yes |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [The Movie Database (TMDB)](https://www.themoviedb.org/) for providing movie data
- [Groq](https://groq.com/) for AI-powered sentiment analysis
- [FastAPI](https://fastapi.tiangolo.com/) for the excellent Python web framework
- [React](https://reactjs.org/) for the frontend framework
- [TailwindCSS](https://tailwindcss.com/) for the styling framework 