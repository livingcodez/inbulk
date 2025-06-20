export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { ShoppingBag, Search, Filter, Plus, Users, AlertCircle, LayoutGrid } from 'lucide-react' // Added LayoutGrid
import { Header } from '@/components/layout/Header'
import { RoleToggle } from '@/components/dashboard/RoleToggle'
import { ProductCard } from '@/components/products/ProductCard'
import { getUserProfile } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import Link from 'next/link'
import { Avatar } from '@/components/ui/Avatar'
import { BuyerTabs } from '@/components/dashboard/BuyerTabs'
import { VendorTabs } from '@/components/dashboard/VendorTabs'
import { getLiveProducts, getVendorProducts } from '@/lib/supabase/products'; // Added getVendorProducts
import { getGroupsByUser } from '@/lib/supabase/groups';
import { ProductSearchControls } from '@/components/dashboard/ProductSearchControls';
import { JoinedGroupCard, type JoinedGroupMembership } from '@/components/dashboard/JoinedGroupCard';
import { VendorActions } from '@/components/dashboard/VendorActions'; // New import

const DEFAULT_PRODUCT_IMAGE = 'https://via.placeholder.com/150/E0E0E0/909090?text=No+Image';

interface DashboardPageProps {
  searchParams?: { [key: string]: string | string[] | undefined };
}

// Assuming DashboardContent is modified to accept searchParams
async function DashboardContent({ searchParams }: DashboardPageProps) {
  let productsError: string | null = null; // For product fetching errors
  let productsToDisplay: any[] = [];      // Initialize with empty array
  let joinedGroupsData: any[] = []; // Variable for joined groups
  let joinedGroupsError: string | null = null; // Error state for joined groups
  let vendorProductsData: any[] = []; // New state for vendor products
  let vendorProductsError: string | null = null; // New error state for vendor products

	try {
		const profile = await getUserProfile()

		if (!profile) {
			redirect('/login')
		}

		const currentRole = searchParams?.mode === 'vendor' ? 'vendor' : 'buyer'; // Default to 'buyer'

		let activeTab: string;

		if (currentRole === 'buyer') {
			const requestedTab = searchParams?.tab;
			if (requestedTab === 'mygroups') {
				activeTab = 'mygroups';
			} else {
				activeTab = 'explore'; // Default for buyer
			}
		} else { // currentRole === 'vendor'
			const requestedTab = searchParams?.tab;
			if (requestedTab === 'orders') {
				activeTab = 'orders';
			} else {
				activeTab = 'mylistings'; // Default for vendor
			}
		}

		// productsToDisplay is already declared at the top of the function scope

		const searchQuery = searchParams?.q;
		const categoryName = searchParams?.category;

		// productsToDisplay is already declared at the top of the function scope

		if (currentRole === 'buyer' && activeTab === 'explore') {
			try {
					// Pass search and category params to getLiveProducts
					const fetchedProducts = await getLiveProducts({ searchQuery, category: categoryName });
					if (fetchedProducts) { // Ensure fetchedProducts is not null/undefined
						productsToDisplay = fetchedProducts;
					}
					// console.log('Fetched products:', productsToDisplay); // For debugging
			} catch (fetchError: any) { // Catch specific error
					console.error("Error fetching live products:", fetchError);
					productsError = "We couldn't load products at this time. Please try refreshing the page or check back later.";
					// productsToDisplay will remain empty
			}
		}

		// Fetch joined groups for 'mygroups' tab
		if (currentRole === 'buyer' && activeTab === 'mygroups') {
			if (profile.id) { // Ensure profile.id is available
				try {
					const fetchedJoinedGroups = await getGroupsByUser(profile.id);
					if (fetchedJoinedGroups) {
						joinedGroupsData = fetchedJoinedGroups;
					}
					// console.log('Fetched joined groups:', joinedGroupsData); // For debugging
				} catch (fetchError: any) {
					console.error("Error fetching joined groups:", fetchError);
					joinedGroupsError = "Could not load your groups at this time. Please try again later.";
					// joinedGroupsData will remain empty
				}
			} else {
				// This case should ideally not be reached if profile is required for the page
				console.warn("User profile ID not available for fetching groups.");
				joinedGroupsError = "User information not found, cannot fetch groups.";
			}
		}

		// Fetch vendor's own products for 'mylistings' tab
		if (currentRole === 'vendor' && activeTab === 'mylistings') {
			if (profile.id) { // Ensure profile.id is available
				try {
					const fetchedVendorProducts = await getVendorProducts(profile.id);
					if (fetchedVendorProducts) {
						vendorProductsData = fetchedVendorProducts;
					}
					// console.log('Fetched vendor products:', vendorProductsData); // For debugging
				} catch (fetchError: any) {
					console.error("Error fetching vendor products:", fetchError);
					vendorProductsError = "Could not load your products. Please try refreshing.";
					// vendorProductsData will remain empty
				}
			} else {
				console.warn("User profile ID not available for fetching vendor products.");
				vendorProductsError = "User information not found, cannot fetch your products.";
			}
		}

		return (
			<div className="flex-1">
				<div className="container mx-auto px-4 py-8">
					{/* Dashboard Header Card - Description will be updated in next step */}
					<section className="bg-white p-6 rounded-lg shadow-sm mb-8 dark:bg-neutral-800">
						<h1 className="text-3xl font-bold text-primary mb-2 font-display dark:text-primary-dark">
							Dashboard
						</h1>
						<p className="text-neutral-600 mb-4 dark:text-neutral-300">
							{/* This description will be made dynamic in the next plan step */}
							Manage your activities as a {currentRole}.
						</p>
						<RoleToggle /> {/* RoleToggle reads from URL/localStorage itself */}
					</section>

					{/* Dashboard Content - Dynamically switched */}
					<section className="space-y-6">
						{currentRole === 'buyer' && (
							<>
								<BuyerTabs currentActiveTab={activeTab} /> {/* Use the new client component */}

								{activeTab === 'explore' && (
									<>
										{/* Replace old search/filter bar with the new component */}
										<div className="mt-6"> {/* Added mt-6 to the controls wrapper */}
											<ProductSearchControls />
										</div>

										{productsError ? (
											<div className="mt-6 bg-white p-6 rounded-lg shadow-sm dark:bg-neutral-800 text-center">
												<p className="text-red-500 dark:text-red-400">{productsError}</p>
											</div>
										) : productsToDisplay.length === 0 ? ( // Check for empty products array when no error
											<div className="mt-6 bg-white p-6 rounded-lg shadow-sm dark:bg-neutral-800 text-center">
												<ShoppingBag className="mx-auto h-12 w-12 text-neutral-400 dark:text-neutral-500" />
												<h3 className="mt-2 text-lg font-medium text-neutral-900 dark:text-neutral-100">No products found</h3>
												<p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
													There are currently no live products available. Please check back later or suggest a new one!
												</p>
											</div>
										) : (
											// Product Grid - rendered if no error and products exist
											<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
												{productsToDisplay.map((product: any) => (
													<ProductCard
														key={product.id}
														id={product.id}
														title={product.title} // Changed from product.name
														description={product.description || ''}
														price={product.price}
														category={product.category}
														image={product.image_url || DEFAULT_PRODUCT_IMAGE} // DEFAULT_PRODUCT_IMAGE is defined above
														isUnique={product.is_fungible ?? false}
													/>
												))}
											</div>
										)}

										{!productsError && (
												<div className="text-center mt-8">
													<button className="inline-flex items-center gap-2 px-6 py-3 bg-accent-orange text-white rounded-md font-medium hover:bg-accent-orange/90 transition-colors">
														<Plus className="h-5 w-5" />
														Suggest Product
													</button>
												</div>
										)}
									</>
								)}

								{activeTab === 'mygroups' && (
									<div className="mt-6"> {/* Container for My Groups content */}
										{/* Error and Empty state handling will be fully fleshed out in the next step (Plan Step 4) */}
										{/* For now, let's focus on displaying the cards if data exists and no error */}

										{!joinedGroupsError && joinedGroupsData.length > 0 && (
											<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
												{joinedGroupsData.map((membership) => (
													<JoinedGroupCard
														key={membership.group_id} // Assuming group_id is unique for the membership entry
														membership={membership as JoinedGroupMembership} // Cast to the expected type
													/>
												))}
											</div>
										)}

										{/* Placeholder for error display (refined in next step) */}
										{joinedGroupsError ? (
											<div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm text-center">
												<AlertCircle className="mx-auto h-12 w-12 text-red-400" />
												<h3 className="mt-2 text-lg font-medium text-neutral-900 dark:text-neutral-100">Error Loading Groups</h3>
												<p className="mt-1 text-sm text-red-600 dark:text-red-400">
													{joinedGroupsError}
												</p>
												{/* Optional: Add a retry button here in a future iteration */}
											</div>
										) : joinedGroupsData.length === 0 ? (
											<div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm text-center">
												<Users className="mx-auto h-12 w-12 text-neutral-400 dark:text-neutral-500" />
												<h3 className="mt-2 text-lg font-medium text-neutral-900 dark:text-neutral-100">No Groups Joined Yet</h3>
												<p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
													You haven't joined any groups. Why not explore some and join the fun?
												</p>
												{/* Optional: A button/link to navigate to 'explore' tab could be nice here */}
											</div>
										) : null} {/* End of new error/empty states, grid is already in the success case */}
									</div>
								)}
							</>
						)}

						{currentRole === 'vendor' && (
							<div className="bg-white p-6 rounded-lg shadow-sm dark:bg-neutral-800">
								<h2 className="text-2xl font-semibold mb-4 text-neutral-800 dark:text-neutral-100">Vendor Mode</h2>
								<VendorTabs currentActiveTab={activeTab} />

								{activeTab === 'mylistings' && (
									<div className="mt-6"> {/* Container for My Listings content */}
										{/* Error and Empty state handling will be fully fleshed out in the next step (Plan Step 3) */}
										{/* For now, let's focus on displaying the cards if data exists and no error */}

										{!vendorProductsError && vendorProductsData.length > 0 && (
											<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"> {/* Using up to 4 cols like explore */}
												{vendorProductsData.map((product: any) => ( // Use 'any' for now, ideally a Product type
													<ProductCard
														key={product.id}
														id={product.id}
														title={product.title} // Changed from product.name
														description={product.description || ''}
														price={product.price}
														category={product.category}
														image={product.image_url || DEFAULT_PRODUCT_IMAGE}
														isUnique={product.is_fungible ?? false}
														// TODO: ProductCard could be enhanced for vendors with status pills, edit buttons, etc.
														// For now, it will display like a regular product card.
													/>
												))}
											</div>
										)}

										{/* Placeholder for error display (refined in next step) */}
										{vendorProductsError ? (
											<div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm text-center">
												<AlertCircle className="mx-auto h-12 w-12 text-red-400" />
												<h3 className="mt-2 text-lg font-medium text-neutral-900 dark:text-neutral-100">Error Loading Your Products</h3>
												<p className="mt-1 text-sm text-red-600 dark:text-red-400">
													{vendorProductsError}
												</p>
											</div>
										) : vendorProductsData.length === 0 ? (
											<div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm text-center">
												<LayoutGrid className="mx-auto h-12 w-12 text-neutral-400 dark:text-neutral-500" />
												<h3 className="mt-2 text-lg font-medium text-neutral-900 dark:text-neutral-100">No Products Listed Yet</h3>
												<p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
													You haven't listed any products. Click the '+' button to add your first one!
												</p>
											</div>
										) : null } {/* End of new error/empty states, grid is already in the success case */}
									</div>
								)}

								{activeTab === 'orders' && (
									<div className="mt-6">
										<h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100">Received Orders</h3>
										<p className="text-neutral-600 dark:text-neutral-300 mt-2">
											This is where orders for your products will be shown. Functionality coming soon!
										</p>
									</div>
								)}
							</div>
						)}
					</section>
				</div> {/* End of container */}

				{/* Conditionally render VendorActions (FAB and Modal logic) */}
				{profile && currentRole === 'vendor' && (
					<VendorActions currentUserId={profile.id} />
				)}

				{/* Footer - Ensure it's visually below the FAB or FAB avoids it */}
				<footer className="mt-auto py-6 text-center border-t bg-white dark:bg-neutral-800 dark:border-neutral-700">
						<p className="text-sm text-neutral-600 dark:text-neutral-300">
								&copy; 2025 CrowdCart Lite. All rights reserved.
						</p>
				</footer>
			</div> // End of main flex-1 div
		)
	} catch (error) { // Top-level error (profile fetching, etc.)
		console.error('Dashboard error:', error)
		return (
			<div className="p-4 text-center">
				<p className="text-red-500">
					Something went wrong. Please try again later.
				</p>
			</div>
		)
	}
}

// Modify DashboardPage to pass searchParams to DashboardContent
export default async function DashboardPage({ searchParams }: DashboardPageProps) {
	return (
		<div className="min-h-screen bg-[#F0F4F7] flex flex-col dark:bg-neutral-900">
			<Header /> {/* Header might need dark mode styles too */}
			<ErrorBoundary>
				<Suspense
					fallback={
						<div className="flex items-center justify-center min-h-[50vh]">
							<LoadingSpinner />
						</div>
					}
				>
					<DashboardContent searchParams={searchParams} />
				</Suspense>
			</ErrorBoundary>
		</div>
	)
}
