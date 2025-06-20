// src/components/products/GroupTabs.tsx
'use client';

import { useState } from 'react';
import { GroupData } from '@/lib/supabase/groups';
import { GroupCard } from './GroupCard'; // Adjust path as needed
import { Clock, Users } from 'lucide-react'; // Icons for tabs

interface GroupTabsProps {
  timedGroups: GroupData[];
  untimedGroups: GroupData[];
  currentUserId?: string; // Pass this to GroupCard
  productName?: string;
   // Add onJoinGroup, onApproveVote, onDisapproveVote later for interactions
}

export function GroupTabs({ timedGroups, untimedGroups, currentUserId, productName }: GroupTabsProps) {
  const [activeTab, setActiveTab] = useState<'timed' | 'untimed'>('timed');

  const handleTabChange = (tab: 'timed' | 'untimed') => {
    setActiveTab(tab);
  };

  // Filter out groups that are not 'open' or 'waiting_votes' unless they are in the process of voting
  // This is to avoid showing closed/completed groups in the "join" section.
  // Groups in 'waiting_votes' are kept because their cards show voting UI.
  const filterActiveGroups = (groups: GroupData[]) => {
    return groups.filter(group => group.status === 'open' || group.status === 'waiting_votes');
  };

  const activeTimedGroups = filterActiveGroups(timedGroups);
  const activeUntimedGroups = filterActiveGroups(untimedGroups);

  const groupsToShow = activeTab === 'timed' ? activeTimedGroups : activeUntimedGroups;

  return (
    <section className="group-interaction-section mt-10 font-sans">
      {/* Section Title & Description: Adjusted font sizes, colors, and spacing */}
      <h2 className="text-2xl md:text-3xl font-bold text-primary font-display mb-3 text-center">
        Join a Group for {productName || 'this product'}
      </h2>
      <p className="text-slate-600 mb-8 text-center max-w-lg mx-auto">
        This product uses auto-grouping. Find an open group that matches your preference or check back soon for new openings!
      </p>

      {/* Tab Triggers: Enhanced active/inactive states, padding, and overall look */}
      <div className="tabs-container mb-8">
        <div className="tab-triggers flex justify-center border-b-2 border-slate-200">
          <button
            onClick={() => handleTabChange('timed')}
            className={`tab-trigger py-3 px-6 -mb-0.5 text-sm font-semibold flex items-center transition-colors duration-150 ease-in-out
              ${activeTab === 'timed'
                ? 'border-b-2 border-primary text-primary'
                : 'text-slate-500 hover:text-slate-700 hover:border-slate-300 border-b-2 border-transparent'}`}
          >
            <Clock className="w-5 h-5 mr-2.5" /> Timed Groups (Flash Deal)
          </button>
          <button
            onClick={() => handleTabChange('untimed')}
            className={`tab-trigger py-3 px-6 -mb-0.5 text-sm font-semibold flex items-center transition-colors duration-150 ease-in-out
              ${activeTab === 'untimed'
                ? 'border-b-2 border-primary text-primary'
                : 'text-slate-500 hover:text-slate-700 hover:border-slate-300 border-b-2 border-transparent'}`}
          >
            <Users className="w-5 h-5 mr-2.5" /> Untimed Groups (No Rush)
          </button>
        </div>
      </div>

      {/* Tab Content Area: Grid gap adjustment */}
      <div className="tab-content min-h-[200px]"> {/* Added min-height to prevent collapse when empty */}
        {groupsToShow.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-8">
            {groupsToShow.map(group => (
              <GroupCard
                key={group.id}
                group={group}
                currentUserId={currentUserId}
                // Pass action handlers here later: onJoinGroup, onApproveVote, onDisapproveVote
              />
            ))}
          </div>
        ) : (
          // Empty State Message: Enhanced styling
          <div className="text-center py-12 bg-white rounded-xl shadow-lg">
            <Users className="w-16 h-16 mx-auto text-slate-400 mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-1">No active {activeTab} groups available</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              Currently, there are no {activeTab === 'timed' ? 'timed (flash deal)' : 'untimed (no rush)'} groups open for joining or voting for this product. Please check back later or explore other amazing products!
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
