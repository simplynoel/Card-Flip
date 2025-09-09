import { useState, useEffect } from 'react'
//for styiling
import './App.scss'
//Card type and utility functions
import { type Card, initializeCards, gridSizes } from './utils/Card'
//Scoring
import { type Score, type Difficulty, type Hiscore } from './utils/Scoring'
//Sound and Visual Effects
import useSound from 'use-sound';
import flipSound from './assets/cardflip.mp3';
import winSound from './assets/people-cheering.mp3';
import BGM from './assets/bgm.mp3';
import matched from './assets/game-won.mp3';
import Celebration from './assets/animation/Celebration';



function App() {

  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<string[]>([]);
  const [matchesFound, setMatchesFound] = useState(0);
  const [moves, setMoves] = useState(0);
  const [isGameWon, setIsGameWon] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [isBgmMuted, setIsBgmMuted] = useState(false);
  const [isFlipMuted, setIsFlipMuted] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [playBGM, { stop, sound }] = useSound(BGM, { loop: true, volume: isBgmMuted ? 0 : 1 });
  const [play] = useSound(flipSound, { volume: isFlipMuted ? 0 : 1 });
   const [matchFound] = useSound(matched, { volume: isFlipMuted ? 0 : 1 });
  const [playWinSound] = useSound(winSound, { volume: isGameWon ? 1 : 0 })
  //scoring 
  const [newHighScore, setNewHighScore] = useState<Score | null>(null);
  const [bestScores, setBestScores] = useState({
    easy: { time: null, moves: null },
    medium: { time: null, moves: null },
    hard: { time: null, moves: null },
  });

  
// Load best scores once on mount
useEffect(() => {
  const savedScores = localStorage.getItem('bestMemoryGameScores');
  if (savedScores) {
    setBestScores(JSON.parse(savedScores));
  }
}, []);

// Save best scores whenever they change
useEffect(() => {
  localStorage.setItem('bestMemoryGameScores', JSON.stringify(bestScores));
}, [bestScores]);

const handleGameEnd = (time: number, moves: number, currentDifficulty: ("easy"|"medium"|"hard") ) => {
  setBestScores(prevScores => {
    const currentBest = prevScores[currentDifficulty];
    const isNewTimeBetter = currentBest.time === null || time < currentBest.time;
    const isNewMovesBetter = currentBest.moves === null || moves < currentBest.moves;
    // Only update if better
    if (isNewTimeBetter || isNewMovesBetter) {
      return {
        ...prevScores,
        [currentDifficulty]: { 
          time: isNewTimeBetter ? time : currentBest.time,
          moves: isNewMovesBetter ? moves : currentBest.moves,
        },
      };
    }
    return prevScores;
  });
};

// When game is won, call handleGameEnd
useEffect(() => {
  if (isGameWon) {
    handleGameEnd(timer, moves, difficulty);
  }
}, [isGameWon]);

  

  //plays the bgm on start
  useEffect(() => {
    playBGM();
    return () => {
      stop();
    };
  }, [playBGM, stop]);

  useEffect(() => {
    if (sound) {
      sound.volume(isBgmMuted ? 0 : 1);
    }
  }, [isBgmMuted, sound]);

  useEffect(() => {
    setCards(initializeCards(difficulty));
    setFlippedCards([]);
    setMatchesFound(0);
    setMoves(0);
    setIsGameWon(false);
    setTimer(0);
    setIsTimerActive(true);
  }, [difficulty]);

useEffect(() => {
  if (flippedCards.length === 2) {
    setMoves(prevMoves => prevMoves + 1);
    const [firstCardId, secondCardId] = flippedCards;
    const firstCard = cards.find(card => card.id === firstCardId);
    const secondCard = cards.find(card => card.id === secondCardId);

    if (firstCard && secondCard && firstCard.value === secondCard.value) {
      setCards(prevCards =>
        prevCards.map(card =>
          card.id === firstCardId || card.id === secondCardId ? { ...card, matched: true } : card
        )
      );
      setMatchesFound(prevMatches => prevMatches + 1);
      setFlippedCards([]);
      setIsTimerActive(false); 
      setTimeout(() => {
        setIsTimerActive(true); 
      }, 800); 
    } else {
      setTimeout(() => {
        setCards(prevCards =>
          prevCards.map(card =>
            card.id === firstCardId || card.id === secondCardId ? { ...card, flipped: false } : card
          )
        );
        setFlippedCards([]);
      }, 1000);
    }
  }
}, [flippedCards, cards]);

  useEffect(() => {
    const size = gridSizes[difficulty];
    const totalPairs = (size * size) / 2;
    if (matchesFound === totalPairs) {
      setIsGameWon(true);
      setIsTimerActive(false);
    }
  }, [matchesFound, difficulty]);
  
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (hasStarted && isTimerActive && !isGameWon) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [hasStarted, isTimerActive, isGameWon]);

  const handleCardClick = (id: string) => {
    const clickedCard = cards.find(card => card.id === id);

    if (!clickedCard || clickedCard.flipped || clickedCard.matched || flippedCards.length === 2) {
      return;
    }

    // Start timer on first flip
    if (!hasStarted) setHasStarted(true);

    setCards(prevCards =>
      prevCards.map(card =>
        card.id === id ? { ...card, flipped: true } : card
      )
    );
    setFlippedCards(prev => [...prev, id]);
    play(); 
  };

  useEffect(() => {
      matchFound(); 
  }, [matchesFound, matchFound]);

  const handleRestartGame = () => {
    setCards(initializeCards(difficulty));
    setFlippedCards([]);
    setMatchesFound(0);
    setMoves(0);
    setIsGameWon(false);
    setTimer(0);
    setIsTimerActive(true);
    setHasStarted(false); 
  };


  const handleLevelChange = (level: 'easy' | 'medium' | 'hard') => {
    setDifficulty(level);
  };

  

useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && showSettings) {
      setShowSettings(false);
    }
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => {
    window.removeEventListener('keydown', handleKeyDown);
  };
}, [showSettings]);

useEffect(() => { 
  if (isGameWon === true && isBgmMuted === false) {
   playWinSound();
  }
}, [isGameWon, isBgmMuted]); 

return (
  <div className="App">
    <div className="panel">
      <div className="GameHeader">
        <div className="GameStats">
          <div className="StatBox">
            <span role="img" aria-label="moves">🔄</span>
            <span>{moves} Moves</span>
          </div>
          <div className="StatBox">
            <span role="img" aria-label="timer">⏱️</span>
            <span>{timer}s</span>
          </div>
          <div className="StatBox">
            <span role="img" aria-label="pairs">🎯</span>
            <span>{matchesFound} / {(gridSizes[difficulty] * gridSizes[difficulty]) / 2} Pairs</span>
          </div>
          <div className='StatBox'>
            <button className="icon-btn" title="Restart" onClick={handleRestartGame}>
              <span role="img" aria-label="restart" className='btn-icon'>🔄</span>
            </button>
            <button className="icon-btn" title="Mute/Unmute BGM" onClick={() => setIsBgmMuted(!isBgmMuted)}>
              <span role="img" aria-label="bgm" className='btn-icon'>{isBgmMuted ? "🔇" : "🔊"}</span>
            </button>
            <button className="icon-btn" title="Mute/Unmute Card Flip" onClick={() => setIsFlipMuted(!isFlipMuted)}>
              <span role="img" aria-label="flip" className='btn-icon'>{isFlipMuted ? "🔕" : "🔔"}</span>
            </button>
            <button
              className="icon-btn"
              title="Settings"
              onClick={() => setShowSettings(true)}
              style={{ position: "relative" }}
            >
              <span role="img" aria-label="settings" className='btn-icon'>⚙️</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    <div className="card-container">
      <div className={`CardGrid ${difficulty}`}>
        {cards.map(card => (
          <div
            key={card.id}
            className={`Card${card.flipped || card.matched ? " Flipped" : ""}`}
            onClick={() => handleCardClick(card.id)}
          >
          <div className="CardInner">
            <div className="CardBack"></div>      
            <div className="CardFront">{card.value}</div> 
          </div>
          </div>
        ))}
      </div>
      {isGameWon && (
        <div className="WinModal">
          <div className="WinBox">
            {(
              (bestScores[difficulty].moves === null || moves < bestScores[difficulty].moves) ||
              (bestScores[difficulty].time === null || timer < bestScores[difficulty].time)
            ) ? (
              <span className='thropy' style={{ fontSize: "3rem", animation: "trophyBounce 1s infinite" }}>🏆</span>
            ) : (
              <span className='thropy' style={{ fontSize: "3rem", animation: "trophyBounce 1s infinite" }}>🥇</span>
            )}
            <Celebration />
            <h2 style={{ marginBottom: "0.5rem" }}>Congratulations!</h2>
            <p style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>
              You won the game in <strong>{moves}</strong> moves and <strong>{timer}</strong> seconds.
            </p>
            <div style={{
              background: "rgba(255,255,255,0.08)",
              borderRadius: "10px",
              padding: "1rem",
              marginBottom: "1rem",
              boxShadow: "0 2px 8px #0002"
            }}>
              <h3 style={{ margin: "0 0 0.5rem 0" }}>Best Scores ({difficulty}):</h3>
              <p>
                Least Moves: <strong>{bestScores[difficulty].moves ?? '--'}</strong>
                <br />
                Best Time: <strong>{bestScores[difficulty].time ?? '--'}s</strong>
              </p>
              <p style={{ marginTop: "0.5rem", fontSize: "0.95rem" }}>
                {((bestScores[difficulty].moves === null || moves < bestScores[difficulty].moves) ||
                  (bestScores[difficulty].time === null || timer < bestScores[difficulty].time))
                  ? "🎉 New High Score! You beat your best record!" 
                  : "🥇 Good job! Try again to beat your best score."}
              </p>
            </div>
            <button className="difficulty_btn" onClick={handleRestartGame}>Play Again</button>
          </div>
        </div>
      )}
    </div>
    {showSettings && (
      <div className="settings-popup">
        <div className="settings-content">
          <button
            className="close-btn"
            onClick={() => setShowSettings(false)}
            title="Close"
          >
            ×
          </button>
          <h2>Settings</h2>
          <div>
            <div className="DifficultySelect">
              <button className={`difficulty_btn${difficulty === "easy" ? " selected" : ""}`} onClick={() => [handleLevelChange("easy"), setShowSettings(false)]}>Easy</button>
              <button className={`difficulty_btn${difficulty === "medium" ? " selected" : ""}`} onClick={() => [handleLevelChange("medium"), setShowSettings(false)]}>Medium</button>
              <button className={`difficulty_btn${difficulty === "hard" ? " selected" : ""}`} onClick={() => [handleLevelChange("hard"), setShowSettings(false)]}>Hard</button>
            </div>
            <p>choose game difficulty.</p>
          </div>
        </div>
      </div>
    )}
  </div>
);
}

export default App
