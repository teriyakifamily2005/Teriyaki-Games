
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState } from './types';
import { getDocBrownAdvice } from './services/geminiService';
import DeLorean from './components/DeLorean';
import { Zap, Clock, RotateCcw, Flame, Sparkles, CloudLightning, Trophy } from 'lucide-react';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START_SCREEN);
  const [speed, setSpeed] = useState(88);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [advice, setAdvice] = useState("準備はいいか、マーティ！");
  const [targetPos, setTargetPos] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [lightning, setLightning] = useState(false);
  const [bgScroll, setBgScroll] = useState(0);
  const [scale, setScale] = useState(1);
  
  const gameLoopRef = useRef<number>();
  const wirePosRef = useRef(150);

  const STAGE_WIDTH = 1024;
  const STAGE_HEIGHT = 768;
  const BASE_WIRE_SPEED = 2.4;
  const BG_PATTERN_WIDTH = 868;

  // 画面サイズに合わせてステージを拡大縮小する
  useEffect(() => {
    const handleResize = () => {
      const screenW = window.innerWidth;
      const screenH = window.innerHeight;
      
      // 縦横比を維持しながら画面に収まる最大スケールを計算
      const s = Math.min(screenW / STAGE_WIDTH, screenH / STAGE_HEIGHT);
      setScale(s);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    const timer = setTimeout(handleResize, 100);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const savedBest = localStorage.getItem('bttf_best_streak');
    if (savedBest) setBestStreak(parseInt(savedBest, 10));
  }, []);

  useEffect(() => {
    if (streak > bestStreak) {
      setBestStreak(streak);
      localStorage.setItem('bttf_best_streak', streak.toString());
    }
  }, [streak, bestStreak]);

  useEffect(() => {
    const triggerLightning = () => {
      if (Math.random() > 0.96) {
        setLightning(true);
        setTimeout(() => setLightning(false), 120);
      }
    };
    const interval = setInterval(triggerLightning, 400);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const initAdvice = async () => {
      const msg = await getDocBrownAdvice('start');
      setAdvice(msg);
    };
    initAdvice();
  }, []);

  const startGame = () => {
    setGameState(GameState.COUNTDOWN);
    setCountdown(3);
    setSpeed(88); 
    wirePosRef.current = 150;
    setTargetPos(150);
  };

  const resetGame = () => {
    setStreak(0);
    startGame();
  };

  useEffect(() => {
    if (gameState === GameState.COUNTDOWN) {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        setGameState(GameState.RACING);
      }
    }
  }, [countdown, gameState]);

  const handleAction = useCallback(async () => {
    if (gameState !== GameState.RACING) return;

    const carX = 15; 
    const hookOffset = 1.2; 
    const contactX = carX + hookOffset; 
    const currentWireX = wirePosRef.current;
    const diff = Math.abs(currentWireX - contactX);

    if (diff < 15) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setGameState(GameState.SUCCESS);
      setFeedback("1.21ジゴワット！！未来へ帰るぞ！");
      getDocBrownAdvice('success').then(setAdvice);
    } else {
      setGameState(GameState.FAILURE);
      setFeedback("電線に触れんかった！タイミングが重要だ！");
      getDocBrownAdvice('failure', speed).then(setAdvice);
    }
  }, [gameState, speed, streak]);

  useEffect(() => {
    if (gameState === GameState.RACING) {
      const currentSpeedMult = Math.pow(1.15, streak);
      const currentWireMove = BASE_WIRE_SPEED * currentSpeedMult;

      const update = () => {
        wirePosRef.current -= currentWireMove;
        setTargetPos(wirePosRef.current);

        // 背景を無限ループさせる
        setBgScroll(prev => {
          const next = prev - currentWireMove * 3.56;
          return next <= -BG_PATTERN_WIDTH ? next + BG_PATTERN_WIDTH : next;
        });

        if (wirePosRef.current < -30) {
          setGameState(GameState.FAILURE);
          setFeedback("通り過ぎてしまった！科学は正確でなければ！");
          getDocBrownAdvice('failure', speed).then(setAdvice);
        } else {
          gameLoopRef.current = requestAnimationFrame(update);
        }
      };
      gameLoopRef.current = requestAnimationFrame(update);
      return () => {
        if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
      };
    }
  }, [gameState, streak, speed]);

  return (
    <div className="fixed inset-0 bg-[#020617] flex items-center justify-center overflow-hidden select-none touch-none">
      
      {/* 
          背景装飾: ステージ外の「黒い余白」に回路風のテクスチャを配置し
          PCのような高級感を演出 
      */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: `radial-gradient(#1e40af 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
      <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 via-transparent to-blue-900/20 pointer-events-none" />

      {/* 
          スケーリングステージ:
          translate(-50%, -50%) と scale(scale) を組み合わせることで、
          アスペクト比を維持しつつ画面中央に最適化配置されます。
      */}
      <div 
        className="absolute top-1/2 left-1/2 transition-transform duration-75 ease-out origin-center"
        style={{ 
          width: `${STAGE_WIDTH}px`, 
          height: `${STAGE_HEIGHT}px`,
          transform: `translate(-50%, -50%) scale(${scale})`
        }}
      >
        
        {/* ゲーム画面本体 */}
        <div 
          className={`relative w-full h-full overflow-hidden transition-colors duration-100 ${lightning ? 'bg-slate-200' : 'bg-[#334155]'} border-4 border-slate-800 rounded-2xl shadow-[0_0_100px_rgba(30,58,138,0.5)]`}
          onClick={handleAction}
        >
          
          {/* 背景要素 */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 w-full h-full bg-gradient-to-b from-slate-900 via-slate-800/40 to-transparent" />
            
            <div 
              className="absolute bottom-32 h-[400px] flex items-end will-change-transform"
              style={{ transform: `translateX(${bgScroll}px)`, width: `${BG_PATTERN_WIDTH * 16}px` }}
            >
              {[...Array(16)].map((_, i) => (
                <div key={i} className="flex items-end gap-32 px-10 shrink-0" style={{ width: BG_PATTERN_WIDTH }}>
                  <div className="relative w-64 h-56 bg-slate-900 border-t-8 border-red-700 rounded-sm shadow-2xl">
                     <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-24 h-16 bg-white rounded-full border-4 border-red-700 flex items-center justify-center font-black text-red-700 text-xs shadow-lg uppercase">Texaco</div>
                  </div>
                  <div className="relative w-[320px] h-48 bg-gray-800 border-t-8 border-pink-600 rounded-t-xl">
                     <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[280px] h-14 bg-blue-950/60 border-2 border-pink-500/50 flex items-center justify-center rounded-lg">
                        <span className="text-pink-400 font-black italic text-3xl tracking-tighter animate-pulse">LOU'S DINER</span>
                     </div>
                  </div>
                  <div className="relative w-[400px] h-80 bg-black border-x-8 border-gray-950 shadow-2xl">
                     <div className="absolute -top-14 left-0 w-full h-14 bg-yellow-700 flex items-center justify-center border-b-4 border-yellow-800">
                        <span className="text-white font-black text-2xl tracking-[0.4em]">T H E A T E R</span>
                     </div>
                     <div className="absolute inset-6 border-4 border-white/5 flex flex-col items-center justify-center gap-4 bg-slate-900/40">
                        <span className="text-yellow-100/50 text-xs font-bold tracking-widest uppercase">Now Showing</span>
                        <span className="text-white text-3xl font-black text-center leading-tight uppercase">Cattle Queen<br/>of Montana</span>
                     </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="absolute bottom-0 w-full h-32 bg-[#0f172a] border-t-[10px] border-black shadow-[inset_0_20px_50px_rgba(0,0,0,0.9)]">
               <div className="absolute top-0 w-full h-2 border-t-4 border-dashed border-gray-600/30 mt-4" />
            </div>
          </div>

          {/* 雨 */}
          <div className="absolute inset-0 pointer-events-none z-10">
            {[...Array(40)].map((_, i) => (
              <div key={i} className="absolute bg-white/20 w-[1px] h-32 rotate-[20deg] animate-[fall_0.4s_linear_infinite]"
                style={{ left: `${Math.random() * 110}%`, top: `${Math.random() * -100}%`, animationDelay: `${Math.random() * 2}s` }} />
            ))}
          </div>

          {/* 時計台ターゲット */}
          <div className="absolute top-0 w-full h-full pointer-events-none z-20">
            <div className="absolute transition-transform duration-75" style={{ left: `${targetPos}%`, top: '15%' }}>
              <div className="absolute -top-16 -left-16 w-32 h-32 bg-blue-400/30 rounded-full animate-ping blur-2xl" />
              <div className="absolute -top-8 -left-8 w-16 h-16 bg-white rounded-full animate-pulse shadow-[0_0_80px_white]" />
              <div className="w-8 h-[420px] bg-gradient-to-b from-white via-blue-500 to-yellow-500 shadow-[0_0_100px_rgba(59,130,246,0.8)] relative rounded-full" />
              <div className="absolute top-[420px] -translate-x-1/2 left-1/2 w-[450px] h-[1000px] bg-gradient-to-b from-slate-800 to-black border-x-8 border-slate-900 flex flex-col items-center pt-24">
                <div className="w-56 h-56 bg-slate-100 rounded-full border-[18px] border-[#2b1604] flex items-center justify-center shadow-inner">
                   <Clock className="w-32 h-32 text-slate-900" />
                </div>
                <div className="mt-20 text-slate-600 font-black tracking-[1em] text-xl uppercase opacity-40">Hill Valley</div>
              </div>
            </div>
          </div>

          {/* UI */}
          <div className="relative z-40 h-full flex flex-col p-8 pointer-events-none">
            <div className="flex justify-between items-start gap-6">
              <div className="bg-slate-950/90 p-5 border-l-[10px] border-orange-600 rounded-r-2xl shadow-2xl backdrop-blur-xl border border-white/10 shrink-0">
                <div className="text-orange-500 text-[10px] font-black tracking-widest mb-1 uppercase">Target Velocity</div>
                <div className="text-6xl font-black italic text-white flex items-baseline gap-2">
                  88.0<span className="text-sm not-italic text-orange-600 font-black opacity-80">MPH</span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-3 grow max-w-[650px]">
                 <div className="bg-blue-900/95 p-8 rounded-[2.5rem] border-4 border-blue-400/60 italic text-white text-4xl font-black shadow-2xl backdrop-blur-3xl leading-snug text-center w-full drop-shadow-xl">
                   「{advice}」
                 </div>
                 {bestStreak > 0 && (
                   <div className="bg-slate-950/80 p-3 px-8 rounded-full border-2 border-yellow-600 flex items-center gap-3 shadow-2xl">
                      <Trophy className="text-yellow-500 w-6 h-6" />
                      <span className="text-yellow-500 font-black uppercase tracking-widest text-lg">Best Streak: {bestStreak}</span>
                   </div>
                 )}
              </div>
            </div>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-6">
              <div className="pointer-events-auto w-full max-w-[850px]">
                {gameState === GameState.START_SCREEN && (
                  <div className="text-center bg-slate-950/95 p-16 rounded-[4rem] border-4 border-blue-600 backdrop-blur-3xl shadow-2xl">
                    <CloudLightning className="w-24 h-24 text-yellow-500 mx-auto mb-8 animate-pulse" />
                    <h1 className="text-7xl font-black italic tracking-tighter text-blue-500 mb-6 leading-none uppercase drop-shadow-[0_0_30px_rgba(59,130,246,0.6)]">
                      Back To The <span className="text-orange-600">Future</span>
                    </h1>
                    <p className="text-gray-300 mb-12 text-3xl font-bold leading-relaxed">
                      落雷の瞬間、時速88マイルで<br/>
                      フックを電線に接触させろ！
                    </p>
                    <button onClick={(e) => { e.stopPropagation(); startGame(); }}
                      className="px-20 py-10 bg-orange-700 hover:bg-orange-600 text-white font-black text-5xl italic rounded-full transition-all transform hover:scale-105 shadow-[0_0_60px_rgba(194,65,12,0.6)]">
                      エンジン始動！
                    </button>
                  </div>
                )}

                {gameState === GameState.COUNTDOWN && (
                  <div className="text-[25rem] font-black italic animate-ping text-white drop-shadow-[0_0_100px_white] leading-none text-center">
                    {countdown > 0 ? countdown : 'GO!'}
                  </div>
                )}

                {gameState === GameState.SUCCESS && (
                  <div className="text-center bg-blue-900/95 p-12 rounded-[4rem] border-[12px] border-yellow-500 backdrop-blur-3xl shadow-2xl animate-in zoom-in duration-300">
                    <h2 className="text-[7.5rem] font-black italic text-white mb-6 leading-none tracking-tighter uppercase drop-shadow-[0_0_50px_white]">GREAT MARTY!</h2>
                    <div className="text-4xl font-black text-yellow-400 mb-12 tracking-widest animate-bounce">
                      {feedback}
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); startGame(); }}
                      className="px-20 py-8 bg-white text-blue-950 font-black text-4xl rounded-full hover:bg-gray-100 shadow-2xl transition-all">
                      <RotateCcw className="w-12 h-12 inline mr-4" /> 次の時代へ
                    </button>
                  </div>
                )}

                {gameState === GameState.FAILURE && (
                  <div className="text-center bg-red-950/95 p-12 rounded-[4rem] border-8 border-red-600 shadow-2xl backdrop-blur-3xl animate-in zoom-in duration-300">
                    <h2 className="text-[7rem] font-black italic text-white mb-6 leading-none uppercase drop-shadow-[0_0_40px_rgba(220,38,38,0.5)]">HEAVY...</h2>
                    <div className="text-3xl font-black text-red-300 mb-12 px-10 py-8 bg-black/70 rounded-[2.5rem] border-2 border-red-600/40">
                      {feedback}
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); resetGame(); }}
                      className="px-20 py-8 bg-white text-red-950 font-black text-4xl rounded-full hover:bg-gray-200 transition-all shadow-2xl">
                      <RotateCcw className="w-12 h-12 inline mr-4" /> 再挑戦
                    </button>
                  </div>
                )}
              </div>
            </div>

            {gameState === GameState.RACING && (
              <div className="mt-auto mb-16 text-center animate-pulse self-center">
                <div className="text-yellow-400 text-5xl font-black mb-10 tracking-[0.4em] drop-shadow-xl uppercase text-outline">
                  ターゲット接近！
                </div>
                <div className="text-9xl font-black text-white px-24 py-12 bg-white/10 border-y-[8px] border-white/60 rounded-full shadow-[0_0_120px_rgba(255,255,255,0.4)] tracking-tighter leading-none pointer-events-auto cursor-pointer active:scale-95 transition-transform">
                  TAP NOW!
                </div>
              </div>
            )}
          </div>

          <div className="absolute bottom-32 left-[15%] z-30 pointer-events-none">
            <DeLorean 
              speed={speed} 
              isSuccess={gameState === GameState.SUCCESS}
              isFailure={gameState === GameState.FAILURE}
              streak={streak}
            />
          </div>

          {gameState === GameState.RACING && (
            <div className="absolute left-[16.5%] bottom-32 h-[550px] w-4 bg-gradient-to-t from-blue-600 to-transparent opacity-60 pointer-events-none z-20 shadow-[0_0_20px_rgba(37,99,235,0.5)]">
               <div className="absolute -top-16 left-1/2 -translate-x-1/2 text-[24px] text-blue-400 font-black whitespace-nowrap tracking-[0.6em] animate-pulse">HOOK LINE</div>
            </div>
          )}

          {gameState === GameState.SUCCESS && (
            <div className="absolute inset-0 z-50 bg-white animate-[ping_0.8s_infinite] opacity-50 pointer-events-none" />
          )}
        </div>
      </div>

      <style>{`
        @keyframes fall {
          to { transform: translateY(800px) rotate(20deg); }
        }
        .text-outline {
          text-shadow: -4px -4px 0 #000, 4px -4px 0 #000, -4px 4px 0 #000, 4px 4px 0 #000;
        }
      `}</style>
    </div>
  );
};

export default App;
