import React, { useMemo } from 'react';
import { SingleEliminationBracket, Match, SVGViewer } from '@g-loot/react-tournament-brackets'
import './TournamentBrackets.css';

export default function TournamentBrackets({ matches }) {
  const formattedMatches = useMemo(() => {
    if (!matches || matches.length === 0) return [];
    
    const sortedMatches = [...matches].sort((a, b) => a.id - b.id);
    const totalMatches = sortedMatches.length;
    const matchRounds = [];


    let roundIndex = 1;
    let currentMatchIndex = 0;
    const teamsCount = (totalMatches + 1) / 2;
    sortedMatches.forEach((match, index) => {
      currentMatchIndex++;
      console.log("Current Match Index: ", currentMatchIndex, "Teams Count: ", teamsCount, "ddd", currentMatchIndex/teamsCount * roundIndex)
      if (currentMatchIndex/((totalMatches + 1) / 2) * roundIndex >= 1){
        roundIndex++;
        currentMatchIndex = 0;
      }
      console.log("Round Index: ", roundIndex)
      matchRounds.push(roundIndex);
    });

    let curremtRoundIndex = matchRounds.length-1;
    
    return sortedMatches.map(match => {
        let state;
        switch (match.status.toLowerCase()) {
          case 'completed':
            state = 'DONE';
            break;
          case 'ongoing':
            state = 'RUNNING';
            break;
          default:
            state = 'SCHEDULED';
        }
        
        const participants = [];
        let id;
        let is_winner;

        if (match.team1){
            id = match.team1.id;
            is_winner = match.result ? match.result.winner == id : false;
            participants.push({
                id: id.toString(),
                name: match.team1.name,
                status: match.status === 'completed' ? 'PLAYED' : null,
                isWinner: match.status === 'completed' ? is_winner : false,
                resultText: match.status === 'completed' ? (is_winner ? 'Won' : 'Lost') : null,
            });
        }
        
        if (match.team2){
            id = match.team2.id;
            is_winner = match.result ? match.result.winner == id : false;
            participants.push({
                id: id.toString(),
                name: match.team2.name,
                status: match.status === 'completed' ? 'PLAYED' : null,
                isWinner: match.status === 'completed' ? is_winner : false,
                resultText: match.status === 'completed' ? (is_winner ? 'Won' : 'Lost') : null,
            });
        }
        let match_time = ""
        if (match.match_time){
          match_time = new Date(match.match_time).toISOString().split('T')[0];
        }else{
          match_time = "Soon";
        }

        curremtRoundIndex--;

        console.log("Current Round Index: ", curremtRoundIndex, "Match Rounds: ", matchRounds[curremtRoundIndex])
        
        
        return {
          id: match.id,
          href: '/matches/' + match.id,
          nextMatchId: match.next_match,
          tournamentRoundText: 1,
          startTime: match_time,
          state,
          participants,
        };
      });
  }, [matches]);
  
  if (!matches || matches.length === 0) {
    return (
      <div className="bracket-loading">
        <p>No matches available for bracket visualization</p>
      </div>
    );
  }

  const height = Math.max(500, formattedMatches.length * 80 * 2);
  const width = Math.min(1000, window.innerWidth - 60);

  return (
    <div className="tournament-bracket-container">
        <SingleEliminationBracket
            matches={formattedMatches}
            matchComponent={Match}
            svgWrapper={({ children, ...props }) => (
            <SVGViewer 
                width={width} 
                height={height} 
                {...props}
                background="transparent"
                SVGBackground="transparent"
            >
                {children}
            </SVGViewer>
            )}
            options={{
              style: {
                  roundHeader: {
                    fontSize: 16,
                  },
                  connectorColor: "rgba(255, 255, 255, 0.3)",
                  connectorColorHighlight: "rgba(108, 92, 231, 0.8)",
              }
            }}
        />
    </div>
  );
}