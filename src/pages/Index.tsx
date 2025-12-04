import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

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
    return (
      <div className="min-h-screen bg-black flex items-center justify-center crt-effect overflow-hidden">
        <div className="animate-shake">
          <div className="text-9xl animate-pulse">
            {jumpscareActive === 'freddy' && '🐻'}
            {jumpscareActive === 'bonnie' && '🐰'}
            {jumpscareActive === 'chica' && '🐔'}
          </div>
          <p className="text-6xl text-red-600 pixel-text mt-4 text-center glitch">
            {jumpscareActive === 'freddy' && 'ФРЕДДИ!'}
            {jumpscareActive === 'bonnie' && 'БОННИ!'}
            {jumpscareActive === 'chica' && 'ЧИКА!'}
          </p>
        </div>
        <div className="absolute inset-0 bg-red-600 opacity-30 animate-pulse"></div>
      </div>
    );
  }

  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center crt-effect p-4">
        <Card className="p-12 bg-gray-800/90 border-red-600 border-4 max-w-2xl w-full">
          <div className="text-center space-y-8">
            <h1 className="text-7xl font-bold text-red-600 pixel-text animate-flicker mb-4">
              🍕 FIVE NIGHTS AT
            </h1>
            <h2 className="text-6xl font-bold text-purple-400 pixel-text animate-pulse-slow">
              PIZZA PALACE
            </h2>
            
            <div className="h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent my-8"></div>
            
            <div className="space-y-4">
              <Button
                onClick={startGame}
                className="w-full text-3xl py-8 bg-red-600 hover:bg-red-700 border-4 border-red-800 pixel-text transition-all hover:scale-105"
              >
                НОВАЯ ИГРА
              </Button>
              
              <Button
                onClick={() => {}}
                disabled
                className="w-full text-3xl py-8 bg-gray-700 border-4 border-gray-800 pixel-text opacity-50"
              >
                ПРОДОЛЖИТЬ
              </Button>
              
              <Button
                onClick={() => {}}
                disabled
                className="w-full text-3xl py-8 bg-purple-600 hover:bg-purple-700 border-4 border-purple-800 pixel-text opacity-50"
              >
                КАСТОМ НОЧЬ
              </Button>
              
              <Button
                onClick={() => {}}
                disabled
                className="w-full text-3xl py-8 bg-gray-700 border-4 border-gray-800 pixel-text opacity-50"
              >
                НАСТРОЙКИ
              </Button>
            </div>

            <p className="text-xl text-gray-400 pixel-text mt-8">
              НОЧЬ: {night} / 7
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (gameState === 'win') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-900 to-gray-900 flex items-center justify-center crt-effect p-4">
        <Card className="p-12 bg-gray-800/90 border-green-600 border-4 max-w-2xl w-full text-center">
          <h1 className="text-7xl font-bold text-green-400 pixel-text mb-8">
            🎉 ВЫЖИЛ!
          </h1>
          <p className="text-4xl text-gray-300 pixel-text mb-8">
            НОЧЬ {night} ПРОЙДЕНА
          </p>
          <p className="text-2xl text-gray-400 pixel-text mb-12">
            6:00 AM - СМЕНА ОКОНЧЕНА
          </p>
          <div className="space-y-4">
            <Button
              onClick={() => {
                setNight(prev => Math.min(7, prev + 1));
                setGameState('menu');
              }}
              className="w-full text-3xl py-8 bg-green-600 hover:bg-green-700 border-4 border-green-800 pixel-text"
            >
              СЛЕДУЮЩАЯ НОЧЬ
            </Button>
            <Button
              onClick={() => setGameState('menu')}
              className="w-full text-3xl py-8 bg-gray-600 hover:bg-gray-700 border-4 border-gray-800 pixel-text"
            >
              В МЕНЮ
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (gameState === 'gameover') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-900 to-gray-900 flex items-center justify-center crt-effect p-4">
        <Card className="p-12 bg-gray-800/90 border-red-600 border-4 max-w-2xl w-full text-center">
          <h1 className="text-7xl font-bold text-red-600 pixel-text mb-8 glitch">
            💀 GAME OVER
          </h1>
          <p className="text-4xl text-gray-300 pixel-text mb-8">
            НОЧЬ {night} ПРОВАЛЕНА
          </p>
          <p className="text-2xl text-gray-400 pixel-text mb-12">
            {timeDisplay} - ВЫ НЕ ВЫЖИЛИ
          </p>
          <div className="space-y-4">
            <Button
              onClick={startGame}
              className="w-full text-3xl py-8 bg-red-600 hover:bg-red-700 border-4 border-red-800 pixel-text"
            >
              ПОПРОБОВАТЬ СНОВА
            </Button>
            <Button
              onClick={() => setGameState('menu')}
              className="w-full text-3xl py-8 bg-gray-600 hover:bg-gray-700 border-4 border-gray-800 pixel-text"
            >
              В МЕНЮ
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden crt-effect">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwwLDAsMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>

      {!cameraOpen ? (
        <div className="relative h-screen flex flex-col">
          <div className="flex-1 relative bg-gradient-to-b from-gray-800 to-gray-900 border-b-4 border-red-900">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-9xl opacity-20">🏢</div>
            </div>
            
            {flashlightOn && energy > 0 && (
              <div className="absolute inset-0 bg-gradient-radial from-yellow-300/30 via-transparent to-transparent"></div>
            )}

            <div className="absolute top-8 left-8 space-y-4">
              <div className="bg-black/80 p-4 border-2 border-red-600">
                <p className="text-3xl pixel-text text-red-400">НОЧЬ {night}</p>
              </div>
              <div className="bg-black/80 p-4 border-2 border-blue-600">
                <p className="text-3xl pixel-text text-blue-400">{timeDisplay}</p>
              </div>
            </div>

            <div className="absolute top-8 right-8">
              <div className="bg-black/80 p-4 border-2 border-yellow-600">
                <p className="text-3xl pixel-text text-yellow-400">
                  ЭНЕРГИЯ: {Math.floor(energy)}%
                </p>
                <div className="w-48 h-4 bg-gray-700 mt-2 border-2 border-yellow-600">
                  <div
                    className={`h-full ${energy > 50 ? 'bg-green-500' : energy > 20 ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'}`}
                    style={{ width: `${energy}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="h-48 bg-gray-800 border-t-4 border-red-900 flex items-center justify-between px-8">
            <div className="space-x-4">
              <Button
                onClick={() => energy > 0 && setLeftDoorClosed(!leftDoorClosed)}
                disabled={energy <= 0}
                className={`text-2xl py-6 px-8 pixel-text ${
                  leftDoorClosed ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                <Icon name={leftDoorClosed ? 'DoorClosed' : 'DoorOpen'} size={32} className="mr-2" />
                ЛЕВАЯ ДВЕРЬ
              </Button>
              
              <Button
                onClick={() => energy > 0 && setFlashlightOn(!flashlightOn)}
                disabled={energy <= 0}
                className={`text-2xl py-6 px-8 pixel-text ${
                  flashlightOn ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                <Icon name="Lightbulb" size={32} className="mr-2" />
                ФОНАРИК
              </Button>
            </div>

            <Button
              onClick={() => energy > 0 && setCameraOpen(true)}
              disabled={energy <= 0}
              className="text-2xl py-6 px-8 bg-purple-600 hover:bg-purple-700 pixel-text"
            >
              <Icon name="Camera" size={32} className="mr-2" />
              КАМЕРЫ
            </Button>

            <Button
              onClick={() => energy > 0 && setRightDoorClosed(!rightDoorClosed)}
              disabled={energy <= 0}
              className={`text-2xl py-6 px-8 pixel-text ${
                rightDoorClosed ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              <Icon name={rightDoorClosed ? 'DoorClosed' : 'DoorOpen'} size={32} className="mr-2" />
              ПРАВАЯ ДВЕРЬ
            </Button>
          </div>
        </div>
      ) : (
        <div className="h-screen flex flex-col bg-black">
          <div className="flex-1 relative bg-gray-900 border-4 border-green-600 m-4">
            <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,255,0,0.3)_2px,rgba(0,255,0,0.3)_4px)]"></div>
            
            <div className="absolute top-4 left-4 bg-black/90 p-4 border-2 border-green-500">
              <p className="text-2xl pixel-text text-green-400">
                КАМЕРА {selectedCamera + 1}: {LOCATIONS[selectedCamera]}
              </p>
            </div>

            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="text-9xl animate-pulse">
                  {selectedCamera === 0 && '🎭'}
                  {selectedCamera === 1 && '🍕'}
                  {selectedCamera === 2 && '🚪'}
                  {selectedCamera === 3 && '🚪'}
                  {selectedCamera === 4 && '🌀'}
                  {selectedCamera === 5 && '⬅️'}
                  {selectedCamera === 6 && '➡️'}
                </div>
                
                <div className="space-y-2">
                  {Object.entries(animatronics).map(([name, status]) => {
                    if (status.location === selectedCamera) {
                      return (
                        <p key={name} className="text-4xl pixel-text text-red-500 animate-flicker">
                          {name === 'freddy' && '🐻 ФРЕДДИ ЗДЕСЬ!'}
                          {name === 'bonnie' && '🐰 БОННИ ЗДЕСЬ!'}
                          {name === 'chica' && '🐔 ЧИКА ЗДЕСЬ!'}
                        </p>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            </div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {LOCATIONS.slice(0, 7).map((_, index) => (
                <Button
                  key={index}
                  onClick={() => setSelectedCamera(index)}
                  className={`text-xl py-2 px-4 pixel-text ${
                    selectedCamera === index ? 'bg-green-600' : 'bg-gray-700'
                  }`}
                >
                  CAM {index + 1}
                </Button>
              ))}
            </div>
          </div>

          <div className="h-24 bg-gray-800 flex items-center justify-center">
            <Button
              onClick={() => setCameraOpen(false)}
              className="text-2xl py-6 px-12 bg-red-600 hover:bg-red-700 pixel-text"
            >
              <Icon name="X" size={32} className="mr-2" />
              ЗАКРЫТЬ КАМЕРЫ
            </Button>
          </div>
        </div>
      )}

      {energy <= 0 && (
        <div className="absolute inset-0 bg-black/95 flex items-center justify-center animate-pulse">
          <p className="text-6xl text-red-600 pixel-text">ЭНЕРГИЯ ЗАКОНЧИЛАСЬ...</p>
        </div>
      )}
    </div>
  );
}
