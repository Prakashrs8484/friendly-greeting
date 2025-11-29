import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface FinancialData {
  // Income & Expenses
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  
  // Investments
  totalInvested: number;
  currentInvestmentValue: number;
  unrealizedGains: number;
  unrealizedGainsPercent: number;
  
  // Overall
  netWorth: number;
  monthlyChangePercent: number;
  
  // Category breakdowns
  expenseCategories: Record<string, number>;
  incomeCategories: Record<string, number>;
  investmentCategories: Record<string, { invested: number; current: number; }>;
  
  // Investment details
  topPerformers: Array<{ name: string; returns: number; assetType: string; }>;
  riskDistribution: { low: number; medium: number; high: number; };
  sipContributions: number;
  
  // Financial Planning
  emergencyFund: {
    required: number;
    current: number;
    progress: number;
  };
  allocation: {
    recommended: {
      emergencyFund: number;
      veryShortTerm: number;
      shortMediumTerm: number;
      longTermInvestments: number;
    };
    actual: {
      emergencyFund: number;
      veryShortTerm: number;
      shortMediumTerm: number;
      longTermInvestments: number;
    };
  };
  goals: {
    veryShortTerm: Array<{ name: string; amount: number; deadline: string; }>;
    shortMediumTerm: Array<{ name: string; amount: number; deadline: string; }>;
    longTerm: Array<{ name: string; amount: number; deadline: string; }>;
  };
  
  // Intelligent Planning Data (client-side)
  intelligentPlanning?: {
    monthlySalary: number;
    annualIncrement: number;
    bracket: string;
    budgetAllocations: any;
    investmentDistribution: any;
    salaryProjection: any[];
  };
}

interface FinancialContextType {
  financialData: FinancialData;
  refreshFinancialData: () => Promise<void>;
  isLoading: boolean;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export const FinancialProvider = ({ children }: { children: ReactNode }) => {
  const [financialData, setFinancialData] = useState<FinancialData>({
    totalIncome: 5200,
    totalExpenses: 3180,
    netSavings: 2020,
    totalInvested: 275000,
    currentInvestmentValue: 303000,
    unrealizedGains: 28000,
    unrealizedGainsPercent: 10.18,
    netWorth: 305020,
    monthlyChangePercent: 8.5,
    expenseCategories: {
      food: 850,
      transport: 420,
      bills: 980,
      entertainment: 350,
      shopping: 280,
      health: 300
    },
    incomeCategories: {
      salary: 3800,
      freelance: 800,
      investment: 400,
      other: 200
    },
    investmentCategories: {
      'mutual-funds': { invested: 120000, current: 135000 },
      'stocks': { invested: 80000, current: 92000 },
      'debt-funds': { invested: 40000, current: 42000 },
      'gold-silver': { invested: 25000, current: 26000 },
      'crypto': { invested: 10000, current: 8000 }
    },
    topPerformers: [
      { name: 'HDFC Index Fund', returns: 18.5, assetType: 'mutual-funds' },
      { name: 'TCS Stock', returns: 15.2, assetType: 'stocks' },
      { name: 'Gold ETF', returns: 8.3, assetType: 'gold-silver' }
    ],
    riskDistribution: { low: 67000, medium: 160000, high: 76000 },
    sipContributions: 15000,
    emergencyFund: {
      required: 3180 * 6, // 6 months of expenses
      current: 8500,
      progress: 45
    },
    allocation: {
      recommended: {
        emergencyFund: 25,
        veryShortTerm: 15,
        shortMediumTerm: 20,
        longTermInvestments: 40
      },
      actual: {
        emergencyFund: 10,
        veryShortTerm: 8,
        shortMediumTerm: 12,
        longTermInvestments: 70
      }
    },
    goals: {
      veryShortTerm: [
        { name: 'New Laptop', amount: 2000, deadline: 'Mar 2025' }
      ],
      shortMediumTerm: [
        { name: 'Vacation to Japan', amount: 5000, deadline: 'Jun 2025' },
        { name: 'Car Down Payment', amount: 50000, deadline: 'Dec 2025' }
      ],
      longTerm: [
        { name: 'Retirement Fund', amount: 5000000, deadline: 'Dec 2050' },
        { name: 'Dream Home', amount: 2000000, deadline: 'Dec 2030' }
      ]
    }
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const refreshFinancialData = async () => {
    setIsLoading(true);
    try {
      // In production, fetch from your backend API
      // const response = await fetch('/api/finance/unified-stats');
      // const data = await response.json();
      // setFinancialData(data);
      
      // For now, recalculate from existing data
      setFinancialData(prev => ({
        ...prev,
        netWorth: prev.netSavings + prev.currentInvestmentValue,
        netSavings: prev.totalIncome - prev.totalExpenses,
        unrealizedGains: prev.currentInvestmentValue - prev.totalInvested,
        unrealizedGainsPercent: ((prev.currentInvestmentValue - prev.totalInvested) / prev.totalInvested) * 100
      }));
    } catch (error) {
      console.error('Error refreshing financial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshFinancialData();
  }, []);

  return (
    <FinancialContext.Provider value={{ financialData, refreshFinancialData, isLoading }}>
      {children}
    </FinancialContext.Provider>
  );
};

export const useFinancialContext = () => {
  const context = useContext(FinancialContext);
  if (!context) {
    throw new Error('useFinancialContext must be used within FinancialProvider');
  }
  return context;
};
