/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { TopNav } from './components/layout/TopNav';
import { useProfile } from './hooks/useProfile';
import { useAuth } from './contexts/AuthContext';
import { LoginScreen } from './components/auth/LoginScreen';
import { BackgroundUniverse } from './components/shared/BackgroundUniverse';

// Import newly created sub-pages
import { Dashboard } from './pages/Dashboard';
import { Onboarding } from './pages/Onboarding';
import { Advisor } from './pages/Advisor';
import { Simulator } from './pages/Simulator';
import { Scenarios } from './pages/Scenarios';
import { SideHustle } from './pages/SideHustle';
import { Settings } from './pages/Settings';
import { Ledger } from './pages/Ledger';

export default function App() {
  const { user, loading } = useAuth();
  const {
    profile,
    allocation,
    sideHustles,
    checkins,
    transactions,
    updateProfile,
    updateAllocation,
    updateSideHustles,
    addCheckin,
    addTransaction,
    deleteTransaction,
    resetAllData,
  } = useProfile(user?.uid);

  // If onboarding hasn't been completed, force-route their active tab to onboarding page
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  useEffect(() => {
    if (profile && !profile.onboarding_completed) {
      setActiveTab('onboarding');
    } else {
      setActiveTab('dashboard');
    }
  }, [profile?.onboarding_completed]);

  // Loading screen overlay
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center font-sans text-xs">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-500/25 border-t-emerald-500 animate-spin mb-4" />
        <span className="text-zinc-500 font-mono tracking-wider">Hệ thống bảo vệ đang khởi tạo...</span>
      </div>
    );
  }

  // Intercept with authentication gateway if not logged in
  if (!user) {
    return <LoginScreen />;
  }

  // Route layout renderer
  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            profile={profile}
            allocation={allocation}
            checkins={checkins}
            addCheckin={addCheckin}
            setActiveTab={setActiveTab}
            transactions={transactions}
          />
        );
      case 'onboarding':
        return (
          <Onboarding
            profile={profile}
            updateProfile={updateProfile}
            setActiveTab={setActiveTab}
          />
        );
      case 'advisor':
        return (
          <Advisor
            profile={profile}
            allocation={allocation}
            updateAllocation={updateAllocation}
          />
        );
      case 'ledger':
        return (
          <Ledger
            profile={profile}
            transactions={transactions}
            addTransaction={addTransaction}
            deleteTransaction={deleteTransaction}
            addCheckin={addCheckin}
            setActiveTab={setActiveTab}
          />
        );
      case 'simulator':
        return <Simulator />;
      case 'scenarios':
        return <Scenarios profile={profile} />;
      case 'side-hustle':
        return (
          <SideHustle
            profile={profile}
            sideHustles={sideHustles}
            updateSideHustles={updateSideHustles}
          />
        );
      case 'settings':
        return (
          <Settings
            profile={profile}
            updateProfile={updateProfile}
            resetAllData={resetAllData}
          />
        );
      default:
        return (
          <Dashboard
            profile={profile}
            allocation={allocation}
            checkins={checkins}
            addCheckin={addCheckin}
            setActiveTab={setActiveTab}
            transactions={transactions}
          />
        );
    }
  };

  return (
    <div className="flex bg-zinc-950 text-zinc-300 min-h-screen font-sans relative overflow-hidden">
      {/* 0. IMMERSIVE FINTECH COSMOS BACKGROUND */}
      <BackgroundUniverse />

      {/* 1. Left Sidebar - Fixed & Desktop only */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onboardingCompleted={profile ? profile.onboarding_completed : false}
      />

      {/* Spacer to replicate fixed Sidebar columns flow */}
      <div className="w-68 shrink-0 hidden md:block pointer-events-none" />

      {/* 2. Main Content Frame Area */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        
        {/* Top Navbar */}
        {profile && (
          <TopNav
            profile={profile}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        )}

        {/* Dynamic Inner views */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto px-6 py-8 md:px-10">
          <div className="max-w-6xl mx-auto">
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
}
