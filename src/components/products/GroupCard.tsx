// src/components/products/GroupCard.tsx
'use client';

import { useState, useEffect } from 'react'; // Added useEffect for initial state sync
import { GroupData, joinGroup, updateVoteStatus } from '@/lib/supabase/groups';
import { Clock, Users, XCircle, Vote, Hourglass, ListChecks, Loader2, CheckCircle } from 'lucide-react'; // Added CheckCircle, corrected AlertTriangle
import { useRouter } from 'next/navigation';

interface GroupCardProps {
  group: GroupData;
  currentUserId?: string;
}

// Helper to calculate time left (can be imported from a utils file later)
const calculateTimeLeft = (deadline: string | null | undefined, endedText = 'Ended'): string => {
  if (!deadline) return 'N/A';
  const diff = new Date(deadline).getTime() - new Date().getTime();
  if (diff <= 0) return endedText;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / 1000 / 60) % 60);

  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  if (minutes > 0) return `${minutes}m left`;
  return 'Ending soon';
};

const getVoteStatsInitial = (group: GroupData, currentUserId?: string) => {
    let currentUserVote: 'approved' | 'rejected' | 'pending' | null = null;
    let approvalCount = 0;
    if (group.group_members) {
        group.group_members.forEach(member => {
            if (member.vote_status === 'approved') approvalCount++;
            if (member.user_id === currentUserId) {
              currentUserVote = member.vote_status as 'approved' | 'rejected' || 'pending';
            }
        });
    }
    return { currentUserVote, approvalCount };
};

export function GroupCard({ group, currentUserId }: GroupCardProps) {
  const router = useRouter();
  const [isLoadingJoin, setIsLoadingJoin] = useState(false);
  const [isLoadingVote, setIsLoadingVote] = useState(false);

  // Initialize optimistic states based on the initial group prop
  const initialVoteStats = getVoteStatsInitial(group, currentUserId);
  const [optimisticVoteStatus, setOptimisticVoteStatus] = useState<'approved' | 'rejected' | 'pending' | null>(initialVoteStats.currentUserVote);
  const [optimisticApprovalCount, setOptimisticApprovalCount] = useState(initialVoteStats.approvalCount);
  const [optimisticMemberCount, setOptimisticMemberCount] = useState(group.member_count);
  const [isOptimisticallyMember, setIsOptimisticallyMember] = useState(
    group.group_members?.some(member => member.user_id === currentUserId) || false
  );

  // Effect to resync optimistic state if group prop changes (e.g. after router.refresh)
  useEffect(() => {
    const newVoteStats = getVoteStatsInitial(group, currentUserId);
    setOptimisticVoteStatus(newVoteStats.currentUserVote);
    setOptimisticApprovalCount(newVoteStats.approvalCount);
    setOptimisticMemberCount(group.member_count);
    setIsOptimisticallyMember(group.group_members?.some(member => member.user_id === currentUserId) || false);
  }, [group, currentUserId]);

  const targetMembers = group.target_count || group.products?.max_participants || 5; // Changed max_buyers to max_participants
  const memberProgress = optimisticMemberCount && targetMembers ? (optimisticMemberCount / targetMembers) * 100 : 0;

  // Assuming group.vote_deadline is the specific 1-hour window end time
  const voteTimeRemaining = group.status === 'waiting_votes' ? calculateTimeLeft(group.vote_deadline, 'Voting ended') : '';

  const handleJoinGroup = async () => {
    if (!currentUserId) {
      alert('You must be logged in to join a group.'); // Replace with toast
      return;
    }
    if (isOptimisticallyMember || group.status !== 'open') return;

    setIsLoadingJoin(true);
    try {
      await joinGroup(group.id, currentUserId);
      alert('Successfully joined group!'); // Replace with toast
      setOptimisticMemberCount(prev => prev + 1);
      setIsOptimisticallyMember(true);
      router.refresh();
    } catch (error: any) {
      console.error('Error joining group:', error);
      alert(`Failed to join group: ${error.message}`); // Replace with toast
    } finally {
      setIsLoadingJoin(false);
    }
  };

  const handleVote = async (vote: 'approved' | 'rejected') => {
    if (!currentUserId || !group.id || !isOptimisticallyMember || group.status !== 'waiting_votes') {
      alert('You must be an active member of this group during the voting phase to vote.'); // Replace with toast
      return;
    }
    if (optimisticVoteStatus === vote && optimisticVoteStatus !== 'pending') return;

    setIsLoadingVote(true);
    const previousVoteStatus = optimisticVoteStatus; // Store previous status for accurate count update

    try {
      await updateVoteStatus(group.id, currentUserId, vote);
      alert(`Successfully voted: ${vote}`); // Replace with toast

      setOptimisticVoteStatus(vote);
      if (vote === 'approved') {
        if (previousVoteStatus !== 'approved') { // Was pending or rejected
          setOptimisticApprovalCount(prev => prev + 1);
        }
      } else if (vote === 'rejected') {
        if (previousVoteStatus === 'approved') { // Was approved, now rejected
          setOptimisticApprovalCount(prev => prev - 1);
        }
      }
      router.refresh();
    } catch (error: any) {
      console.error('Error voting:', error);
      alert(`Failed to vote: ${error.message}`); // Replace with toast
      // Revert optimistic state on error if needed, though router.refresh() will eventually do this
      setOptimisticVoteStatus(previousVoteStatus);
      // Recalculate approval count based on actual group data if reverting, but refresh handles this better
    } finally {
      setIsLoadingVote(false);
    }
  };

  // Determine text for "Voting ends by" - this is the overall offer expiry for timed groups in voting
  // or the specific vote_deadline if it's an untimed group that reached capacity.
  // The mockup shows "Voting ends by: [Offer Expiry]" for the card's main part.
  const mainCardVotingDeadlineText = group.group_type === 'timed' && group.expires_at ?
                                     calculateTimeLeft(group.expires_at, 'Offer Expired') :
                                     calculateTimeLeft(group.vote_deadline, 'Voting Ended');


  return (
    <article className="group-card bg-white border border-slate-200 rounded-xl shadow-lg flex flex-col overflow-hidden transition-all hover:shadow-xl font-sans">
      <div className="group-card-header p-4 lg:p-5 border-b border-slate-100">
        <div className="flex justify-between items-start mb-1.5">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center">
            {group.status === 'open' && <Users className="w-5 h-5 mr-2 text-emerald-500" />}
            {group.status === 'waiting_votes' && <Vote className="w-5 h-5 mr-2 text-sky-500" />}
            {group.status === 'closed' && <XCircle className="w-5 h-5 mr-2 text-red-500" />}
            {group.status === 'completed' && <CheckCircle className="w-5 h-5 mr-2 text-purple-500" />}
            {group.name || `Group ${group.id.substring(0, 6)}...`}
          </h3>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full leading-none
            ${group.group_type === 'timed' ? 'bg-orange-100 text-orange-600' : 'bg-sky-100 text-sky-600'}`}>
            {group.group_type === 'timed' ? 'Timed' : 'Untimed'}
          </span>
        </div>
        <p className="text-xs text-slate-500 font-mono">ID: {group.id}</p>
      </div>

      <div className="group-card-content p-4 lg:p-5 flex-grow space-y-3.5 text-sm">
        <p className="text-slate-600">
          <strong className="font-medium text-slate-700">Status:</strong>
          <span className={`ml-1.5 font-semibold ${
            group.status === 'open' ? 'text-emerald-600' :
            group.status === 'waiting_votes' ? 'text-sky-600' :
            group.status === 'closed' ? 'text-red-600' :
            group.status === 'completed' ? 'text-purple-600' : 'text-slate-700'
          }`}>
            {group.status === 'open' ? 'Open for Members' :
             group.status === 'waiting_votes' ? 'Voting in Progress' :
             group.status === 'closed' ? 'Closed' :
             group.status === 'completed' ? 'Deal Secured!' : group.status}
          </span>
        </p>

        <div>
          <p className="text-slate-600 mb-0.5"><strong className="font-medium text-slate-700">Members:</strong> {optimisticMemberCount} / {targetMembers}</p>
          <div className="w-full bg-slate-200 rounded-full h-2.5 mt-1">
            <div className="bg-primary h-2.5 rounded-full transition-all duration-300" style={{ width: `${memberProgress}%` }}></div>
          </div>
        </div>

        {group.waitlist_count !== undefined && group.waitlist_count > 0 && (
          <p className="text-slate-600"><strong className="font-medium text-slate-700">Waitlist:</strong> {group.waitlist_count} / {group.waitlist_max_capacity || 'N/A'}</p>
        )}

        {group.group_type === 'timed' && group.status === 'open' && group.expires_at && (
          <p className="text-slate-600 flex items-center">
            <Clock className="w-4 h-4 mr-2 text-slate-500" />
            Offer ends in: <span className="font-medium ml-1">{calculateTimeLeft(group.expires_at)}</span>
          </p>
        )}

        {group.status === 'waiting_votes' && ( // Display overall deadline in main card info
             <p className="text-slate-600 flex items-center">
                <Hourglass className="w-4 h-4 mr-2 text-slate-500" />
                Voting ends by: <span className="font-medium ml-1">{mainCardVotingDeadlineText}</span>
             </p>
        )}
      </div>

      {group.status === 'waiting_votes' && (
        <div className="voting-interface p-4 lg:p-5 bg-sky-50 border-t border-sky-100">
          <h4 className="text-base font-semibold text-primary mb-2.5 flex items-center">
            <ListChecks className="w-5 h-5 mr-2 text-sky-500" /> Group Voting Active
          </h4>
          {isOptimisticallyMember && (
            <>
              <div className="text-xs text-slate-600 mb-1 flex items-center">
                <Hourglass className="w-3.5 h-3.5 inline mr-1.5 text-slate-500" /> Short Vote Window: <strong className="ml-1">{voteTimeRemaining}</strong>
              </div>
              <div className="text-xs text-slate-600 mb-1.5">Vote Progress: <strong className="ml-1">{optimisticApprovalCount} / {group.member_count} Approvals</strong></div>
              <div className="w-full bg-slate-200 rounded-full h-2 my-2">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${(optimisticApprovalCount / (group.member_count || 1)) * 100}%` }}>
                </div>
              </div>
              <p className="text-xs text-slate-500 my-2.5">
                This group requires {group.unanimous_approval_required ? `unanimous approval (${group.member_count}/${group.member_count})` : `${Math.ceil(group.member_count / 2)}/${group.member_count} approvals (majority)`}.
              </p>
              <div className="info-message bg-sky-100 text-sky-700 p-2.5 rounded-md text-xs my-2.5 border border-sky-200">
                 Vote within 1 hour (from group full). Inaction may be considered as approval by default.
              </div>
              <div className="voting-buttons flex gap-2.5 mt-3">
                <button
                  onClick={() => handleVote('approved')}
                  disabled={isLoadingVote || optimisticVoteStatus === 'approved' || voteTimeRemaining === 'Voting ended'}
                  className="btn-approve flex-1 bg-emerald-500 text-white px-3 py-2.5 rounded-md text-xs font-semibold hover:bg-emerald-600 disabled:bg-slate-300 disabled:text-slate-500 transition-colors flex items-center justify-center"
                >
                  {isLoadingVote && optimisticVoteStatus !== 'approved' && <Loader2 className="animate-spin w-4 h-4 mr-1.5" />} Approve
                </button>
                <button
                  onClick={() => handleVote('rejected')}
                  disabled={isLoadingVote || optimisticVoteStatus === 'rejected' || voteTimeRemaining === 'Voting ended'}
                  className="btn-disapprove flex-1 bg-red-500 text-white px-3 py-2.5 rounded-md text-xs font-semibold hover:bg-red-600 disabled:bg-slate-300 disabled:text-slate-500 transition-colors flex items-center justify-center"
                >
                  {isLoadingVote && optimisticVoteStatus !== 'rejected' && <Loader2 className="animate-spin w-4 h-4 mr-1.5" />} Disapprove
                </button>
              </div>
               {optimisticVoteStatus && optimisticVoteStatus !== 'pending' && voteTimeRemaining !== 'Voting ended' && (
                <p className="text-xs text-center mt-2.5 text-slate-600">You have voted: <span className="font-semibold capitalize">{optimisticVoteStatus}</span></p>
              )}
               {voteTimeRemaining === 'Voting ended' && optimisticVoteStatus === 'pending' && isOptimisticallyMember && (
                 <p className="text-xs text-center mt-2.5 text-orange-600 font-medium">Voting has ended. Your vote was not cast in time.</p>
               )}
            </>
          )}
          {(!isOptimisticallyMember && group.status === 'waiting_votes') && ( // Show this if not a member during voting phase
             <p className="text-xs text-slate-600 text-center py-3">Only group members can vote in this group.</p>
          )}
        </div>
      )}

      {group.status === 'open' && (
        <div className="group-card-footer p-4 lg:p-5 border-t border-slate-100">
          <button
            onClick={handleJoinGroup}
            disabled={isLoadingJoin || isOptimisticallyMember || optimisticMemberCount >= targetMembers}
            className="btn-join w-full bg-primary text-white px-4 py-2.5 rounded-md font-semibold hover:bg-primary/90 disabled:bg-slate-400 disabled:text-slate-100 transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1 text-sm"
          >
            {isLoadingJoin && <Loader2 className="animate-spin w-5 h-5 mr-2" />}
            {isOptimisticallyMember ? "Already Joined" : optimisticMemberCount >= targetMembers ? "Group Full" : "Join Group"}
          </button>
        </div>
      )}
    </article>
  );
}
