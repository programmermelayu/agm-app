import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common';
import AGMCard from '../components/AGMCard';
import { useAGM } from '../hooks/useAGM';
import { useAuth } from '../context/AuthContext';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { agms, pagination, isLoading, error, fetchAGMs, deleteAGM } = useAGM();

  const [filterStatus, setFilterStatus] = useState<string>('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch AGMs on mount
  useEffect(() => {
    const filters: any = {
      page: 1,
      limit: 20,
    };
    if (filterStatus) {
      filters.status = filterStatus;
    }
    fetchAGMs(filters);
  }, [filterStatus, fetchAGMs]);

  const handleDeleteAGM = async (agmId: string) => {
    setDeletingId(agmId);
    try {
      await deleteAGM(agmId);
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Muktamar</h1>
            <p className="text-gray-600 mt-1">AGM Management System</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Logged in as</p>
              <p className="font-semibold text-gray-900">{user?.email}</p>
            </div>
            <Button variant="secondary" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Dashboard header with action button */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">My AGMs</h2>
            <p className="text-gray-600 mt-1">
              {pagination.total} total AGM
              {pagination.total !== 1 ? 's' : ''}
            </p>
          </div>
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/agms/create')}
          >
            + Create AGM
          </Button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-3">
          <button
            onClick={() => setFilterStatus('')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === ''
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterStatus('draft')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === 'draft'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Draft
          </button>
          <button
            onClick={() => setFilterStatus('scheduled')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === 'scheduled'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Scheduled
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === 'completed'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Completed
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading AGMs...</p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && agms.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No AGMs yet
            </h3>
            <p className="text-gray-600 mb-6">
              {filterStatus
                ? 'No AGMs with this status. Try a different filter.'
                : 'Create your first AGM to get started'}
            </p>
            {!filterStatus && (
              <Button
                variant="primary"
                onClick={() => navigate('/agms/create')}
              >
                Create First AGM
              </Button>
            )}
          </div>
        )}

        {/* AGM Grid */}
        {!isLoading && agms.length > 0 && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agms.map((agm) => (
                <AGMCard
                  key={agm.id}
                  agm={agm}
                  onDelete={handleDeleteAGM}
                  isDeleting={deletingId === agm.id}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.total_pages > 1 && (
              <div className="mt-8 flex justify-center items-center gap-2">
                <button
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-gray-600">
                  Page {pagination.page} of {pagination.total_pages}
                </span>
                <button
                  disabled={pagination.page === pagination.total_pages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
