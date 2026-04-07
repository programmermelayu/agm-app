import React, { useState, useEffect } from 'react';
import SendInvitationForm from './SendInvitationForm';
import RSVPSummary from './RSVPSummary';
import InvitationList from './InvitationList';

interface Invitation {
  id: string;
  attendee_email: string;
  rsvp_status: 'pending' | 'attending' | 'not_attending' | 'maybe';
  created_at: string;
  responded_at: string | null;
}

interface RSVPStats {
  pending: number;
  attending: number;
  not_attending: number;
  maybe: number;
  total: number;
}

interface InvitationsTabProps {
  agmId: string;
}

export const InvitationsTab: React.FC<InvitationsTabProps> = ({ agmId }) => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [stats, setStats] = useState<RSVPStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 20;

  const token = localStorage.getItem('token');

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load invitations list
      const invResponse = await fetch(
        `/api/v1/agms/${agmId}/invitations?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!invResponse.ok) throw new Error('Failed to load invitations');
      const invData = await invResponse.json();
      setInvitations(invData.data.invitations);

      // Load RSVP summary
      const summaryResponse = await fetch(
        `/api/v1/agms/${agmId}/invitations/summary`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!summaryResponse.ok) throw new Error('Failed to load summary');
      const summaryData = await summaryResponse.json();
      setStats(summaryData.data);
    } catch (error) {
      console.error('Failed to load invitations data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [agmId, page]);

  const handleDeleteInvitation = async (id: string) => {
    try {
      const response = await fetch(`/api/v1/invitations/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete invitation');
      }

      // Reload data
      await loadData();
    } catch (error) {
      console.error('Failed to delete invitation:', error);
    }
  };

  return (
    <div className="space-y-6">
      <SendInvitationForm
        agmId={agmId}
        onSuccess={loadData}
        isLoading={isLoading}
      />

      <RSVPSummary stats={stats} isLoading={isLoading} />

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Invitations
        </h3>
        <InvitationList
          invitations={invitations}
          isLoading={isLoading}
          total={stats?.total || 0}
          page={page}
          limit={limit}
          onPageChange={setPage}
          onDelete={handleDeleteInvitation}
        />
      </div>
    </div>
  );
};

export default InvitationsTab;
