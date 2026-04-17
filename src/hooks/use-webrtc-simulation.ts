import { useState, useEffect, useCallback } from "react";

// A mock hook to simulate WebRTC live room behavior for UI demonstration
export function useWebRTCSimulation(roomId: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState<any[]>([]);
  const [liveVotes, setLiveVotes] = useState(0);

  useEffect(() => {
    // Simulate connection delay
    const timer = setTimeout(() => {
      setIsConnected(true);
      setParticipants([
        { id: 1, name: "Ali Yılmaz", isHost: true },
        { id: 2, name: "Zeynep K.", isHost: false },
        { id: 3, name: "Caner D.", isHost: false },
      ]);
    }, 1500);

    // Simulate incoming votes
    const voteInterval = setInterval(() => {
      setLiveVotes(prev => prev + Math.floor(Math.random() * 5));
    }, 3000);

    return () => {
      clearTimeout(timer);
      clearInterval(voteInterval);
    };
  }, [roomId]);

  const sendVote = useCallback(() => {
    setLiveVotes(prev => prev + 1);
  }, []);

  return {
    isConnected,
    participants,
    liveVotes,
    sendVote
  };
}
