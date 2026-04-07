import React, { useState } from 'react';
import { Card, Badge } from './common';

interface Invitation {
  id: string;
  attendee_email: string;
  rsvp_status: 'pending' | 'attending' | 'not_attending' | 'maybe';
  created_at: string;
  responded_at: string | null;
}

interface InvitationListProps {
  invitations: Invitation[];
  isLoading: boolean;
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onDelete?: (id: string) => void;
}

const statusColors = {
  pending: 'default',
  attending: 'success',
  not_attending: 'danger',
  maybe: 'warning',
} as const;

export const InvitationList: React.FC<InvitationListProps> = ({
  invitations,
  isLoading,
  total,
  page,
  limit,
  onPageChange,
  onDelete,
}) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const totalPages = Math.ceil(total / limit);

  const handleDelete = async (id: string) => {
    if (!onDelete) return;

    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading invitations...</p>
        </div>
      </Card>
    );
  }

  if (invitations.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-gray-600">No invitations sent yet</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">
                  Email
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">
                  Status
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">
                  Sent
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">
                  Responded
                </th>
                {onDelete && (
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">
                    Action
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {invitations.map((invitation) => (
                <tr
                  key={invitation.id}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="py-3 px-4 text-gray-900">
                    {invitation.attendee_email}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={statusColors[invitation.rsvp_status]}>
                      {invitation.rsvp_status
                        .replace(/_/g, ' ')
                        .replace(/\b\w/g, (c) => c.toUpperCase())}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-gray-600 text-xs">
                    {new Date(invitation.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-gray-600 text-xs">
                    {invitation.responded_at
                      ? new Date(invitation.responded_at).toLocaleDateString()
                      : '-'}
                  </td>
                  {onDelete && (
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(invitation.id)}
                        disabled={deletingId === invitation.id}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50 font-medium text-sm"
                      >
                        {deletingId === invitation.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 pt-4 border-t border-gray-200">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 text-sm"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 text-sm"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default InvitationList;
