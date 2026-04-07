import React, { useState, useEffect } from 'react';
import CheckInForm from './CheckInForm';
import AttendanceStats from './AttendanceStats';
import AttendanceList from './AttendanceList';

interface AttendanceRecord {
  id: string;
  attendee_name: string;
  attendee_email: string;
  checked_in_at: string;
  checked_in_by: string | null;
  notes: string | null;
}

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

interface AttendanceTabProps {
  agmId: string;
}

export const AttendanceTab: React.FC<AttendanceTabProps> = ({ agmId }) => {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [rsvp, setRSVP] = useState<RSVP | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 50;

  const token = localStorage.getItem('token');

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load attendance records
      const attResponse = await fetch(
        `/api/v1/agms/${agmId}/attendance?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!attResponse.ok) throw new Error('Failed to load attendance');
      const attData = await attResponse.json();
      setAttendance(attData.data.attendance);

      // Load attendance stats
      const statsResponse = await fetch(
        `/api/v1/agms/${agmId}/attendance/stats`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!statsResponse.ok) throw new Error('Failed to load stats');
      const statsData = await statsResponse.json();
      setStats(statsData.data);

      // Load RSVP comparison
      const compResponse = await fetch(
        `/api/v1/agms/${agmId}/attendance/comparison`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!compResponse.ok) throw new Error('Failed to load comparison');
      const compData = await compResponse.json();
      setRSVP(compData.data.rsvp);
    } catch (error) {
      console.error('Failed to load attendance data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [agmId, page]);

  const handleDeleteAttendance = async (id: string) => {
    try {
      const response = await fetch(`/api/v1/attendance/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to undo check-in');
      }

      // Reload data
      await loadData();
    } catch (error) {
      console.error('Failed to undo check-in:', error);
    }
  };

  return (
    <div className="space-y-6">
      <CheckInForm
        agmId={agmId}
        onSuccess={loadData}
        isLoading={isLoading}
        isBulkMode={false}
      />

      <AttendanceStats stats={stats} rsvp={rsvp} isLoading={isLoading} />

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Check-in Records
        </h3>
        <AttendanceList
          attendance={attendance}
          isLoading={isLoading}
          total={stats?.total_checked_in || 0}
          page={page}
          limit={limit}
          onPageChange={setPage}
          onDelete={handleDeleteAttendance}
        />
      </div>
    </div>
  );
};

export default AttendanceTab;
