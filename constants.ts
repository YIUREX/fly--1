import { Skin, PowerUpType } from './types';

export const GAME_CONFIG = {
  PLAYER_SPEED: 5.5,
  PLAYER_BOOST_SPEED: 9,
  PLAYER_TURN_SPEED: 0.12,
  PLAYER_RADIUS: 14,
  
  MISSILE_SPAWN_RATE: 100, // Frames
  MISSILE_BASE_SPEED: 4,
  MISSILE_TURN_RATE: 0.045,
  MISSILE_RADIUS: 7,
  
  COIN_SPAWN_RATE: 100,
  POWERUP_SPAWN_RATE: 600,
  
  FRICTION: 0.96,
  TRAIL_LENGTH: 30,
  
  // World Management
  SPAWN_DISTANCE_OFFSET: 100, // How far outside the screen to spawn
  DESPAWN_DISTANCE: 2000, // Distance from player to delete entities
};

// Neon/Bright Skins suitable for dark background
export const SKINS: Skin[] = [
  { id: 'default', name: 'Paper White', price: 0, color: '#f8fafc', secondaryColor: '#94a3b8', type: 'basic' },
  { id: 'neon_cyan', name: 'Cyber Cyan', price: 100, color: '#06b6d4', secondaryColor: '#22d3ee', type: 'fighter' },
  { id: 'plasma_pink', name: 'Plasma Pink', price: 250, color: '#db2777', secondaryColor: '#f472b6', type: 'basic' },
  { id: 'golden_glory', name: 'Golden Glory', price: 500, color: '#eab308', secondaryColor: '#facc15', type: 'fighter' },
  { id: 'stealth_ops', name: 'Ghost Ops', price: 1000, color: '#334155', secondaryColor: '#94a3b8', type: 'stealth' },
  { id: 'inferno', name: 'Inferno', price: 1500, color: '#ef4444', secondaryColor: '#f87171', type: 'basic' },
];

export const POWERUP_COLORS = {
  [PowerUpType.SHIELD]: '#60a5fa', // Blue
  [PowerUpType.SPEED]: '#facc15',  // Yellow
  [PowerUpType.MAGNET]: '#c084fc', // Purple
};

export const POWERUP_LABELS = {
  [PowerUpType.SHIELD]: 'ESCUDO',
  [PowerUpType.SPEED]: 'TURBO',
  [PowerUpType.MAGNET]: 'IMÁN',
};