import React from 'react';
import WelcomeSection from '../components/dashboard/WelcomeSection';
import QuickLinks from '../components/dashboard/QuickLinks';
import RecentDetections from '../components/dashboard/RecentDetections';

const Home = ({ user }) => {
  return (
    <div className="max-w-6xl mx-auto">
      <WelcomeSection username={user.username} />
      <QuickLinks />
      <RecentDetections />
    </div>
  );
};

export default Home; 