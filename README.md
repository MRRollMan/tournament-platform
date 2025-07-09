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
> ⚠️ Don't forget to update the backend URL in the file "frontend/src/constants.js".

### 3. Build and run

```bash
docker-compose up --build
```

The backend will run at http://127.0.0.1:8000, and the frontend at http://localhost:5173


## Screenshots

### 🏠 Home Page

Displays upcoming tournaments, news, and quick navigation.

![Home Page](https://github.com/user-attachments/assets/f3b0f434-37ff-4874-9f15-ed566b93ae04)

### 🏆 Tournament Page

Detailed view of a tournament, including brackets and participants.

![Tournament Page](https://github.com/user-attachments/assets/de3a02ce-c4e0-45fc-8b3d-6e076382d557)

### 👥 Team Page

Team profile with match history.

![Team Page](https://github.com/user-attachments/assets/29416692-a492-42c8-91e6-d7820d880091)

> ⚠️ The data shown in these screenshots is fictional and does not reflect real events. 
