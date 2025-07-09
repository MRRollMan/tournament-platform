import { use, useContext, useEffect, useState } from "react";
import { api } from "../../api";
import './TournamentList.css';
import Loading from "../Loading";
import Error from "../Error";
import Filter from "../Filter";
import Search from "../Search";
import { ArrowIcon, NoTournamentsIcon } from "../Icons";
import TournamentComponent from "../TournamentComponent";
import { getTournamentStatusClass } from "../../utils";
import { AuthContext } from "../../AuthContext";
import { Link } from "react-router-dom";

export default function TournamentsList() {
  const { user } = useContext(AuthContext);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const tournaments = await api.tournaments();
        setTournaments(tournaments);
      } catch (err) {
        setError("Failed to fetch tournaments");
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, []);

  const filteredTournaments = tournaments.filter((tournament) => {
    if (filter !== "all") {
      const status = getTournamentStatusClass(tournament);
      if (status !== filter) return false;
    }

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      return (
        tournament.name.toLowerCase().includes(query) ||
        tournament.game.toLowerCase().includes(query)
      );
    }

    return true;
  });


  if (loading) 
    return <Loading text="Loading tournaments..."/>;
  
  if (error) return <Error error={error}/>
  console.log(user.data.role)

  return (
    <div className="tournaments-container">
      <div className="tournaments-header">
        <h2 className="subtitle">Tournaments
        {user.data.role === "organizer" && (
          <Link to="/create/tournament/" className="create-tournament">
            Create Tournament
          </Link>
        )}
        </h2>
        
        <div className="tournaments-controls">
          <Search text="Search tournaments..." searchQuery={searchQuery} setSearchQuery={setSearchQuery}/>
          <Filter buttons={["All", "Upcoming", "Active", "Completed"]} filter={filter} setFilter={setFilter}/>
        </div>
      </div>

      {filteredTournaments.length === 0 ? (
        <div className="no-tournaments">
          <NoTournamentsIcon />
          <p>No tournaments found</p>
          {searchQuery && <p className="search-message">Try a different search term</p>}
        </div>
      ) : (
        <div className="tournament-grid">
          {filteredTournaments.map((tournament) => {
            
            return <TournamentComponent key={tournament.id} tournament={tournament} />
          })}
        </div>
      )}
    </div>
  );
}