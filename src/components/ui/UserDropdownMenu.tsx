'use client'

import { useState, useEffect, useRef, ReactNode } from 'react';
import { cn } from '@/lib/utils'; // Assuming cn utility is available

export interface DropdownMenuItem {
  label: string;
  onClick: () => void;
  isDanger?: boolean; // For styling items like "Sign out"
}

interface UserDropdownMenuProps {
  trigger: ReactNode; // The element that triggers the dropdown (e.g., Avatar)
  items: DropdownMenuItem[];
  menuWidthClass?: string; // e.g., 'w-48'
}

export function UserDropdownMenu({ trigger, items, menuWidthClass = 'w-48' }: UserDropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div onClick={toggleDropdown} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={cn(
            'absolute right-0 z-20 mt-2 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-neutral-800 dark:ring-neutral-700',
            menuWidthClass
          )}
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="menu-button" // Assuming trigger has an id 'menu-button' or similar
        >
          <div className="py-1" role="none">
            {items.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  item.onClick();
                  setIsOpen(false); // Close menu on item click
                }}
                className={cn(
                  'block w-full px-4 py-2 text-sm text-left',
                  item.isDanger
                    ? 'text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-700/20'
                    : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-700',
                  'disabled:opacity-50'
                )}
                role="menuitem"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
