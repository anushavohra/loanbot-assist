import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import {
  calculateEligibility,
  emptyApplication,
  generateSummary,
  calculateRepayment,
  formatMoney,
  storage,
  type LoanApplication,
} from "@/lib/loan";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/summary")({
  head: () => ({
    meta: [
      { title: "Application Summary — TrustBank Finance" },
      {
        name: "description",
        content:
          "Review your TrustBank Finance loan application answers, see your pre-approval decision and submit for final review.",
      },
      { property: "og:title", content: "Application Summary — TrustBank Finance" },
      {
        property: "og:description",
        content: "Check your answers and pre-approval result before submitting your loan application.",
      },
    ],
  }),
  component: SummaryPage,
});

function SummaryPage() {
  const navigate = useNavigate();
  const [application, setApplication] = useState<LoanApplication>(emptyApplication);
  const [submitted, setSubmitted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const app = storage.loadApplication();
    app.eligibility = calculateEligibility(app);
    setApplication(app);
    setSubmitted(storage.loadSubmitted());
  }, []);

  const rows = generateSummary(application);
  const estimate = calculateRepayment(application);
  const approved = application.eligibility.approved;

  /** submitApplication(): persist the final application locally. */
  function submitApplication() {
    storage.saveApplication(application);
    storage.saveSubmitted(true);
    setSubmitted(true);
    setOpen(true);
  }

  function editStep(step: number) {
    storage.saveStep(step);
    navigate({ to: "/chat" });
  }

  function startNew() {
    storage.reset();
    navigate({ to: "/chat" });
  }

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-[720px] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-4">
          <Link to="/" className="flex min-w-0 items-center gap-2">
            <Icon name="account_balance" className="shrink-0 text-xl text-primary" filled />
            <span className="truncate font-bold">TrustBank Finance</span>
          </Link>
          <Button asChild variant="ghost" size="sm" className="min-h-11 rounded-full">
            <Link to="/">
              <Icon name="close" className="text-lg" />
              <span className="hidden sm:inline">Save &amp; Exit</span>
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-[720px] px-4 py-8">
        <p
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${
            approved
              ? "bg-accent text-accent-foreground"
              : "bg-warning/15 text-warning-foreground"
          }`}
        >
          <Icon name={approved ? "check_circle" : "info"} className="text-lg" filled />
          {approved ? "Pre-Approval Successful" : "Additional Review Needed"}
        </p>
        <h1 className="mt-4 text-[32px] font-bold leading-tight tracking-tight">
          Application Summary
        </h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          Review your answers below. Use the edit buttons to change any response.
        </p>

        <div
          className={`mt-6 flex items-start gap-3 rounded-xl border p-4 ${
            approved
              ? "border-success bg-success/10"
              : "border-warning bg-warning/10"
          }`}
          role="status"
        >
          <Icon
            name={approved ? "check_circle" : "info"}
            className={`mt-0.5 shrink-0 text-xl ${approved ? "text-success" : "text-warning"}`}
            filled
          />
          <div className="min-w-0">
            <h2 className="font-semibold">{approved ? "Pre-Approved" : "Review Needed"}</h2>
            <p className="mt-1 text-sm text-foreground">
              {application.eligibility.message || "Complete the chat to see your decision."}
            </p>
          </div>
        </div>

        <ul className="mt-6 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-bank">
          {rows.map((row) => (
            <li
              key={row.label}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {row.label}
                </p>
                <p className="truncate font-semibold text-card-foreground">{row.value}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="min-h-11 rounded-full text-primary"
                onClick={() => editStep(row.step)}
                aria-label={`Edit ${row.label}`}
              >
                <Icon name="edit" className="text-base" />
                Edit
              </Button>
            </li>
          ))}
        </ul>

        {estimate && (
          <section
            aria-labelledby="estimate-heading"
            className="mt-6 rounded-xl border border-border bg-card p-4 shadow-bank"
          >
            <div className="flex items-center gap-2">
              <Icon name="calculate" className="text-xl text-primary" />
              <h2 id="estimate-heading" className="font-semibold">
                Repayment estimate
              </h2>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-secondary p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Estimated monthly payment
                </p>
                <p className="mt-1 text-2xl font-bold text-primary">
                  {formatMoney(estimate.monthlyPayment)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {estimate.months} payments at {(estimate.apr * 100).toFixed(2)}% APR
                </p>
              </div>
              <div className="rounded-lg bg-secondary p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Total repayment
                </p>
                <p className="mt-1 text-2xl font-bold text-card-foreground">
                  {formatMoney(estimate.totalRepayment)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Includes {formatMoney(estimate.totalInterest)} in interest
                </p>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Estimates only, based on the published {application.loanType} rate. Your final rate is
              confirmed after review.
            </p>
          </section>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild variant="outline" className="min-h-11 rounded-full sm:min-w-32">
            <Link to="/chat">Back</Link>
          </Button>
          <Button
            className="min-h-11 flex-1 rounded-full font-semibold"
            onClick={submitApplication}
            disabled={submitted}
          >
            {submitted ? "Application Submitted" : "Submit Application"}
            <Icon name="arrow_forward" className="text-lg" />
          </Button>
          <Button variant="ghost" className="min-h-11 rounded-full" onClick={startNew}>
            Start New Application
          </Button>
        </div>
      </main>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Application received</DialogTitle>
            <DialogDescription>
              Thanks {application.fullName || "there"} — we've saved your {application.loanType || "loan"}{" "}
              application. A confirmation was sent to {application.email || "your email"} and a loan
              officer will follow up within one business day.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
            <Button onClick={startNew}>Start New Application</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
