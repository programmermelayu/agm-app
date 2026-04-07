import React from 'react';
import { useNavigate } from 'react-router-dom';
import AGMForm, { AGMFormData } from '../components/AGMForm';
import { useAGM } from '../hooks/useAGM';

export const CreateAGMPage: React.FC = () => {
  const navigate = useNavigate();
  const { createAGM, isLoading } = useAGM();

  const handleSubmit = async (data: AGMFormData) => {
    const agm = await createAGM(data.name, data.date, data.time, data.location);
    // Redirect to AGM detail page
    navigate(`/agms/${agm.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-600 hover:text-blue-700 mb-4 font-medium"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold text-gray-900">Create New AGM</h1>
          <p className="text-gray-600 mt-2">
            Schedule a new Annual General Meeting
          </p>
        </div>

        {/* Form */}
        <AGMForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          submitButtonText="Create AGM"
        />

        {/* Helpful info */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Quick Tips</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Fill in all fields to create your AGM</li>
            <li>• You can only invite attendees after creating the AGM</li>
            <li>• Draft AGMs can be edited or deleted anytime</li>
            <li>
              • Once scheduled, AGM details cannot be changed until completion
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreateAGMPage;
