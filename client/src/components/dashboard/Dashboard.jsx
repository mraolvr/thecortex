import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import TodayAgenda from './TodayAgenda';
import NotificationHub from './NotificationHub';
import WelcomeBanner from './WelcomeBanner';

const Dashboard = () => {
  const { theme, accentColor } = useTheme();

  return (
    <div className="p-6 space-y-6">
      <WelcomeBanner />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TodayAgenda />
        <NotificationHub />
      </div>
    </div>
  );
};

export default Dashboard; 