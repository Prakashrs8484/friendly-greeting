import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BarChart3, TrendingUp, Brain } from "lucide-react";
import { CategoryInsights } from "./CategoryInsights";
import { ExpenseForecast } from "./ExpenseForecast";
import { AIFinanceInsights } from "./AIFinanceInsights";
import { useState } from "react";

interface CategoryAnalysisPanelProps {
  category: string;
  onBack: () => void;
  mode?: "expense" | "income";
}

export const CategoryAnalysisPanel = ({ category, onBack, mode = "expense" }: CategoryAnalysisPanelProps) => {
  const [activeTab, setActiveTab] = useState("analytics");
  
  const isIncomeMode = mode === "income";

  return (
    <Card className="card-glass border-0 shadow-lg w-full overflow-hidden">
      <CardHeader className="bg-card/95 backdrop-blur-sm border-b border-border/50 p-3 sm:p-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-1.5 shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm">Back</span>
          </Button>
          <div className="min-w-0 flex-1">
            <h2 className="text-base sm:text-xl font-semibold truncate">{category} Insights</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 truncate">
              {isIncomeMode ? "Detailed income analytics and projections" : "Detailed analytics and forecasts"}
            </p>
          </div>
        </div>
      </CardHeader>

      <div className="border-b border-border/50 overflow-x-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-3 bg-muted/30 rounded-none h-auto">
            <TabsTrigger 
              value="analytics"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 text-xs sm:text-sm"
            >
              <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger 
              value="forecast"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 text-xs sm:text-sm"
            >
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Forecast</span>
            </TabsTrigger>
            <TabsTrigger 
              value="ai-insights"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 text-xs sm:text-sm"
            >
              <Brain className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">AI Insights</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <CardContent className="p-3 sm:p-6 w-full overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="analytics" className="mt-0 w-full">
            <CategoryInsights category={category} onClose={onBack} mode={mode} />
          </TabsContent>
          <TabsContent value="forecast" className="mt-0 w-full">
            <ExpenseForecast mode={mode} />
          </TabsContent>
          <TabsContent value="ai-insights" className="mt-0 w-full">
            <AIFinanceInsights mode={mode} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
