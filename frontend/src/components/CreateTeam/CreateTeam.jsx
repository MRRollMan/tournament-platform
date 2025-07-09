import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api";
import { AuthContext } from "../../AuthContext";
import Error from "../Error";
import Loading from "../Loading";
import "./CreateTeam.css";

export default function CreateTeam() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [teamName, setTeamName] = useState("");
    const [tournaments, setTournaments] = useState(null);
    const [selectedTournaments, setSelectedTournaments] = useState([]);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchTournaments = async () => {
          try {
            const tournaments = await api.tournaments("upcoming");
            setTournaments(tournaments);
          } catch (err) {
            setError("Failed to fetch tournaments");
          } finally {
            setIsLoading(false);
          }
        };
    
        fetchTournaments();
      }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!teamName.trim()) {
            setError("Team name is required");
            return;
        }
        
        setIsLoading(true);
        setError("");
        
        try {
            const teamData = {
                name: teamName,
                captain_id: user.data.id,
                tournament_ids: selectedTournaments
            };
            
            const response = await api.createTeam(teamData);
            navigate(`/teams/${response.id}`);
        } catch (err) {
            console.error("Error creating team:", err);
            setError(err.response?.data?.message || "Failed to create team. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <Loading text="Creating team..." />;

    return (
        <div className="create-team-container">
            <div className="create-team-card">
                <h1>Create a New Team</h1>
                
                {error && <Error error={error} />}
                
                <form onSubmit={handleSubmit} className="create-team-form">
                    <div className="form-group">
                        <label htmlFor="team-name">Team Name</label>
                        <input
                            type="text"
                            id="team-name"
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                            placeholder="Enter team name"
                            required
                            className="form-control"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="tournaments">Select Tournaments</label>
                        {tournaments ? (
                            tournaments.length > 0 ? (
                                <div className="tournaments-selection">
                                    {tournaments.map((tournament) => (
                                        <div key={tournament.id} className="tournament-checkbox">
                                            <input
                                                type="checkbox"
                                                id={`tournament-${tournament.id}`}
                                                value={tournament.id}
                                                onChange={(e) => {
                                                    const tournamentId = parseInt(e.target.value);
                                                    const isChecked = e.target.checked;
                                                    
                                                    if (isChecked) {
                                                        setSelectedTournaments(prev => [...prev, tournamentId]);
                                                    } else {
                                                        setSelectedTournaments(prev => prev.filter(id => id !== tournamentId));
                                                    }
                                                }}
                                            />
                                            <label htmlFor={`tournament-${tournament.id}`}>
                                                {tournament.name} - {new Date(tournament.start_date).toLocaleDateString()}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="no-tournaments">No upcoming tournaments available</p>
                            )
                        ) : (
                            <p>Loading tournaments...</p>
                        )}
                    </div>
                    
                    <button 
                        type="submit" 
                        className="main-button"
                        disabled={isLoading}
                    >
                        {isLoading ? "Creating..." : "Create Team"}
                    </button>
                </form>
            </div>
        </div>
    );
}