import React from 'react';

interface SuggestedQuestionsProps {
  onQuestionClick: (question: string) => void;
}

const SuggestedQuestions: React.FC<SuggestedQuestionsProps> = ({ onQuestionClick }) => {
  const questions = [
    { text: 'Tell me about AccountEase Pro', icon: '📦' },
    { text: 'Find documentation for AccuBooks Pro', icon: '📄' },
    { text: 'What is the return policy?', icon: '🔄' },
    { text: 'Show my service history', icon: '📋' },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {questions.map((q, i) => (
          <button
            key={i}
            onClick={() => onQuestionClick(q.text)}
            className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-gray-300 transition-all text-left"
          >
            <span className="text-2xl">{q.icon}</span>
            <span className="text-gray-700 text-sm font-medium">{q.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SuggestedQuestions;
