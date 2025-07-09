export const getTeamColor = (name) => {
    const colors = [
      "#6c5ce7", // primary
      "#00b894", // secondary
      "#e74c3c", // danger
      "#f39c12", // warning
      "#3498db", // info
      "#e84393", // pink
      "#1abc9c", // teal
      "#d63031", // red
      "#0984e3", // blue
      "#00cec9", // cyan
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };


export const getTournamentStatusClass = (tournament) => {
  const startDate = new Date(tournament.start_date);
  const endDate = new Date(tournament.end_date);
  const today = new Date();

  if (today < startDate) return "upcoming";
  if (today >= startDate && today <= endDate) return "active";
  return "completed";
};