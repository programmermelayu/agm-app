import React, { useState } from 'react';
import { Button, Input, Card } from './common';

interface CheckInFormProps {
  agmId: string;
  onSuccess: () => void;
  isLoading: boolean;
  isBulkMode?: boolean;
}

export const CheckInForm: React.FC<CheckInFormProps> = ({
  agmId,
  onSuccess,
  isLoading,
  isBulkMode = false,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [mode, setMode] = useState<'single' | 'bulk'>(isBulkMode ? 'bulk' : 'single');
  const [bulkText, setBulkText] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const parseCSVLine = (line: string) => {
    // Simple CSV parsing: "Name,Email" format
    const parts = line.split(',').map((p) => p.trim());
    return { name: parts[0], email: parts[1] };
  };

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim() || !email.trim()) {
      setError('Please enter name and email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `/api/v1/agms/${agmId}/attendance`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            attendee_name: name,
            attendee_email: email,
            notes: notes || undefined,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check in');
      }

      setSuccess(`${name} checked in successfully!`);
      setName('');
      setEmail('');
      setNotes('');

      setTimeout(() => {
        setSuccess('');
        onSuccess();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check in');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const lines = bulkText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) {
      setError('Please enter at least one attendee');
      return;
    }

    const attendees = lines.map((line) => {
      const parsed = parseCSVLine(line);
      if (!parsed.name || !parsed.email) {
        throw new Error(`Invalid format: ${line}`);
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(parsed.email)) {
        throw new Error(`Invalid email: ${parsed.email}`);
      }
      return parsed;
    });

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `/api/v1/agms/${agmId}/attendance/bulk`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ attendees }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to bulk check in');
      }

      const { success: successCount, failed: failedCount } = data.data;

      setSuccess(
        `Check-ins completed: ${successCount.length} successful${
          failedCount.length > 0 ? `, ${failedCount.length} failed` : ''
        }`
      );
      setBulkText('');

      setTimeout(() => {
        setSuccess('');
        onSuccess();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to bulk check in');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <div className="space-y-4">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setMode('single')}
            className={`px-4 py-2 rounded-lg font-medium ${
              mode === 'single'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Single Check-in
          </button>
          <button
            onClick={() => setMode('bulk')}
            className={`px-4 py-2 rounded-lg font-medium ${
              mode === 'bulk'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Bulk Check-in
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded text-sm">
            {success}
          </div>
        )}

        {mode === 'single' ? (
          <form onSubmit={handleCheckIn} className="space-y-4">
            <Input
              label="Attendee Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              disabled={isSubmitting || isLoading}
            />

            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              disabled={isSubmitting || isLoading}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                rows={2}
                disabled={isSubmitting || isLoading}
              />
            </div>

            <Button
              variant="primary"
              type="submit"
              disabled={isSubmitting || isLoading || !name.trim() || !email.trim()}
              className="w-full"
            >
              {isSubmitting ? 'Checking in...' : 'Check In'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleBulkCheckIn} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attendees (Name, Email)
              </label>
              <textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder="John Doe,john@example.com&#10;Jane Smith,jane@example.com&#10;Bob Johnson,bob@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                rows={5}
                disabled={isSubmitting || isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Format: Name,Email (one per line, max 500)
              </p>
            </div>

            <Button
              variant="primary"
              type="submit"
              disabled={isSubmitting || isLoading || bulkText.trim().length === 0}
              className="w-full"
            >
              {isSubmitting ? 'Checking in...' : 'Bulk Check-in'}
            </Button>
          </form>
        )}
      </div>
    </Card>
  );
};

export default CheckInForm;
