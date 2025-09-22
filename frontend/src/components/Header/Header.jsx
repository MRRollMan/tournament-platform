import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../AuthContext";
import './Header.css';

export default function Header() {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="header">
        <nav className="navbar">
            <h1 className="logo"><Link to="/" className="logo">Tournament Platform</Link></h1>
            <div className="nav-links">
                <Link to="/" className="nav-item">Home</Link>
                <Link to="/tournaments" className="nav-item">Tournaments</Link>
                <Link to="/matches" className="nav-item">Matches</Link>
                <Link to="/teams" className="nav-item">Teams</Link>
                {user ? (
                <>
                <button onClick={async () => {await logout();} } className="nav-item">Logout</button>
                </>
                ) : (
                <>
                <Link to="/login" className="nav-item">Login</Link>
                <Link to="/register" className="nav-item">Register</Link>
                </>
            )}
            </div>
        </nav>
    </header>
  );
}
