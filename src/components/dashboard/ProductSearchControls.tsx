'use client'

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter as FilterIcon, X } from 'lucide-react';
import { getDistinctCategories } from '@/lib/supabase/products'; // Import the new function
import { cn } from '@/lib/utils'; // Assuming cn is in lib/utils

// useDebounce hook (as previously defined)
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

export function ProductSearchControls() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize searchTerm from URL's 'q' parameter or empty string
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [showCategoryFilters, setShowCategoryFilters] = useState(false);
  const [categoriesList, setCategoriesList] = useState<string[]>([]);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  const activeCategory = searchParams.get('category') || '';

  // Fetch categories on component mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        const fetchedCategories = await getDistinctCategories();
        setCategoriesList(fetchedCategories);
        setCategoriesError(null);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setCategoriesError("Could not load categories.");
        setCategoriesList([]);
      }
    }
    fetchCategories();
  }, []);

  // Effect to update URL when debouncedSearchTerm changes
  useEffect(() => {
    const currentParams = new URLSearchParams(Array.from(searchParams.entries()));
    const newQ = debouncedSearchTerm.trim();
    const currentQ = currentParams.get('q') || '';

    if (newQ === currentQ) {
      return; // No change in search query, no need to push
    }

    const finalParams = new URLSearchParams(currentParams); // Preserve all existing params
    if (newQ === '') {
      finalParams.delete('q');
    } else {
      finalParams.set('q', newQ);
    }

    router.push(`/dashboard?${finalParams.toString()}`, { scroll: false });

  }, [debouncedSearchTerm, searchParams, router]);

  // Effect to sync searchTerm input with URL's 'q' param
  useEffect(() => {
    setSearchTerm(searchParams.get('q') || '');
  }, [searchParams]);


  const handleFilterToggle = () => {
    setShowCategoryFilters(!showCategoryFilters);
  };

  const handleCategorySelect = (category: string | null) => {
    const finalParams = new URLSearchParams(Array.from(searchParams.entries())); // Preserve all existing params
    if (category) {
      finalParams.set('category', category);
    } else {
      finalParams.delete('category'); // Clear category filter
    }
    setShowCategoryFilters(false); // Hide filter options after selection

    router.push(`/dashboard?${finalParams.toString()}`, { scroll: false });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm dark:bg-neutral-800">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400 dark:text-neutral-500" />
          <input
          type="search"
          placeholder="Search products or groups..."
          className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-50 dark:focus:ring-primary-dark/20 dark:focus:border-primary-dark"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="relative"> {/* Wrapper for filter button and dropdown */}
        <button
          onClick={handleFilterToggle}
          className="w-full sm:w-auto flex items-center justify-center sm:justify-start gap-2 px-4 py-2 border border-neutral-200 rounded-md hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-700 transition-colors"
          aria-expanded={showCategoryFilters}
          aria-controls="category-filter-options"
        >
          <FilterIcon className="h-5 w-5" />
          Filters
          {activeCategory && (
              <span className="ml-1 text-xs bg-primary/10 text-primary dark:bg-primary-dark/20 dark:text-primary-light px-1.5 py-0.5 rounded-full">
                  1
              </span>
          )}
        </button>
        {showCategoryFilters && (
          <div
            id="category-filter-options"
            className="absolute right-0 sm:left-0 mt-2 w-full sm:w-64 origin-top-right rounded-md bg-white dark:bg-neutral-700 shadow-lg ring-1 ring-black dark:ring-neutral-600 ring-opacity-5 focus:outline-none z-10 p-2 space-y-1"
          >
            {categoriesError && <p className="text-xs text-red-500 dark:text-red-400 px-2">{categoriesError}</p>}
            {!categoriesError && categoriesList.length === 0 && !categoriesError && <p className="text-xs text-neutral-500 dark:text-neutral-400 px-2">No categories found.</p>}

            <button
              onClick={() => handleCategorySelect(null)}
              className={cn(
                  "w-full text-left px-3 py-1.5 text-sm rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-600",
                  !activeCategory ? "font-semibold text-primary dark:text-primary-light" : "text-neutral-700 dark:text-neutral-200"
              )}
            >
              All Categories
            </button>
            {categoriesList.map((category) => (
              <button
                key={category}
                onClick={() => handleCategorySelect(category)}
                className={cn(
                  "w-full text-left px-3 py-1.5 text-sm rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-600",
                  activeCategory === category ? "font-semibold text-primary dark:text-primary-light" : "text-neutral-700 dark:text-neutral-200"
                )}
              >
                {category}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
  );
}
