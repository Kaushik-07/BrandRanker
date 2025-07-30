export interface ExperimentResult {
  id: number;
  companies: string[];
  categories: string[];
  results: {
    [category: string]: {
      rankings: { [brand: string]: number };
      reason: string;
      metadata?: {
        citations: Array<{
          title: string;
          url: string;
          date?: string;
        }>;
        search_results: Array<{
          title: string;
          url: string;
          date?: string;
        }>;
        usage: {
          prompt_tokens: number;
          completion_tokens: number;
          total_tokens: number;
          search_context_size: string;
        };
        model: string;
        created: number;
        search_context_size: string;
      };
    };
  };
  average_ranks: { [brand: string]: number };
  created_at: string;
}

export interface ExperimentResponse {
  experiment: ExperimentResult;
  message: string;
}

export interface ExperimentCreate {
  companies: string[];
  categories: string[];
}

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface Token {
  access_token: string;
  token_type: string;
  user: User;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

// Enhanced types for comparison system
export interface ComparisonResult {
  brand: string;
  // category: rank mapping
  [category: string]: number | string;
}

export interface ComparisonTableProps {
  data: ComparisonResult[];
  categories: string[];
  onCellClick?: (brand: string, category: string) => void;
}

export interface ComparisonChartProps {
  data: ComparisonResult[];
  categories: string[];
  onBarClick?: (brand: string, category: string) => void;
} 