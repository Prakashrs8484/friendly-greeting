import { Wallet, Download, Search, Filter } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

interface Transaction {
  date: string;
  description: string;
  category: string;
  amount: string;
  type: "income" | "expense";
  paymentMethod?: string;
}

const recentTransactions: Transaction[] = [
  {
    date: "Oct 15",
    description: "Grocery Shopping",
    category: "Food",
    amount: "125",
    type: "expense",
    paymentMethod: "Credit Card",
  },
  {
    date: "Oct 14",
    description: "Freelance Project",
    category: "Income",
    amount: "800",
    type: "income",
    paymentMethod: "Bank Transfer",
  },
  {
    date: "Oct 13",
    description: "Electricity Bill",
    category: "Bills",
    amount: "85",
    type: "expense",
    paymentMethod: "Auto-pay",
  },
  {
    date: "Oct 12",
    description: "Movie Tickets",
    category: "Entertainment",
    amount: "45",
    type: "expense",
    paymentMethod: "Debit Card",
  },
  {
    date: "Oct 11",
    description: "Salary Credit",
    category: "Income",
    amount: "5200",
    type: "income",
    paymentMethod: "Direct Deposit",
  },
  {
    date: "Oct 10",
    description: "Gas Station",
    category: "Transport",
    amount: "60",
    type: "expense",
    paymentMethod: "Credit Card",
  },
  {
    date: "Oct 09",
    description: "Restaurant Dinner",
    category: "Food",
    amount: "85",
    type: "expense",
    paymentMethod: "Credit Card",
  },
  {
    date: "Oct 08",
    description: "Online Course",
    category: "Education",
    amount: "149",
    type: "expense",
    paymentMethod: "PayPal",
  },
];

export const TransactionsList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");

  const filteredTransactions = recentTransactions.filter((t) => {
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || t.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleExport = () => {
    // Simple CSV export
    const headers = ["Date", "Description", "Category", "Amount", "Type", "Payment Method"];
    const rows = filteredTransactions.map(t => [
      t.date,
      t.description,
      t.category,
      t.amount,
      t.type,
      t.paymentMethod || ""
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(","))
      .join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card className="p-4 sm:p-6 bg-card/50 backdrop-blur border-border">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-5 h-5 text-primary" />
            <h3 className="text-lg sm:text-xl font-semibold text-foreground">Recent Transactions</h3>
          </div>
          <p className="text-sm text-muted-foreground">{filteredTransactions.length} transactions</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterType} onValueChange={(v) => setFilterType(v as any)}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="income">Income Only</SelectItem>
            <SelectItem value="expense">Expenses Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[80px]">Date</TableHead>
                <TableHead className="min-w-[150px]">Description</TableHead>
                <TableHead className="min-w-[100px]">Category</TableHead>
                <TableHead className="min-w-[120px]">Payment</TableHead>
                <TableHead className="text-right min-w-[100px]">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction, idx) => (
                <TableRow key={idx}>
                  <TableCell className="text-muted-foreground text-sm">{transaction.date}</TableCell>
                  <TableCell className="font-medium text-sm">{transaction.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {transaction.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {transaction.paymentMethod}
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={`font-semibold ${
                        transaction.type === "income" ? "text-success" : "text-foreground"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}₹{transaction.amount}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </Card>
  );
};
