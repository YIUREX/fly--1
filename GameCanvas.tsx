import React, { useEffect, useRef, useCallback } from 'react';
import { GameState, Player, Missile, Particle, Coin, PowerUp, PowerUpType, Vector, Entity, Cloud, Star } from '../types';
import { GAME_CONFIG, POWERUP_COLORS, SKINS } from '../constants';
import { vecAdd, vecSub, vecMult, vecNorm, vecLen, dist, randomRange, lerp, soundManager } from '../utils';

interface GameCanvasProps {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  setScore: (score: number) => void;
  setCoinsCollected: (coins: number) => void;
  currentSkinId: string;
  addCoins: (amount: number) => void;
  activePowerUps: PowerUpType[];
  setActivePowerUps: React.Dispatch<React.SetStateAction<PowerUpType[]>>;
  isDarkMode: boolean;
}

const GameCanvasComponent: React.FC<GameCanvasProps> = ({ 
  gameState, 
  setGameState, 
  setScore, 
  setCoinsCollected, 
  currentSkinId,
  addCoins,
  setActivePowerUps,
  isDarkMode
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const prevGameState = useRef<GameState>(gameState);
  
  // Joystick State
  const joystickRef = useRef<{ active: boolean; origin: Vector; current: Vector } | null>(null);

  // Camera State
  const cameraRef = useRef<Vector>({ x: 0, y: 0 });

  // Game State Refs
  const playerRef = useRef<Player>({
    id: 'player',
    pos: { x: 0, y: 0 },
    vel: { x: 0, y: 0 },
    angle: 0,
    radius: GAME_CONFIG.PLAYER_RADIUS,
    dead: false,
    shieldActive: false,
    magnetActive: false,
    speedBoostActive: false,
    skinId: 'default',
    trail: []
  });

  const missilesRef = useRef<Missile[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const coinsRef = useRef<Coin[]>([]);
  const powerUpsRef = useRef<PowerUp[]>([]);
  
  // Background Props
  const cloudsRef = useRef<Cloud[]>([]);
  const starsRef = useRef<Star[]>([]);
  
  const frameCountRef = useRef(0);
  const scoreRef = useRef(0);
  const coinsCollectedRef = useRef(0);
  const gameTimeRef = useRef(0);

  // Initialize Background Elements
  const initBackground = useCallback(() => {
    // Generate Clouds
    const newClouds: Cloud[] = [];
    for (let i = 0; i < 20; i++) {
      newClouds.push({
        x: Math.random() * 2000,
        y: Math.random() * 2000,
        scale: 1 + Math.random() * 2,
        speed: 0.1 + Math.random() * 0.3,
        opacity: 0.3 + Math.random() * 0.4
      });
    }
    cloudsRef.current = newClouds;

    // Generate Stars
    const newStars: Star[] = [];
    for (let i = 0; i < 100; i++) {
      newStars.push({
        x: Math.random() * 2000,
        y: Math.random() * 2000,
        size: Math.random() * 2 + 1,
        speed: 0.05 + Math.random() * 0.1,
        blinkOffset: Math.random() * 10
      });
    }
    starsRef.current = newStars;
  }, []);

  // Initialize Game
  const initGame = useCallback(() => {
    soundManager.init(); // Ensure audio context is ready
    if (!canvasRef.current) return;
    
    // Player starts at 0,0 world coordinates
    playerRef.current = {
      id: 'player',
      pos: { x: 0, y: 0 },
      vel: { x: 0, y: 0 },
      angle: -Math.PI / 2,
      radius: GAME_CONFIG.PLAYER_RADIUS,
      dead: false,
      shieldActive: false,
      magnetActive: false,
      speedBoostActive: false,
      skinId: currentSkinId,
      trail: []
    };
    
    cameraRef.current = { x: 0, y: 0 };

    missilesRef.current = [];
    particlesRef.current = [];
    coinsRef.current = [];
    powerUpsRef.current = [];
    joystickRef.current = null;

    scoreRef.current = 0;
    coinsCollectedRef.current = 0;
    frameCountRef.current = 0;
    gameTimeRef.current = 0;
    
    initBackground();

    setScore(0);
    setCoinsCollected(0);
    setActivePowerUps([]);
  }, [currentSkinId, setScore, setCoinsCollected, setActivePowerUps, initBackground]);

  // --- HELPERS ---
  
  const worldToScreen = (pos: Vector, width: number, height: number): Vector => {
    return {
      x: pos.x - cameraRef.current.x + width / 2,
      y: pos.y - cameraRef.current.y + height / 2
    };
  };

  const createExplosion = (pos: Vector, color: string, count: number = 15) => {
    soundManager.playExplosion();
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      particlesRef.current.push({
        id: Math.random().toString(),
        pos: { ...pos },
        vel: { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
        life: 1.0,
        maxLife: 1.0,
        color: color,
        size: Math.random() * 5 + 2
      });
    }
  };

  const getRandomSpawnPos = (width: number, height: number): Vector => {
    // Spawn outside the current viewport
    const angle = Math.random() * Math.PI * 2;
    const screenDiag = Math.sqrt(width * width + height * height) / 2;
    const distance = screenDiag + GAME_CONFIG.SPAWN_DISTANCE_OFFSET;
    
    return {
      x: cameraRef.current.x + Math.cos(angle) * distance,
      y: cameraRef.current.y + Math.sin(angle) * distance
    };
  };

  const spawnMissile = (width: number, height: number, difficultyMultiplier: number) => {
    const startPos = getRandomSpawnPos(width, height);
    soundManager.playShoot();

    missilesRef.current.push({
      id: Math.random().toString(),
      pos: startPos,
      vel: { x: 0, y: 0 },
      angle: 0,
      radius: GAME_CONFIG.MISSILE_RADIUS,
      dead: false,
      turnRate: GAME_CONFIG.MISSILE_TURN_RATE * difficultyMultiplier,
      speed: GAME_CONFIG.MISSILE_BASE_SPEED * difficultyMultiplier,
      wobbleOffset: Math.random() * 100,
      trail: []
    });
  };

  const spawnCoin = (width: number, height: number) => {
    const pos = getRandomSpawnPos(width, height);
    coinsRef.current.push({
      id: Math.random().toString(),
      pos: pos,
      vel: { x: 0, y: 0 },
      angle: 0,
      radius: 12,
      dead: false,
      value: 10,
      magnetized: false,
      trail: []
    });
  };

  const spawnPowerUp = (width: number, height: number) => {
    const types = [PowerUpType.SHIELD, PowerUpType.SPEED, PowerUpType.MAGNET];
    const type = types[Math.floor(Math.random() * types.length)];
    const pos = getRandomSpawnPos(width, height);
    
    powerUpsRef.current.push({
      id: Math.random().toString(),
      pos: pos,
      vel: { x: 0, y: 0 },
      angle: 0,
      radius: 14,
      dead: false,
      type: type,
      trail: []
    });
  };

  const activatePowerUp = (type: PowerUpType) => {
    const p = playerRef.current;
    if (type === PowerUpType.SHIELD) {
      p.shieldActive = true;
      setTimeout(() => { p.shieldActive = false; setActivePowerUps(prev => prev.filter(t => t !== PowerUpType.SHIELD)); }, 5000);
    } else if (type === PowerUpType.MAGNET) {
      p.magnetActive = true;
      setTimeout(() => { p.magnetActive = false; setActivePowerUps(prev => prev.filter(t => t !== PowerUpType.MAGNET)); }, 8000);
    } else if (type === PowerUpType.SPEED) {
      p.speedBoostActive = true;
      setTimeout(() => { p.speedBoostActive = false; setActivePowerUps(prev => prev.filter(t => t !== PowerUpType.SPEED)); }, 5000);
    }
    setActivePowerUps(prev => [...prev.filter(t => t !== type), type]);
  };

  const updateTrail = (entity: Entity, currentPos: Vector, freq: number = 2) => {
    if (frameCountRef.current % freq === 0) {
      entity.trail.push({ ...currentPos });
      if (entity.trail.length > GAME_CONFIG.TRAIL_LENGTH) {
        entity.trail.shift();
      }
    }
  };

  // --- MAIN LOOP ---
  const update = useCallback(() => {
    if (!canvasRef.current || gameState !== GameState.PLAYING) return;
    const canvas = canvasRef.current;
    const { width, height } = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    frameCountRef.current++;
    gameTimeRef.current += 1/60;

    // Difficulty
    const difficultyMultiplier = 1 + Math.min(scoreRef.current / 3000, 1.2);

    // Spawning
    if (frameCountRef.current % Math.floor(GAME_CONFIG.MISSILE_SPAWN_RATE / difficultyMultiplier) === 0) {
      spawnMissile(width, height, difficultyMultiplier);
    }
    if (frameCountRef.current % GAME_CONFIG.COIN_SPAWN_RATE === 0 && coinsRef.current.length < 10) {
      spawnCoin(width, height);
    }
    if (frameCountRef.current % GAME_CONFIG.POWERUP_SPAWN_RATE === 0 && powerUpsRef.current.length < 3) {
      spawnPowerUp(width, height);
    }

    // --- PLAYER ---
    const p = playerRef.current;
    
    // Joystick Control
    if (joystickRef.current && joystickRef.current.active) {
      const { origin, current } = joystickRef.current;
      const diff = vecSub(current, origin);
      const len = vecLen(diff);
      
      if (len > 10) { // Deadzone
        const targetAngle = Math.atan2(diff.y, diff.x);
        
        // Smooth rotation
        let angleDiff = targetAngle - p.angle;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        
        p.angle += Math.max(-GAME_CONFIG.PLAYER_TURN_SPEED, Math.min(GAME_CONFIG.PLAYER_TURN_SPEED, angleDiff));
      }
    }

    // Movement (Infinite World)
    const currentSpeed = p.speedBoostActive ? GAME_CONFIG.PLAYER_BOOST_SPEED : GAME_CONFIG.PLAYER_SPEED;
    const moveVel = { x: Math.cos(p.angle) * currentSpeed, y: Math.sin(p.angle) * currentSpeed };
    p.pos = vecAdd(p.pos, moveVel);

    // Update Camera (Soft Follow)
    const cameraTarget = p.pos;
    cameraRef.current.x = lerp(cameraRef.current.x, cameraTarget.x, 0.1);
    cameraRef.current.y = lerp(cameraRef.current.y, cameraTarget.y, 0.1);

    // Calculate Tail Position for Trail
    const playerTailOffset = 18;
    const playerTailPos = {
      x: p.pos.x - Math.cos(p.angle) * playerTailOffset,
      y: p.pos.y - Math.sin(p.angle) * playerTailOffset
    };
    updateTrail(p, playerTailPos, 2);

    // --- MISSILES ---
    missilesRef.current.forEach(m => {
      // Homing
      const toPlayer = vecSub(p.pos, m.pos);
      const angleToPlayer = Math.atan2(toPlayer.y, toPlayer.x);
      
      let angleDiff = angleToPlayer - m.angle;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

      m.angle += Math.max(-m.turnRate, Math.min(m.turnRate, angleDiff));
      
      const velocity = { x: Math.cos(m.angle) * m.speed, y: Math.sin(m.angle) * m.speed };
      m.pos = vecAdd(m.pos, velocity);

      // Missile Tail Position
      const missileTailOffset = 10; 
      const missileTailPos = {
        x: m.pos.x - Math.cos(m.angle) * missileTailOffset,
        y: m.pos.y - Math.sin(m.angle) * missileTailOffset
      };
      updateTrail(m, missileTailPos, 2);

      // Hit Player
      if (dist(m.pos, p.pos) < m.radius + p.radius - 5 && !p.dead) {
        if (p.shieldActive) {
          m.dead = true;
          createExplosion(m.pos, '#60a5fa', 10);
          scoreRef.current += 50;
        } else {
          p.dead = true;
          createExplosion(p.pos, '#f472b6', 40);
          soundManager.playGameOver();
          setGameState(GameState.GAMEOVER);
          // Coins added immediately
        }
      }

      // Hit Other Missile
      missilesRef.current.forEach(otherM => {
        if (m === otherM || otherM.dead) return;
        if (dist(m.pos, otherM.pos) < m.radius + otherM.radius) {
          m.dead = true;
          otherM.dead = true;
          createExplosion(m.pos, '#facc15', 20);
          scoreRef.current += 100;
          setScore(Math.floor(scoreRef.current));
        }
      });

      // Despawn if too far
      if (dist(m.pos, p.pos) > GAME_CONFIG.DESPAWN_DISTANCE) {
        m.dead = true;
      }
    });
    missilesRef.current = missilesRef.current.filter(m => !m.dead);

    // --- COINS ---
    coinsRef.current.forEach(c => {
      if (p.magnetActive && dist(c.pos, p.pos) < 350) c.magnetized = true;
      if (c.magnetized) {
        const dir = vecNorm(vecSub(p.pos, c.pos));
        c.pos = vecAdd(c.pos, vecMult(dir, 14));
      }
      if (dist(c.pos, p.pos) < c.radius + p.radius) {
        c.dead = true;
        coinsCollectedRef.current += c.value;
        setCoinsCollected(coinsCollectedRef.current);
        scoreRef.current += 10;
        createExplosion(c.pos, '#facc15', 5);
        soundManager.playCoin();
        setScore(Math.floor(scoreRef.current));
        // Immediate Save
        addCoins(c.value);
      }
      if (dist(c.pos, p.pos) > GAME_CONFIG.DESPAWN_DISTANCE) c.dead = true;
    });
    coinsRef.current = coinsRef.current.filter(c => !c.dead);

    // --- POWERUPS ---
    powerUpsRef.current.forEach(pu => {
      if (dist(pu.pos, p.pos) < pu.radius + p.radius) {
        pu.dead = true;
        activatePowerUp(pu.type);
        createExplosion(pu.pos, POWERUP_COLORS[pu.type], 15);
        soundManager.playPowerUp();
      }
      if (dist(pu.pos, p.pos) > GAME_CONFIG.DESPAWN_DISTANCE) pu.dead = true;
    });
    powerUpsRef.current = powerUpsRef.current.filter(pu => !pu.dead);

    if (!p.dead) {
        scoreRef.current += 0.2;
        setScore(Math.floor(scoreRef.current));
    }

    // Particles
    particlesRef.current.forEach(pt => {
      pt.pos = vecAdd(pt.pos, pt.vel);
      pt.vel = vecMult(pt.vel, 0.95); // Drag
      pt.life -= 0.03;
    });
    particlesRef.current = particlesRef.current.filter(pt => pt.life > 0);

    // --- RENDER ---
    ctx.clearRect(0, 0, width, height);

    // 1. Background
    drawBackground(ctx, width, height);

    // 2. Trails
    const drawTrail = (trail: Vector[], color: string, lineWidth: number, currentPos?: Vector) => {
      if (trail.length === 0 && !currentPos) return;

      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      // Move to start
      if (trail.length > 0) {
        const start = worldToScreen(trail[0], width, height);
        ctx.moveTo(start.x, start.y);
      } else if (currentPos) {
        const start = worldToScreen(currentPos, width, height);
        ctx.moveTo(start.x, start.y);
      }

      // Draw stored segments
      for (let i = 1; i < trail.length; i++) {
        const p = worldToScreen(trail[i], width, height);
        ctx.lineTo(p.x, p.y);
      }
      
      // Connect to current pos (Tail Pos)
      if (currentPos) {
          const end = worldToScreen(currentPos, width, height);
          ctx.lineTo(end.x, end.y);
      }
      
      ctx.stroke();
    };

    // 3. Draw Player
    if (!p.dead) {
      // Calculate current tail pos for drawing
      const playerTailOffset = 18;
      const playerTailPos = {
        x: p.pos.x - Math.cos(p.angle) * playerTailOffset,
        y: p.pos.y - Math.sin(p.angle) * playerTailOffset
      };

      drawTrail(p.trail, p.speedBoostActive ? '#fbbf24' : 'rgba(255,255,255,0.4)', p.speedBoostActive ? 14 : 10, playerTailPos);
      
      const screenPos = worldToScreen(p.pos, width, height);
      ctx.save();
      ctx.translate(screenPos.x, screenPos.y);
      ctx.rotate(p.angle + Math.PI / 2); // Adjust for paper plane model

      const skin = SKINS.find(s => s.id === p.skinId) || SKINS[0];
      
      // Paper Plane Graphics
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.moveTo(0, -20);
      ctx.lineTo(15, 20);
      ctx.lineTo(0, 15);
      ctx.lineTo(-15, 20);
      ctx.closePath();
      ctx.fill();

      // Wings
      ctx.fillStyle = skin.color;
      ctx.strokeStyle = skin.secondaryColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -20);
      ctx.lineTo(15, 20);
      ctx.lineTo(0, 15);
      ctx.lineTo(-15, 20);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Center fold
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      ctx.beginPath();
      ctx.moveTo(0, -20);
      ctx.lineTo(0, 15);
      ctx.lineTo(5, 20);
      ctx.closePath();
      ctx.fill();

      // Effects
      if (p.shieldActive) {
        ctx.beginPath();
        ctx.strokeStyle = '#60a5fa';
        ctx.lineWidth = 3;
        ctx.arc(0, 0, 30, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = 'rgba(96, 165, 250, 0.2)';
        ctx.fill();
      }
      if (p.magnetActive) {
        ctx.beginPath();
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 2;
        ctx.arc(0, 0, 40 + Math.sin(frameCountRef.current * 0.2) * 5, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();
    }

    // 4. Draw Missiles
    missilesRef.current.forEach(m => {
      const missileTailOffset = 10; 
      const missileTailPos = {
        x: m.pos.x - Math.cos(m.angle) * missileTailOffset,
        y: m.pos.y - Math.sin(m.angle) * missileTailOffset
      };

      drawTrail(m.trail, 'rgba(248, 113, 113, 0.6)', 6, missileTailPos);
      
      const screenPos = worldToScreen(m.pos, width, height);
      ctx.save();
      ctx.translate(screenPos.x, screenPos.y);
      ctx.rotate(m.angle + Math.PI / 2);

      // Missile Body (Smaller)
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(0, -14);
      ctx.lineTo(7, 7);
      ctx.lineTo(0, 4);
      ctx.lineTo(-7, 7);
      ctx.closePath();
      ctx.fill();
      
      ctx.restore();
    });

    // 5. Draw Coins
    coinsRef.current.forEach(c => {
      const screenPos = worldToScreen(c.pos, width, height);
      ctx.save();
      ctx.translate(screenPos.x, screenPos.y);
      
      const scale = 1 + Math.sin(frameCountRef.current * 0.1) * 0.1;
      ctx.scale(scale, scale);

      ctx.beginPath();
      ctx.fillStyle = '#fbbf24';
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('$', 0, 1);

      ctx.restore();
    });

    // 6. Draw Powerups
    powerUpsRef.current.forEach(pu => {
      const screenPos = worldToScreen(pu.pos, width, height);
      ctx.save();
      ctx.translate(screenPos.x, screenPos.y);

      ctx.beginPath();
      ctx.fillStyle = POWERUP_COLORS[pu.type];
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = 'white';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const label = pu.type === PowerUpType.SHIELD ? 'S' : pu.type === PowerUpType.SPEED ? '>>' : 'M';
      ctx.fillText(label, 0, 1);

      ctx.restore();
    });

    // 7. Particles
    particlesRef.current.forEach(pt => {
      const screenPos = worldToScreen(pt.pos, width, height);
      ctx.globalAlpha = pt.life;
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, pt.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;
    });

    // 8. Draw Virtual Joystick
    if (joystickRef.current && joystickRef.current.active) {
      const { origin, current } = joystickRef.current;
      
      // Base
      ctx.beginPath();
      ctx.arc(origin.x, origin.y, 40, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();

      // Stick
      ctx.beginPath();
      ctx.arc(current.x, current.y, 20, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.fill();
    }

    requestRef.current = requestAnimationFrame(update);
  }, [gameState, setGameState, setScore, setCoinsCollected, addCoins, setActivePowerUps, currentSkinId]);

  // Background Rendering
  const drawBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Stars (Night Mode)
    if (isDarkMode) {
      ctx.fillStyle = 'white';
      starsRef.current.forEach(star => {
        const offsetX = (star.x - cameraRef.current.x * star.speed) % 2000;
        const offsetY = (star.y - cameraRef.current.y * star.speed) % 2000;
        
        let screenX = offsetX;
        let screenY = offsetY;
        
        if (screenX < 0) screenX += 2000;
        if (screenY < 0) screenY += 2000;

        if (screenX > -50 && screenX < width + 50 && screenY > -50 && screenY < height + 50) {
            const opacity = 0.5 + Math.sin(gameTimeRef.current * 5 + star.blinkOffset) * 0.5;
            ctx.globalAlpha = opacity;
            ctx.beginPath();
            ctx.arc(screenX, screenY, star.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
        }
      });
    }

    // Clouds
    cloudsRef.current.forEach(cloud => {
        const offsetX = (cloud.x - cameraRef.current.x * cloud.speed) % 2000;
        const offsetY = (cloud.y - cameraRef.current.y * cloud.speed) % 2000;

        let screenX = offsetX;
        let screenY = offsetY;

        if (screenX < -200) screenX += 2000;
        if (screenY < -200) screenY += 2000;

        if (screenX > -200 && screenX < width + 200 && screenY > -200 && screenY < height + 200) {
            ctx.fillStyle = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.4)';
            ctx.beginPath();
            ctx.arc(screenX, screenY, 60 * cloud.scale, 0, Math.PI * 2);
            ctx.arc(screenX + 40 * cloud.scale, screenY - 20 * cloud.scale, 70 * cloud.scale, 0, Math.PI * 2);
            ctx.arc(screenX + 90 * cloud.scale, screenY, 60 * cloud.scale, 0, Math.PI * 2);
            ctx.fill();
        }
    });
  };

  useEffect(() => {
    if (gameState === GameState.PLAYING) {
      // Only init if coming from MENU or GAMEOVER to avoid reset on Resume
      if (prevGameState.current === GameState.MENU || prevGameState.current === GameState.GAMEOVER) {
        initGame();
      }
      requestRef.current = requestAnimationFrame(update);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      joystickRef.current = null; // Reset joystick on pause
    }
    prevGameState.current = gameState;
    
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState, initGame, update]);

  // Input Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (gameState !== GameState.PLAYING) return;
    joystickRef.current = {
      active: true,
      origin: { x: e.clientX, y: e.clientY },
      current: { x: e.clientX, y: e.clientY }
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (gameState !== GameState.PLAYING || !joystickRef.current?.active) return;
    joystickRef.current.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    if (joystickRef.current) joystickRef.current.active = false;
  };

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 touch-none"
      width={window.innerWidth}
      height={window.innerHeight}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    />
  );
};

export const GameCanvas = React.memo(GameCanvasComponent);