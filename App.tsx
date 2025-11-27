import React, { useState, useEffect, useCallback } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { UIOverlay } from './components/UIOverlay';
import { Shop } from './components/Shop';
import { GameState, PowerUpType } from './types';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [score, setScore] = useState(0);
  const [coinsCollected, setCoinsCollected] = useState(0);
  const [activePowerUps, setActivePowerUps] = useState<PowerUpType[]>([]);

  // Persistent State (Load from localStorage) with Safety Checks
  const [totalCoins, setTotalCoins] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('sky_dodge_coins');
      const parsed = saved ? parseInt(saved) : 0;
      return isNaN(parsed) ? 0 : parsed;
    } catch (e) {
      return 0;
    }
  });

  const [ownedSkins, setOwnedSkins] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sky_dodge_skins');
      return saved ? JSON.parse(saved) : ['default'];
    } catch (e) {
      return ['default'];
    }
  });

  const [currentSkinId, setCurrentSkinId] = useState<string>(() => {
    return localStorage.getItem('sky_dodge_current_skin') || 'default';
  });

  const [highScore, setHighScore] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('sky_dodge_highscore');
      const parsed = saved ? parseInt(saved) : 0;
      return isNaN(parsed) ? 0 : parsed;
    } catch (e) {
      return 0;
    }
  });
  
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('sky_dodge_darkmode');
    return saved === 'true'; // Default false (Day)
  });

  // Save persistence
  useEffect(() => { localStorage.setItem('sky_dodge_coins', totalCoins.toString()); }, [totalCoins]);
  useEffect(() => { localStorage.setItem('sky_dodge_skins', JSON.stringify(ownedSkins)); }, [ownedSkins]);
  useEffect(() => { localStorage.setItem('sky_dodge_current_skin', currentSkinId); }, [currentSkinId]);
  useEffect(() => { localStorage.setItem('sky_dodge_darkmode', isDarkMode.toString()); }, [isDarkMode]);
  
  // Check High Score on Game Over
  useEffect(() => {
    if (gameState === GameState.GAMEOVER) {
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('sky_dodge_highscore', score.toString());
      }
    }
  }, [gameState, score, highScore]);

  const handleBuySkin = (skinId: string, cost: number) => {
    if (totalCoins >= cost && !ownedSkins.includes(skinId)) {
      setTotalCoins(prev => prev - cost);
      setOwnedSkins(prev => [...prev, skinId]);
    }
  };

  const handleEquipSkin = (skinId: string) => {
    if (ownedSkins.includes(skinId)) {
      setCurrentSkinId(skinId);
    }
  };

  // Wrapped in useCallback to ensure stability and prevent unnecessary re-renders in GameCanvas
  const addCoins = useCallback((amount: number) => {
    setTotalCoins(prev => prev + amount);
  }, []);
  
  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return (
    <div className={`relative w-full h-screen overflow-hidden transition-colors duration-1000 ${isDarkMode ? 'bg-slate-900' : 'bg-sky-400'}`}>
      <GameCanvas 
        gameState={gameState} 
        setGameState={setGameState}
        setScore={setScore}
        setCoinsCollected={setCoinsCollected}
        currentSkinId={currentSkinId}
        addCoins={addCoins}
        activePowerUps={activePowerUps}
        setActivePowerUps={setActivePowerUps}
        isDarkMode={isDarkMode}
      />
      
      <UIOverlay 
        gameState={gameState}
        score={score}
        highScore={highScore}
        coins={totalCoins}
        coinsCollectedInRun={coinsCollected}
        activePowerUps={activePowerUps}
        onStart={() => setGameState(GameState.PLAYING)}
        onOpenShop={() => setGameState(GameState.SHOP)}
        onRestart={() => setGameState(GameState.PLAYING)}
        onMenu={() => setGameState(GameState.MENU)}
        onPause={() => setGameState(GameState.PAUSED)}
        onResume={() => setGameState(GameState.PLAYING)}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
      />

      {gameState === GameState.SHOP && (
        <Shop 
          coins={totalCoins}
          ownedSkins={ownedSkins}
          currentSkinId={currentSkinId}
          onBuy={handleBuySkin}
          onEquip={handleEquipSkin}
          onBack={() => setGameState(GameState.MENU)}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
};

export default App;