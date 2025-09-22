import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../api";
import Loading from "../Loading";
import Error from "../Error";
import "./Tournament.css";
import TournamentBrackets from "./TournamentBrackets";
import { getTeamColor } from "../../utils";
import { PencilIcon, PulseIcon, CalendarIcon } from "../Icons";
import MatchesListComponent from "../MatchListComponent/MatchesListComponent";
import JoinTournamentModal from "./JoinTournamentModal";
import { AuthContext } from "../../AuthContext";



export default function Tournament() {
    const { user } = useContext(AuthContext);
    const { id } = useParams();
    const [tournament, setTournament] = useState(null);
    const [teams, setTeams] = useState([]);
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTournamentData = async () => {
            try {
                const tournamentData = await api.tournamentDetail(id);
                
                setTournament(tournamentData);
                setTeams(tournamentData.teams);
                console.log(tournamentData.status);
                setMatches(tournamentData.matches);
            } catch (err) {
                console.error(err);
                setError(`Failed to fetch tournament details: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchTournamentData();
    }, [id]);

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const getStatusClass = () => {
        if (!tournament) return "";
        
        const startDate = new Date(tournament.start_date);
        const endDate = new Date(tournament.end_date);
        const today = new Date();

        if (today < startDate) return "upcoming";
        if (today >= startDate && today <= endDate) return "active";
        return "completed";
    };

    const getStatusText = () => {
        const statusClass = getStatusClass();
        if (statusClass === "upcoming") return "Upcoming";
        if (statusClass === "active") return "Active";
        return "Completed";
    };

    console.log(matches)

    if (loading) return <Loading text="Loading tournament details..." />;
    if (error) return <Error error={error} />;

    return (
        <div className="tournament-container">
            <div className="tournament-header">
                <div className="tournament-detail-status">
                    <span className={`status-detail-badge status-${getStatusClass()}`}>
                        {getStatusText()}
                    </span>
                </div>
                <div className="tournament-title">
                    <h1>{tournament.name}</h1>
                    {user && tournament.organizer.id === user.data.id && (
                        <Link to={`/edit/tournament/${id}`} className="tournament-btn edit-tournament-btn">
                            <span> Edit Tournament</span>
                        </Link>
                    )}
                </div>
                <div className="tournament-meta">
                    <div className="tournament-detail-game">
                        <PencilIcon />
                        <span>{tournament.game}</span>
                    </div>
                    <div className="tournament-format">
                        <PulseIcon />
                        <span>{tournament.format}</span>
                    </div>
                    <div className="tournament-date">
                        <CalendarIcon />
                        <span>{formatDate(tournament.start_date)} - {formatDate(tournament.end_date)}</span>
                    </div>
                </div>
                <div className="tournament-organizer">
                    <span>Organized by:</span>
                    <strong>{tournament.organizer.username}</strong>
                    {tournament.organizer.nickname && <span className="organizer-nickname">({tournament.organizer.nickname})</span>}
                </div>
            </div>

            <div className="tournament-detail-content">
                <div className="tournament-section">
                    <div className="tournament-section-header">
                        <h2 className="section-title">Participating Teams {teams.length}/{tournament.max_teams}</h2>
                        <div className="tournament-actions">
                            {(getStatusClass() === "upcoming" && teams.length < tournament.max_teams) && (
                                <JoinTournamentModal tournamentId={id} />
                            )}
                        </div>
                    </div>

                    
                    {teams.length === 0 ? (
                        <div className="empty-section">
                            <p>No teams have registered for this tournament yet.</p>
                        </div>
                    ) : (
                        <div className="tournament-teams-grid">
                            {teams.map(team => {
                                const teamColor = getTeamColor(team.name);
                                return(
                                <Link to={`/teams/${team.id}`} key={team.id} className="tournament-team-card">
                                    <div className="tournament-team-avatar"
                                    style={{ 
                                    backgroundColor: teamColor,
                                    boxShadow: `0 10px 20px -3px ${teamColor}40`
                                    }}>
                                        <span className="team-initial">{team.name.charAt(0)}</span>
                                    </div>
                                    <h3 className="tournament-team-name">{team.name}</h3>
                                    <div className="team-captain">
                                        <span>Captain: {team.captain.username}</span>
                                    </div>
                                </Link>)
                            })}
                        </div>
                    )}
                </div>

                <div className="tournament-section">
                    <MatchesListComponent matches={matches} />
                </div>

                <div className="tournament-section">
                    <h2 className="section-title">Tournament Brackets</h2>
                    <TournamentBrackets matches={matches} />
                </div>
            </div>
        </div>
    );
}