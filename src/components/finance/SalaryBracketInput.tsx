import { Wallet, Edit3, Check, X, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from "react";
import { toast } from "sonner";

interface SalaryBracketInputProps {
  onSalaryChange: (salary: number, increment: number, bracket: string) => void;
}

export const SalaryBracketInput = ({ onSalaryChange }: SalaryBracketInputProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [monthlySalary, setMonthlySalary] = useState(50000);
  const [annualIncrement, setAnnualIncrement] = useState(8);
  const [previewOtherBrackets, setPreviewOtherBrackets] = useState(false);
  
  const [tempMonthlySalary, setTempMonthlySalary] = useState(monthlySalary);
  const [tempAnnualIncrement, setTempAnnualIncrement] = useState(annualIncrement);

  const detectBracket = (salary: number): string => {
    if (salary < 25000) return "15K-25K";
    if (salary < 50000) return "25K-50K";
    if (salary < 75000) return "50K-75K";
    if (salary < 100000) return "75K-1L";
    return "1L+";
  };

  const bracket = detectBracket(monthlySalary);
  const annualSalary = monthlySalary * 12;

  const handleEdit = () => {
    setTempMonthlySalary(monthlySalary);
    setTempAnnualIncrement(annualIncrement);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (tempMonthlySalary <= 0 || tempAnnualIncrement < 0 || tempAnnualIncrement > 50) {
      toast.error("Please enter valid salary and increment values");
      return;
    }
    setMonthlySalary(tempMonthlySalary);
    setAnnualIncrement(tempAnnualIncrement);
    setIsEditing(false);
    
    const newBracket = detectBracket(tempMonthlySalary);
    onSalaryChange(tempMonthlySalary, tempAnnualIncrement, newBracket);
    toast.success("Salary details updated successfully!");
  };

  const handleCancel = () => {
    setTempMonthlySalary(monthlySalary);
    setTempAnnualIncrement(annualIncrement);
    setIsEditing(false);
  };

  return (
    <Card className="card-hover card-glass">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Wallet className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Salary & Bracket Detection</CardTitle>
              <p className="text-sm text-muted-foreground">Configure your income for personalized planning</p>
            </div>
          </div>
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={handleEdit} className="gap-2">
              <Edit3 className="w-4 h-4" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCancel} className="gap-2">
                <X className="w-4 h-4" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} className="gap-2">
                <Check className="w-4 h-4" />
                Save
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Salary Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="monthly-salary" className="text-sm font-medium">
              Monthly Salary
            </Label>
            {isEditing ? (
              <Input
                id="monthly-salary"
                type="number"
                value={tempMonthlySalary}
                onChange={(e) => setTempMonthlySalary(parseInt(e.target.value) || 0)}
                className="text-base"
                placeholder="Enter monthly salary"
              />
            ) : (
              <div className="px-3 py-2 rounded-md bg-muted/50 border border-border">
                <p className="text-lg font-bold text-foreground">₹{monthlySalary.toLocaleString()}</p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="annual-increment" className="text-sm font-medium flex items-center gap-1">
              Annual Increment (%)
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-3.5 h-3.5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Expected yearly salary increase percentage</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            {isEditing ? (
              <Input
                id="annual-increment"
                type="number"
                value={tempAnnualIncrement}
                onChange={(e) => setTempAnnualIncrement(parseFloat(e.target.value) || 0)}
                className="text-base"
                placeholder="e.g., 8"
                step="0.5"
              />
            ) : (
              <div className="px-3 py-2 rounded-md bg-muted/50 border border-border">
                <p className="text-lg font-bold text-foreground">{annualIncrement}%</p>
              </div>
            )}
          </div>
        </div>

        {/* Bracket Detection */}
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-foreground mb-1">Detected Bracket</p>
              <p className="text-xs text-muted-foreground">Based on your monthly salary</p>
            </div>
            <Badge variant="default" className="text-sm px-3 py-1">
              {bracket}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/50">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Annual Salary</p>
              <p className="text-sm font-semibold text-foreground">₹{annualSalary.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Yearly Growth</p>
              <p className="text-sm font-semibold text-success">+₹{Math.round(annualSalary * annualIncrement / 100).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Preview Other Brackets Toggle */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
          <div className="flex-1">
            <Label htmlFor="preview-toggle" className="text-sm font-medium cursor-pointer">
              Preview Other Brackets
            </Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              Compare planning rules across different income levels
            </p>
          </div>
          <Switch
            id="preview-toggle"
            checked={previewOtherBrackets}
            onCheckedChange={setPreviewOtherBrackets}
          />
        </div>

        {previewOtherBrackets && (
          <div className="space-y-2 p-3 rounded-lg bg-muted/10 border border-border">
            <p className="text-xs font-semibold text-foreground mb-2">Available Brackets</p>
            {["15K-25K", "25K-50K", "50K-75K", "75K-1L", "1L+"].map((b) => (
              <div
                key={b}
                className={`flex items-center justify-between p-2 rounded-md ${
                  b === bracket
                    ? "bg-primary/10 border border-primary/30"
                    : "bg-muted/30"
                }`}
              >
                <span className="text-xs font-medium">{b}</span>
                {b === bracket && (
                  <Badge variant="outline" className="text-xs">Current</Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
