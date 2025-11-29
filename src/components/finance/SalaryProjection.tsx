import { TrendingUp, Download, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState, useMemo } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface SalaryProjectionProps {
  startingSalary: number;
  annualIncrement: number;
}

export const SalaryProjection = ({ startingSalary, annualIncrement }: SalaryProjectionProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const projectionData = useMemo(() => {
    const data = [];
    const currentYear = new Date().getFullYear();
    let salary = startingSalary;

    for (let i = 0; i <= 20; i++) {
      data.push({
        year: currentYear + i,
        salary: Math.round(salary),
        monthlySalary: Math.round(salary / 12),
      });
      salary *= (1 + annualIncrement / 100);
    }
    return data;
  }, [startingSalary, annualIncrement]);

  const handleExportCSV = () => {
    const headers = ["Year", "Annual Salary", "Monthly Salary"];
    const rows = projectionData.map(d => [d.year, d.salary, d.monthlySalary]);
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `salary_projection_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="card-hover card-glass">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Salary Projection (20+ Years)</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Based on {annualIncrement}% annual increment
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-2">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export CSV</span>
              </Button>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent>
            <div className="h-[300px] mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={projectionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="year" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    tickFormatter={(value) => `₹${(value / 100000).toFixed(1)}L`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, "Annual Salary"]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="salary" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))", r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium">Year</th>
                    <th className="text-right p-3 font-medium">Annual Salary</th>
                    <th className="text-right p-3 font-medium">Monthly Salary</th>
                  </tr>
                </thead>
                <tbody>
                  {projectionData.map((row, idx) => (
                    <tr key={idx} className="border-t border-border hover:bg-muted/20">
                      <td className="p-3">{row.year}</td>
                      <td className="p-3 text-right font-medium">₹{row.salary.toLocaleString()}</td>
                      <td className="p-3 text-right text-muted-foreground">₹{row.monthlySalary.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
