import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, IndianRupee } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const ExpenseSummaryBar = () => {
  return (
    <Card className="card-hover card-glass p-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Month Selector */}
        <div className="flex items-center gap-3">
          <Select defaultValue="nov-2025">
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nov-2025">November 2025</SelectItem>
              <SelectItem value="oct-2025">October 2025</SelectItem>
              <SelectItem value="sep-2025">September 2025</SelectItem>
              <SelectItem value="aug-2025">August 2025</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Summary Stats */}
        <div className="flex flex-wrap items-center gap-6">
          {/* Total Income */}
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-success/10">
              <TrendingUp className="w-4 h-4 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Income</p>
              <p className="text-lg font-bold text-foreground">₹5,200</p>
            </div>
            <Badge variant="outline" className="text-success border-success/20 bg-success/5">
              +8%
            </Badge>
          </div>

          {/* Total Expenses */}
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-destructive/10">
              <TrendingDown className="w-4 h-4 text-destructive" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Expenses</p>
              <p className="text-lg font-bold text-foreground">₹3,180</p>
            </div>
            <Badge variant="outline" className="text-success border-success/20 bg-success/5">
              -5%
            </Badge>
          </div>

          {/* Net Savings */}
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <IndianRupee className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Savings</p>
              <p className="text-lg font-bold text-foreground">₹2,020</p>
            </div>
            <Badge variant="outline" className="text-success border-success/20 bg-success/5">
              +15%
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
};
