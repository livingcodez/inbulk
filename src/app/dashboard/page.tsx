import { Suspense } from 'react'
import { ShoppingBag, Search, Filter, Plus } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { RoleToggle } from '@/components/dashboard/RoleToggle'
import { ProductCard } from '@/components/products/ProductCard'
import { getUserProfile } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import Link from 'next/link'
import { Avatar } from '@/components/ui/Avatar'

async function DashboardContent() {
	try {
		const profile = await getUserProfile()

		if (!profile) {
			redirect('/login')
		}

		const products = [
			{
				id: '1',
				title: 'Pro Graphics Tablet',
				description:
					'A high-quality graphics tablet for digital artists and designers. Features a large active area, battery-free stylus, and customizable express keys.',
				price: 350.0,
				category: 'Electronics',
				image: '/placeholder-product.png',
			},
			{
				id: '2',
				title: 'Ergonomic Office Chair',
				description:
					'Premium ergonomic chair with lumbar support, adjustable armrests, and breathable mesh back for maximum comfort during long work hours.',
				price: 220.0,
				category: 'Furniture',
				image: '/placeholder-product.png',
			},
			{
				id: '3',
				title: 'Limited Edition Art Print "Cosmic Dream"',
				description:
					'A unique, signed art print by a renowned digital artist. Only 50 prints available worldwide. This is print #23/50.',
				price: 150.0,
				category: 'Art',
				image: '/placeholder-product.png',
				isUnique: true,
			},
			{
				id: '4',
				title: 'Vintage Mechanical Keyboard',
				description:
					'A rare find! This unique vintage mechanical keyboard from the 90s is fully restored and functional. A collector\'s item.',
				price: 280.0,
				category: 'Collectibles',
				image: '/placeholder-product.png',
				isUnique: true,
			},
		]

		return (
			<div className="flex-1">
				<div className="container mx-auto px-4 py-8">
					{/* Dashboard Header Card */}
					<section className="bg-white p-6 rounded-lg shadow-sm mb-8">
						<h1 className="text-3xl font-bold text-primary mb-2 font-display">
							Dashboard
						</h1>
						<p className="text-neutral-600 mb-4">
							Manage your activities as a buyer.
						</p>
						<RoleToggle />
					</section>

					{/* Dashboard Content */}
					<section className="space-y-6">
						{/* Tabs */}
						<div className="flex gap-2">
							<button className="px-4 py-2 bg-primary text-white rounded-md font-medium">
								Explore Groups
							</button>
							<button className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-md font-medium hover:bg-neutral-200">
								My Groups
							</button>
						</div>

						{/* Search and Filters */}
						<div className="bg-white p-4 rounded-lg shadow-sm flex gap-4">
							<div className="relative flex-1">
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
								<input
									type="search"
									placeholder="Search products or groups..."
									className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
								/>
							</div>
							<button className="flex items-center gap-2 px-4 py-2 border border-neutral-200 rounded-md hover:bg-neutral-50">
								<Filter className="h-5 w-5" />
								Filters
							</button>
						</div>

						{/* Product Grid */}
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
							{products.map((product) => (
								<ProductCard key={product.id} {...product} />
							))}
						</div>

						{/* Suggest Product */}
						<div className="text-center mt-8">
							<button className="inline-flex items-center gap-2 px-6 py-3 bg-accent-orange text-white rounded-md font-medium hover:bg-accent-orange/90 transition-colors">
								<Plus className="h-5 w-5" />
								Suggest Product
							</button>
						</div>
					</section>
				</div>

				{/* Footer */}
				<footer className="mt-auto py-6 text-center border-t bg-white">
					<p className="text-sm text-neutral-600">
						&copy; 2025 CrowdCart Lite. All rights reserved.
					</p>
				</footer>
			</div>
		)
	} catch (error) {
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

export default async function DashboardPage() {
	return (
		<div className="min-h-screen bg-[#F0F4F7] flex flex-col">
			<Header />
			<ErrorBoundary>
				<Suspense
					fallback={
						<div className="flex items-center justify-center min-h-[50vh]">
							<LoadingSpinner />
						</div>
					}
				>
					<DashboardContent />
				</Suspense>
			</ErrorBoundary>
		</div>
	)
}
