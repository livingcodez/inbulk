'use client'

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

interface BuyerTabsProps {
  currentActiveTab: string; // The tab active according to the URL on server render
  // No need for currentRole prop, this component is specific to buyer
}

type BuyerTabName = 'explore' | 'mygroups';

export function BuyerTabs({ currentActiveTab }: BuyerTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentMode = searchParams.get('mode') || 'buyer'; // Should be 'buyer' here

  // This component focuses on reflecting and changing the 'tab' URL param
  // And persisting/reading from localStorage for the buyer's tabs

  useEffect(() => {
    // On mount, if URL has no specific tab, try to load from localStorage
    const tabFromUrl = searchParams.get('tab') as BuyerTabName | null;
    if (!tabFromUrl) {
      const storedTab = localStorage.getItem('buyerActiveTab') as BuyerTabName | null;
      if (storedTab && (storedTab === 'explore' || storedTab === 'mygroups')) {
        // Replace URL to include the stored tab
        router.replace(`/dashboard?mode=${currentMode}&tab=${storedTab}`, { scroll: false });
      }
    }
  }, [searchParams, currentMode, router]);

  const handleTabClick = (tabName: BuyerTabName) => {
    localStorage.setItem('buyerActiveTab', tabName);
    router.push(`/dashboard?mode=${currentMode}&tab=${tabName}`, { scroll: false });
    // The page will re-render due to URL change, and DashboardContent will receive new activeTab
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleTabClick('explore')}
        className={cn(
          'px-4 py-2 rounded-md font-medium',
          currentActiveTab === 'explore'
            ? 'bg-primary text-white dark:bg-primary-dark dark:text-neutral-900'
            : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600'
        )}
      >
        Explore Groups
      </button>
      <button
        onClick={() => handleTabClick('mygroups')}
        className={cn(
          'px-4 py-2 rounded-md font-medium',
          currentActiveTab === 'mygroups'
            ? 'bg-primary text-white dark:bg-primary-dark dark:text-neutral-900'
            : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600'
        )}
      >
        My Groups
      </button>
    </div>
  );
}
