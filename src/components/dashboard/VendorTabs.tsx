'use client'

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

interface VendorTabsProps {
  currentActiveTab: string; // The tab active according to the URL on server render
}

type VendorTabName = 'mylistings' | 'orders';

export function VendorTabs({ currentActiveTab }: VendorTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentMode = searchParams.get('mode') || 'vendor'; // Should be 'vendor' here

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab') as VendorTabName | null;
    if (!tabFromUrl) {
      const storedTab = localStorage.getItem('vendorActiveTab') as VendorTabName | null;
      if (storedTab && (storedTab === 'mylistings' || storedTab === 'orders')) {
        router.replace(`/dashboard?mode=${currentMode}&tab=${storedTab}`, { scroll: false });
      }
    }
  }, [searchParams, currentMode, router]);

  const handleTabClick = (tabName: VendorTabName) => {
    localStorage.setItem('vendorActiveTab', tabName);
    router.push(`/dashboard?mode=${currentMode}&tab=${tabName}`, { scroll: false });
  };

  return (
    <div className="flex gap-2 mt-4"> {/* Added mt-4 for spacing below the title and above content */}
      <button
        onClick={() => handleTabClick('mylistings')}
        className={cn(
          'px-4 py-2 rounded-md font-medium',
          currentActiveTab === 'mylistings'
            ? 'bg-primary text-white dark:bg-primary-dark dark:text-neutral-900'
            : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600'
        )}
      >
        My Listings
      </button>
      <button
        onClick={() => handleTabClick('orders')}
        className={cn(
          'px-4 py-2 rounded-md font-medium',
          currentActiveTab === 'orders'
            ? 'bg-primary text-white dark:bg-primary-dark dark:text-neutral-900'
            : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600'
        )}
      >
        Orders
      </button>
    </div>
  );
}
