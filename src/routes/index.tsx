import { createFileRoute, Link } from "@tanstack/react-router";
import { Star, ShieldCheck, Users, ArrowRight } from "lucide-react";
import { LOAN_TYPES } from "@/lib/loan";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LoanBank — Smart Loans, Instant Decisions" },
      {
        name: "description",
        content:
          "Get pre-approved for a car, house, personal or education loan in minutes with LoanBank's AI-powered chatbot.",
      },
      { property: "og:title", content: "LoanBank — Smart Loans, Instant Decisions" },
      {
        property: "og:description",
        content: "Apply for a loan in 10 guided steps and get an instant pre-approval decision.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-dvh bg-background animate-fade-in">
      <header className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-[1200px] grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-4 sm:px-6">
          <Link to="/" className="flex min-w-0 items-center gap-2" aria-label="LoanBank home">
            <span aria-hidden="true" className="text-2xl">
              🏦
            </span>
            <span className="truncate text-lg font-bold tracking-tight">LoanBank</span>
          </Link>
          <Button asChild size="sm">
            <Link to="/chat">Apply now</Link>
          </Button>
        </div>
      </header>

      <main>
        <section className="gradient-hero px-4 py-16 text-primary-foreground sm:px-6 sm:py-24">
          <div className="mx-auto max-w-[1200px] text-center">
            <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
              Smart Loans. Instant Decisions.
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base opacity-90 sm:text-lg">
              Get pre-approved in minutes with our AI-powered chatbot
            </p>
            <div className="mt-8">
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="w-full font-semibold sm:w-auto"
              >
                <Link to="/chat">
                  Start Your Application
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1200px] px-4 py-14 sm:px-6" aria-labelledby="loan-types">
          <h2 id="loan-types" className="text-center text-2xl font-bold tracking-tight">
            Choose the loan that fits your plan
          </h2>
          <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {LOAN_TYPES.map((loan) => (
              <li key={loan.name}>
                <div className="h-full rounded-xl border border-border bg-card p-6 shadow-bank transition-transform hover:-translate-y-1">
                  <span aria-hidden="true" className="text-3xl">
                    {loan.emoji}
                  </span>
                  <h3 className="mt-3 text-lg font-semibold text-card-foreground">{loan.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{loan.term}</p>
                  <p className="mt-3 inline-flex rounded-lg bg-accent px-2.5 py-1 text-sm font-semibold text-accent-foreground">
                    {loan.apr}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="border-y border-border bg-secondary px-4 py-12 sm:px-6">
          <ul className="mx-auto grid max-w-[1200px] grid-cols-1 gap-6 text-center sm:grid-cols-3">
            <li className="flex flex-col items-center gap-2">
              <Users aria-hidden="true" className="size-6 text-primary" />
              <span className="font-semibold">50,000+ customers served</span>
            </li>
            <li className="flex flex-col items-center gap-2">
              <Star aria-hidden="true" className="size-6 text-primary" />
              <span className="font-semibold">4.8/5 rating</span>
            </li>
            <li className="flex flex-col items-center gap-2">
              <ShieldCheck aria-hidden="true" className="size-6 text-primary" />
              <span className="font-semibold">Secure &amp; Confidential</span>
            </li>
          </ul>
        </section>
      </main>

      <footer className="bg-card px-4 py-10 text-sm text-muted-foreground sm:px-6">
        <div className="mx-auto max-w-[1200px] space-y-2">
          <p className="font-semibold text-card-foreground">🏦 LoanBank</p>
          <p>1200 Financial Avenue, Suite 400 · Member FDIC · Equal Housing Lender</p>
          <p>Support: 1-800-555-0134 · support@loanbank.example</p>
          <p>© {new Date().getFullYear()} LoanBank. Portfolio demo — no real applications processed.</p>
        </div>
      </footer>
    </div>
  );
}
