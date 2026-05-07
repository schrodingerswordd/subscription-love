import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/**
 * Mirrors the provider-cancel dialog in app.index.tsx so we can assert
 * focus, keyboard, and ARIA behavior in isolation.
 */
function ProviderCancelDialog({ onOpenChange }: { onOpenChange?: (o: boolean) => void }) {
  return (
    <AlertDialog defaultOpen onOpenChange={onOpenChange}>
      <AlertDialogContent
        aria-labelledby="t"
        aria-describedby="d"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          document.getElementById("cancel-btn")?.focus();
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle id="t">Open Netflix's cancel page?</AlertDialogTitle>
          <AlertDialogDescription id="d">
            We'll open the provider's cancellation page in a new tab.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel id="cancel-btn" aria-label="Don't open the cancellation page">
            Not now
          </AlertDialogCancel>
          <AlertDialogAction aria-label="Open Netflix cancellation page in new tab">
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

describe("Provider-cancel dialog accessibility", () => {
  it("has no axe violations", async () => {
    const { container } = render(<ProviderCancelDialog />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("focuses the safe (cancel) action on open", async () => {
    render(<ProviderCancelDialog />);
    // Wait a tick for Radix focus management to settle.
    await new Promise((r) => setTimeout(r, 0));
    expect(screen.getByRole("button", { name: /don't open the cancellation page/i })).toHaveFocus();
  });

  it("closes when Esc is pressed", async () => {
    const user = userEvent.setup();
    let openState = true;
    render(<ProviderCancelDialog onOpenChange={(o) => { openState = o; }} />);
    await user.keyboard("{Escape}");
    expect(openState).toBe(false);
  });

  it("traps focus within the dialog when tabbing", async () => {
    const user = userEvent.setup();
    render(<ProviderCancelDialog />);
    await new Promise((r) => setTimeout(r, 0));
    await user.tab();
    expect(screen.getByRole("button", { name: /open netflix cancellation page/i })).toHaveFocus();
    await user.tab();
    // Focus stays inside the dialog (wraps back to cancel).
    expect(screen.getByRole("button", { name: /don't open the cancellation page/i })).toHaveFocus();
  });

  it("exposes accessible names on action buttons", () => {
    render(<ProviderCancelDialog />);
    expect(screen.getByRole("button", { name: /don't open the cancellation page/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /open netflix cancellation page in new tab/i })).toBeInTheDocument();
  });
});
