import { useContext } from 'react';
import './Home.css'
import { AuthContext } from '../../AuthContext';
import { Link } from 'react-router-dom';

export default function Home() {
  const { user } = useContext(AuthContext);

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Tournament Platform</h1>
        <p className="tagline">Organize, manage, and compete in tournaments with ease</p>
      </header>
      
      <section className="features-section">
        <h2>Welcome to our Tournament Platform</h2>
        <p>A comprehensive solution for tournament organizers and participants alike. Our platform provides the tools you need to create and join tournaments across various games.</p>
        
        <div className="feature-cards">
          <div className="feature-card">
            <h3>Create Tournaments</h3>
            <p>Easily set up tournaments with brackets.</p>
          </div>
          
          <div className="feature-card">
            <h3>Join Competitions</h3>
            <p>Browse available tournaments and register to participate in competitions that interest you.</p>
          </div>
          
          <div className="feature-card">
            <h3>Track Results</h3>
            <p>Follow tournament progress with live updates.</p>
          </div>
        </div>
      </section>
      
      <section className="cta-section">
        <h2>Ready to get started?</h2>
        <div className="cta-buttons">
          {user ? (
            <>
              <Link to="/teams" className="cta-button secondary">View Teams</Link>
              <Link to="/tournaments" className="cta-button">Browse Tournaments</Link>
              <Link to="/matches" className="cta-button secondary">View Matches</Link>
            </>
          ) : (
            <>
              <Link to="/login" className="cta-button">Login</Link>
              <Link to="/register" className="cta-button secondary">Register</Link>
            </>
          )}
        </div>
      </section>
    </div>
  );
  }
  