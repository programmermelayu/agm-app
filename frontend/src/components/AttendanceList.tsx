import React, { useState } from 'react';
import { Card } from './common';

interface AttendanceRecord {
  id: string;
  attendee_name: string;
  attendee_email: string;
  checked_in_at: string;
  checked_in_by: string | null;
  notes: string | null;
}

interface AttendanceListProps {
  attendance: AttendanceRecord[];
  isLoading: boolean;
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onDelete?: (id: string) => void;
}

export const AttendanceList: React.FC<AttendanceListProps> = ({
  attendance,
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
          <p className="text-gray-600">Loading attendance records...</p>
        </div>
      </Card>
    );
  }

  if (attendance.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-gray-600">No attendees checked in yet</p>
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
                  Name
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">
                  Email
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">
                  Checked In
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">
                  By
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">
                  Notes
                </th>
                {onDelete && (
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">
                    Action
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {attendance.map((record) => (
                <tr
                  key={record.id}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="py-3 px-4 font-medium text-gray-900">
                    {record.attendee_name}
                  </td>
                  <td className="py-3 px-4 text-gray-600">{record.attendee_email}</td>
                  <td className="py-3 px-4 text-gray-600 text-xs">
                    {new Date(record.checked_in_at).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-gray-600 text-xs">
                    {record.checked_in_by || '-'}
                  </td>
                  <td className="py-3 px-4 text-gray-600 text-xs max-w-xs truncate">
                    {record.notes || '-'}
                  </td>
                  {onDelete && (
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(record.id)}
                        disabled={deletingId === record.id}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50 font-medium text-sm"
                      >
                        {deletingId === record.id ? 'Undoing...' : 'Undo'}
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

export default AttendanceList;
