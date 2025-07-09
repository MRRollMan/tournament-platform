import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api";
import { AuthContext } from "../../AuthContext";
import "./Tournament.css";
import Error from "../Error";
import { CalendarIcon, PencilIcon, PulseIcon } from "../Icons";

export default function CreateTournament() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        game: "",
        format: "Single Elimination",
        start_date: "",
        end_date: "",
        max_teams: 8
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const startDate = new Date(formData.start_date);
            const endDate = new Date(formData.end_date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            console.log("startDate:", startDate.toISOString());
            console.log("today:", today.toISOString());

            if (startDate < today) {
                setError("Start date cannot be in the past");
                setLoading(false);
                return
            }

            if (endDate < startDate) {
                setError("End date must be after start date");
                setLoading(false);
                return
            }

            console.log("endDate:", endDate.toISOString());
            const formatDate = (date) => {
                return date.toISOString().split('T')[0];
            };

            const tournamentData = {
                ...formData,
                start_date: formatDate(startDate),
                end_date: formatDate(endDate),
                max_teams: formData.max_teams,
                organizer_id: user.data.id
            };

            const response = await api.createTournament(tournamentData);
            console.log("Tournament created:", response);
            navigate(`/tournaments/${response.id}`);
        } catch (err) {
            console.error("Error creating tournament:", err);
            setError(err.message || "Failed to create tournament. Please try again.");
            setLoading(false);
        }
    };

    if (!user) {
        return <Error error="You must be logged in to create a tournament" />;
    }

    return (
        <div className="create-tournament-container">
            {error && <Error error={error} />}
            
            <form className="create-tournament-card" onSubmit={handleSubmit}>
                <h1 className="page-title">Create a New Tournament</h1>
                
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
                    >
                        <option value="4">4 Teams</option>
                        <option value="8">8 Teams</option>
                        <option value="16">16 Teams</option>
                        <option value="32">32 Teams</option>
                        <option value="64">64 Teams</option>
                        <option value="128">128 Teams</option>
                    </select>
                </div>

                <div className="form-actions">
                    <button 
                        type="submit" 
                        className="btn main-button" 
                        disabled={loading}
                    >
                        {loading ? "Creating..." : "Create Tournament"}
                    </button>
                    <button 
                        type="button" 
                        className="btn btn-secondary" 
                        onClick={() => navigate(-1)}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
