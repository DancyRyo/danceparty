
import React, { useEffect, useState, useRef } from 'react';
import { Dancer } from '../types';

interface DanceFloorProps {
  dancers: Dancer[];
}

const DanceFloor: React.FC<DanceFloorProps> = ({ dancers }) => {
  const [tick, setTick] = useState(0);
  const requestRef = useRef<number>(null);

  useEffect(() => {
    const animate = () => {
      setTick(t => t + 1);
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden bg-black rounded-3xl border-4 border-pink-500/30 shadow-[0_0_50px_rgba(255,0,255,0.15)]">
      {/* 动态网格背景 */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ 
             backgroundImage: 'linear-gradient(#ff00ff 1px, transparent 1px), linear-gradient(90deg, #ff00ff 1px, transparent 1px)', 
             backgroundSize: '40px 40px',
             transform: `perspective(500px) rotateX(60deg) translateY(${tick % 40}px)` 
           }}>
      </div>

      {/* 舞者容器 */}
      {dancers.map((dancer) => {
        // 使用 tick 驱动不同的舞蹈动作
        const bounce = Math.abs(Math.sin(tick * 0.1 * dancer.speed)) * -dancer.bounceHeight;
        const wiggle = Math.sin(tick * 0.15 * dancer.speed) * 25;
        const tilt = Math.cos(tick * 0.1 * dancer.speed) * dancer.rotation;
        const scale = 1 + Math.sin(tick * 0.2) * 0.1;

        // 计算路径范围
        const minX = Math.min(...dancer.points.map(p => p.x));
        const minY = Math.min(...dancer.points.map(p => p.y));
        const maxX = Math.max(...dancer.points.map(p => p.x));
        const maxY = Math.max(...dancer.points.map(p => p.y));
        const width = maxX - minX;
        const height = maxY - minY;
        
        // 居中路径
        const pathData = dancer.points
          .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x - minX} ${p.y - minY}`)
          .join(' ');

        return (
          <div
            key={dancer.id}
            className="absolute will-change-transform"
            style={{
              left: `calc(50% + ${dancer.offsetX}px)`,
              top: `calc(50% + ${dancer.offsetY}px)`,
              transform: `translate(-50%, -50%) translate(${wiggle}px, ${bounce}px) rotate(${tilt}deg) scale(${scale * dancer.scale})`,
            }}
          >
            {/* 影子 */}
            <div 
              className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-full h-4 bg-pink-500/20 blur-xl rounded-full transition-transform"
              style={{ transform: `scaleX(${1 - Math.abs(bounce)/100})` }}
            />
            
            <svg 
              width={width + 30} 
              height={height + 30} 
              viewBox={`-15 -15 ${width + 30} ${height + 30}`}
              className="filter drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
            >
              <path
                d={pathData}
                fill="none"
                stroke={dancer.color}
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-all duration-300"
              />
            </svg>
            
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
               <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 whitespace-nowrap">
                 <span className="text-[10px] font-black uppercase tracking-tighter text-white">
                   {dancer.personality}
                 </span>
               </div>
            </div>
          </div>
        );
      })}

      {/* 蹦迪灯光 */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] opacity-20"
          style={{ 
            background: `radial-gradient(circle at center, ${tick % 100 > 50 ? '#00ffff' : '#ff00ff'} 0%, transparent 70%)`,
            transform: `translate(${Math.sin(tick * 0.02) * 10}%, ${Math.cos(tick * 0.02) * 10}%)`
          }}
        />
        {/* 闪光效果 */}
        {tick % 10 < 2 && (
          <div className="absolute inset-0 bg-white/5" />
        )}
      </div>
    </div>
  );
};

export default DanceFloor;
