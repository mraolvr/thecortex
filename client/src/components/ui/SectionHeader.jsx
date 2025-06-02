import React from 'react';
import Card from './Card';

const SectionHeader = ({ title, subtitle, children, center = false, icon: Icon, divider = false }) => {
  return (
    <div className="mb-10">
      <Card>
        <div className={`flex ${center ? 'flex-col items-center text-center' : 'items-center justify-between'}`}>
          <div className={center ? 'flex flex-col items-center' : ''}>
            <div className="flex items-center gap-3">
              {Icon && <Icon className="w-8 h-8 text-white" />}
              <h1 className="text-4xl font-bold text-white">
                {title}
              </h1>
            </div>
            {subtitle && <p className="mt-2 text-lg max-w-2xl text-neutral-200">{subtitle}</p>}
          </div>
          {!center && children}
        </div>
        {center && children && <div className="mt-10 flex justify-center">{children}</div>}
        {divider && <div className="h-px bg-neutral-800 my-2 w-full" />}
      </Card>
    </div>
  );
};

export default SectionHeader; 