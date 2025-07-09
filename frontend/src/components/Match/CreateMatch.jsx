import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../api";
import "./CreateMatch.css";
import Loading from "../Loading";
import Error from "../Error";
import { CalendarIcon } from "../Icons";

export default function CreateMatch() {
    const { tournamentId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        tournament_id: "",
        team1_id: "",
        team2_id: "",
        match_time: "",
        status: "scheduled"
    });
    const [tournament, setTournament] = useState([]);
    const [teams, setTeams] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoadingData(true);
                const tournamentsResponse = await api.tournamentDetail(tournamentId);
                setTournament(tournamentsResponse);
                setFormData({
                    ...formData,
                    "tournament_id": tournamentsResponse.id,
                })
                setTeams(tournamentsResponse.teams);
            } catch (err) {
                console.error(err);
                setError(`Failed to load data: ${err.message || "Unknown error"}`);
            } finally {
                setLoadingData(false);
            }
        };

        fetchInitialData();
    }, []);

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
            if (formData.team1_id === formData.team2_id) {
                setError("Teams cannot play against themselves");
                setLoading(false);
                return
            }
            const formDataWithUTC = { ...formData, match_time: new Date(formData.match_time).toISOString() };
            const response = await api.createMatch(formDataWithUTC);
            navigate(`/matches/${response.id}`);
        } catch (err) {
            console.error(err);
            setError(`Failed to create match: ${err.message || "Unknown error"}`);
            setLoading(false);
        }
    };

    if (loadingData) return <Loading text="Loading data..." />;

    return (
        <div className="create-match-container">
            {error && <Error error={error} />}
            
            <form className="create-match-card" onSubmit={handleSubmit}>
                <h1 className="page-title">Create New Match for {tournament.name}</h1>
                <div className="form-group">
                    <label htmlFor="team1">Team 1</label>
                    <select
                        id="team1"
                        name="team1_id"
                        value={formData.team1_id}
                        onChange={handleInputChange}
                        required
                        className="form-control"
                    >
                        <option value="">Select Team 1</option>
                        {teams.map(team => (
                            <option key={team.id} value={team.id}>
                                {team.name}
                            </option>
                        ))}
                    </select>
                </div>
                
                <div className="form-group">
                    <label htmlFor="team2">Team 2</label>
                    <select
                        id="team2"
                        name="team2_id"
                        value={formData.team2_id}
                        onChange={handleInputChange}
                        required
                        className="form-control"
                    >
                        <option value="">Select Team 2</option>
                        {teams.map(team => (
                            <option key={team.id} value={team.id}>
                                {team.name}
                            </option>
                        ))}
                    </select>
                </div>
                
                <div className="form-group">
                    <label htmlFor="match_time" className="input-label">
                        <CalendarIcon /> Match Date and Time
                    </label>
                    <input
                        type="datetime-local"
                        id="match_time"
                        name="match_time"
                        value={formData.match_time}
                        onChange={handleInputChange}
                        required
                        className="form-control"
                    />
                </div>

                <div className="form-actions">
                    <button 
                        type="submit" 
                        className="btn main-button" 
                        disabled={loading}
                    >
                        {loading ? "Creating..." : "Create Match"}
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