type Animatronic = 'freddy' | 'bonnie' | 'chica';

interface JumpscareScreenProps {
  animatronic: Animatronic;
}

export default function JumpscareScreen({ animatronic }: JumpscareScreenProps) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center crt-effect overflow-hidden">
      <div className="animate-shake">
        <div className="text-9xl animate-pulse">
          {animatronic === 'freddy' && '🐻'}
          {animatronic === 'bonnie' && '🐰'}
          {animatronic === 'chica' && '🐔'}
        </div>
        <p className="text-6xl text-red-600 pixel-text mt-4 text-center glitch">
          {animatronic === 'freddy' && 'ФРЕДДИ!'}
          {animatronic === 'bonnie' && 'БОННИ!'}
          {animatronic === 'chica' && 'ЧИКА!'}
        </p>
      </div>
      <div className="absolute inset-0 bg-red-600 opacity-30 animate-pulse"></div>
    </div>
  );
}
