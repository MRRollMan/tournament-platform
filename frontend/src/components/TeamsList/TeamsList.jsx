import { useContext, useEffect, useState } from "react";
import { api } from "../../api";
import './TeamsList.css';
import Loading from "../Loading";
import Error from "../Error";
import Search from "../Search";
import { getTeamColor } from "../../utils";
import { ArrowIcon, NoTeamsIcon } from "../Icons";
import { Link } from "react-router-dom";
import { AuthContext } from "../../AuthContext";

export default function TeamsList() {
  const { user } = useContext(AuthContext);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const teams = await api.teams();
        setTeams(teams);
      } catch (err) {
        setError("Failed to fetch teams");
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  const filteredTeams = teams.filter((team) => {
    if (searchQuery.trim() === "") return true;
    return team.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getInitial = (name) => {
    return name.charAt(0).toUpperCase();
  };

  if (loading) return <Loading text="Loading teams..."/>
  
  if (error) return <Error error={error}/>

  return (
    <div className="teams-container">
      <div className="teams-header">
        <h2 className="subtitle">Teams</h2>
        <Search text="Search teams..." searchQuery={searchQuery} setSearchQuery={setSearchQuery}/>
      </div>

      {user?.data?.role === "captain" && (
        <div className="create-team-wrapper">
          <Link to="/create/team/" className="create-team-button">
            Create Team
          </Link>
        </div>
      )}

      {filteredTeams.length === 0 ? (
        <div className="no-teams">
          <NoTeamsIcon />
          <p>No teams found</p>
          {searchQuery && <p className="search-message">Try a different search term</p>}
        </div>
      ) : (
        <div className="teams-grid">
          {filteredTeams.map((team) => {
            const teamColor = getTeamColor(team.name);
            
            return (
              <Link to={`/teams/${team.id}/`} key={team.id} className="team-card-link">
                <div className="team-card">
                  <div 
                    className="team-avatar"
                    style={{ 
                      backgroundColor: teamColor,
                      boxShadow: `0 10px 20px -3px ${teamColor}40`
                    }}
                  >
                    {team.logo ? (
                      <img src={team.logo} alt={`${team.name} logo`} />
                    ) : (
                      <span className="team-initial">{getInitial(team.name)}</span>
                    )}
                  </div>
                  <div className="team-info">
                    <h3 className="team-name">{team.name}</h3>
                    <div className="team-stats">
                      <div className="stat">
                        <span className="stat-value">{team.total_matches || 0}</span>
                        <span className="stat-label">Matches</span>
                      </div>
                      <div className="stat">
                        <span className="stat-value">{team.wins || 0}</span>
                        <span className="stat-label">Wins</span>
                      </div>
                      <div className="stat">
                        <span className="stat-value">{team.losses || 0}</span>
                        <span className="stat-label">Losses</span>
                      </div>
                    </div>
                  </div>
                  <div className="view-team">
                    <span>View Team</span>
                    <ArrowIcon />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}