import { Calendar, Plus, Trash2, Edit, Bell, IndianRupee, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: number;
  category: string;
  isPaid: boolean;
  autoReminder: boolean;
}

const INITIAL_BILLS: Bill[] = [
  { id: "1", name: "Electricity Bill", amount: 2500, dueDate: 5, category: "Utilities", isPaid: true, autoReminder: true },
  { id: "2", name: "Internet & WiFi", amount: 1200, dueDate: 10, category: "Utilities", isPaid: false, autoReminder: true },
  { id: "3", name: "Netflix Subscription", amount: 649, dueDate: 15, category: "Entertainment", isPaid: false, autoReminder: true },
  { id: "4", name: "Rent", amount: 15000, dueDate: 1, category: "Housing", isPaid: true, autoReminder: true },
  { id: "5", name: "Mobile Bill", amount: 599, dueDate: 20, category: "Utilities", isPaid: false, autoReminder: true },
];

export const BillsRecurring = () => {
  const [bills, setBills] = useState<Bill[]>(INITIAL_BILLS);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const totalMonthly = bills.reduce((sum, bill) => sum + bill.amount, 0);
  const paidAmount = bills.filter(b => b.isPaid).reduce((sum, bill) => sum + bill.amount, 0);
  const unpaidAmount = totalMonthly - paidAmount;

  const togglePaid = (id: string) => {
    setBills(bills.map(bill => 
      bill.id === id ? { ...bill, isPaid: !bill.isPaid } : bill
    ));
  };

  const deleteBill = (id: string) => {
    setBills(bills.filter(bill => bill.id !== id));
  };

  return (
    <Card className="p-6 card-glass">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-semibold text-foreground">Bills & Recurring Payments</h3>
          </div>
          <p className="text-sm text-muted-foreground">Track monthly bills and subscriptions</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Bill
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Bill</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Bill Name</Label>
                <Input placeholder="e.g., Electricity, Rent" />
              </div>
              <div className="space-y-2">
                <Label>Amount (₹)</Label>
                <Input type="number" placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label>Due Date (Day of Month)</Label>
                <Input type="number" placeholder="1-31" min="1" max="31" />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utilities">Utilities</SelectItem>
                    <SelectItem value="housing">Housing</SelectItem>
                    <SelectItem value="entertainment">Entertainment</SelectItem>
                    <SelectItem value="insurance">Insurance</SelectItem>
                    <SelectItem value="subscriptions">Subscriptions</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full">Add Bill</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="p-4 bg-background/60 backdrop-blur border-border">
          <p className="text-xs text-muted-foreground mb-1">Total Monthly</p>
          <p className="text-xl font-bold text-foreground flex items-center gap-1">
            <IndianRupee className="w-4 h-4" />
            {totalMonthly.toLocaleString()}
          </p>
        </Card>
        
        <Card className="p-4 bg-success/5 backdrop-blur border-success/20">
          <p className="text-xs text-muted-foreground mb-1">Paid</p>
          <p className="text-xl font-bold text-success flex items-center gap-1">
            <IndianRupee className="w-4 h-4" />
            {paidAmount.toLocaleString()}
          </p>
        </Card>
        
        <Card className="p-4 bg-warning/5 backdrop-blur border-warning/20">
          <p className="text-xs text-muted-foreground mb-1">Unpaid</p>
          <p className="text-xl font-bold text-warning flex items-center gap-1">
            <IndianRupee className="w-4 h-4" />
            {unpaidAmount.toLocaleString()}
          </p>
        </Card>
      </div>

      {/* Bills List */}
      <div className="space-y-3">
        {bills.sort((a, b) => a.dueDate - b.dueDate).map((bill) => {
          const today = new Date().getDate();
          const daysUntilDue = bill.dueDate - today;
          const isUpcoming = daysUntilDue > 0 && daysUntilDue <= 5;
          const isOverdue = daysUntilDue < 0 && !bill.isPaid;

          return (
            <div
              key={bill.id}
              className={cn(
                "p-4 rounded-xl border transition-all",
                bill.isPaid && "bg-success/5 border-success/20",
                !bill.isPaid && isOverdue && "bg-destructive/5 border-destructive/20",
                !bill.isPaid && isUpcoming && "bg-warning/5 border-warning/20",
                !bill.isPaid && !isOverdue && !isUpcoming && "bg-card border-border"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-0 h-auto hover:bg-transparent"
                    onClick={() => togglePaid(bill.id)}
                  >
                    <CheckCircle2 
                      className={cn(
                        "w-5 h-5 flex-shrink-0 transition-colors",
                        bill.isPaid ? "text-success fill-success/20" : "text-muted-foreground"
                      )} 
                    />
                  </Button>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className={cn(
                        "font-semibold text-foreground truncate",
                        bill.isPaid && "line-through text-muted-foreground"
                      )}>
                        {bill.name}
                      </p>
                      {bill.autoReminder && (
                        <Bell className="w-3 h-3 text-primary flex-shrink-0" />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        {bill.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Due: {bill.dueDate}th of month
                      </span>
                      {isUpcoming && !bill.isPaid && (
                        <Badge className="text-xs bg-warning/10 text-warning border-warning/20">
                          Due in {daysUntilDue} day{daysUntilDue !== 1 ? 's' : ''}
                        </Badge>
                      )}
                      {isOverdue && (
                        <Badge className="text-xs bg-destructive/10 text-destructive border-destructive/20">
                          Overdue
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <p className={cn(
                    "text-lg font-bold flex items-center gap-1",
                    bill.isPaid ? "text-success" : "text-foreground"
                  )}>
                    <IndianRupee className="w-4 h-4" />
                    {bill.amount.toLocaleString()}
                  </p>
                  
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      onClick={() => deleteBill(bill.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
