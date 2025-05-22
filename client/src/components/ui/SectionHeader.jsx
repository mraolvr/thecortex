import React from 'react';
import GlowingEffect from './GlowingEffect';

const SectionHeader = ({ title, subtitle, children, center = false, icon: Icon, divider = false }) => {
  return (
    <GlowingEffect className="bg-neutral-950 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-surface-light/20">
      <div
        className={`flex ${center ? 'flex-col items-center text-center' : 'items-center justify-between'} mb-10`}
      >
        <div className={center ? 'flex flex-col items-center' : ''}>
          <div className="flex items-center gap-3">
            {Icon && <Icon className="w-8 h-8 text-primary drop-shadow" />}
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary-light to-primary bg-clip-text text-transparent"
                style={{
                  color: '#fff',
                  textShadow: '0 2px 16px rgba(80, 60, 180, 0.25), 0 1px 2px rgba(0,0,0,0.18)'
                }}
            >
              {title}
            </h1>
          </div>
          {subtitle && <p className="mt-2 text-lg max-w-2xl" style={{ color: '#f3f4f6', textShadow: '0 1px 8px rgba(80, 60, 180, 0.18)' }}>{subtitle}</p>}
        </div>
        {!center && children}
      </div>
      {center && children && <div className="mt-10 flex justify-center">{children}</div>}
      {divider && <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent my-2 w-full" />}
    </GlowingEffect>
  );
};

export default SectionHeader; 