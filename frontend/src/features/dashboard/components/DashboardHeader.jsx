import React from 'react';
import { LayoutDashboard } from 'lucide-react';

const DashboardHeader = ({ userData, healthMetrics }) => {
  // Extract user's first name
  const firstName = userData?.displayName?.split(' ')[0] || userData?.name?.split(' ')[0] || 'there';

  // Get current time of day for greeting
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const greeting = getTimeBasedGreeting();
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="pb-2 border-b mb-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center">
            <LayoutDashboard className="mr-2 h-6 w-6 text-[#e72208]" /> 
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            {greeting}, <span className="font-medium">{firstName}</span>
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          <div className="flex items-center">
            <span>{today}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;