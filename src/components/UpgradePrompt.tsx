import { Link } from "@tanstack/react-router";
import { Crown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";

interface UpgradePromptProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
}

export function UpgradePrompt({ open, onClose, title, description }: UpgradePromptProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground shadow-elegant">
          <Crown className="h-6 w-6" />
        </div>
        <DialogHeader className="text-center sm:text-center">
          <DialogTitle className="text-center">{title}</DialogTitle>
          <DialogDescription className="text-center">{description}</DialogDescription>
        </DialogHeader>
        <div className="rounded-xl bg-muted/50 p-4 text-sm">
          <p className="font-semibold">Premium — $2.99/month</p>
          <ul className="mt-2 space-y-1 text-muted-foreground">
            <li>• Unlimited subscriptions</li>
            <li>• Bank statement scanner</li>
            <li>• Price-change alerts</li>
          </ul>
        </div>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="ghost" onClick={onClose}>
            <X className="h-4 w-4" /> Not now
          </Button>
          <Button asChild className="bg-gradient-primary hover:opacity-90">
            <Link to="/pricing" onClick={onClose}>
              <Crown className="h-4 w-4" /> See plans
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
