export type Vector = { x: number; y: number };

export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAMEOVER = 'GAMEOVER',
  SHOP = 'SHOP'
}

export enum PowerUpType {
  SHIELD = 'SHIELD',
  SPEED = 'SPEED',
  MAGNET = 'MAGNET'
}

export interface Skin {
  id: string;
  name: string;
  price: number;
  color: string;
  secondaryColor: string;
  type: 'basic' | 'fighter' | 'stealth';
}

export interface Entity {
  id: string;
  pos: Vector;
  vel: Vector;
  angle: number;
  radius: number;
  dead: boolean;
  trail: Vector[]; 
}

export interface Player extends Entity {
  shieldActive: boolean;
  magnetActive: boolean;
  speedBoostActive: boolean;
  skinId: string;
}

export interface Missile extends Entity {
  turnRate: number;
  speed: number;
  wobbleOffset: number;
}

export interface Coin extends Entity {
  value: number;
  magnetized: boolean;
}

export interface PowerUp extends Entity {
  type: PowerUpType;
}

export interface Particle {
  id: string;
  pos: Vector;
  vel: Vector;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

// Background Elements
export interface Cloud {
  x: number;
  y: number;
  scale: number;
  speed: number; // Parallax factor
  opacity: number;
}

export interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  blinkOffset: number;
}