
import React, { useState, useCallback } from 'react';
import { GameState, Path, Dancer } from './types';
import { NEON_COLORS, DANCE_STYLES } from './constants';
import DrawingCanvas from './components/DrawingCanvas';
import DanceFloor from './components/DanceFloor';
import { generateDancerPersona } from './services/geminiService';
import { discoAudio } from './utils/audio';
import { Sparkles, Music, Play, Plus, Eraser, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.DRAWING);
  const [dancers, setDancers] = useState<Dancer[]>([]);
  const [currentColor, setCurrentColor] = useState(NEON_COLORS[0]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [announcement, setAnnouncement] = useState('画个圆、星星 or 小人，开启派对！');

  const handleDrawEnd = useCallback(async (path: Path) => {
    // 1. 立即创建一个基础舞者，让用户看到“画的东西动起来”
    const tempId = path.id;
    const newDancer: Dancer = {
      ...path,
      danceStyle: DANCE_STYLES[Math.floor(Math.random() * DANCE_STYLES.length)],
      personality: "正在注入灵魂...",
      scale: 0.8 + Math.random() * 0.4,
      rotation: 15 + Math.random() * 15,
      // 确保在屏幕可见范围内
      offsetX: (Math.random() - 0.5) * (window.innerWidth * 0.6),
      offsetY: (Math.random() - 0.5) * (window.innerHeight * 0.4),
      speed: 0.8 + Math.random() * 1.2,
      bounceHeight: 30 + Math.random() * 40,
    };

    setDancers(prev => [...prev, newDancer]);
    
    // 如果是第一个舞者，自动开启派对模式并播放音乐
    if (dancers.length === 0) {
      setGameState(GameState.PARTY);
      discoAudio.startParty();
    }

    // 2. 异步请求 AI 生成个性化信息
    setIsAiLoading(true);
    try {
      // 简单判断形状
      const points = path.points;
      const isComplex = points.length > 30;
      const description = isComplex ? "一个复杂的抽象艺术画" : "一个简单的几何形状";

      const persona = await generateDancerPersona(description);
      
      // 更新该舞者的信息
      setDancers(prev => prev.map(d => 
        d.id === tempId 
          ? { ...d, personality: persona.name } 
          : d
      ));
      setAnnouncement(`新成员加入：${persona.name}! "${persona.catchphrase}"`);
    } catch (error) {
      console.error("AI 赋予灵魂失败", error);
    } finally {
      setIsAiLoading(false);
    }
  }, [dancers]);

  const toggleParty = () => {
    if (gameState === GameState.DRAWING) {
      setGameState(GameState.PARTY);
      discoAudio.startParty();
    } else {
      setGameState(GameState.DRAWING);
      discoAudio.stopParty();
    }
  };

  // Fix: Wrapped clearParty in useCallback and corrected syntax to resolve variable redeclaration and destructuring errors
  const clearParty = useCallback(() => {
    setDancers([]);
    setAnnouncement('舞池空了，快画一个新的明星！');
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 flex flex-col gap-4">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-center gap-4 z-50">
        <div>
          <h1 className="text-4xl md:text-5xl font-bungee text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 neon-animate">
            AI 蹦迪派对
          </h1>
          <p className="text-gray-400 mt-1 font-medium tracking-tight flex items-center gap-2">
            <Sparkles size={16} className="text-yellow-400" />
            {announcement}
          </p>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={toggleParty}
            className={`px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 shadow-lg ${
              gameState === GameState.PARTY 
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-pink-500/30' 
              : 'bg-gradient-to-r from-green-500 to-emerald-600 shadow-green-500/30'
            }`}
          >
            {gameState === GameState.PARTY ? (
              <><Plus size={20} /> 继续画画</>
            ) : (
              <><Play size={20} /> 进入舞池!</>
            )}
          </button>
          
          <button 
            onClick={clearParty}
            className="p-3 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors shadow-lg border border-gray-700"
            title="清空所有舞者"
          >
            <Eraser size={20} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative">
        <div className={`absolute inset-0 transition-opacity duration-500 ${gameState === GameState.DRAWING ? 'opacity-100 z-10' : 'opacity-0 -z-10'}`}>
          <div className="h-full flex flex-col gap-4">
            <div className="flex justify-center gap-3 bg-gray-900/80 backdrop-blur px-4 py-2 rounded-full w-fit mx-auto border border-gray-800">
              {NEON_COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => setCurrentColor(color)}
                  className={`w-8 h-8 rounded-full border-2 transition-all transform hover:scale-125 ${
                    currentColor === color ? 'border-white scale-110 shadow-[0_0_10px_white]' : 'border-transparent opacity-60'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            
            <DrawingCanvas onDrawEnd={handleDrawEnd} color={currentColor} />
            
            <div className="text-center text-gray-500 animate-pulse text-sm">
              <p>在上方区域作画，松开后它就会去跳舞！</p>
            </div>
          </div>
        </div>

        <div className={`absolute inset-0 transition-opacity duration-500 ${gameState === GameState.PARTY ? 'opacity-100 z-10' : 'opacity-0 -z-10'}`}>
          <div className="h-full">
            {dancers.length > 0 ? (
              <DanceFloor dancers={dancers} />
            ) : (
              <div className="h-full flex items-center justify-center border-4 border-dashed border-gray-800 rounded-3xl bg-gray-900/20">
                <div className="text-center">
                   <Music size={48} className="mx-auto text-gray-700 mb-4 animate-bounce" />
                   <p className="text-lg text-gray-600">舞池空无一人... 快去画一个舞者！</p>
                   <button 
                     onClick={() => setGameState(GameState.DRAWING)}
                     className="mt-4 px-6 py-2 bg-pink-600/20 text-pink-500 border border-pink-500/30 rounded-full hover:bg-pink-600/30 transition-all"
                   >
                     立即作画
                   </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI Loading indicator for personality injection */}
        {isAiLoading && (
          <div className="fixed bottom-10 right-10 bg-black/80 backdrop-blur-md border border-pink-500/50 px-4 py-2 rounded-full flex items-center gap-2 z-[100] animate-in fade-in slide-in-from-bottom-4">
            <Loader2 size={16} className="animate-spin text-pink-500" />
            <span className="text-xs font-bold tracking-wider">AI 正在为你的画作赋予灵魂...</span>
          </div>
        )}
      </main>

      <footer className="text-center text-gray-700 text-[10px] uppercase tracking-[0.2em]">
        <p>AI DANCE PARTY • DRAW • DANCE • REPEAT</p>
      </footer>
    </div>
  );
};

export default App;
