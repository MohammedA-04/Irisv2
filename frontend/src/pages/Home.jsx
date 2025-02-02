import React from 'react';
import WelcomeSection from '../components/homeComp/WelcomeSection';
import QuickLinks from '../components/homeComp/QuickLinks';
import RecentDetections from '../components/homeComp/RecentDetections';
import StatsSection from '../components/homeComp/StatsSection';
import SolutionsStats from '../components/homeComp/SolutionStats';
import { useLocation } from 'react-router-dom';

/**
 * Home page component
 * @returns {JSX.Element}
 * @description Main landing page after successful login [(login -> otp ? register -> login -> otp) -> home]
 */

const Home = () => {
  const location = useLocation();
  const username = location.state?.username;
  
  return (
    <div className="w-full space-y-4">
      {/* Welcome section in container */}
      <div className="container mx-auto px-4">
        <WelcomeSection username={username} />
      </div>

      <QuickLinks />

      <RecentDetections />

      {/* Full-width Stats Section */}
      <StatsSection />

      {/* Full-width Solutions Stats Section */}
      <SolutionsStats />
    </div>
  );
};

export default Home;