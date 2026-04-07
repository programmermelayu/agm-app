import React, { useState } from 'react';
import { Button, Input, Card } from './common';

interface AGMFormProps {
  onSubmit: (data: AGMFormData) => Promise<void>;
  isLoading?: boolean;
  initialValues?: Partial<AGMFormData>;
  submitButtonText?: string;
}

export interface AGMFormData {
  name: string;
  date: string;
  time: string;
  location: string;
}

export const AGMForm: React.FC<AGMFormProps> = ({
  onSubmit,
  isLoading = false,
  initialValues,
  submitButtonText = 'Create AGM',
}) => {
  const [formData, setFormData] = useState<AGMFormData>({
    name: initialValues?.name || '',
    date: initialValues?.date || '',
    time: initialValues?.time || '',
    location: initialValues?.location || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) {
      newErrors.name = 'AGM name is required';
    } else if (formData.name.length > 255) {
      newErrors.name = 'AGM name must be 255 characters or less';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      selectedDate.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.date = 'Date must be today or in the future';
      }
    }

    if (!formData.time) {
      newErrors.time = 'Time is required';
    } else if (!/^([0-1]\d|2[0-3]):[0-5]\d:[0-5]\d$/.test(formData.time)) {
      newErrors.time = 'Time must be in HH:MM:SS format';
    }

    if (!formData.location) {
      newErrors.location = 'Location is required';
    } else if (formData.location.length > 500) {
      newErrors.location = 'Location must be 500 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err: any) {
      const message =
        err.response?.data?.error?.message || 'Failed to save AGM';
      setSubmitError(message);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-4">
        {submitError && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {submitError}
          </div>
        )}

        <Input
          label="AGM Name"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Annual General Meeting 2026"
          error={errors.name}
          disabled={isLoading}
          maxLength={255}
        />

        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              label="Date"
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              error={errors.date}
              disabled={isLoading}
            />
          </div>
          <div className="flex-1">
            <Input
              label="Time"
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              placeholder="14:30:00"
              error={errors.time}
              helperText="HH:MM format"
              disabled={isLoading}
            />
          </div>
        </div>

        <Input
          label="Location"
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Main Conference Hall"
          error={errors.location}
          disabled={isLoading}
          maxLength={500}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          isLoading={isLoading}
        >
          {submitButtonText}
        </Button>
      </form>
    </Card>
  );
};

export default AGMForm;
