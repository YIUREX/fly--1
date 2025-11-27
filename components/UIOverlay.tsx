import React from 'react';
import { GameState, PowerUpType } from '../types';
import { POWERUP_LABELS, POWERUP_COLORS } from '../constants';

interface UIOverlayProps {
  gameState: GameState;
  score: number;
  highScore: number;
  coins: number;
  coinsCollectedInRun: number;
  activePowerUps: PowerUpType[];
  onStart: () => void;
  onOpenShop: () => void;
  onRestart: () => void;
  onMenu: () => void;
  onPause: () => void;
  onResume: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const UIOverlay: React.FC<UIOverlayProps> = ({
  gameState,
  score,
  highScore,
  coins,
  coinsCollectedInRun,
  activePowerUps,
  onStart,
  onOpenShop,
  onRestart,
  onMenu,
  onPause,
  onResume,
  isDarkMode,
  toggleDarkMode,
}) => {
  const isNewRecord = score > highScore && highScore > 0;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 z-10 font-fredoka select-none overflow-hidden">
      
      {/* Top Bar Controls */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between pointer-events-none z-20">
        
        {/* Left: Pause Button */}
        <div className="pointer-events-auto">
          {gameState === GameState.PLAYING && (
            <button 
              onClick={onPause}
              className={`p-3 rounded-full shadow-lg transition-transform hover:scale-110 active:scale-90 border-2 flex items-center justify-center w-12 h-12 ${isDarkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-white/50 text-slate-800'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
              </svg>
            </button>
          )}
        </div>

        {/* Right: Dark Mode Toggle */}
        <div className="pointer-events-auto">
          <button 
            onClick={toggleDarkMode}
            className={`p-3 rounded-full shadow-lg transition-transform hover:scale-110 active:scale-90 border-2 w-12 h-12 flex items-center justify-center ${isDarkMode ? 'bg-slate-800 border-slate-600 text-yellow-300' : 'bg-sky-200 border-sky-100 text-orange-500'}`}
          >
            {isDarkMode ? '🌙' : '☀️'}
          </button>
        </div>
      </div>

      {/* HUD (Playing) */}
      {gameState === GameState.PLAYING && (
        <>
          <div className="flex justify-between items-start w-full mt-20">
            {/* Score & Health */}
            <div className="flex flex-col gap-1 pointer-events-auto">
              <div className="text-5xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] italic">
                {Math.floor(score)}
              </div>
              <div className="text-sm font-bold text-white/60 tracking-wider">METROS</div>
            </div>

            {/* Coins - Displaying Coins collected in THIS run */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border shadow-lg backdrop-blur-md pointer-events-auto ${isDarkMode ? 'bg-slate-900/50 border-white/10' : 'bg-white/30 border-white/40'}`}>
              <span className="text-2xl">💰</span>
              <span className="text-xl font-bold text-yellow-400">{coinsCollectedInRun}</span>
            </div>
          </div>

          {/* Active Powerups */}
          <div className="flex flex-col gap-2 items-start mt-auto mb-20 pointer-events-auto">
            {activePowerUps.map((type) => (
              <div 
                key={type}
                className="px-4 py-2 rounded-lg font-bold text-white text-sm shadow-lg flex items-center gap-2 animate-pulse"
                style={{ backgroundColor: POWERUP_COLORS[type] }}
              >
                <span>⚡</span> {POWERUP_LABELS[type]}
              </div>
            ))}
          </div>
        </>
      )}

      {/* PAUSE MENU */}
      {gameState === GameState.PAUSED && (
        <div className={`absolute inset-0 flex flex-col items-center justify-center backdrop-blur-md pointer-events-auto z-50 animate-in fade-in duration-200 ${isDarkMode ? 'bg-slate-900/80' : 'bg-sky-500/50'}`}>
          <h2 className="text-6xl font-black text-white drop-shadow-lg mb-8 italic tracking-widest">PAUSA</h2>
          
          <div className="flex flex-col gap-4 w-full max-w-xs">
            <button 
              onClick={onResume}
              className="w-full py-4 bg-green-500 hover:bg-green-400 text-white rounded-xl font-black text-2xl shadow-[0_0_15px_rgba(34,197,94,0.5)] transition-all transform hover:scale-105 active:scale-95 border-b-4 border-green-700 active:border-b-0 active:translate-y-1"
            >
              CONTINUAR
            </button>
            
            <button 
              onClick={onMenu}
              className="w-full py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl font-bold text-lg backdrop-blur-sm transition-colors border-2 border-white/10"
            >
              SALIR AL MENÚ
            </button>
          </div>
        </div>
      )}

      {/* Main Menu */}
      {gameState === GameState.MENU && (
        <div className={`absolute inset-0 flex flex-col items-center justify-center backdrop-blur-sm pointer-events-auto transition-colors duration-500 ${isDarkMode ? 'bg-slate-900/80' : 'bg-sky-400/30'}`}>
          <div className="mb-12 text-center relative group">
            <div className={`absolute -inset-10 rounded-full blur-3xl opacity-50 animate-pulse ${isDarkMode ? 'bg-blue-500/20' : 'bg-white/40'}`}></div>
            <h1 className="relative text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-blue-200 drop-shadow-xl italic transform -skew-x-6 pb-2">
              Fly!
            </h1>
            <p className="text-white mt-2 text-xl tracking-[0.5em] font-light drop-shadow-md">PAPER PLANE</p>
          </div>

          <div className="flex flex-col gap-4 w-full max-w-xs z-10">
            {highScore > 0 && (
              <div className="text-center mb-4">
                <span className="text-white/80 text-sm font-bold tracking-widest uppercase drop-shadow-sm">Mejor Puntuación</span>
                <div className="text-4xl font-black text-white drop-shadow-md">{highScore}</div>
              </div>
            )}

            <button 
              onClick={onStart}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white rounded-xl font-black text-2xl shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all transform hover:scale-105 active:scale-95 border-b-4 border-emerald-800 active:border-b-0 active:translate-y-1"
            >
              DESPEGAR
            </button>
            
            <button 
              onClick={onOpenShop}
              className={`w-full py-3 text-white rounded-xl font-bold text-lg shadow-lg transition-colors flex items-center justify-center gap-2 border-b-4 active:border-b-0 active:translate-y-1 ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600 border-slate-900' : 'bg-blue-500 hover:bg-blue-400 border-blue-700'}`}
            >
              <span>🛒</span> HANGAR
            </button>
          </div>

          <div className="absolute bottom-8 text-white/50 text-center text-sm">
            <p>Toca y arrastra para pilotar el avión</p>
            <div className="mt-2 w-12 h-12 border-2 border-white/20 rounded-full mx-auto flex items-center justify-center">
              <div className="w-2 h-2 bg-white/50 rounded-full animate-ping"></div>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState === GameState.GAMEOVER && (
        <div className={`absolute inset-0 flex flex-col items-center justify-center backdrop-blur-md pointer-events-auto z-50 animate-in fade-in duration-300 ${isDarkMode ? 'bg-red-900/90' : 'bg-red-500/80'}`}>
          <h2 className="text-6xl font-black text-white drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)] mb-2 italic">
            DERRIBADO
          </h2>
          
          <div className="bg-white/10 rounded-3xl p-8 backdrop-blur-sm border border-white/20 shadow-2xl w-full max-w-sm text-center mb-8 relative overflow-hidden">
            {isNewRecord && (
              <div className="absolute top-0 left-0 w-full bg-yellow-400 text-yellow-900 font-bold text-xs py-1 animate-pulse">
                ¡NUEVO RÉCORD!
              </div>
            )}
            
            <div className="mb-6 mt-2">
              <div className="text-blue-100 text-sm font-bold uppercase tracking-widest">Puntuación</div>
              <div className="text-6xl font-black text-white drop-shadow-md">{Math.floor(score)}</div>
            </div>

            {!isNewRecord && highScore > 0 && (
               <div className="mb-6 opacity-60">
                 <div className="text-white text-xs uppercase">Mejor</div>
                 <div className="text-2xl font-bold text-white">{highScore}</div>
               </div>
            )}

            <div className="flex justify-center items-center gap-2 text-yellow-300 bg-black/20 rounded-lg py-2">
              <span>+ {coinsCollectedInRun}</span>
              <span>💰</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full max-w-xs">
            <button 
              onClick={onRestart}
              className="w-full py-4 bg-white text-red-600 hover:bg-gray-100 rounded-xl font-black text-xl shadow-xl transition-transform hover:scale-105 active:scale-95"
            >
              VOLVER A INTENTAR
            </button>
            <button 
              onClick={onMenu}
              className="w-full py-3 bg-black/30 text-white hover:bg-black/50 rounded-xl font-bold transition-colors"
            >
              MENÚ PRINCIPAL
            </button>
          </div>
        </div>
      )}
    </div>
  );
};