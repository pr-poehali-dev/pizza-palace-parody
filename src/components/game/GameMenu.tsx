import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

type GameState = 'menu' | 'win' | 'gameover';

interface GameMenuProps {
  gameState: GameState;
  night: number;
  timeDisplay: string;
  onStartGame: () => void;
  onNextNight: () => void;
  onBackToMenu: () => void;
}

export default function GameMenu({
  gameState,
  night,
  timeDisplay,
  onStartGame,
  onNextNight,
  onBackToMenu,
}: GameMenuProps) {
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
                onClick={onStartGame}
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
              onClick={onNextNight}
              className="w-full text-3xl py-8 bg-green-600 hover:bg-green-700 border-4 border-green-800 pixel-text"
            >
              СЛЕДУЮЩАЯ НОЧЬ
            </Button>
            <Button
              onClick={onBackToMenu}
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
              onClick={onStartGame}
              className="w-full text-3xl py-8 bg-red-600 hover:bg-red-700 border-4 border-red-800 pixel-text"
            >
              ПОПРОБОВАТЬ СНОВА
            </Button>
            <Button
              onClick={onBackToMenu}
              className="w-full text-3xl py-8 bg-gray-600 hover:bg-gray-700 border-4 border-gray-800 pixel-text"
            >
              В МЕНЮ
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return null;
}
