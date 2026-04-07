import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Badge } from './common';
import { AGM } from '../hooks/useAGM';

interface AGMCardProps {
  agm: AGM;
  onDelete?: (agmId: string) => void;
  isDeleting?: boolean;
}

export const AGMCard: React.FC<AGMCardProps> = ({
  agm,
  onDelete,
  isDeleting = false,
}) => {
  const navigate = useNavigate();

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/agms/${agm.id}/edit`);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && confirm('Are you sure you want to delete this AGM?')) {
      onDelete(agm.id);
    }
  };

  const handleViewDetails = () => {
    navigate(`/agms/${agm.id}`);
  };

  const statusColors = {
    draft: 'default',
    scheduled: 'primary',
    completed: 'success',
  } as const;

  const formattedDate = new Date(agm.date).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Card hoverable onClick={handleViewDetails} className="cursor-pointer">
      <div className="space-y-3">
        {/* Header with title and status */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold text-gray-900 flex-1 line-clamp-2">
            {agm.name}
          </h3>
          <Badge variant={statusColors[agm.status]}>
            {agm.status.charAt(0).toUpperCase() + agm.status.slice(1)}
          </Badge>
        </div>

        {/* Date, time, location */}
        <div className="space-y-1 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span className="font-medium">📅</span>
            <span>
              {formattedDate} at {agm.time}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">📍</span>
            <span className="line-clamp-1">{agm.location}</span>
          </div>
        </div>

        {/* Invitation count (if available) */}
        {agm.invitation_count !== undefined && (
          <div className="text-sm text-gray-600 flex items-center gap-2">
            <span className="font-medium">👥</span>
            <span>
              {agm.invitation_count} invitation
              {agm.invitation_count !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* RSVP Summary (if available) */}
        {agm.rsvp_summary && (
          <div className="pt-2 border-t border-gray-200">
            <div className="grid grid-cols-4 gap-1 text-xs">
              <div className="text-center">
                <div className="font-semibold text-green-600">
                  {agm.rsvp_summary.attending}
                </div>
                <div className="text-gray-600">Attending</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-yellow-600">
                  {agm.rsvp_summary.maybe}
                </div>
                <div className="text-gray-600">Maybe</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-red-600">
                  {agm.rsvp_summary.not_attending}
                </div>
                <div className="text-gray-600">Not Coming</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-600">
                  {agm.rsvp_summary.pending}
                </div>
                <div className="text-gray-600">Pending</div>
              </div>
            </div>
          </div>
        )}

        {/* Action buttons (only show for draft AGMs) */}
        {agm.status === 'draft' && (
          <div className="pt-2 border-t border-gray-200 flex gap-2">
            <button
              onClick={handleEdit}
              className="flex-1 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
              disabled={isDeleting}
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default AGMCard;
