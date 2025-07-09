# Tournament Platform

A web platform for organizing esports tournaments.  
Built with Django and DRF (Django REST Framework) for the backend, and React for the frontend.  
This project was developed as part of a bachelor's thesis.

## Features

- Tournament creation and management
- Team registration
- Match scheduling
- Django Admin panel
- Separated backend and frontend
- UI built with React

## Technologies Used

- Django + Django REST Framework
- React + Vite
- SQLite (or PostgreSQL)
- Docker & Docker Compose
- Nginx (for production deployment)

## Local Deployment (Docker Compose)

To run the full application using Docker Compose:

### 1. Clone the repository

```bash
git clone https://github.com/MRRollMan/tournament-platform.git
cd tournament-platform
```

### 2. Edit docker-compose.yml

Make sure to update the environment variables in your docker-compose.yml file:

```yaml
environment:
    - DEBUG=True
    - SECRET_KEY=ABCDEFG
    - DATABASE_URL=db.sqlite3
    - BACKEND_URL=http://127.0.0.1:8000 # Also, set the link in the file "frontend\src\constants.js"
    - FRONTEND_URL=http://localhost:5173
    - EMAIL_HOST=smtp.mail.com
    - EMAIL_HOST_USER=user@mail.com
    - EMAIL_HOST_PASSWORD=abcd efgh
    - EMAIL_PORT=587
```
⚠️ Don't forget to update the backend URL in the file frontend/src/constants.js as well.

3. Build and run

```bash
docker-compose up --build
```

The backend will run at http://127.0.0.1:8000, and the frontend at http://localhost:5173