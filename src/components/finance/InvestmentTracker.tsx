import { TrendingUp, Plus, Edit, Trash2, Filter } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

interface Investment {
  id: string;
  assetType: string;
  name: string;
  investmentMode: 'sip' | 'lumpsum';
  purchaseAmount: number;
  units: number;
  purchaseDate: string;
  currentValue: number;
  riskCategory: 'low' | 'medium' | 'high';
  goalMapping?: string;
  absoluteReturns: number;
  percentageReturns: number;
}

const mockInvestments: Investment[] = [
  {
    id: '1',
    assetType: 'mutual-funds',
    name: 'HDFC Index Fund',
    investmentMode: 'sip',
    purchaseAmount: 50000,
    units: 250,
    purchaseDate: '2024-01-15',
    currentValue: 58000,
    riskCategory: 'medium',
    absoluteReturns: 8000,
    percentageReturns: 16
  },
  {
    id: '2',
    assetType: 'stocks',
    name: 'TCS Equity',
    investmentMode: 'lumpsum',
    purchaseAmount: 100000,
    units: 25,
    purchaseDate: '2023-06-10',
    currentValue: 125000,
    riskCategory: 'high',
    absoluteReturns: 25000,
    percentageReturns: 25
  },
  {
    id: '3',
    assetType: 'gold-silver',
    name: 'Gold ETF',
    investmentMode: 'lumpsum',
    purchaseAmount: 30000,
    units: 100,
    purchaseDate: '2024-03-20',
    currentValue: 32500,
    riskCategory: 'low',
    absoluteReturns: 2500,
    percentageReturns: 8.33
  }
];

const assetTypeLabels = {
  'mutual-funds': 'Mutual Funds',
  'stocks': 'Stocks / Equity',
  'debt-funds': 'Debt Funds',
  'gold-silver': 'Gold & Silver',
  'crypto': 'Crypto',
  'other': 'Other Assets'
};

const assetTypeEmojis = {
  'mutual-funds': '📊',
  'stocks': '📈',
  'debt-funds': '🏦',
  'gold-silver': '🪙',
  'crypto': '₿',
  'other': '💼'
};

interface InvestmentTrackerProps {
  onInvestmentChange?: () => void;
}

export const InvestmentTracker = ({ onInvestmentChange }: InvestmentTrackerProps) => {
  const [activeTab, setActiveTab] = useState('mutual-funds');
  const [addInvestmentOpen, setAddInvestmentOpen] = useState(false);
  const [formData, setFormData] = useState({
    assetType: 'mutual-funds',
    name: '',
    investmentMode: 'lumpsum',
    purchaseAmount: '',
    units: '',
    purchaseDate: '',
    currentValue: '',
    riskCategory: 'medium',
    goalMapping: ''
  });

  const filteredInvestments = mockInvestments.filter(inv => inv.assetType === activeTab);

  const getRiskBadgeVariant = (risk: string) => {
    switch (risk) {
      case 'low': return 'default';
      case 'medium': return 'secondary';
      case 'high': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur border-border">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">Investment Portfolio</h3>
            </div>
            <p className="text-sm text-muted-foreground">Track and manage all your investments</p>
          </div>
          <Dialog open={addInvestmentOpen} onOpenChange={setAddInvestmentOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Investment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Investment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Asset Type</Label>
                    <Select value={formData.assetType} onValueChange={(v) => setFormData({...formData, assetType: v})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mutual-funds">📊 Mutual Funds</SelectItem>
                        <SelectItem value="stocks">📈 Stocks / Equity</SelectItem>
                        <SelectItem value="debt-funds">🏦 Debt Funds</SelectItem>
                        <SelectItem value="gold-silver">🪙 Gold & Silver</SelectItem>
                        <SelectItem value="crypto">₿ Crypto</SelectItem>
                        <SelectItem value="other">💼 Other Assets</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Investment Name</Label>
                    <Input 
                      placeholder="e.g., HDFC Index Fund" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Investment Mode</Label>
                    <Select value={formData.investmentMode} onValueChange={(v) => setFormData({...formData, investmentMode: v})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sip">SIP</SelectItem>
                        <SelectItem value="lumpsum">Lumpsum</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Risk Category</Label>
                    <Select value={formData.riskCategory} onValueChange={(v) => setFormData({...formData, riskCategory: v})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low Risk</SelectItem>
                        <SelectItem value="medium">Medium Risk</SelectItem>
                        <SelectItem value="high">High Risk</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Purchase Amount (₹)</Label>
                    <Input 
                      type="number" 
                      placeholder="0.00"
                      value={formData.purchaseAmount}
                      onChange={(e) => setFormData({...formData, purchaseAmount: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Units / Quantity</Label>
                    <Input 
                      type="number" 
                      placeholder="0"
                      value={formData.units}
                      onChange={(e) => setFormData({...formData, units: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Purchase Date</Label>
                    <Input 
                      type="date"
                      value={formData.purchaseDate}
                      onChange={(e) => setFormData({...formData, purchaseDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Current Value (₹)</Label>
                    <Input 
                      type="number" 
                      placeholder="0.00"
                      value={formData.currentValue}
                      onChange={(e) => setFormData({...formData, currentValue: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Goal Mapping (Optional)</Label>
                  <Input 
                    placeholder="e.g., Retirement, House, Education"
                    value={formData.goalMapping}
                    onChange={(e) => setFormData({...formData, goalMapping: e.target.value})}
                  />
                </div>

                <Button 
                  className="w-full"
                  onClick={() => {
                    // In production, this would save to backend
                    console.log('Adding investment:', formData);
                    setAddInvestmentOpen(false);
                    setFormData({
                      assetType: 'mutual-funds',
                      name: '',
                      investmentMode: 'lumpsum',
                      purchaseAmount: '',
                      units: '',
                      purchaseDate: '',
                      currentValue: '',
                      riskCategory: 'medium',
                      goalMapping: ''
                    });
                    // Refresh financial data after adding investment
                    onInvestmentChange?.();
                  }}
                >
                  Add Investment
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-6">
            <TabsTrigger value="mutual-funds" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">📊 Mutual Funds</span>
              <span className="sm:hidden">📊 MF</span>
            </TabsTrigger>
            <TabsTrigger value="stocks" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">📈 Stocks</span>
              <span className="sm:hidden">📈 Stocks</span>
            </TabsTrigger>
            <TabsTrigger value="debt-funds" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">🏦 Debt</span>
              <span className="sm:hidden">🏦 Debt</span>
            </TabsTrigger>
            <TabsTrigger value="gold-silver" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">🪙 Gold</span>
              <span className="sm:hidden">🪙 Gold</span>
            </TabsTrigger>
            <TabsTrigger value="crypto" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">₿ Crypto</span>
              <span className="sm:hidden">₿ Crypto</span>
            </TabsTrigger>
            <TabsTrigger value="other" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">💼 Other</span>
              <span className="sm:hidden">💼 Other</span>
            </TabsTrigger>
          </TabsList>

          {Object.keys(assetTypeLabels).map((type) => (
            <TabsContent key={type} value={type} className="space-y-4">
              {filteredInvestments.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No investments in this category yet</p>
                  <p className="text-sm mt-1">Click "Add Investment" to get started</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredInvestments.map((investment) => (
                    <Card key={investment.id} className="p-4 bg-background/50 hover:bg-background/80 transition-all border-border">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">{assetTypeEmojis[investment.assetType as keyof typeof assetTypeEmojis]}</span>
                            <h4 className="font-semibold text-foreground truncate">{investment.name}</h4>
                            <Badge variant={getRiskBadgeVariant(investment.riskCategory)} className="text-xs">
                              {investment.riskCategory.toUpperCase()}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {investment.investmentMode.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground text-xs mb-1">Invested</p>
                              <p className="font-medium text-foreground">₹{investment.purchaseAmount.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs mb-1">Current Value</p>
                              <p className="font-medium text-foreground">₹{investment.currentValue.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs mb-1">Returns</p>
                              <p className={`font-medium ${investment.absoluteReturns >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                ₹{investment.absoluteReturns.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs mb-1">% Returns</p>
                              <p className={`font-medium ${investment.percentageReturns >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {investment.percentageReturns.toFixed(2)}%
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};
