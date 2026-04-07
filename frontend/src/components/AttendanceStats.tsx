import React from 'react';
import { Card } from './common';

interface Stats {
  total_checked_in: number;
  total_invited: number;
  no_shows: number;
  attendance_rate: number;
}

interface RSVP {
  pending: number;
  attending: number;
  not_attending: number;
  maybe: number;
  total: number;
}

interface AttendanceStatsProps {
  stats: Stats | null;
  rsvp: RSVP | null;
  isLoading: boolean;
}

export const AttendanceStats: React.FC<AttendanceStatsProps> = ({
  stats,
  rsvp,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <Card>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading statistics...</p>
        </div>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-gray-600">No attendance data available</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Attendance</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">
                {stats.total_checked_in}
              </p>
              <p className="text-xs text-gray-600">Checked In</p>
            </div>

            <div className="text-center">
              <p className="text-3xl font-bold text-gray-600">
                {stats.attendance_rate}%
              </p>
              <p className="text-xs text-gray-600">Rate</p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Attendance Rate
              </span>
              <span className="text-sm font-bold text-gray-900">
                {stats.attendance_rate}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${stats.attendance_rate}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Summary</h3>

          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-sm font-medium text-gray-700">
                Total Invited
              </span>
              <span className="text-lg font-bold text-gray-900">
                {stats.total_invited}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-green-50 rounded">
              <span className="text-sm font-medium text-green-700">
                Checked In
              </span>
              <span className="text-lg font-bold text-green-600">
                {stats.total_checked_in}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-red-50 rounded">
              <span className="text-sm font-medium text-red-700">No-shows</span>
              <span className="text-lg font-bold text-red-600">
                {stats.no_shows}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {rsvp && (
        <Card className="md:col-span-2">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              RSVP vs Attendance
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{rsvp.total}</p>
                <p className="text-xs text-gray-600">Total Invitations</p>
              </div>

              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {rsvp.attending}
                </p>
                <p className="text-xs text-gray-600">RSVP Attending</p>
              </div>

              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {stats.total_checked_in}
                </p>
                <p className="text-xs text-gray-600">Actually Here</p>
              </div>

              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {stats.no_shows}
                </p>
                <p className="text-xs text-gray-600">No-shows</p>
              </div>

              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {rsvp.pending}
                </p>
                <p className="text-xs text-gray-600">Pending</p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AttendanceStats;
