import { Link } from "react-router-dom";
import { getTournamentStatusClass } from "../utils";
import { ArrowIcon } from "./Icons";

export default function TournamentComponent(props){
    const { tournament } = props;


  
    const getStatusText = (tournament) => {
      const statusClass = getTournamentStatusClass(tournament);
      if (statusClass === "upcoming") return "Upcoming";
      if (statusClass === "active") return "Active";
      return "Completed";
    };
    
    const formatDate = (dateString) => {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    };

    
    const statusClass = getTournamentStatusClass(tournament);

    return (<Link to={`/tournaments/${tournament.id}/`} className="card-link">
              <div className={`tournament-card ${statusClass}`}>
                <div className="tournament-status">
                  <span className={`status-badge status-${statusClass}`}>
                    {getStatusText(tournament)}
                  </span>
                </div>
                
                <div className="tournament-content">
                  <div className="tournament-game">
                    <span>{tournament.game}</span>
                  </div>
                  
                  <h3 className="tournament-name">{tournament.name}</h3>
                  
                  <div className="tournament-details">
                    <div className="detail-item">
                      <span className="detail-label">Format</span>
                      <span className="detail-value">{tournament.format}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Dates</span>
                      <span className="detail-value">
                        {formatDate(tournament.start_date)} - {formatDate(tournament.end_date)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="card-footer">
                    <span className="view-details">View Details</span>
                    <ArrowIcon />
                  </div>
                </div>
              </div>
            </Link>
                );
}