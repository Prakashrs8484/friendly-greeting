import { Brain, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import { SalaryBracketInput } from "./SalaryBracketInput";
import { SalaryProjection } from "./SalaryProjection";
import { SmartBudgetAllocator } from "./SmartBudgetAllocator";
import { EmergencyFundPlanner } from "./EmergencyFundPlanner";
import { InvestmentDistribution } from "./InvestmentDistribution";

export const IntelligentPlanning = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [monthlySalary, setMonthlySalary] = useState(50000);
  const [annualIncrement, setAnnualIncrement] = useState(8);
  const [bracket, setBracket] = useState("50K-75K");

  const handleSalaryChange = (salary: number, increment: number, detectedBracket: string) => {
    setMonthlySalary(salary);
    setAnnualIncrement(increment);
    setBracket(detectedBracket);
  };

  // Calculate derived values
  const monthlyExpenses = Math.round(monthlySalary * 0.55); // Approximate based on bracket
  const monthlyInvestment = Math.round(monthlySalary * 0.20); // 20% for investments

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="card-hover card-glass border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20 border border-primary/30">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Intelligent Financial Planning System</CardTitle>
                <p className="text-sm text-muted-foreground">
                  AI-powered budget allocation, projections, and investment planning
                </p>
              </div>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </Button>
            </CollapsibleTrigger>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <div className="px-6 pb-6 space-y-4">
            {/* Salary & Bracket Input */}
            <SalaryBracketInput onSalaryChange={handleSalaryChange} />

            {/* Salary Projection */}
            <SalaryProjection 
              startingSalary={monthlySalary * 12} 
              annualIncrement={annualIncrement} 
            />

            {/* Smart Budget Allocator */}
            <SmartBudgetAllocator 
              monthlySalary={monthlySalary} 
              bracket={bracket} 
            />

            {/* Emergency Fund Planner */}
            <EmergencyFundPlanner 
              monthlyExpenses={monthlyExpenses} 
              bracket={bracket} 
            />

            {/* Investment Distribution */}
            <InvestmentDistribution 
              monthlyInvestmentAmount={monthlyInvestment} 
            />
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
