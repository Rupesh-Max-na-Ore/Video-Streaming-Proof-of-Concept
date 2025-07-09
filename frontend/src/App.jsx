import { useRef } from 'react';
import './App.css';
import VideoPlayer from './VideoPlayer';

function App() {
  const playerRef = useRef(null);

  // Replace with the correct video URL from your backend
  const videoLink = "http://localhost:8000/uploads/c19031a2-7db3-4a33-986a-5cd86c0f01a8/index.m3u8";

  const videoPlayerOptions = {
    autoplay: false,
    controls: true,
    responsive: true,
    fluid: true,
    sources: [
      {
        src: videoLink,
        type: "application/x-mpegURL",
      },
    ],
  };

  const handlePlayerReady = (player) => {
    playerRef.current = player;

    // Example player event listeners
    player.on("waiting", () => {
      console.log("player is waiting");
    });

    player.on("dispose", () => {
      console.log("player will dispose");
    });
  };

  return (
    <div className="App">
      <h1>React + Video.js HLS Player</h1>
      <VideoPlayer options={videoPlayerOptions} onReady={handlePlayerReady} />
    </div>
  );
}

export default App;
