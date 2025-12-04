import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

type Animatronic = 'freddy' | 'bonnie' | 'chica';

interface AnimatronicStatus {
  location: number;
  aggression: number;
  moving: boolean;
}

interface CameraSystemProps {
  selectedCamera: number;
  animatronics: Record<Animatronic, AnimatronicStatus>;
  locations: string[];
  onSelectCamera: (index: number) => void;
  onCloseCamera: () => void;
}

export default function CameraSystem({
  selectedCamera,
  animatronics,
  locations,
  onSelectCamera,
  onCloseCamera,
}: CameraSystemProps) {
  return (
    <div className="h-screen flex flex-col bg-black">
      <div className="flex-1 relative bg-gray-900 border-4 border-green-600 m-4">
        <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,255,0,0.3)_2px,rgba(0,255,0,0.3)_4px)]"></div>
        
        <div className="absolute top-4 left-4 bg-black/90 p-4 border-2 border-green-500 z-50">
          <p className="text-2xl pixel-text text-green-400">
            КАМЕРА {selectedCamera + 1}: {locations[selectedCamera]}
          </p>
        </div>

        <div className="h-full flex items-center justify-center relative">
          {selectedCamera === 0 && (
            <div className="w-full h-full bg-gradient-to-b from-purple-900/50 to-gray-900 flex items-center justify-center relative">
              <div className="absolute inset-0 grid grid-cols-3 gap-8 p-12">
                <div className="bg-red-900/30 border-4 border-red-800 flex items-center justify-center">
                  <span className="text-8xl">🎤</span>
                </div>
                <div className="bg-purple-900/30 border-4 border-purple-800 flex items-center justify-center">
                  <span className="text-8xl">🎸</span>
                </div>
                <div className="bg-yellow-900/30 border-4 border-yellow-800 flex items-center justify-center">
                  <span className="text-8xl">🎹</span>
                </div>
              </div>
              <p className="text-4xl pixel-text text-purple-400 absolute bottom-8">ГЛАВНАЯ СЦЕНА</p>
            </div>
          )}
          
          {selectedCamera === 1 && (
            <div className="w-full h-full bg-gradient-to-b from-orange-900/50 to-gray-900 flex items-center justify-center relative">
              <div className="grid grid-cols-4 gap-4 p-8">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="w-24 h-24 bg-brown-800/40 border-2 border-orange-700 rounded-full flex items-center justify-center">
                    <span className="text-3xl">🍕</span>
                  </div>
                ))}
              </div>
              <p className="text-4xl pixel-text text-orange-400 absolute bottom-8">СТОЛОВАЯ</p>
            </div>
          )}
          
          {selectedCamera === 2 && (
            <div className="w-full h-full bg-gradient-to-r from-gray-900 via-gray-800 to-black flex items-center justify-center relative">
              <div className="w-1/3 h-full bg-gradient-to-r from-transparent via-gray-700/50 to-black border-l-8 border-r-8 border-red-900/50"></div>
              <p className="text-4xl pixel-text text-blue-400 absolute bottom-8">КОРИДОР СЛЕВА</p>
            </div>
          )}
          
          {selectedCamera === 3 && (
            <div className="w-full h-full bg-gradient-to-l from-gray-900 via-gray-800 to-black flex items-center justify-center relative">
              <div className="w-1/3 h-full bg-gradient-to-l from-transparent via-gray-700/50 to-black border-l-8 border-r-8 border-red-900/50"></div>
              <p className="text-4xl pixel-text text-blue-400 absolute bottom-8">КОРИДОР СПРАВА</p>
            </div>
          )}
          
          {selectedCamera === 4 && (
            <div className="w-full h-full bg-gradient-to-b from-gray-800 to-gray-900 flex items-center justify-center relative">
              <div className="absolute inset-0">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute bg-gray-700/40 border border-gray-600"
                    style={{
                      width: `${Math.random() * 100 + 50}px`,
                      height: `${Math.random() * 100 + 50}px`,
                      left: `${Math.random() * 80}%`,
                      top: `${Math.random() * 80}%`,
                    }}
                  ></div>
                ))}
              </div>
              <span className="text-9xl animate-spin-slow">🌀</span>
              <p className="text-4xl pixel-text text-cyan-400 absolute bottom-8">ВЕНТИЛЯЦИЯ</p>
            </div>
          )}
          
          {selectedCamera === 5 && (
            <div className="w-full h-full bg-gradient-to-r from-red-900/50 to-gray-900 flex items-center justify-center relative">
              <div className="w-1/2 h-3/4 bg-gray-800/60 border-8 border-red-900 rounded-lg flex items-center justify-center">
                <Icon name="DoorClosed" size={200} className="text-red-700" />
              </div>
              <p className="text-4xl pixel-text text-red-400 absolute bottom-8">ЛЕВАЯ ДВЕРЬ</p>
            </div>
          )}
          
          {selectedCamera === 6 && (
            <div className="w-full h-full bg-gradient-to-l from-red-900/50 to-gray-900 flex items-center justify-center relative">
              <div className="w-1/2 h-3/4 bg-gray-800/60 border-8 border-red-900 rounded-lg flex items-center justify-center">
                <Icon name="DoorClosed" size={200} className="text-red-700" />
              </div>
              <p className="text-4xl pixel-text text-red-400 absolute bottom-8">ПРАВАЯ ДВЕРЬ</p>
            </div>
          )}
          
          <div className="absolute inset-0 pointer-events-none">
            {Object.entries(animatronics).map(([name, status]) => {
              if (status.location === selectedCamera) {
                return (
                  <div key={name} className="absolute inset-0 flex items-center justify-center bg-black/60">
                    <div className="text-center space-y-4 animate-pulse">
                      <div className="text-9xl">
                        {name === 'freddy' && '🐻'}
                        {name === 'bonnie' && '🐰'}
                        {name === 'chica' && '🐔'}
                      </div>
                      <p className="text-6xl pixel-text text-red-500 animate-flicker glitch">
                        {name === 'freddy' && 'ФРЕДДИ!'}
                        {name === 'bonnie' && 'БОННИ!'}
                        {name === 'chica' && 'ЧИКА!'}
                      </p>
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-50">
          {locations.slice(0, 7).map((_, index) => (
            <Button
              key={index}
              onClick={() => onSelectCamera(index)}
              className={`text-xl py-2 px-4 pixel-text ${
                selectedCamera === index ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              CAM {index + 1}
            </Button>
          ))}
        </div>
      </div>

      <div className="h-24 bg-gray-800 flex items-center justify-center border-t-4 border-green-600">
        <Button
          onClick={onCloseCamera}
          className="text-2xl py-6 px-12 bg-red-600 hover:bg-red-700 border-4 border-red-800 pixel-text transition-all hover:scale-105"
        >
          <Icon name="X" size={32} className="mr-2" />
          ЗАКРЫТЬ КАМЕРЫ
        </Button>
      </div>
    </div>
  );
}
