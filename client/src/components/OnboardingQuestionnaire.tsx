import React from 'react';

interface OnboardingQuestionnaireProps {
  user: any;
  onComplete: () => void;
}

const OnboardingQuestionnaire: React.FC<OnboardingQuestionnaireProps> = ({ user, onComplete }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Onboarding Questionnaire
        </h1>
        <p className="text-gray-600 mb-6">
          Welcome {user?.email}! This is a placeholder for your original onboarding questionnaire.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Replace this component with your original sophisticated questionnaire from GitHub.
        </p>
        <button
          onClick={onComplete}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
        >
          Complete Setup (Temporary)
        </button>
      </div>
    </div>
  );
};

export default OnboardingQuestionnaire;