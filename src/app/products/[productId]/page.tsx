import Link from 'next/link';
import Image from 'next/image';
import { getProductById } from '@/lib/supabase/products';
import { getGroupsAwaitingVotes, getTimedGroupsByProduct, getUntimedGroupsByProduct, GroupData } from '@/lib/supabase/groups';
import { GroupTabs } from '@/components/products/GroupTabs'; // New import!
import { getUserProfile } from '@/lib/supabase/server'; // To get currentUserId

// Define a basic type for Product for now - consider moving to a types file later
interface Product {
  id: string;
  title: string; // Changed from name
  description: string | null;
  price: number;
  image_url: string | null;
  category: string;
  user_profiles?: { full_name: string | null } | null; // Vendor info
  max_participants: number | null; // Changed from max_buyers
}

// Interface for groups awaiting votes
interface GroupAwaitingVote {
  id: string;
  name?: string | null;
  vote_deadline: string | null; // Or Date
}

// This is a server component, so we can make it async
export default async function ProductDetailsPage({ params }: { params: { productId: string } }) {
  const { productId } = params;
  let product: Product | null = null;
  let errorLoadingProduct: string | null = null;

  let groupsAwaitingVotes: GroupAwaitingVote[] = [];
  let errorLoadingGroupsAwaitingVotes: string | null = null;

  let timedGroups: GroupData[] = [];
  let untimedGroups: GroupData[] = [];
  let errorLoadingTimedGroups: string | null = null;
  let errorLoadingUntimedGroups: string | null = null;
  let currentUserId: string | undefined = undefined;

  try {
    const profile = await getUserProfile(); // Fetch user profile
    currentUserId = profile?.id;
  } catch (e) {
    console.error("Error fetching user profile on product page:", e);
    // Not critical for page load, currentUserId will remain undefined
  }

  try {
    product = await getProductById(productId);
  } catch (error) {
    console.error("Error fetching product:", error);
    errorLoadingProduct = `Could not load product details. ${error instanceof Error ? error.message : 'Unknown error'}`;
  }

  if (product) {
    // Fetch groups awaiting votes
    try {
      const fetchedGroups = await getGroupsAwaitingVotes(productId);
      if (fetchedGroups) {
        groupsAwaitingVotes = fetchedGroups.map(g => ({
          id: g.id,
          name: g.name || `Group ${g.id.substring(0,6)}...`,
          vote_deadline: g.vote_deadline
        }));
      }
    } catch (error) {
      console.error("Error fetching groups awaiting votes:", error);
      errorLoadingGroupsAwaitingVotes = `Could not load group vote information. ${error instanceof Error ? error.message : ''}`;
    }

    // Fetch timed groups
    try {
      timedGroups = await getTimedGroupsByProduct(productId);
    } catch (error) {
      console.error("Error fetching timed groups:", error);
      errorLoadingTimedGroups = `Could not load timed groups. ${error instanceof Error ? error.message : ''}`;
    }

    // Fetch untimed groups
    try {
      untimedGroups = await getUntimedGroupsByProduct(productId);
    } catch (error) {
      console.error("Error fetching untimed groups:", error);
      errorLoadingUntimedGroups = `Could not load untimed groups. ${error instanceof Error ? error.message : ''}`;
    }
  }

  // Page level loading/error for product itself
  if (!product && errorLoadingProduct) { // Critical error: product could not be loaded at all
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-primary mb-4">Error</h1>
        <p className="text-red-500">{errorLoadingProduct}</p>
        <Link href="/" className="mt-4 inline-block bg-primary text-white px-6 py-2 rounded hover:bg-primary/90">Go Home</Link>
      </div>
    );
  }

  if (!product) { // Still loading product
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Loading product details...</p> {/* Replace with a proper spinner/skeleton */}
      </div>
    );
  }

  const calculateTimeLeft = (deadline: string | null): string => {
    if (!deadline) return 'N/A';
    const diff = new Date(deadline).getTime() - new Date().getTime();
    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / 1000 / 60) % 60);

    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h ${minutes}m left`;
    if (minutes > 0) return `${minutes}m left`;
    return 'Less than a minute left';
  };

  return (
    <>
      {/* Header: Adjusted padding, font-display for logo, text colors */}
      <header className="bg-white shadow-md sticky top-0 z-50 font-sans">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="text-3xl font-bold text-primary hover:text-primary-dark font-display">CrowdCart</Link>
          <nav>
            <ul className="flex items-center space-x-5">
              <li><Link href="/dashboard" className="text-sm font-medium text-slate-700 hover:text-primary">Dashboard</Link></li>
              <li><Link href="/inbox" className="text-sm font-medium text-slate-700 hover:text-primary">Inbox</Link></li>
              <li className="flex items-center ml-4">
                <span className="text-sm font-semibold text-primary mr-3">$115.25</span> {/* Placeholder */}
                <span className="text-sm font-medium text-slate-700 mr-2">Young Fella</span> {/* Placeholder */}
                {/* Basic Avatar Placeholder - consider enhancing */}
                <div className="w-9 h-9 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 text-xs">YF</div>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Main Content Area: Adjusted background to a common light gray if neutral-50 is too dark, py-10 for more spacing */}
      <main className="bg-slate-50 py-10 font-sans">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">

          {errorLoadingProduct && ( // Non-critical: product loaded, but maybe stale or an update failed
             <div className="mb-8 p-4 bg-orange-100 border-l-4 border-orange-400 text-orange-700 rounded-md">
               <p>Note: There was an issue refreshing product data: {errorLoadingProduct}</p>
             </div>
          )}

          {/* Product Information Section: Enhanced styling, text colors, spacing */}
          <section className="bg-white p-6 md:p-8 rounded-xl shadow-lg mb-10">
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-6 items-start">
              {/* Product Image Placeholder: Adjusted aspect ratio and placeholder style */}
              <div className="product-image-placeholder relative w-full aspect-[4/3] bg-slate-100 flex items-center justify-center rounded-lg overflow-hidden">
                {product.image_url ? (
                  <Image src={product.image_url} alt={product.title} fill style={{ objectFit: 'cover' }}/>
                ) : (
                  <svg className="w-20 h-20 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                )}
              </div>
              <div className="py-2">
                <h1 className="text-3xl lg:text-4xl font-bold text-primary font-display mb-3">{product.title}</h1>
                <p className="text-3xl font-semibold text-emerald-600 mb-5">${product.price.toFixed(2)}</p>
                <p className="text-slate-700 mb-6 leading-relaxed">{product.description || "No description available."}</p>
                <div className="product-attributes text-sm text-slate-600 space-y-2.5">
                  <p><strong className="font-medium text-slate-700">Category:</strong> {product.category}</p>
                  <p><strong className="font-medium text-slate-700">Vendor:</strong> {product.user_profiles?.full_name || 'N/A'}</p>
                  <p><strong className="font-medium text-slate-700">Target Group Size:</strong> {product.max_participants ?? 'N/A'}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Alert Section: Refined styling */}
          {errorLoadingGroupsAwaitingVotes && (
            <div className="mb-8 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg shadow-md">
              <p>{errorLoadingGroupsAwaitingVotes}</p>
            </div>
          )}
          {groupsAwaitingVotes.length > 0 && (
            <section className="alert-section bg-amber-50 border-l-4 border-amber-400 text-amber-800 p-5 rounded-lg mb-10 shadow-md">
              <div className="flex items-center">
                <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.216 3.031-1.742 3.031H4.42c-1.526 0-2.492-1.697-1.742-3.031l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1.75-2.75a.75.75 0 00-1.5 0v2.5c0 .414.336.75.75.75h2.5a.75.75 0 000-1.5h-1.75v-1.75z" clipRule="evenodd"></path></svg>
                <h2 className="text-xl font-semibold font-display text-amber-900">Groups Awaiting Votes!</h2>
              </div>
              <p className="mt-2.5 text-sm leading-relaxed">
                One or more groups for "{product.title}" are full and need member votes to proceed.
                Cast your vote if you're a member. The voting window is typically 1 hour from when the group becomes full.
              </p>
              <ul className="list-disc list-inside pl-1 mt-3 space-y-1.5 text-sm">
                {groupsAwaitingVotes.map(group => (
                  <li key={group.id}>
                    <span className="font-medium">{group.name}</span> - Vote by: {calculateTimeLeft(group.vote_deadline)}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <GroupTabs
            timedGroups={timedGroups}
            untimedGroups={untimedGroups}
            currentUserId={currentUserId}
            productName={product.title}
          />

          {/* Page-level errors for group loading if GroupTabs itself isn't rendered or they are catastrophic */}
          {(!product || (timedGroups.length === 0 && errorLoadingTimedGroups)) && (
             <div className="my-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg shadow-md text-sm">
                <p>Could not load Timed Groups: {errorLoadingTimedGroups}</p>
             </div>
          )}
          {(!product || (untimedGroups.length === 0 && errorLoadingUntimedGroups)) && (
             <div className="my-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg shadow-md text-sm">
                <p>Could not load Untimed Groups: {errorLoadingUntimedGroups}</p>
             </div>
          )}

              {/* Group Discussions & Vendor Chat Placeholder: Enhanced styling */}
              <section className="discussions-placeholder bg-white p-8 rounded-xl shadow-lg mt-10 text-center">
                <svg className="w-16 h-16 mx-auto text-primary mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                <h3 className="text-2xl font-semibold text-primary font-display mb-3">
                  Group Discussions & Vendor Chat
                </h3>
                <p className="text-slate-600 max-w-md mx-auto">
                  This exciting feature is currently under development. Soon you'll be able to chat with group members and the vendor right here!
                </p>
              </section>

        </div>
      </main>

      {/* Footer: Adjusted padding and text color */}
      <footer className="bg-white border-t border-slate-200 mt-auto font-sans">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <p className="text-sm text-slate-500">© 2025 CrowdCart Lite. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
