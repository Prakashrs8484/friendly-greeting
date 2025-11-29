import { IndianRupee, TrendingUp, Target, PiggyBank, Plus, FileText, Download } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import AgentChat from "@/components/AgentChat";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { FinancialGoals } from "@/components/finance/FinancialGoals";
import { TransactionsList } from "@/components/finance/TransactionsList";
import { ExpenseSummaryBar } from "@/components/finance/ExpenseSummaryBar.tsx";
import { AnalyticsDashboard } from "@/components/finance/AnalyticsDashboard";
import { BudgetPlanner } from "@/components/finance/BudgetPlanner";
import { InvestmentTracker } from "@/components/finance/InvestmentTracker";
import { InvestmentAnalytics } from "@/components/finance/InvestmentAnalytics";
import { FinancialPlanning } from "@/components/finance/FinancialPlanning";
import { BillsRecurring } from "@/components/finance/BillsRecurring";
import { IntelligentPlanning } from "@/components/finance/IntelligentPlanning";
import { FinancialProvider, useFinancialContext } from "@/contexts/FinancialContext";

const FinancePageContent = () => {
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);
  const [addIncomeOpen, setAddIncomeOpen] = useState(false);
  const [addGoalOpen, setAddGoalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { financialData, refreshFinancialData } = useFinancialContext();

  return (
    <DashboardLayout hideNavigation>
      <div className="page-container animate-fade-in">
        {/* Header with Action Buttons */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="min-w-0">
            <h1 className="page-title">
              Finance Workspace
            </h1>
            <p className="page-subtitle">AI-powered financial planning, tracking, and insights</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
          <Dialog open={addExpenseOpen} onOpenChange={setAddExpenseOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Expense</span>
                <span className="sm:hidden">Expense</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Expense</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input type="number" placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="food">Food & Dining</SelectItem>
                      <SelectItem value="transport">Transportation</SelectItem>
                      <SelectItem value="bills">Bills & Utilities</SelectItem>
                      <SelectItem value="entertainment">Entertainment</SelectItem>
                      <SelectItem value="shopping">Shopping</SelectItem>
                      <SelectItem value="health">Healthcare</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input placeholder="What was this expense for?" />
                </div>
                <Button className="w-full">Add Expense</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={addIncomeOpen} onOpenChange={setAddIncomeOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Income</span>
                <span className="sm:hidden">Income</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Income</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input type="number" placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <Label>Source</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="salary">Salary</SelectItem>
                      <SelectItem value="freelance">Freelance</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="investment">Investment Returns</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input placeholder="Income source details" />
                </div>
                <Button className="w-full">Add Income</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={addGoalOpen} onOpenChange={setAddGoalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Target className="w-4 h-4" />
                <span className="hidden sm:inline">Add Goal</span>
                <span className="sm:hidden">Goal</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Financial Goal</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Goal Name</Label>
                  <Input placeholder="e.g., Emergency Fund, Vacation" />
                </div>
                <div className="space-y-2">
                  <Label>Target Amount</Label>
                  <Input type="number" placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <Label>Deadline</Label>
                  <Input type="date" />
                </div>
                <Button className="w-full">Create Goal</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" className="gap-2">
            <FileText className="w-4 h-4" />
            <span className="hidden md:inline">Generate Report</span>
            <span className="md:hidden">Report</span>
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export Data
          </Button>
            
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              <IndianRupee className="w-4 h-4 mr-1.5" />
              Active Agent
            </Badge>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left Column - Functional & Interactive Sections */}
          <div className="space-y-4">
            {/* Finance Agent Chat */}
            <div className="h-[600px]">
              <AgentChat
                agentName="Finance Agent"
                agentIcon={IndianRupee}
                placeholder="Ask about budgets, expenses, savings, investments..."
                financialContext={{
                  totalIncome: financialData.totalIncome,
                  totalExpenses: financialData.totalExpenses,
                  netSavings: financialData.netSavings,
                  totalInvested: financialData.totalInvested,
                  currentInvestmentValue: financialData.currentInvestmentValue,
                  unrealizedGains: financialData.unrealizedGains,
                  netWorth: financialData.netWorth,
                  emergencyFund: financialData.emergencyFund,
                  allocation: financialData.allocation,
                  goals: financialData.goals,
                }}
                initialMessages={[
                  {
                    role: "agent",
                    content: `Hello! I'm your finance agent. Your current net worth is ₹${(financialData.netWorth / 1000).toFixed(1)}K with ₹${(financialData.currentInvestmentValue / 1000).toFixed(1)}K in investments. Your emergency fund is ${financialData.emergencyFund.progress}% complete. Ask me anything about your finances!`,
                    timestamp: new Date(),
                  },
                ]}
              />
            </div>

            {/* Recent Transactions */}
            <TransactionsList />

            {/* Financial Goals */}
            <FinancialGoals />
          </div>

          {/* Right Column - Analytics & Insights */}
          <div className="space-y-4">
            {/* Overview Summary Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="card-hover card-glass p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-success/10 flex-shrink-0">
                    <TrendingUp className="w-4 h-4 text-success" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-1.5 font-medium">Monthly Income</p>
                <p className="text-2xl font-bold text-foreground mb-1">₹{(financialData.totalIncome / 1000).toFixed(1)}K</p>
                <p className="text-xs font-medium text-success">+8%</p>
              </Card>

              <Card className="card-hover card-glass p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-destructive/10 flex-shrink-0">
                    <PiggyBank className="w-4 h-4 text-destructive" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-1.5 font-medium">Total Expenses</p>
                <p className="text-2xl font-bold text-foreground mb-1">₹{(financialData.totalExpenses / 1000).toFixed(1)}K</p>
                <p className="text-xs font-medium text-success">-5%</p>
              </Card>

              <Card className="card-hover card-glass p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-primary/10 flex-shrink-0">
                    <IndianRupee className="w-4 h-4 text-primary" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-1.5 font-medium">Net Savings</p>
                <p className="text-2xl font-bold text-foreground mb-1">₹{(financialData.netSavings / 1000).toFixed(1)}K</p>
                <p className="text-xs font-medium text-success">+15%</p>
              </Card>

              <Card className="card-hover card-glass p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 flex-shrink-0">
                    <Target className="w-4 h-4 text-purple-600" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-1.5 font-medium">Investments</p>
                <p className="text-2xl font-bold text-foreground mb-1">₹{(financialData.currentInvestmentValue / 1000).toFixed(1)}K</p>
                <p className="text-xs font-medium text-success">+{financialData.unrealizedGainsPercent.toFixed(1)}%</p>
              </Card>
            </div>

            {/* Expense Summary Bar */}
            <ExpenseSummaryBar />

            {/* Budget Planner - Separate Entity */}
            <BudgetPlanner />

            {/* Unified Analytics Dashboard */}
            <AnalyticsDashboard 
              selectedCategory={selectedCategory}
              onCategorySelect={setSelectedCategory}
            />
          </div>
        </div>

        {/* Intelligent Financial Planning System - Full Width */}
        <div className="mt-6">
          <IntelligentPlanning />
        </div>

        {/* Complete Financial Planning Section - Full Width */}
        <div className="mt-4 space-y-4">
          <FinancialPlanning />
        </div>

        {/* Bills & Recurring Payments - Full Width */}
        <div className="mt-4">
          <BillsRecurring />
        </div>

        {/* Investment Section - Full Width */}
        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Investment Portfolio</h2>
              <p className="text-sm text-muted-foreground">Track and grow your investment wealth</p>
            </div>
          </div>

          <Tabs defaultValue="tracker" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3 mb-6">
              <TabsTrigger value="tracker">Investment Tracker</TabsTrigger>
              <TabsTrigger value="analytics">Analytics & Insights</TabsTrigger>
              <TabsTrigger value="agent">AI Assistant</TabsTrigger>
            </TabsList>
            <TabsContent value="tracker" className="space-y-6">
              <InvestmentTracker onInvestmentChange={refreshFinancialData} />
            </TabsContent>
            <TabsContent value="analytics" className="space-y-6">
              <InvestmentAnalytics />
            </TabsContent>
            <TabsContent value="agent" className="space-y-6">
              <div className="h-[600px]">
                <AgentChat
                  agentName="Investment Advisor"
                  agentIcon={TrendingUp}
                  placeholder="Ask about portfolio allocation, returns, risk management..."
                  financialContext={{
                    totalIncome: financialData.totalIncome,
                    totalExpenses: financialData.totalExpenses,
                    netSavings: financialData.netSavings,
                    totalInvested: financialData.totalInvested,
                    currentInvestmentValue: financialData.currentInvestmentValue,
                    unrealizedGains: financialData.unrealizedGains,
                    netWorth: financialData.netWorth,
                    emergencyFund: financialData.emergencyFund,
                    allocation: financialData.allocation,
                    goals: financialData.goals,
                  }}
                  initialMessages={[
                    {
                      role: "agent",
                      content: `Hi! I'm your investment advisor. Your portfolio value is ₹${(financialData.currentInvestmentValue / 1000).toFixed(1)}K with ${financialData.unrealizedGainsPercent.toFixed(1)}% returns. Your long-term allocation is ${financialData.allocation.actual.longTermInvestments}% (recommended: ${financialData.allocation.recommended.longTermInvestments}%). Ask me about diversification, risk management, or portfolio optimization!`,
                      timestamp: new Date(),
                    },
                  ]}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

const FinancePage = () => {
  return (
    <FinancialProvider>
      <FinancePageContent />
    </FinancialProvider>
  );
};

export default FinancePage;
