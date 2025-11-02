import React, { useState } from 'react';
import MessageInbox from './MessageInbox';
import ShareLink from './ShareLink';

const UserDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('inbox');

  const tabs = [
    { id: 'inbox', name: '📥 Boîte de réception', component: <MessageInbox user={user} /> },
    { id: 'share', name: '🔗 Partager', component: <ShareLink user={user} /> },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="text-white/70 text-sm">Utilisateur</div>
          <div className="text-white text-2xl font-bold">@{user.username}</div>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="text-white/70 text-sm">Messages reçus</div>
          <div className="text-white text-2xl font-bold">-</div>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="text-white/70 text-sm">Statut</div>
          <div className="text-green-400 text-2xl font-bold">Actif</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
        {/* Navigation Tabs */}
        <div className="border-b border-white/20">
          <nav className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-0 px-6 py-4 text-center font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'text-white bg-white/20 border-b-2 border-white'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {tabs.find(tab => tab.id === activeTab)?.component}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;