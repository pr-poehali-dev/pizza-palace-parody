import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface GameOfficeProps {
  night: number;
  timeDisplay: string;
  energy: number;
  leftDoorClosed: boolean;
  rightDoorClosed: boolean;
  flashlightOn: boolean;
  onToggleLeftDoor: () => void;
  onToggleRightDoor: () => void;
  onToggleFlashlight: () => void;
  onOpenCamera: () => void;
}

export default function GameOffice({
  night,
  timeDisplay,
  energy,
  leftDoorClosed,
  rightDoorClosed,
  flashlightOn,
  onToggleLeftDoor,
  onToggleRightDoor,
  onToggleFlashlight,
  onOpenCamera,
}: GameOfficeProps) {
  return (
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
            onClick={onToggleLeftDoor}
            disabled={energy <= 0}
            className={`text-2xl py-6 px-8 pixel-text ${
              leftDoorClosed ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            <Icon name={leftDoorClosed ? 'DoorClosed' : 'DoorOpen'} size={32} className="mr-2" />
            ЛЕВАЯ ДВЕРЬ
          </Button>
          
          <Button
            onClick={onToggleFlashlight}
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
          onClick={onOpenCamera}
          disabled={energy <= 0}
          className="text-2xl py-6 px-8 bg-purple-600 hover:bg-purple-700 pixel-text"
        >
          <Icon name="Camera" size={32} className="mr-2" />
          КАМЕРЫ
        </Button>

        <Button
          onClick={onToggleRightDoor}
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
  );
}
