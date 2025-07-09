import { useEffect, useState } from "react";
import "./MatchesList.css";
import { api } from "../../api";
import Loading from "../Loading";
import Error from "../Error";
import Filter from "../Filter";
import { TimeIcon } from "../Icons";
import { Link } from "react-router-dom";

export default function MatchesList() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const matches = await api.matches();
        setMatches(matches);
      } catch (err) {
        setError("Failed to fetch matches");
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  const filteredMatches = matches.filter(match => {
    if (filter === "all") return true;
    return match.status === filter;
  });

  const getStatusClass = (status) => {
    switch(status.toLowerCase()) {
      case "scheduled": return "status-scheduled";
      case "ongoing": return "status-ongoing";
      case "completed": return "status-completed";
      case "canceled": return "status-canceled";
      default: return "";
    }
  };

  if (loading)
    return <Loading text="Loading matches..."/>;
  
  if (error) return <Error error={error}/>

  return (
    <div className="matches-container">
      <div className="matches-header">
        <h2 className="subtitle">Tournament Matches</h2>
        <Filter buttons={["All", "Scheduled", "Ongoing", "Completed", "Canceled"]} filter={filter} setFilter={setFilter}/>
      </div>
      
      {filteredMatches.length === 0 ? (
        <div className="no-matches">
          <p>No matches available</p>
        </div>
      ) : (
        <ul className="match-list">
          {filteredMatches.map((match) => (
            <li key={match.id} className="match-item">
              <div className="match-card">
                <div className="match-header">
                  <span className={`matches-status ${getStatusClass(match.status)}`}>
                    {match.status}
                  </span>
                  <span className="match-tournament">{match.tournament.name}</span>
                </div>
                
                <div className="match-teams">
                  <div className="team team-left">
                    <div className="team-logo">
                      {match.team1.logo ? (
                        <img src={match.team1.logo} alt={`${match.team1.name} logo`} />
                      ) : (
                        <div className="team-placeholder">{match.team1.name.charAt(0)}</div>
                      )}
                    </div>
                    <h3 className="mathces-team-name">{match.team1.name}</h3>
                  </div>
                  
                  <div className={"match-vs " + (match.status === "completed" ? (match.result.winner === match.team1.id ? "match-list-winner-left" : "match-list-winner-right") : "")}>
                    <span>VS</span>
                  </div>
                  
                  <div className="team team-right">
                    <div className="team-logo">
                      {match.team2.logo ? (
                        <img src={match.team2.logo} alt={`${match.team2.name} logo`} />
                      ) : (
                        <div className="team-placeholder">{match.team2.name.charAt(0)}</div>
                      )}
                    </div>
                    <h3 className="mathces-team-name">{match.team2.name}</h3>
                  </div>
                </div>
                
                <div className="match-details">
                  <div className="match-time">
                    <TimeIcon />
                    <span>{new Date(match.match_time).toLocaleString()}</span>
                  </div>
                  
                  <Link to={"/matches/" + match.id} className="match-btn card-link" >
                    {match.status.toLowerCase() === "ongoing" ? "Watch" : "Details"}
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}