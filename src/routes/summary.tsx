import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Calculator, CheckCircle2, ClipboardList, Pencil } from "lucide-react";
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
      { title: "Application Summary — LoanBank" },
      {
        name: "description",
        content:
          "Review your LoanBank loan application answers, see your pre-approval decision and submit for final review.",
      },
      { property: "og:title", content: "Application Summary — LoanBank" },
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
    <div className="min-h-dvh bg-secondary animate-fade-in">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-4">
          <span aria-hidden="true" className="text-xl">
            🏦
          </span>
          <Link to="/" className="truncate font-bold">
            LoanBank
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Application Summary</h1>
        <p className="mt-2 text-sm text-muted-foreground">
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
          {approved ? (
            <CheckCircle2 aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-success" />
          ) : (
            <ClipboardList aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-warning" />
          )}
          <div className="min-w-0">
            <h2 className="font-semibold">{approved ? "✅ Pre-Approved" : "📋 Review Needed"}</h2>
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
                className="min-h-11 text-primary"
                onClick={() => editStep(row.step)}
                aria-label={`Edit ${row.label}`}
              >
                <Pencil aria-hidden="true" />
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
              <Calculator aria-hidden="true" className="size-5 text-primary" />
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
          <Button className="min-h-11 flex-1" onClick={submitApplication} disabled={submitted}>
            {submitted ? "Application Submitted" : "Submit Application"}
          </Button>
          <Button variant="outline" className="min-h-11 flex-1" onClick={startNew}>
            Start New Application
          </Button>
        </div>
      </main>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Application received 🎉</DialogTitle>
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
