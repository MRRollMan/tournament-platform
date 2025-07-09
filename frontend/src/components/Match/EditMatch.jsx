import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../api";
import "./CreateMatch.css";
import Loading from "../Loading";
import Error from "../Error";
import { CalendarIcon } from "../Icons";

export default function EditMatch() {
    const { matchId } = useParams();
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
    const [endFormData, setEndFormData] = useState(
        {
            winner: "",
            score_team1: 0,
            score_team2: 0,
        }
    );
    
    const [endMatch, setEndMatch] = useState(false);
    const [hasResult, setHasResult] = useState(false);
    const [match, setMatch] = useState({});
    const [tournament, setTournament] = useState([]);
    const [teams, setTeams] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoadingData(true);
                const matchResponse = await api.matchDetail(matchId);
                setFormData({
                    "team1_id": matchResponse.team1?.id.toString() || "" ,
                    "team2_id": (matchResponse.team2?.id.toString()) || "" ,
                    "tournament_id": matchResponse.tournament.id.toString(),
                    "match_time": matchResponse.match_time?.split("Z")[0] || "",
                    "status": matchResponse.status
                })

                if (matchResponse.result){
                    setHasResult(true);
                    setEndFormData({
                        winner: matchResponse.result.winner,
                        score_team1: matchResponse.result.score_team1,
                        score_team2: matchResponse.result.score_team2,
                    })
                }
                setMatch(matchResponse);
                setTournament(matchResponse.tournament);
                setTeams(matchResponse.tournament.teams);
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
            if (formData.team1_id === formData.team2_id & formData.team1_id !== "") {
                setError("Teams cannot play against themselves");
                setLoading(false);
                return
            }
            const newFormData = { ...formData, 
                match_time: new Date(formData.match_time).toISOString(), 
                team1_id: formData.team1_id === "" ? null : formData.team1_id, 
                team2_id: formData.team2_id === "" ? null : formData.team2_id 
            };
            const response = await api.updateMatch(match.id, newFormData);
            
            if (endMatch) {
                await api.endMatch(match.id, endFormData);
            }

            navigate(`/matches/${response.id}`);
        } catch (err) {
            console.error(err);
            setError(`Failed to edit match: ${err.message || "Unknown error"}`);
            setLoading(false);
        }
    };

    if (loadingData) return <Loading text="Loading data..." />;

    return (
        <div className="create-match-container">
            {error && <Error error={error} />}
            
            <form className="create-match-card" onSubmit={handleSubmit}>
                <h1 className="page-title">Edit Match for {tournament.name}</h1>
                <div className="form-group">
                    <label htmlFor="team1">Team 1</label>
                    <select
                        id="team1"
                        name="team1_id"
                        value={formData.team1_id}
                        onChange={handleInputChange}
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
                
                <div className="form-group">
                    <label htmlFor="status">Status</label>
                    <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="form-control"
                    >
                        <option value="scheduled">Scheduled</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="canceled">Canceled</option>
                        {(match.status === "completed" || hasResult) && <option value="completed">Completed</option>}
                    </select>
                </div>
                { match.status !== "completed" && match.status !== "canceled" && (
                    <>
                    <div className="form-group">
                        <label htmlFor="end_match">End Match</label>
                        <input
                            type="checkbox"
                            id="end_match"
                            name="end_match"
                            checked={endMatch}
                            onChange={(e) => setEndMatch(e.target.checked)}
                            className="form-control"
                        />
                    </div>

                    {endMatch && (
                        <div className="form-group">
                            <label htmlFor="winner">Winner</label>
                            <select
                                id="winner"
                                name="winner"
                                value={endFormData.winner}
                                required
                                onChange={(e) => setEndFormData({ ...endFormData, winner: e.target.value })}
                                className="form-control"
                            >
                                <option value="">Select Winner</option>
                                {match.team1 && <option value={match.team1?.id}>{match.team1?.name}</option>}
                                {match.team2 && <option value={match.team2?.id}>{match.team2?.name}</option>}
                            </select>

                            <label htmlFor="score_team1">{match.team1?.name || "Team 1"} Score</label>
                            <input
                                type="number"
                                id="score_team1"
                                name="score_team1"
                                value={endFormData.score_team1}
                                onChange={(e) => setEndFormData({ ...endFormData, score_team1: e.target.value })}
                                className="form-control"
                            />

                            <label htmlFor="score_team2">{match.team2?.name || "Team 1"} Score</label>
                            <input
                                type="number"
                                id="score_team2"
                                name="score_team2"
                                value={endFormData.score_team2}
                                onChange={(e) => setEndFormData({ ...endFormData, score_team2: e.target.value })}
                                className="form-control"
                            />
                        </div>
                    )}
                    </>
                )}

                <div className="form-actions">
                    <button 
                        type="submit" 
                        className="btn main-button" 
                        disabled={loading}
                    >
                        {loading ? "Creating..." : "Save Match"}
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