import React from 'react';
import WelcomeSection from '../components/homeComp/WelcomeSection';
import QuickLinks from '../components/homeComp/QuickLinks';
import RecentDetections from '../components/homeComp/RecentDetections';
import { useLocation } from 'react-router-dom';

/**
 * Home page component
 * @returns {JSX.Element}
 * @description Main landing page after successful login [(login -> otp ? register -> login -> otp) -> home]
 */

const Home = () => {
  const location = useLocation();
  console.log("Full location state:", location.state);
  const username = location.state?.username;
  console.log("Username from navigation state:", username);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8">
        {/* Welcome section */}
        <WelcomeSection username={username} />

        {/* Main content grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left column */}
          <div className="space-y-8">
            <QuickLinks />
          </div>

          {/* Right column */}
          <div className="space-y-8">
            <RecentDetections />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 