import { useContext, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../../api";
import "./Match.css";
import Loading from "../Loading";
import Error from "../Error";
import { TimeIcon, CalendarIcon } from "../Icons";
import { getTeamColor } from "../../utils";
import { AuthContext } from "../../AuthContext";

export default function Match() {
    const { user } = useContext(AuthContext);
    const { id } = useParams();
    const [match, setMatch] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMatchData = async () => {
            try {
                const response = await api.matchDetail(id);
                console.log(response);
                setMatch(response);
            } catch (err) {
                console.error(err);
                setError(`Failed to fetch match details: ${err.message || "Unknown error"}`);
            } finally {
                setLoading(false);
            }
        };

        fetchMatchData();
    }, [id]);

    if (loading) return <Loading text="Loading match details..." />;
    if (error) return <Error error={error} />;
    if (!match) return <Error error="Match not found" />;

    const getStatusClass = (status) => {
        switch(status.toLowerCase()) {
            case "scheduled": return "status-scheduled";
            case "ongoing": return "status-ongoing";
            case "completed": return "status-completed";
            case "canceled": return "status-canceled";
            default: return "";
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const team1Color = match.team1 ? getTeamColor(match.team1.name) : "#6c5ce7";
    const team2Color = match.team2 ? getTeamColor(match.team2.name) : "#6c5ce7";
    let borderTeam1Color;
    let borderTeam2Color;
    if (match.status === "completed") {
        borderTeam1Color = match.result.winner === match.team1.id ? "var(--secondary)" : "var(--danger)";
        borderTeam2Color = match.result.winner === match.team2.id ? "var(--secondary)" : "var(--danger)";
    } else {
        borderTeam1Color = team1Color
        borderTeam2Color = team2Color;
    }

    return (
        <div className="match-detail-container">

            {user?.data?.id === match.tournament.organizer.id && (
                <div className="create-team-wrapper">
                <Link to={"/edit/match/" + id} className="create-team-button">
                    Edit Match
                </Link>
                </div>
                
            )}
            <div className="match-detail-header">
                <div className="match-detail-tournament">
                    <span className={`match-detail-status ${getStatusClass(match.status)}`}>
                        {match.status}
                    </span>
                    <Link to={`/tournaments/${match.tournament.id}`} className="tournament-link card-link">
                        {match.tournament.name}
                    </Link>
                </div>
                
                <div className="match-detail-time-info">
                    <div className="match-detail-time">
                        <CalendarIcon />
                        <span>{formatDate(match.match_time)}</span>
                    </div>
                </div>
            </div>

            <div className="match-detail-teams-container">
                <div className="match-detail-team-column" style={{ borderColor: borderTeam1Color }}>
                    <div 
                        className="match-detail-team-avatar"
                        style={{ backgroundColor: team1Color }}
                    >
                        {match.team1?.logo ? (
                            <img src={match.team1.logo} alt={match.team1.name} />
                        ) : (
                            <span className="match-detail-team-initial">{match.team1?.name.charAt(0) || '?'}</span>
                        )}
                    </div>
                    <h2 className="match-detail-team-name">{match.team1?.name || "TBD"}</h2>
                    
                    {match.status === "completed" && match.result && (
                        <div className="match-detail-result-indicator">
                            {match.result.winner === match.team1?.id ? (
                                <div className="winner-badge">Win</div>
                            ) : (
                                <div className="loser-badge">Lose</div>
                            )}
                        </div>
                    )}
                    
                    {match.team1 && (
                        <Link to={`/teams/${match.team1.id}`} className="view-team-link">
                            View Team Details
                        </Link>
                    )}
                </div>

                <div className="match-detail-vs-container">
                    <div className="match-detail-vs">VS</div>
                    {match.status === "completed" && match.result && (
                        <div className="match-detail-score">
                            <span className="match-detail-team1-score">{match.result.score_team1}</span>
                            <span className="match-detail-score-separator">:</span>
                            <span className="match-detail-team2-score">{match.result.score_team2}</span>
                        </div>
                    )}
                </div>

                <div className="match-detail-team-column" style={{ borderColor: borderTeam2Color }}>
                    <div 
                        className="match-detail-team-avatar"
                        style={{ backgroundColor: team2Color }}
                    >
                        {match.team2?.logo ? (
                            <img src={match.team2.logo} alt={match.team2.name} />
                        ) : (
                            <span className="match-detail-team-initial">{match.team2?.name.charAt(0) || '?'}</span>
                        )}
                    </div>
                    <h2 className="match-detail-team-name">{match.team2?.name || "TBD"}</h2>
                    
                    {match.status === "completed" && match.result && (
                        <div className="match-detail-result-indicator">
                            {match.result.winner === match.team2?.id ? (
                                <div className="winner-badge">Win</div>
                            ) : (
                                <div className="loser-badge">Lose</div>
                            )}
                        </div>
                    )}
                    
                    {match.team2 && (
                        <Link to={`/teams/${match.team2.id}`} className="view-team-link">
                            View Team Details
                        </Link>
                    )}
                </div>
            </div>

            {match.status === "ongoing" && (
                <div className="match-detail-live-section">
                    <div className="match-detail-live-indicator">
                        <span className="live-dot"></span>
                        <span>LIVE NOW</span>
                    </div>
                    <p>This match is currently in progress. Stay tuned for results!</p>
                </div>
            )}

            {match.status === "scheduled" && (
                <div className="match-detail-upcoming-section">
                    <h3>Upcoming Match</h3>
                    <p>This match is scheduled to start on {formatDate(match.match_time)}.</p>
                </div>
            )}
        </div>
    );
}