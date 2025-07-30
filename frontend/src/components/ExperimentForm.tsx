import React, { useState, useCallback, useMemo } from 'react';
import { experimentsAPI } from '../services/api';

interface ExperimentFormProps {
  onExperimentCreated: () => void;
  onAnalysisStart?: () => void;
  onAnalysisProgress?: (progress: number) => void;
  onAnalysisComplete?: () => void;
}

export const ExperimentForm: React.FC<ExperimentFormProps> = ({ 
  onExperimentCreated, 
  onAnalysisStart, 
  onAnalysisProgress, 
  onAnalysisComplete 
}) => {
  const [companies, setCompanies] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [companyInput, setCompanyInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  
  // Validation states
  const [isValidatingCompany, setIsValidatingCompany] = useState(false);
  const [isValidatingCategory, setIsValidatingCategory] = useState(false);

  // Memoized validation rules
  const validationRules = useMemo(() => ({
    maxCompanies: 5,
    maxCategories: 3,
    minCompanyLength: 2,
    maxCompanyLength: 50,
    minCategoryLength: 2,
    maxCategoryLength: 50
  }), []);

  // Validate company with Perplexity API
  const validateCompanyWithAPI = async (companyName: string): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:8000/api/validate/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ companies: [companyName.trim()] })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Validation failed');
      }

      const result = await response.json();
      // Check if the company is in the valid_items list
      const isValid = result.valid && result.valid_items.includes(companyName.trim());
      return isValid;
    } catch (error) {
      console.error('Company validation error:', error);
      return false;
    }
  };

  // Validate category with Perplexity API
  const validateCategoryWithAPI = async (categoryName: string): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:8000/api/validate/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ categories: [categoryName.trim()] })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Validation failed');
      }

      const result = await response.json();
      // Check if the category is in the valid_items list
      const isValid = result.valid && result.valid_items.includes(categoryName.trim());
      return isValid;
    } catch (error) {
      console.error('Category validation error:', error);
      return false;
    }
  };

  // Add company handler with API validation
  const addCompany = useCallback(async () => {
    if (!companyInput.trim()) return;
    
    if (companies.length >= validationRules.maxCompanies) {
      setError(`Maximum ${validationRules.maxCompanies} companies allowed`);
      return;
    }

    // Case-insensitive duplicate check
    if (companies.some(c => c.toLowerCase() === companyInput.trim().toLowerCase())) {
      setError('This company is already added');
      return;
    }

    // Show validation in progress
    setIsValidatingCompany(true);
    setError(null);

    try {
      // Validate with Perplexity API
      const isValid = await validateCompanyWithAPI(companyInput);
      
      if (isValid) {
        setCompanies([...companies, companyInput.trim()]);
        setCompanyInput('');
        setError(null);
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.company;
          return newErrors;
        });
      } else {
        setError('Invalid company name. Please enter a real brand name.');
      }
    } catch (error) {
      setError('Failed to validate company. Please try again.');
    } finally {
      setIsValidatingCompany(false);
    }
  }, [companyInput, companies, validationRules.maxCompanies]);

  // Remove company handler
  const removeCompany = useCallback((index: number) => {
    setCompanies(companies.filter((_, i) => i !== index));
  }, [companies]);

  // Add category handler with API validation
  const addCategory = useCallback(async () => {
    if (!categoryInput.trim()) return;
    
    if (categories.length >= validationRules.maxCategories) {
      setError(`Maximum ${validationRules.maxCategories} categories allowed`);
      return;
    }

    // Case-insensitive duplicate check
    if (categories.some(c => c.toLowerCase() === categoryInput.trim().toLowerCase())) {
      setError('This category is already added');
      return;
    }

    // Show validation in progress
    setIsValidatingCategory(true);
    setError(null);

    try {
      // Validate with Perplexity API
      const isValid = await validateCategoryWithAPI(categoryInput);
      
      if (isValid) {
        setCategories([...categories, categoryInput.trim()]);
        setCategoryInput('');
        setError(null);
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.category;
          return newErrors;
        });
      } else {
        setError('Invalid category name. Please enter a real category.');
      }
    } catch (error) {
      setError('Failed to validate category. Please try again.');
    } finally {
      setIsValidatingCategory(false);
    }
  }, [categoryInput, categories, validationRules.maxCategories]);

  // Remove category handler
  const removeCategory = useCallback((index: number) => {
    setCategories(categories.filter((_, i) => i !== index));
  }, [categories]);

  // Handle input changes
  const handleCompanyInputChange = useCallback((value: string) => {
    setCompanyInput(value);
    if (error) setError(null);
  }, [error]);

  const handleCategoryInputChange = useCallback((value: string) => {
    setCategoryInput(value);
    if (error) setError(null);
  }, [error]);

  // Memoized form validation
  const isFormValid = useMemo(() => {
    return companies.length >= 1 && 
           categories.length >= 1;
  }, [companies, categories]);

  // Optimistic UI update for experiment creation
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      // Start analysis
      onAnalysisStart?.();
      
      // Simulate progress for each category
      for (let i = 0; i < categories.length; i++) {
        const progress = ((i + 1) / categories.length) * 100;
        onAnalysisProgress?.(progress);
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const response = await experimentsAPI.createExperiment({
        companies: companies,
        categories: categories
      });

      if (response) {
        setCompanies([]);
        setCategories([]);
        setCompanyInput('');
        setCategoryInput('');
        setValidationErrors({});
        
        // Complete analysis
        onAnalysisComplete?.();
        onExperimentCreated();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create experiment');
    } finally {
      setIsLoading(false);
    }
  }, [companies, categories, isFormValid, isLoading, onExperimentCreated, onAnalysisStart, onAnalysisProgress, onAnalysisComplete]);

  return (
    <div className="experiment-form-container">
      <h3>Create New Experiment</h3>
      
      <form onSubmit={handleSubmit} className="experiment-form">
        {/* Companies Section */}
        <div className="form-section">
          <label>Companies (up to {validationRules.maxCompanies})</label>
          <div className="input-group">
            <div className="input-with-button">
              <input
                type="text"
                value={companyInput}
                onChange={(e) => handleCompanyInputChange(e.target.value)}
                placeholder="Enter company name"
                className={validationErrors.company ? 'error' : ''}
                disabled={isLoading || isValidatingCompany}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCompany())}
              />
              <button
                type="button"
                onClick={addCompany}
                disabled={!companyInput.trim() || isLoading || companies.length >= validationRules.maxCompanies || isValidatingCompany}
                className="add-button"
              >
                {isValidatingCompany ? 'Validating...' : 'Add'}
              </button>
            </div>
            {validationErrors.company && (
              <span className="error-message">{validationErrors.company}</span>
            )}
          </div>
          
          {/* Display added companies */}
          {companies.length > 0 && (
            <div className="tags-container">
              {companies.map((company, index) => (
                <div key={index} className="tag">
                  <span>{company}</span>
                  <button
                    type="button"
                    onClick={() => removeCompany(index)}
                    className="remove-tag"
                    disabled={isLoading}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Categories Section */}
        <div className="form-section">
          <label>Categories (up to {validationRules.maxCategories})</label>
          <div className="input-group">
            <div className="input-with-button">
              <input
                type="text"
                value={categoryInput}
                onChange={(e) => handleCategoryInputChange(e.target.value)}
                placeholder="Enter category name"
                className={validationErrors.category ? 'error' : ''}
                disabled={isLoading || isValidatingCategory}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCategory())}
              />
              <button
                type="button"
                onClick={addCategory}
                disabled={!categoryInput.trim() || isLoading || categories.length >= validationRules.maxCategories || isValidatingCategory}
                className="add-button"
              >
                {isValidatingCategory ? 'Validating...' : 'Add'}
              </button>
            </div>
            {validationErrors.category && (
              <span className="error-message">{validationErrors.category}</span>
            )}
          </div>
          
          {/* Display added categories */}
          {categories.length > 0 && (
            <div className="tags-container">
              {categories.map((category, index) => (
                <div key={index} className="tag">
                  <span>{category}</span>
                  <button
                    type="button"
                    onClick={() => removeCategory(index)}
                    className="remove-tag"
                    disabled={isLoading}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="error-message">{error}</div>
        )}

        <button
          type="submit"
          disabled={!isFormValid || isLoading || isValidatingCompany || isValidatingCategory}
          className={`submit-button ${isLoading ? 'loading' : ''}`}
        >
          {isLoading ? 'Creating...' : 'Create Experiment'}
        </button>
      </form>
    </div>
  );
}; 