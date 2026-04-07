import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card } from '../components/common';

export const RSVPPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<
    'attending' | 'not_attending' | 'maybe' | null
  >(null);

  const handleRSVP = async (status: 'attending' | 'not_attending' | 'maybe') => {
    if (!token) {
      setError('Invalid RSVP link');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/v1/rsvp/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rsvp_status: status }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit RSVP');
      }

      setSuccess(
        `Thank you! Your RSVP has been recorded as "${status.replace(/_/g, ' ')}".`
      );
      setSelectedStatus(status);

      // Redirect to home after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit RSVP');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Invalid RSVP Link
            </h1>
            <p className="text-gray-600 mb-4">
              The RSVP link is invalid or has expired.
            </p>
            <Button variant="primary" onClick={() => navigate('/')}>
              Go Home
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              You're Invited!
            </h1>
            <p className="text-gray-600">
              Please let us know if you'll be attending
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              {success}
            </div>
          )}

          {!success && (
            <div className="space-y-3">
              <button
                onClick={() => handleRSVP('attending')}
                disabled={isLoading || selectedStatus === 'attending'}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  selectedStatus === 'attending'
                    ? 'bg-green-600 text-white'
                    : 'bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50'
                }`}
              >
                {isLoading && selectedStatus === 'attending'
                  ? 'Submitting...'
                  : "✓ I'll be attending"}
              </button>

              <button
                onClick={() => handleRSVP('maybe')}
                disabled={isLoading || selectedStatus === 'maybe'}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  selectedStatus === 'maybe'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 disabled:opacity-50'
                }`}
              >
                {isLoading && selectedStatus === 'maybe'
                  ? 'Submitting...'
                  : "? Maybe I'll attend"}
              </button>

              <button
                onClick={() => handleRSVP('not_attending')}
                disabled={isLoading || selectedStatus === 'not_attending'}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  selectedStatus === 'not_attending'
                    ? 'bg-red-600 text-white'
                    : 'bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50'
                }`}
              >
                {isLoading && selectedStatus === 'not_attending'
                  ? 'Submitting...'
                  : "✗ I cannot attend"}
              </button>
            </div>
          )}

          {success && (
            <p className="text-center text-sm text-gray-600">
              Redirecting in a few seconds...
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default RSVPPage;
