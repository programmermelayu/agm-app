import React from 'react';
import { Card } from './common';

interface RSVPStats {
  pending: number;
  attending: number;
  not_attending: number;
  maybe: number;
  total: number;
}

interface RSVPSummaryProps {
  stats: RSVPStats | null;
  isLoading: boolean;
}

export const RSVPSummary: React.FC<RSVPSummaryProps> = ({
  stats,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <Card>
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
        </div>
      </Card>
    );
  }

  if (!stats || stats.total === 0) {
    return (
      <Card>
        <div className="text-center py-4">
          <p className="text-gray-600">No invitations sent yet</p>
        </div>
      </Card>
    );
  }

  const respondedCount = stats.attending + stats.not_attending + stats.maybe;
  const responseRate =
    stats.total > 0
      ? Math.round((respondedCount / stats.total) * 100)
      : 0;

  return (
    <Card>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">RSVP Summary</h3>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            <p className="text-xs text-gray-600">Total Invitations</p>
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {stats.pending}
            </p>
            <p className="text-xs text-gray-600">Pending</p>
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {stats.attending}
            </p>
            <p className="text-xs text-gray-600">Attending</p>
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">
              {stats.not_attending}
            </p>
            <p className="text-xs text-gray-600">Not Attending</p>
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {stats.maybe}
            </p>
            <p className="text-xs text-gray-600">Maybe</p>
          </div>
        </div>

        {stats.total > 0 && (
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Response Rate
              </span>
              <span className="text-sm font-bold text-gray-900">
                {responseRate}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${responseRate}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default RSVPSummary;
