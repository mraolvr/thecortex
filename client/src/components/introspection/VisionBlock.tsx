import React from 'react';
import GlowingEffect from '../ui/GlowingEffect';

const VisionBlock: React.FC = () => {
  const visionStatement = "To live a life of servant-hearted leadership—where every interaction becomes an opportunity to uplift, every challenge a chance to create, and every solution a step toward someone else's breakthrough.\nI envision a life where my presence brings clarity, my creativity unlocks potential, and my problem-solving empowers others to cross their finish lines.\nSuccess, to me, is not what I build alone, but what others are able to build because I was there.";

  return (
    <div className="relative rounded-2xl border p-2 md:rounded-3xl md:p-3 mb-8">
      <GlowingEffect
        spread={40}
        glow={true}
        disabled={false}
        proximity={64}
        inactiveZone={0.01}
        gradient="linear-gradient(270deg, #a78bfa 0%, #6366f1 50%, #3b82f6 100%)"
      />
      <div className="relative flex flex-col justify-between gap-6 overflow-hidden rounded-xl p-6 md:p-6 bg-white/5 backdrop-blur-sm border border-white/20">
        <h2 className="text-3xl font-bold text-transparent text-center bg-clip-text bg-gradient-to-r from-cyan-400 to-green-900 mb-2">
          Vision Statement
        </h2>
        <h2 className="text-2xl md:text-2xl font-Metropolis text-gray-300 text-center leading-relaxed whitespace-pre-line">
          {visionStatement}
        </h2>
      </div>
    </div>
  );
};

export default VisionBlock; 