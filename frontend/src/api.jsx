import axios from "axios"
import { ACCESS_TOKEN, REFRESH_TOKEN, BACKEND_URL } from "./constants"
import { jwtDecode } from "jwt-decode"
import { clear_auth_storage } from "./AuthContext"



const ax_api = axios.create({
    baseURL: BACKEND_URL
})

ax_api.interceptors.request.use(
    async (config) => {
        const ignore = ["refresh", "logout", "login"]
        if (ignore.some(i => config.url.includes(i)))
            return config
        const token = await check_token()
        if (token)
            config.headers.Authorization = `Bearer ${token}`
        return config
    },
    (error) => {
        Promise.reject(error)
    }
)

async function check_token(){
    let token = localStorage.getItem(ACCESS_TOKEN)
    if (!token)
        return null

    const decodedToken = jwtDecode(token)
    const expiration = decodedToken.exp
    const now = Date.now() / 1000
    if (expiration < now){
        token = (await refresh_token())
    }
    return token
}

async function refresh_token(){
    const refreshToken = localStorage.getItem(REFRESH_TOKEN)
    try{
        const { access } = await api.refresh(refreshToken)
        localStorage.setItem(ACCESS_TOKEN, access)
        return access

    }catch(err){
        console.log("err", err)
        clear_auth_storage()
    }
}


export const api = {
    login: async (username, password) => {
        const response = await ax_api.post("/api/auth/login/", {
            username,
            password,
        });
        return response.data;
    },
    
    register: async (username, password, email) => {
        const response = await ax_api.post("/api/auth/register/", {
            username,
            password, 
            email
        });
        return response.data;
    },

    logout: async (refresh) => {
        const response = await ax_api.post("/api/auth/logout/", {refresh});
        return response.data;
    },

    refresh: async (refresh) => {
        const response = await ax_api.post("/api/auth/refresh/", {refresh});
        return response.data;
    },

    tournaments: async (status = null) => {
        const response = await ax_api.get("/api/tournaments/?status=" + status);
        return response.data;
    },

    tournamentDetail: async (id) => {
        const response = await ax_api.get("api/tournaments/" + id + "/");
        return response.data;
    },

    matches: async () => {
        const response = await ax_api.get("/api/matches/");
        return response.data;
    },

    matchDetail: async (id) => {
        const response = await ax_api.get("api/matches/" + id + "/");
        return response.data;
    },

    teams: async () => {
        const response = await ax_api.get("/api/teams/");
        return response.data;
    },

    teamDetail: async (id) => {
        const response = await ax_api.get("api/teams/" + id + "/");
        return response.data;
    },

    createTeam: async (teamData) => {
        const response = await ax_api.post("api/teams/", teamData);
        return response.data;
    },

    resetPassword: async (email) => {
        const response = await ax_api.post("api/auth/reset-password/", { email });
        return response.data;
    },

    confirmResetPassword: async (email, new_password, token) => {
        const response = await ax_api.post("api/auth/reset-password/confirm/", {email, new_password, token });
        return response.data;
    },

    createMatch: async (matchData) => {
        const response = await ax_api.post("api/matches/", matchData);
        return response.data;
    },

    updateMatch: async (match_id, matchData) => {
        const response = await ax_api.put("api/matches/" + match_id + "/", matchData);
        return response.data;
    },

    endMatch: async (match_id, matchData) => {
        const response = await ax_api.post("api/matches/" + match_id + "/end/", matchData);
        return response.data;
    },

    getUserTeams: async () => {
        const response = await ax_api.get("/api/teams/my-teams/");
        return response.data;
    },

    joinTournament: async (tournament_id, team_id) => {
        const response = await ax_api.post("/api/tournaments/" + tournament_id + "/join/", {team_id});
        return response.data;
    },

    createTournament: async (tournamentData) => {
        const response = await ax_api.post("api/tournaments/", tournamentData);
        return response.data;
    },

    updateTournament: async (tournament_id, tournamentData) => {
        const response = await ax_api.put("api/tournaments/" + tournament_id + "/", tournamentData);
        return response.data;
    },

    generateTournamentMatches: async (tournament_id) => {
        const response = await ax_api.post("api/tournaments/" + tournament_id + "/generate-matches/");
        return response.data;
    },
}
