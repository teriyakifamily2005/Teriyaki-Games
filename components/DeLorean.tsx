
import React from 'react';

interface DeLoreanProps {
  speed: number;
  isSuccess: boolean;
  isFailure: boolean;
  streak: number;
}

const DeLorean: React.FC<DeLoreanProps> = ({ speed, isSuccess, isFailure, streak }) => {
  return (
    <div className={`relative transition-all duration-75 ${isSuccess ? 'animate-pulse scale-105' : ''}`}>
      {/* 釣り竿 (フック) - 極太で発光、視認性を最優先 */}
      <div 
        className="absolute -top-[160px] left-[18%] w-3 h-[170px] bg-white origin-bottom shadow-[0_0_30px_rgba(255,255,255,1),0_0_15px_rgba(59,130,246,1)] z-30"
        style={{ transform: 'rotate(-20deg)' }}
      >
        {/* 先端のフックフック */}
        <div className="absolute -top-5 -right-4 w-12 h-12 border-t-[10px] border-l-[10px] border-white rounded-tl-full shadow-[0_0_20px_white]" />
        
        {/* 接続部バネ */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-5 h-20 flex flex-col gap-1.5">
           {[...Array(6)].map((_, i) => (
             <div key={i} className="h-2 w-full bg-gray-400 rounded-full shadow-[0_0_5px_white]" />
           ))}
        </div>

        {/* 成功時の激しい放電 */}
        {isSuccess && (
          <div className="absolute top-0 left-0 w-32 h-32 -translate-x-1/2 -translate-y-1/2 z-50">
             <div className="absolute inset-0 bg-blue-300 rounded-full animate-ping" />
             <div className="absolute inset-0 bg-white rounded-full animate-pulse scale-150 shadow-[0_0_80px_cyan]" />
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-6 bg-white rotate-45 blur-md" />
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-6 bg-white -rotate-45 blur-md" />
          </div>
        )}
      </div>

      {/* デロリアン本体 (右向き) */}
      <div className="w-[300px] h-[85px] relative">
        
        {/* リア原子炉（ベント） */}
        <div className="absolute -top-10 left-4 flex gap-2 z-10">
          {[0, 1].map(i => (
            <div key={i} className="w-12 h-16 bg-gradient-to-b from-gray-700 to-black rounded-t-lg border-x-2 border-t-2 border-gray-500 shadow-2xl flex flex-col justify-around p-1">
              <div className="h-1.5 bg-black/80 rounded-full" />
              <div className="h-1.5 bg-black/80 rounded-full" />
              <div className="h-1.5 bg-black/80 rounded-full" />
            </div>
          ))}
        </div>

        {/* メインボディ (ブラッシュドシルバー) */}
        <div className="absolute bottom-0 w-full h-[60px] bg-gradient-to-b from-gray-300 via-gray-100 to-gray-500 rounded-b-lg rounded-tl-[45px] border-b-4 border-gray-800 shadow-[0_10px_30px_rgba(0,0,0,0.6)] overflow-hidden">
          {/* 特徴的な黒いサイドストライプ */}
          <div className="absolute top-[28px] left-0 w-full h-3 bg-[#111] shadow-inner" />
          
          {/* ボディの反射光 */}
          <div className="absolute top-2 left-0 w-full h-3 bg-white/30 blur-sm" />
          
          {/* フロントバンパー & ライト */}
          <div className="absolute right-0 bottom-0 w-10 h-full bg-gray-900 border-l-2 border-gray-600 flex flex-col justify-center items-center gap-1 px-1">
             <div className="w-6 h-4 bg-orange-200 border border-orange-600 shadow-[0_0_15px_orange] rounded-sm" />
             <div className="w-6 h-2 bg-gray-800 border border-gray-700 rounded-sm" />
          </div>

          {/* ドアライン */}
          <div className="absolute left-[35%] top-0 w-1 h-full bg-black/20" />
          <div className="absolute left-[70%] top-0 w-1 h-full bg-black/20" />
        </div>

        {/* キャビン・ガルウィングドア窓 */}
        <div className="absolute top-2 right-20 w-[140px] h-[50px] bg-gradient-to-br from-gray-900 via-black to-gray-950 rounded-t-[50px] border-x-4 border-t-4 border-gray-700 overflow-hidden shadow-2xl">
          <div className="absolute top-2 right-8 w-24 h-10 bg-cyan-500/10 rounded-t-3xl border-t border-cyan-400/20" />
        </div>

        {/* 側面外部配線 */}
        <div className="absolute top-12 left-16 w-[200px] h-6 flex items-center gap-2 opacity-100 z-20">
           <div className="h-2 flex-[2] bg-blue-600 rounded-full border border-black/50 shadow-[0_0_8px_rgba(37,99,235,0.8)]" />
           <div className="h-2 flex-[1.5] bg-red-600 rounded-full border border-black/50" />
           <div className="h-2 flex-[2] bg-gray-400 rounded-full border border-black/50" />
        </div>

        {/* ホイール (シルバーハブ) */}
        {[14, 204].map((left, idx) => (
          <div 
            key={idx}
            className={`absolute -bottom-8 w-20 h-20 bg-gray-950 rounded-full border-4 border-gray-900 shadow-2xl flex items-center justify-center ${speed > 0 ? 'animate-spin' : ''}`}
            style={{ left: `${left}px`, animationDuration: `${Math.max(0.04, 0.6 - speed/120)}s` }}
          >
            <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-400 rounded-full border-2 border-gray-500 relative shadow-inner">
               <div className="w-2 h-full bg-gray-500/30 absolute left-1/2 -translate-x-1/2" />
               <div className="w-full h-2 bg-gray-500/30 absolute top-1/2 -translate-y-1/2" />
               <div className="w-6 h-6 bg-gray-300 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-gray-400" />
            </div>
          </div>
        ))}
      </div>
      
      {/* 成功時の炎のタイヤ痕 */}
      {isSuccess && (
        <div className="absolute bottom-0 right-full w-[2000px] h-12 pointer-events-none">
          <div className="h-10 bg-gradient-to-r from-orange-600 via-yellow-400 to-transparent fire-path blur-[4px] shadow-[0_0_60px_orange]" />
          <div className="h-10 mt-20 bg-gradient-to-r from-orange-600 via-yellow-400 to-transparent fire-path blur-[4px] shadow-[0_0_60px_orange]" />
        </div>
      )}
    </div>
  );
};

export default DeLorean;
