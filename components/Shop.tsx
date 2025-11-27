import React from 'react';
import { Skin } from '../types';
import { SKINS } from '../constants';

interface ShopProps {
  coins: number;
  ownedSkins: string[];
  currentSkinId: string;
  onBuy: (skinId: string, cost: number) => void;
  onEquip: (skinId: string) => void;
  onBack: () => void;
  isDarkMode: boolean;
}

export const Shop: React.FC<ShopProps> = ({ coins, ownedSkins, currentSkinId, onBuy, onEquip, onBack, isDarkMode }) => {
  return (
    <div className={`absolute inset-0 z-20 flex flex-col items-center p-4 overflow-y-auto backdrop-blur-md transition-colors duration-500 ${isDarkMode ? 'bg-slate-900/95' : 'bg-sky-500/90'}`}>
      <div className={`w-full max-w-2xl rounded-3xl p-6 shadow-2xl border mt-10 transition-colors ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/20 border-white/40'}`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-4xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">Hangar</h2>
          <div className="bg-yellow-400/20 text-yellow-300 border border-yellow-400/50 px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2">
            <span>💰</span> {coins}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {SKINS.map((skin) => {
            const isOwned = ownedSkins.includes(skin.id);
            const isEquipped = currentSkinId === skin.id;

            return (
              <div 
                key={skin.id}
                className={`
                  relative p-4 rounded-xl flex flex-col items-center gap-3 transition-all duration-200
                  ${isEquipped 
                    ? 'bg-green-500/20 border-2 border-green-400 scale-105 shadow-[0_0_15px_rgba(74,222,128,0.3)]' 
                    : isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white/30 border-white/40 hover:bg-white/40'}
                  ${!isOwned && !isDarkMode ? 'opacity-90' : ''}
                `}
              >
                {/* Visual Representation of Paper Plane */}
                <div className="w-16 h-16 relative flex items-center justify-center">
                   <svg viewBox="0 0 50 50" className="w-full h-full drop-shadow-lg" style={{ transform: 'rotate(-45deg)' }}>
                      {/* Left Wing */}
                      <path d="M25 5 L5 25 L25 20 Z" fill={skin.color} stroke={skin.secondaryColor} strokeWidth="1.5" />
                      {/* Right Wing */}
                      <path d="M25 5 L45 25 L25 20 Z" fill={skin.color} stroke={skin.secondaryColor} strokeWidth="1.5" />
                      {/* Center Body Shadow */}
                      <path d="M25 5 L25 20 L25 28 L20 25 Z" fill="rgba(0,0,0,0.1)" />
                   </svg>
                </div>

                <div className="text-center">
                  <h3 className="text-white font-bold text-lg leading-tight drop-shadow-sm">{skin.name}</h3>
                  <p className="text-white/60 text-xs mt-1 capitalize">{skin.type}</p>
                </div>

                <div className="mt-auto w-full">
                  {isOwned ? (
                    <button
                      onClick={() => onEquip(skin.id)}
                      disabled={isEquipped}
                      className={`
                        w-full py-2 rounded-lg font-bold text-sm transition-colors
                        ${isEquipped 
                          ? 'bg-green-500 text-white cursor-default' 
                          : 'bg-white/10 text-white hover:bg-white/20'}
                      `}
                    >
                      {isEquipped ? 'EQUIPADO' : 'EQUIPAR'}
                    </button>
                  ) : (
                    <button
                      onClick={() => onBuy(skin.id, skin.price)}
                      disabled={coins < skin.price}
                      className={`
                        w-full py-2 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-1
                        ${coins >= skin.price 
                          ? 'bg-yellow-400 text-yellow-900 hover:bg-yellow-300' 
                          : 'bg-slate-700 text-slate-500 cursor-not-allowed'}
                      `}
                    >
                      <span>{skin.price}</span> 💰
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <button 
          onClick={onBack}
          className="mt-8 w-full py-4 bg-red-500/80 hover:bg-red-500 text-white rounded-xl font-bold text-xl shadow-lg transition-all border-b-4 border-red-700 active:border-b-0 active:translate-y-1"
        >
          VOLVER AL MENÚ
        </button>
      </div>
    </div>
  );
};