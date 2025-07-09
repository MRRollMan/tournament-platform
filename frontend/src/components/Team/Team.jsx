import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../api";
import "./Team.css";
import Loading from "../Loading";
import Error from "../Error";
import { getTeamColor } from "../../utils";
import { PencilIcon, CalendarIcon } from "../Icons";
import MatchesListComponent from "../MatchListComponent/MatchesListComponent";
import TournamentComponent from "../TournamentComponent";

export default function Team() {
    const { id } = useParams();
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTeamData = async () => {
            try {
                const response = await api.teamDetail(id);
                setTeam(response);
            } catch (err) {
                console.error(err);
                setError(`Failed to fetch team details: ${err.message || "Unknown error"}`);
            } finally {
                setLoading(false);
            }
        };

        fetchTeamData();
    }, [id]);

    if (loading) return <Loading text="Loading team details..." />;
    if (error) return <Error error={error} />;
    if (!team) return <Error error="Team not found" />;

    const teamColor = getTeamColor(team.name);
    const winPercentage = team.total_matches > 0 
        ? Math.round((team.wins / team.total_matches) * 100) 
        : 0;

    return (
        <div className="team-detail-container">
            <div className="team-detail-header">
                <div 
                    className="team-detail-avatar"
                    style={{ 
                        backgroundColor: teamColor,
                        boxShadow: `0 10px 20px -3px ${teamColor}40`
                    }}
                >
                    <span className="team-detail-initial">{team.name.charAt(0).toUpperCase()}</span>
                </div>
                <div className="team-detail-info">
                    <h1 className="team-detail-name">{team.name}</h1>
                    <div className="team-detail-captain">
                        <span>Captain:</span>
                        <strong>{team.captain.username}</strong>
                        {team.captain.nickname && (
                            <span className="captain-nickname">({team.captain.nickname})</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="team-detail-stats-container">
                <div className="team-detail-stats">
                    <div className="stat-card">
                        <div className="stat-value">{team.total_matches || 0}</div>
                        <div className="stat-label">Matches</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{team.wins || 0}</div>
                        <div className="stat-label">Wins</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{team.losses || 0}</div>
                        <div className="stat-label">Losses</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{winPercentage}%</div>
                        <div className="stat-label">Win Rate</div>
                    </div>
                </div>
            </div>

            <div className="team-detail-section">
                <h2 className="section-title">Tournaments</h2>
                {team.tournaments.length === 0 ? (
                    <div className="empty-section">
                        <p>This team is not participating in any tournaments.</p>
                    </div>
                ) : (
                    <div className="team-tournaments-grid">
                        {team.tournaments.map((tournament) => (
                            <TournamentComponent key={tournament.id} tournament={tournament} />
                        ))}
                    </div>
                )}
            </div>

            <div className="team-detail-section">
                <h2 className="section-title"></h2>
                <div className="recent-matches">
                    <MatchesListComponent matches={team.matches} title="Recent Matches" />
                </div>
            </div>
        </div>
    );
}