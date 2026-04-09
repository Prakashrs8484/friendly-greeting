import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sliders } from 'lucide-react';
import { Agent } from '@/lib/agentPageApi';

interface AgentTuningDialogProps {
  agent: Agent;
  onConfigChange: (config: Agent['config']) => void;
}

export const AgentTuningDialog: React.FC<AgentTuningDialogProps> = ({
  agent,
  onConfigChange,
}) => {
  const defaultConfig: Agent['config'] = {
    role: 'Assistant',
    tone: 'Friendly',
    creativity: 50,
    verbosity: 50,
    memoryEnabled: false,
  };

  const mergedConfig: Agent['config'] = {
    ...defaultConfig,
    ...(agent.config || {}),
  };

  const [isOpen, setIsOpen] = useState(false);
  const [tempConfig, setTempConfig] = useState<Agent['config']>(mergedConfig);

  // Keep dialog values aligned when selected agent changes.
  useEffect(() => {
    setTempConfig({
      ...defaultConfig,
      ...(agent.config || {}),
    });
  }, [agent._id]);

  const handleCreativityChange = (value: number[]) => {
    setTempConfig((prev) => ({
      ...prev,
      creativity: value[0],
    }));
  };

  const handleVerbosityChange = (value: number[]) => {
    setTempConfig((prev) => ({
      ...prev,
      verbosity: value[0],
    }));
  };

  const handleMemoryToggle = (checked: boolean) => {
    setTempConfig((prev) => ({
      ...prev,
      memoryEnabled: checked,
    }));
  };

  const handleRoleChange = (role: string) => {
    setTempConfig((prev) => ({
      ...prev,
      role,
    }));
  };

  const handleToneChange = (tone: string) => {
    setTempConfig((prev) => ({
      ...prev,
      tone,
    }));
  };

  const handleApply = () => {
    onConfigChange(tempConfig);
    setIsOpen(false);
  };

  const creativeLabel = {
    0: 'Deterministic',
    33: 'Focused',
    66: 'Balanced',
    100: 'Creative',
  }[Math.floor((tempConfig.creativity || 50) / 33) * 33] || 'Balanced';

  const verbosityLabel = {
    0: 'Concise',
    33: 'Summary',
    66: 'Detailed',
    100: 'Comprehensive',
  }[Math.floor((tempConfig.verbosity || 50) / 33) * 33] || 'Detailed';

  const ROLES = ['Assistant', 'Data Analyst', 'Researcher', 'Mentor', 'Critic'];
  const TONES = ['Friendly', 'Formal', 'Motivational', 'Neutral'];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Sliders className="w-4 h-4" />
          Tune
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Tune Agent: {agent.name}</DialogTitle>
          <DialogDescription>
            Customize how this agent behaves and responds
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Personality */}
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-sm">Personality</CardTitle>
              <CardDescription>How the agent communicates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Role */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Role</Label>
                <div className="grid grid-cols-2 gap-2">
                  {ROLES.map((role) => (
                    <Button
                      key={role}
                      variant={tempConfig.role === role ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleRoleChange(role)}
                      className="text-xs"
                    >
                      {role}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Tone */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Tone</Label>
                <div className="grid grid-cols-2 gap-2">
                  {TONES.map((tone) => (
                    <Button
                      key={tone}
                      variant={tempConfig.tone === tone ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleToneChange(tone)}
                      className="text-xs"
                    >
                      {tone}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Behavior */}
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-sm">Behavior</CardTitle>
              <CardDescription>How the agent thinks and responds</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Creativity */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-xs font-medium">Creativity</Label>
                  <Badge variant="secondary" className="text-xs">
                    {creativeLabel}
                  </Badge>
                </div>
                <Slider
                  value={[tempConfig.creativity || 50]}
                  onValueChange={handleCreativityChange}
                  min={0}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  How varied and exploratory responses should be (low = predictable, high = novel)
                </p>
              </div>

              {/* Verbosity */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-xs font-medium">Verbosity</Label>
                  <Badge variant="secondary" className="text-xs">
                    {verbosityLabel}
                  </Badge>
                </div>
                <Slider
                  value={[tempConfig.verbosity || 50]}
                  onValueChange={handleVerbosityChange}
                  min={0}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  How detailed responses should be (low = brief, high = exhaustive)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Memory */}
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-sm">Memory</CardTitle>
              <CardDescription>How the agent learns from context</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Use conversation history</Label>
                  <p className="text-xs text-muted-foreground">
                    Include past messages in context
                  </p>
                </div>
                <Switch
                  checked={Boolean(tempConfig.memoryEnabled)}
                  onCheckedChange={handleMemoryToggle}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleApply} className="flex-1">
              Apply Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
