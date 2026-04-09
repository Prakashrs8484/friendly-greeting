import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Settings,
  Trash2,
  MessageSquare,
  Edit2,
  AlertTriangle,
} from 'lucide-react';
import {
  AgentPage,
  updateAgentPage,
  deleteAgentPage,
  clearPageMessages,
} from '@/lib/agentPageApi';
import { useToast } from '@/hooks/use-toast';

interface PageSettingsDialogProps {
  page: AgentPage;
  onPageUpdated: (updated: AgentPage) => void;
}

export const PageSettingsDialog: React.FC<PageSettingsDialogProps> = ({
  page,
  onPageUpdated,
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editedName, setEditedName] = useState(page.name);
  const [editedDescription, setEditedDescription] = useState(page.description);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleSave = async () => {
    if (!editedName.trim()) {
      toast({ title: 'Page name is required', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      const updated = await updateAgentPage(page._id, {
        name: editedName.trim(),
        description: editedDescription.trim(),
      });
      onPageUpdated(updated);
      toast({ title: 'Page updated successfully' });
      setIsOpen(false);
    } catch (error) {
      toast({
        title: 'Failed to update page',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteAgentPage(page._id);
      toast({ title: 'Page deleted successfully' });
      navigate('/agent-pages');
    } catch (error) {
      toast({
        title: 'Failed to delete page',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleClearMessages = async () => {
    setIsClearing(true);
    try {
      await clearPageMessages(page._id);
      toast({ title: 'Page conversation cleared' });
      setShowClearConfirm(false);
    } catch (error) {
      toast({
        title: 'Failed to clear messages',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Page Settings</DialogTitle>
            <DialogDescription>Manage your workspace configuration</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="general" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
              <TabsTrigger value="danger">Danger</TabsTrigger>
            </TabsList>

            {/* General Tab */}
            <TabsContent value="general" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="page-name">Page Name</Label>
                <Input
                  id="page-name"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  placeholder="Enter page name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="page-desc">Description</Label>
                <Textarea
                  id="page-desc"
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  placeholder="What is this workspace for?"
                  rows={4}
                />
              </div>

              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </TabsContent>

            {/* Messages Tab */}
            <TabsContent value="messages" className="space-y-4">
              <Card className="border-amber-200 bg-amber-50">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Clear Conversation
                  </CardTitle>
                  <CardDescription>
                    Remove all messages from this workspace
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-4">
                    This will delete all user and agent messages. Feature data will be preserved.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setShowClearConfirm(true)}
                    className="w-full"
                  >
                    Clear All Messages
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Danger Tab */}
            <TabsContent value="danger" className="space-y-4">
              <Card className="border-destructive/50 bg-destructive/5">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2 text-destructive">
                    <AlertTriangle className="w-4 h-4" />
                    Delete Workspace
                  </CardTitle>
                  <CardDescription>
                    Permanently remove this entire workspace and all its data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-4">
                    This action cannot be undone. All features, agents, and data will be permanently deleted.
                  </p>
                  <Button
                    variant="destructive"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full"
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Workspace'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Workspace?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{page.name}" and all associated data, including features, agents, and messages. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear Messages Confirmation */}
      <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Messages?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all user and agent messages from this workspace. Feature data will not be affected. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleClearMessages}
            disabled={isClearing}
          >
            {isClearing ? 'Clearing...' : 'Clear Messages'}
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
