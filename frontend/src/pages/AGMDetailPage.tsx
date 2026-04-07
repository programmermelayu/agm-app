import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Badge, Card } from '../components/common';
import AGMForm, { AGMFormData } from '../components/AGMForm';
import InvitationsTab from '../components/InvitationsTab';
import { useAGM, AGM } from '../hooks/useAGM';

export const AGMDetailPage: React.FC = () => {
  const { agm_id } = useParams<{ agm_id: string }>();
  const navigate = useNavigate();
  const { getAGM, updateAGM, isLoading, error } = useAGM();

  const [agm, setAGM] = useState<AGM | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'invitations' | 'attendance'>(
    'details'
  );
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (agm_id) {
      loadAGM();
    }
  }, [agm_id]);

  const loadAGM = async () => {
    if (!agm_id) return;
    try {
      const agmData = await getAGM(agm_id);
      setAGM(agmData);
    } catch (err) {
      // Error is handled by hook
    }
  };

  const handleUpdateAGM = async (data: AGMFormData) => {
    if (!agm_id) return;
    const updated = await updateAGM(agm_id, {
      name: data.name,
      date: data.date,
      time: data.time,
      location: data.location,
    });
    setAGM(updated);
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading AGM details...</p>
        </div>
      </div>
    );
  }

  if (error || !agm) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-600 hover:text-blue-700 mb-4 font-medium"
          >
            ← Back to Dashboard
          </button>
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error || 'AGM not found'}
          </div>
        </div>
      </div>
    );
  }

  const statusColors = {
    draft: 'default',
    scheduled: 'primary',
    completed: 'success',
  } as const;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <button
          onClick={() => navigate('/dashboard')}
          className="text-blue-600 hover:text-blue-700 mb-4 font-medium"
        >
          ← Back to Dashboard
        </button>

        {/* Title and status */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">{agm.name}</h1>
            <p className="text-gray-600 mt-2">
              {new Date(agm.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}{' '}
              at {agm.time}
            </p>
          </div>
          <Badge variant={statusColors[agm.status]}>
            {agm.status.charAt(0).toUpperCase() + agm.status.slice(1)}
          </Badge>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'details'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab('invitations')}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'invitations'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Invitations
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'attendance'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Attendance
          </button>
        </div>

        {/* Tab content */}
        <div>
          {activeTab === 'details' && (
            <Card>
              {isEditing ? (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900">Edit AGM</h3>
                  <AGMForm
                    onSubmit={handleUpdateAGM}
                    isLoading={isLoading}
                    initialValues={agm}
                    submitButtonText="Save Changes"
                  />
                  <button
                    onClick={() => setIsEditing(false)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Location</p>
                    <p className="text-lg text-gray-900 mt-1">{agm.location}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Created
                    </p>
                    <p className="text-lg text-gray-900 mt-1">
                      {new Date(agm.created_at).toLocaleDateString()} at{' '}
                      {new Date(agm.created_at).toLocaleTimeString()}
                    </p>
                  </div>

                  {agm.status === 'draft' && (
                    <div className="pt-4 border-t border-gray-200">
                      <Button
                        variant="primary"
                        onClick={() => setIsEditing(true)}
                      >
                        Edit AGM
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </Card>
          )}

          {activeTab === 'invitations' && (
            <InvitationsTab agmId={agm_id!} />
          )}

          {activeTab === 'attendance' && (
            <Card>
              <div className="text-center py-8">
                <p className="text-gray-600">
                  Attendance tracking coming soon
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AGMDetailPage;
