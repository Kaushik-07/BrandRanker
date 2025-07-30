import React, { useState, useEffect } from 'react';

interface OnboardingGuideProps {
  isVisible: boolean;
  onClose: () => void;
  onComplete: () => void;
}

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: string;
  action?: string;
  highlight?: string;
}

const OnboardingGuide: React.FC<OnboardingGuideProps> = ({ isVisible, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const steps: OnboardingStep[] = [
    {
      id: 1,
      title: "Welcome to Brand Ranker! 🚀",
      description: "Let's get you started with AI-powered brand analysis. This tool helps you compare brands across different categories using advanced AI.",
      icon: "🎯",
      action: "Let's begin!"
    },
    {
      id: 2,
      title: "Add Your Companies",
      description: "Enter up to 5 companies you want to compare. For example: Nike, Adidas, Puma for sneakers, or Apple, Samsung, Google for smartphones.",
      icon: "🏢",
      highlight: "company-input",
      action: "Got it!"
    },
    {
      id: 3,
      title: "Choose Categories",
      description: "Select up to 3 categories to analyze. Think about market segments like 'Smartphones', 'Laptops', or 'Coffee Chains'.",
      icon: "📊",
      highlight: "category-input",
      action: "Understood!"
    },
    {
      id: 4,
      title: "AI Analysis",
      description: "Our AI will analyze each brand across all categories, considering market share, innovation, customer satisfaction, and competitive positioning.",
      icon: "🤖",
      action: "Sounds great!"
    },
    {
      id: 5,
      title: "View Results",
      description: "Explore interactive charts, detailed rankings, and AI-generated insights to understand brand performance across categories.",
      icon: "📈",
      action: "Show me!"
    },
    {
      id: 6,
      title: "Track Performance",
      description: "Monitor system performance, cache efficiency, and API response times with our real-time performance dashboard.",
      icon: "⚡",
      action: "Perfect!"
    },
    {
      id: 7,
      title: "You're All Set! 🎉",
      description: "You're ready to start creating powerful brand analysis experiments. The AI will provide comprehensive insights and rankings.",
      icon: "✅",
      action: "Start Creating!"
    }
  ];

  useEffect(() => {
    if (isVisible) {
      setCurrentStep(0);
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 500);
    }
  }, [isVisible]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
      }, 300);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  if (!isVisible) return null;

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className={`bg-white/95 backdrop-blur-md shadow-3xl rounded-3xl p-8 border border-white/20 max-w-md mx-4 transition-all duration-500 ${
        isAnimating ? 'scale-95 opacity-50' : 'scale-100 opacity-100'
      }`}>
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Step {currentStep + 1} of {steps.length}</span>
            <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Step Content */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg transform hover:scale-110 transition-transform duration-300">
            <span className="text-white text-3xl">{currentStepData.icon}</span>
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            {currentStepData.title}
          </h3>
          
          <p className="text-gray-600 leading-relaxed">
            {currentStepData.description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-3">
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Previous</span>
              </button>
            )}
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleSkip}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
            >
              Skip Tutorial
            </button>
            
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              {currentStepData.action}
            </button>
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center space-x-2 mt-6">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentStep 
                  ? 'bg-indigo-500 scale-125' 
                  : index < currentStep 
                    ? 'bg-green-500' 
                    : 'bg-gray-300'
              }`}
            ></div>
          ))}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Tips */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs">💡</span>
            </div>
            <div>
              <p className="text-sm text-blue-700 font-medium">Pro Tip</p>
              <p className="text-xs text-blue-600">
                {currentStep === 0 && "This tutorial will help you get the most out of Brand Ranker"}
                {currentStep === 1 && "Use specific, well-known brand names for better AI analysis"}
                {currentStep === 2 && "Choose categories that make sense for your selected brands"}
                {currentStep === 3 && "The AI considers multiple factors including market position and innovation"}
                {currentStep === 4 && "Results are cached for faster subsequent analysis"}
                {currentStep === 5 && "Monitor system performance in the bottom-right corner"}
                {currentStep === 6 && "You can always revisit this tutorial from the help menu"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingGuide; 