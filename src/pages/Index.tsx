import { useState, useEffect, useCallback, useRef } from 'react';
import GameMenu from '@/components/game/GameMenu';
import GameOffice from '@/components/game/GameOffice';
import CameraSystem from '@/components/game/CameraSystem';
import JumpscareScreen from '@/components/game/JumpscareScreen';

type GameState = 'menu' | 'playing' | 'gameover' | 'win';
type Animatronic = 'freddy' | 'bonnie' | 'chica';

interface AnimatronicStatus {
  location: number;
  aggression: number;
  moving: boolean;
}

const LOCATIONS = [
  'Главная сцена',
  'Столовая',
  'Коридор слева',
  'Коридор справа',
  'Вентиляция',
  'Левая дверь',
  'Правая дверь',
  'Офис'
];

export default function Index() {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [night, setNight] = useState(1);
  const [time, setTime] = useState(0);
  const [energy, setEnergy] = useState(100);
  const [leftDoorClosed, setLeftDoorClosed] = useState(false);
  const [rightDoorClosed, setRightDoorClosed] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState(0);
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [animatronics, setAnimatronics] = useState<Record<Animatronic, AnimatronicStatus>>({
    freddy: { location: 0, aggression: 1, moving: false },
    bonnie: { location: 0, aggression: 1, moving: false },
    chica: { location: 0, aggression: 1, moving: false }
  });
  const [jumpscareActive, setJumpscareActive] = useState<Animatronic | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  const playSound = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine') => {
    if (!audioEnabled || !audioContextRef.current) return;
    
    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration);
    
    oscillator.start();
    oscillator.stop(audioContextRef.current.currentTime + duration);
  }, [audioEnabled]);

  const enableAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
      setAudioEnabled(true);
    }
  }, []);

  const startGame = useCallback(() => {
    enableAudio();
    setGameState('playing');
    setTime(0);
    setEnergy(100);
    setLeftDoorClosed(false);
    setRightDoorClosed(false);
    setCameraOpen(false);
    setFlashlightOn(false);
    setJumpscareActive(null);
    setAnimatronics({
      freddy: { location: 0, aggression: night, moving: false },
      bonnie: { location: 0, aggression: night, moving: false },
      chica: { location: 0, aggression: Math.max(1, night - 1), moving: false }
    });
  }, [night, enableAudio]);

  const triggerJumpscare = useCallback((animatronic: Animatronic) => {
    setJumpscareActive(animatronic);
    playSound(100, 0.5, 'sawtooth');
    setTimeout(() => playSound(150, 0.3, 'square'), 200);
    setTimeout(() => playSound(80, 0.4, 'sawtooth'), 400);
    
    setTimeout(() => {
      setGameState('gameover');
      setJumpscareActive(null);
    }, 2000);
  }, [playSound]);

  const moveAnimatronic = useCallback((animatronic: Animatronic) => {
    setAnimatronics(prev => {
      const current = prev[animatronic];
      if (current.moving || current.location >= 7) return prev;

      const moveChance = Math.random() * 20;
      if (moveChance < current.aggression) {
        const newLocation = current.location + 1;
        playSound(200 + Math.random() * 100, 0.2, 'square');
        
        return {
          ...prev,
          [animatronic]: { ...current, location: newLocation, moving: true }
        };
      }
      return prev;
    });

    setTimeout(() => {
      setAnimatronics(prev => ({
        ...prev,
        [animatronic]: { ...prev[animatronic], moving: false }
      }));
    }, 1000);
  }, [playSound]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    gameLoopRef.current = setInterval(() => {
      setTime(prev => {
        if (prev >= 360) {
          setGameState('win');
          return 360;
        }
        return prev + 1;
      });

      setEnergy(prev => {
        let drain = 0.05;
        if (leftDoorClosed) drain += 0.08;
        if (rightDoorClosed) drain += 0.08;
        if (cameraOpen) drain += 0.03;
        if (flashlightOn) drain += 0.05;
        
        const newEnergy = Math.max(0, prev - drain);
        if (newEnergy <= 0) {
          setLeftDoorClosed(false);
          setRightDoorClosed(false);
          setCameraOpen(false);
          setFlashlightOn(false);
        }
        return newEnergy;
      });

      if (Math.random() < 0.1) {
        const animatronicList: Animatronic[] = ['freddy', 'bonnie', 'chica'];
        const randomAnimatronic = animatronicList[Math.floor(Math.random() * animatronicList.length)];
        moveAnimatronic(randomAnimatronic);
      }
    }, 100);

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [gameState, leftDoorClosed, rightDoorClosed, cameraOpen, flashlightOn, moveAnimatronic]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const checkAttack = setInterval(() => {
      const { bonnie, freddy, chica } = animatronics;

      if (bonnie.location === 5 && !leftDoorClosed && Math.random() < 0.3) {
        triggerJumpscare('bonnie');
      }
      
      if (freddy.location === 6 && !rightDoorClosed && Math.random() < 0.3) {
        triggerJumpscare('freddy');
      }

      if (chica.location === 4 && !cameraOpen && Math.random() < 0.2) {
        triggerJumpscare('chica');
      }
    }, 2000);

    return () => clearInterval(checkAttack);
  }, [gameState, animatronics, leftDoorClosed, rightDoorClosed, cameraOpen, triggerJumpscare]);

  const currentHour = Math.floor(time / 60);
  const timeDisplay = `${currentHour}:00 AM`;

  if (jumpscareActive) {
    return <JumpscareScreen animatronic={jumpscareActive} />;
  }

  if (gameState === 'menu' || gameState === 'win' || gameState === 'gameover') {
    return (
      <GameMenu
        gameState={gameState}
        night={night}
        timeDisplay={timeDisplay}
        onStartGame={startGame}
        onNextNight={() => {
          setNight(prev => Math.min(7, prev + 1));
          setGameState('menu');
        }}
        onBackToMenu={() => setGameState('menu')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden crt-effect">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwwLDAsMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>

      {!cameraOpen ? (
        <GameOffice
          night={night}
          timeDisplay={timeDisplay}
          energy={energy}
          leftDoorClosed={leftDoorClosed}
          rightDoorClosed={rightDoorClosed}
          flashlightOn={flashlightOn}
          onToggleLeftDoor={() => energy > 0 && setLeftDoorClosed(!leftDoorClosed)}
          onToggleRightDoor={() => energy > 0 && setRightDoorClosed(!rightDoorClosed)}
          onToggleFlashlight={() => energy > 0 && setFlashlightOn(!flashlightOn)}
          onOpenCamera={() => energy > 0 && setCameraOpen(true)}
        />
      ) : (
        <CameraSystem
          selectedCamera={selectedCamera}
          animatronics={animatronics}
          locations={LOCATIONS}
          onSelectCamera={setSelectedCamera}
          onCloseCamera={() => setCameraOpen(false)}
        />
      )}

      {energy <= 0 && (
        <div className="absolute inset-0 bg-black/95 flex items-center justify-center animate-pulse">
          <p className="text-6xl text-red-600 pixel-text">ЭНЕРГИЯ ЗАКОНЧИЛАСЬ...</p>
        </div>
      )}
    </div>
  );
}
