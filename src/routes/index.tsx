import { createFileRoute, Link } from "@tanstack/react-router";
import { LOAN_TYPES } from "@/lib/loan";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/Icon";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TrustBank Finance — Smart Loans, Instant Decisions" },
      {
        name: "description",
        content:
          "Get pre-approved for a car, house, personal or education loan in minutes with TrustBank Finance's AI-powered chatbot.",
      },
      { property: "og:title", content: "TrustBank Finance — Smart Loans, Instant Decisions" },
      {
        property: "og:description",
        content: "Apply for a loan in 10 guided steps and get an instant pre-approval decision.",
      },
    ],
  }),
  component: Landing,
});

const NAV = [
  { label: "Home", to: "/" as const },
  { label: "Loans", to: "/" as const, hash: "loan-types" },
];

const STATS = [
  { value: "50,000+", label: "Happy Customers" },
  { value: "$2B+", label: "Loans Processed" },
  { value: "98%", label: "Customer Satisfaction" },
];

const TRUST = [
  { icon: "lock", label: "256-bit Encryption" },
  { icon: "account_balance", label: "FDIC Insured" },
  { icon: "star", label: "4.8/5 Rating" },
];

function Landing() {
  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto grid max-w-[1200px] grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 sm:px-6">
          <Link to="/" className="flex min-w-0 items-center gap-2" aria-label="TrustBank Finance home">
            <Icon name="account_balance" className="shrink-0 text-2xl text-primary" filled />
            <span className="truncate text-lg font-bold tracking-tight">TrustBank Finance</span>
          </Link>
          <div className="flex items-center gap-1 sm:gap-4">
            <nav aria-label="Main" className="hidden items-center gap-6 md:flex">
              {NAV.map((item) => (
                <a
                  key={item.label}
                  href={item.hash ? `#${item.hash}` : "/"}
                  className="text-sm font-medium text-on-surface-variant transition-colors hover:text-primary"
                >
                  {item.label}
                </a>
              ))}
            </nav>
            <Button asChild size="sm" className="rounded-full">
              <Link to="/chat">Start Application</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="border-b border-border bg-secondary/60 px-4 py-14 sm:px-6 sm:py-20">
          <div className="mx-auto grid max-w-[1200px] items-center gap-12 lg:grid-cols-2">
            <div>
              <h1 className="text-[32px] font-bold leading-tight tracking-tight sm:text-5xl">
                Smart Loans. Instant Decisions.
              </h1>
              <p className="mt-4 max-w-xl text-base text-on-surface-variant sm:text-lg">
                Get pre-approved in minutes with our AI-powered chatbot. Secure, fast, and fully
                transparent financial solutions tailored to your needs.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="rounded-full font-semibold">
                  <Link to="/chat">
                    Start Your Application
                    <Icon name="arrow_forward" className="text-lg" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full font-semibold">
                  <a href="#loan-types">Learn More</a>
                </Button>
              </div>
              <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3">
                {TRUST.map((t) => (
                  <li key={t.label} className="flex items-center gap-2 text-sm text-on-surface-variant">
                    <Icon name={t.icon} className="text-lg text-primary" />
                    {t.label}
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="rounded-xl border border-border bg-card p-4 shadow-bank-lg sm:p-6"
              aria-hidden="true"
            >
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <Icon name="smart_toy" className="text-xl text-primary" filled />
                <p className="text-sm font-semibold">TrustBot Assistant</p>
                <span className="ml-auto size-2 rounded-full bg-success" />
              </div>
              <div className="mt-4 flex flex-col gap-3 text-sm">
                <p className="bubble-bot max-w-[85%] px-4 py-2.5">
                  Hello! Ready to find the perfect loan?
                </p>
                <p className="bubble-user max-w-[85%] self-end px-4 py-2.5">
                  Yes, I'm looking for a car loan.
                </p>
                <p className="bubble-bot max-w-[85%] px-4 py-2.5">
                  Great! Let's get started. What's your estimated budget?
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-primary px-3 py-1.5 text-xs font-medium text-primary">
                    &lt; $20k
                  </span>
                  <span className="rounded-full border border-primary px-3 py-1.5 text-xs font-medium text-primary">
                    $20k - $40k
                  </span>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2">
                <span className="flex-1 text-sm text-muted-foreground">Type your message…</span>
                <Icon name="send" className="text-lg text-primary" />
              </div>
            </div>
          </div>
        </section>

        <section
          id="loan-types"
          className="mx-auto max-w-[1200px] scroll-mt-24 px-4 py-14 sm:px-6 sm:py-20"
          aria-labelledby="loan-types-heading"
        >
          <h2
            id="loan-types-heading"
            className="text-center text-2xl font-bold tracking-tight sm:text-[32px]"
          >
            Flexible Loan Solutions
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-on-surface-variant">
            Choose the perfect financing option for your next milestone.
          </p>
          <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {LOAN_TYPES.map((loan) => (
              <li key={loan.name}>
                <div className="flex h-full flex-col rounded-xl border border-border bg-card p-6 shadow-bank transition-all hover:-translate-y-1 hover:border-primary hover:shadow-bank-lg">
                  <span className="grid size-12 place-items-center rounded-full bg-accent">
                    <Icon name={loan.icon} className="text-2xl text-accent-foreground" />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-card-foreground">{loan.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {loan.term}, {loan.apr}
                  </p>
                  <ul className="mt-4 space-y-2 text-sm">
                    {loan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-on-surface-variant">
                        <Icon name="check_circle" className="text-base text-primary" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button asChild variant="outline" className="mt-6 w-full rounded-full">
                    <Link to="/chat">Apply Now</Link>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="border-y border-border bg-secondary px-4 py-12 sm:px-6">
          <ul className="mx-auto grid max-w-[1200px] grid-cols-1 gap-8 text-center sm:grid-cols-3">
            {STATS.map((s) => (
              <li key={s.label}>
                <p className="text-[32px] font-bold tracking-tight text-primary">{s.value}</p>
                <p className="mt-1 text-sm text-on-surface-variant">{s.label}</p>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-[1200px] space-y-4 text-sm text-on-surface-variant">
          <p className="flex items-center gap-2 text-base font-bold text-foreground">
            <Icon name="account_balance" className="text-xl text-primary" filled />
            TrustBank Finance
          </p>
          <p>
            © {new Date().getFullYear()} TrustBank Financial Services. All rights reserved. Member
            FDIC. Equal Housing Lender.
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {["Privacy Policy", "Terms of Service", "Security", "Accessibility"].map((l) => (
              <li key={l}>
                <a href="#loan-types" className="transition-colors hover:text-primary">
                  {l}
                </a>
              </li>
            ))}
          </ul>
          <p className="text-xs">Portfolio demo — no real applications are processed.</p>
        </div>
      </footer>
    </div>
  );
}
