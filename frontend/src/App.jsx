import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Home from "./components/Home/Home";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Header from "./components/Header/Header";
import { AuthProvider } from "./AuthContext";
import TournamentsList from "./components/TournamentList/TournamentList";
import PrivateRoute from "./components/PrivateRoute";
import MatchesList from "./components/MatchesList/MatchesList";
import TeamsList from "./components/TeamsList/TeamsList";
import './App.css';
import Tournament from "./components/Tournament/Tournament";
import Team from "./components/Team/Team";
import Match from "./components/Match/Match";
import CreateTeam from "./components/CreateTeam/CreateTeam";
import PasswordReset from "./components/PasswordReset/PasswordReset";
import PasswordResetConfirm from "./components/PasswordReset/ConfirmPasswordReset";
import CreateMatch from "./components/Match/CreateMatch";
import EditMatch from "./components/Match/EditMatch";
import CreateTournament from "./components/Tournament/CreateTournament";
import EditTournament from "./components/Tournament/EditTournament";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="container">
          <Header />
          <main className="content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/password-reset" element={<PasswordReset />} />
              <Route path="/password-reset/confirm" element={<PasswordResetConfirm />} />
              <Route element={<PrivateRoute />}>
                <Route path="/tournaments" element={<TournamentsList />} />
                <Route path="/matches" element={<MatchesList />} />
                <Route path="/teams" element={<TeamsList />} />
                <Route path="/tournaments/:id" element={<Tournament />} />
                <Route path="/teams/:id" element={<Team />} />
                <Route path="/matches/:id" element={<Match />} />
                <Route path="/create/team/" element={<CreateTeam />} />
                <Route path="/create/tournament/" element={<CreateTournament />} />
                <Route path="/edit/tournament/:tournamentId" element={<EditTournament />} />
                <Route path="/create/match/:tournamentId" element={<CreateMatch />} />
                <Route path="/edit/match/:matchId" element={<EditMatch />} />
              </Route>
              <Route path="*" element={<Home />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}
