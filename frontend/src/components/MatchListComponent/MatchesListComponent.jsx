import { Link } from "react-router-dom";
import { TimeIcon } from "../Icons";
import "./MatchesListComponent.css";

export default function MatchesListComponent(props){
    const { matches, title="Matches" } = props;

    return (<>
    <h2 className="section-title">{title}</h2>
            {matches.filter(match => match.team1 && match.team2).length === 0 ? (
                <div className="empty-section">
                    <p>No matches have been scheduled yet.</p>
                </div>
            ) : (
                <div className="matches-list">
                    {matches.map(match => (
                        (match.team1 && match.team2) &&
                        <Link to={`/matches/${match.id}`} key={match.id} className="tournament-match-item card-link">
                            <div className={`match-status status-${match.status.toLowerCase()}`}>
                                {match.status}
                            </div>
                            <div className="tournament-match-teams">
                                <span className="tournament-team-name">{(match.team1 ? match.team1.name : "TDB")}</span>
                                <span className={"vs " + (match.status === "completed" ? (match.result.winner === match.team1.id ? "match-winner-left" : "match-winner-right") : "")} >VS</span>
                                <span className="tournament-team-name">{(match.team2 ? match.team2.name : "TDB")}</span>
                            </div>
                            <div className="match-time">
                                <TimeIcon />
                                <span>{new Date(match.match_time).toLocaleString()}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
            
            </>)
}


