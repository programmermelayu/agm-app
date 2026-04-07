import React, { useState } from 'react';
import { Button, Input, Card } from './common';

interface SendInvitationFormProps {
  agmId: string;
  onSuccess: () => void;
  isLoading: boolean;
}

export const SendInvitationForm: React.FC<SendInvitationFormProps> = ({
  agmId,
  onSuccess,
  isLoading,
}) => {
  const [emails, setEmails] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendInvitations = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate emails
    const emailList = emails
      .split('\n')
      .map((email) => email.trim())
      .filter((email) => email.length > 0);

    if (emailList.length === 0) {
      setError('Please enter at least one email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = emailList.filter((email) => !emailRegex.test(email));
    if (invalidEmails.length > 0) {
      setError(`Invalid email addresses: ${invalidEmails.join(', ')}`);
      return;
    }

    setIsSending(true);

    try {
      const response = await fetch(
        `/api/v1/agms/${agmId}/invitations/batch`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ emails: emailList }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send invitations');
      }

      const { success: successCount, failed: failedCount } = data.data;

      setEmails('');
      setSuccess(
        `Invitations sent: ${successCount.length} successful${failedCount.length > 0 ? `, ${failedCount.length} failed` : ''}`
      );

      // Reset form after 2 seconds
      setTimeout(() => {
        setSuccess('');
        onSuccess();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitations');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSendInvitations} className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Send Invitations</h3>

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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Addresses (one per line)
          </label>
          <textarea
            value={emails}
            onChange={(e) => setEmails(e.target.value)}
            placeholder="john@example.com&#10;jane@example.com&#10;bob@example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={5}
            disabled={isSending || isLoading}
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter email addresses, one per line (max 100)
          </p>
        </div>

        <Button
          variant="primary"
          type="submit"
          disabled={isSending || isLoading || emails.trim().length === 0}
          className="w-full"
        >
          {isSending ? 'Sending...' : 'Send Invitations'}
        </Button>
      </form>
    </Card>
  );
};

export default SendInvitationForm;
