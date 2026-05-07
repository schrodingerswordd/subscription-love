import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

/**
 * Representative form snippet — every input has a label, required is announced,
 * and errors are linked via aria-describedby.
 */
function SubscriptionFormSnippet({ error }: { error?: string }) {
  return (
    <form aria-label="Add subscription">
      <div>
        <Label htmlFor="name">Service name</Label>
        <Input id="name" name="name" required aria-required="true" />
      </div>
      <div>
        <Label htmlFor="cost">Monthly cost</Label>
        <Input
          id="cost"
          name="cost"
          type="number"
          required
          aria-required="true"
          aria-invalid={!!error}
          aria-describedby={error ? "cost-err" : undefined}
        />
        {error ? (
          <p id="cost-err" role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
      </div>
      <button type="submit">Save</button>
    </form>
  );
}

describe("Subscription form accessibility", () => {
  it("labels every input", () => {
    render(<SubscriptionFormSnippet />);
    expect(screen.getByLabelText(/service name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/monthly cost/i)).toBeInTheDocument();
  });

  it("marks required fields with aria-required", () => {
    render(<SubscriptionFormSnippet />);
    expect(screen.getByLabelText(/service name/i)).toHaveAttribute("aria-required", "true");
    expect(screen.getByLabelText(/monthly cost/i)).toHaveAttribute("aria-required", "true");
  });

  it("links validation errors via aria-describedby and role=alert", () => {
    render(<SubscriptionFormSnippet error="Cost must be greater than 0" />);
    const input = screen.getByLabelText(/monthly cost/i);
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", "cost-err");
    expect(screen.getByRole("alert")).toHaveTextContent(/cost must be greater than 0/i);
  });

  it("has no axe violations", async () => {
    const { container } = render(<SubscriptionFormSnippet />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
