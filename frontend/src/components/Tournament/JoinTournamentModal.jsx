import { useState } from "react";
import { api } from "../../api";
import "./Tournament.css";

export default function JoinTournamentModal({ tournamentId }) {
    const [isOpen, setIsOpen] = useState(false);
    const [userTeams, setUserTeams] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const fetchUserTeams = async () => {
        setIsLoading(true);
        try {
            const teams = await api.getUserTeams();
            setUserTeams(teams);
        } catch (err) {
            console.error(err);
            setError("Failed to load your teams");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpen = () => {
        setIsOpen(true);
        fetchUserTeams();
        setError(null);
        setSuccess(false);
    };

    const handleClose = () => {
        setIsOpen(false);
        setSelectedTeam("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedTeam) return;
        
        setIsLoading(true);
        try {
            await api.joinTournament(tournamentId, selectedTeam);
            setSuccess(true);
            setTimeout(() => {
                handleClose();
                window.location.reload();
            }, 2000);
        } catch (err) {
            console.error(err);
            setError(err.response.data.error || "Failed to join tournament");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button 
                className="tournament-btn" 
                onClick={handleOpen}
            >
                Join Tournament
            </button>

            {isOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Join Tournament</h3>
                        {error && <div className="error-message">{error}</div>}
                        {success && <div className="success-message">Successfully joined! Refreshing page...</div>}
                        
                        {!success && (
                            <form onSubmit={handleSubmit}>
                                <label htmlFor="team-select">Select your team:</label>
                                {isLoading ? (
                                    <p>Loading your teams...</p>
                                ) : userTeams.length === 0 ? (
                                    <p>You don't have any teams you captain. Create a team first.</p>
                                ) : (
                                    <select 
                                        id="team-select"
                                        value={selectedTeam}
                                        onChange={(e) => setSelectedTeam(e.target.value)}
                                        required
                                    >
                                        <option value="">-- Select a team --</option>
                                        {userTeams.map(team => (
                                            <option key={team.id} value={team.id}>{team.name}</option>
                                        ))}
                                    </select>
                                )}
                                
                                <div className="modal-actions">
                                    <button 
                                        type="button" 
                                        onClick={handleClose} 
                                        className="cancel-btn"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={!selectedTeam || isLoading}
                                        className="submit-btn"
                                    >
                                        {isLoading ? "Joining..." : "Join"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}