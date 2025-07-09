import { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../api";
import { AuthContext } from "../../AuthContext";
import "./Tournament.css";
import Loading from "../Loading";
import Error from "../Error";
import { CalendarIcon, PencilIcon } from "../Icons";

export default function EditTournament() {
    const { tournamentId } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [generatingMatches, setGeneratingMatches] = useState(false);
    const [error, setError] = useState(null);
    const [tournament, setTournament] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        game: "",
        format: "Single Elimination",
        start_date: "",
        end_date: "",
        max_teams: 8,
    });

    useEffect(() => {
        const fetchTournament = async () => {
            try {
                setLoading(true);
                const tournamentData = await api.tournamentDetail(tournamentId);
                
                if (user.data.id !== tournamentData.organizer.id) {
                    setError("You are not authorized to edit this tournament");
                    setLoading(false);
                    return;
                }
                
                setTournament(tournamentData);
                
                const formatDateForInput = (dateString) => {
                    return new Date(dateString).toISOString().split('T')[0];
                };
                
                setFormData({
                    name: tournamentData.name,
                    game: tournamentData.game,
                    format: tournamentData.format,
                    start_date: formatDateForInput(tournamentData.start_date),
                    end_date: formatDateForInput(tournamentData.end_date),
                    max_teams: tournamentData.max_teams
                });
                
            } catch (err) {
                console.error(err);
                setError("Failed to fetch tournament details");
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchTournament();
        }
    }, [tournamentId, user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            const startDate = new Date(formData.start_date);
            const endDate = new Date(formData.end_date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            // Validate dates
            if (tournament.teams.length > 0 && startDate > new Date(tournament.start_date)) {
                setError("Cannot change start date to a later date when teams have already joined");
                setSubmitting(false);
                return;
            }

            if (endDate < startDate) {
                setError("End date must be after start date");
                setSubmitting(false);
                return;
            }

            const formatDate = (date) => {
                return date.toISOString().split('T')[0];
            };

            const updateData = {
                ...formData,
                start_date: formatDate(startDate),
                end_date: formatDate(endDate),
                organizer_id: user.data.id
            };

            if (tournament.teams.length > 0 && formData.max_teams < tournament.teams.length) {
                setError(`Cannot reduce maximum teams below current team count (${tournament.teams.length})`);
                setSubmitting(false);
                return;
            }

            await api.updateTournament(tournamentId, updateData);
            navigate(`/tournaments/${tournamentId}`);
        } catch (err) {
            console.error("Error updating tournament:", err);
            setError(err.message || "Failed to update tournament. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleGenerateMatches = async () => {
        if (!window.confirm("Are you sure you want to generate matches? This will lock the tournament structure and you won't be able to change the maximum number of teams afterwards.")) {
            return;
        }
        
        try {
            setGeneratingMatches(true);
            setError(null);
            await api.generateTournamentMatches(tournamentId);
            
            const updatedTournament = await api.tournamentDetail(tournamentId);
            setTournament(updatedTournament);
        } catch (err) {
            console.error("Error generating matches:", err);
            setError(err.message || "Failed to generate tournament matches. Please try again.");
        } finally {
            setGeneratingMatches(false);
        }
    };

    if (!user) {
        return <Error error="You must be logged in to edit a tournament" />;
    }

    if (loading) {
        return <Loading text="Loading tournament details..." />;
    }

    if (error && !tournament) {
        return <Error error={error} />;
    }

    return (
        <div className="create-tournament-container">
            {error && <Error error={error} />}
            
            <form className="create-tournament-card" onSubmit={handleSubmit}>
                <h1 className="page-title">Edit Tournament</h1>
                
                <div className="form-group">
                    <label htmlFor="name">Tournament Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="form-control"
                        placeholder="Enter tournament name"
                    />
                </div>
                
                <div className="form-group">
                    <label htmlFor="game" className="input-label">
                        <PencilIcon /> Game
                    </label>
                    <input
                        type="text"
                        id="game"
                        name="game"
                        value={formData.game}
                        onChange={handleInputChange}
                        required
                        className="form-control"
                        placeholder="e.g., CS2, League of Legends, Valorant"
                    />
                </div>
                
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="start_date" className="input-label">
                            <CalendarIcon /> Start Date
                        </label>
                        <input
                            type="date"
                            id="start_date"
                            name="start_date"
                            value={formData.start_date}
                            onChange={handleInputChange}
                            required
                            className="form-control"
                            disabled={tournament.teams.length > 0}
                            title={tournament.teams.length > 0 ? "Cannot change start date when teams have joined" : ""}
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="end_date" className="input-label">
                            <CalendarIcon /> End Date
                        </label>
                        <input
                            type="date"
                            id="end_date"
                            name="end_date"
                            value={formData.end_date}
                            onChange={handleInputChange}
                            required
                            className="form-control"
                        />
                    </div>
                </div>
                
                <div className="form-group">
                    <label htmlFor="max_teams">Maximum Number of Teams</label>
                    <select
                        id="max_teams"
                        name="max_teams"
                        value={formData.max_teams}
                        onChange={handleInputChange}
                        required
                        className="form-control"
                        disabled={tournament.matches.length > 0}
                    >
                        <option value="4" disabled={tournament.teams.length > 4}>4 Teams</option>
                        <option value="8" disabled={tournament.teams.length > 8}>8 Teams</option>
                        <option value="16" disabled={tournament.teams.length > 16}>16 Teams</option>
                        <option value="32" disabled={tournament.teams.length > 32}>32 Teams</option>
                        <option value="64" disabled={tournament.teams.length > 64}>64 Teams</option>
                        <option value="128">128 Teams</option>
                    </select>
                    
                    {tournament.teams.length > 0 && (
                        <small>
                            Currently {tournament.teams.length} teams registered
                        </small>
                    )}
                    {tournament.matches.length > 0 && (
                        <small style={{ color: "#f39c12", marginTop: "5px", display: "block" }}>
                            Matches have been generated. Maximum teams cannot be modified.
                        </small>
                    )}
                </div>

                <div className="tournament-actions-section">
                    <h3 className="section-subtitle">Tournament Bracket</h3>
                    
                    {!tournament.matches.length ? (
                        <>
                            <div className="alert alert-warning">
                                <strong>Warning:</strong> Generating matches will lock the tournament structure. 
                                After generating matches, you won't be able to change the maximum number of teams 
                                or allow new teams to join. Make sure all teams have registered before proceeding.
                            </div>
                            
                            <button
                                type="button"
                                className="btn generate-matches-btn"
                                onClick={handleGenerateMatches}
                                disabled={generatingMatches || tournament.teams.length < 2}
                            >
                                {generatingMatches ? "Generating..." : "Generate Tournament Matches"}
                            </button>
                            
                            {tournament.teams.length < 2 && (
                                <small style={{ color: "#e74c3c", marginTop: "5px", display: "block" }}>
                                    At least 2 teams are required to generate matches
                                </small>
                            )}
                        </>
                    ) : (
                        <div className="alert alert-success">
                            Matches have been generated. The tournament is now locked and ready to proceed.
                            View the tournament page to manage matches.
                        </div>
                    )}
                </div>

                <div className="form-actions">
                    <button 
                        type="submit" 
                        className="btn main-button" 
                        disabled={submitting}
                    >
                        {submitting ? "Saving..." : "Save Changes"}
                    </button>
                    <button 
                        type="button" 
                        className="btn btn-secondary" 
                        onClick={() => navigate(`/tournaments/${tournamentId}`)}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}