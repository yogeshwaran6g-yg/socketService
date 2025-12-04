import React, { useState } from "react";
import Dashboard from "../components/Dashboard";
import { useData } from "../context/DataProvider.jsx";

export default function SettingsDashboard() {
  const [fixedWinners, setFixedWinners] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [twoFactor, setTwoFactor] = useState(true);
  //   const { usr } = useData();

  const generalSettings = [
    {
      id: "ANDHAR BAHAR",
      name: "ANDHAR BAHAR",
      description: "Mark winners as fixed for ANDHAR BAHAR game",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
      ),
      defaultValue: fixedWinners,
      onClick: (newState) => handleToggleFixedWinner(newState)
    },
      {
      id: "TIGER DRAGON",
      name: "TIGER DRAGON",
      description: "Mark winners as fixed for tiger dragon game",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
      ),
      defaultValue: fixedWinners,
      onClick: (newState) => handleToggleFixedWinner(newState)
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Settings Dashboard
          </h1>
          <p className="text-gray-600">
            Reusable React component with flexible configuration
          </p>
        </div>

         <Dashboard
        //   settings={generalSettings}
        //   controlType="toggle"
        //   title=" Fixed Winners"
        /> 

        
      </div>
    </div>
  );
}
