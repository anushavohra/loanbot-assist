# 🏦 Loan Chatbot — LoanBank

A conversational loan-application chatbot for a bank. Portfolio project built with React + TanStack Start, Tailwind CSS v4 and localStorage (no backend).

## Features

- 🤖 Guided 10-step loan application with LoanBot
- 💳 4 loan types (Car, House, Personal, Education)
- ✅ Real-time eligibility checking
- 📱 Mobile-first responsive design
- 💾 localStorage persistence (`loanApplication`, `chatHistory`)
- 🎯 WCAG 2.1 AA oriented: ARIA labels, keyboard navigation, visible focus rings, 4.5:1 contrast

## Quick Start

```bash
bun install
bun run dev
```

Then open the printed local URL.

## Pages

| Route      | Purpose                                                     |
| ---------- | ----------------------------------------------------------- |
| `/`        | Landing page: hero, loan cards, trust signals, footer       |
| `/chat`    | Full-screen chat UI with progress bar and quick replies     |
| `/summary` | Answer review, eligibility badge, edit + submit flow        |

## Loan Types

- Car Loan: $30k min annual income, 650+ credit score, up to 5 years, 7% APR
- House Loan: $50k min annual income, 700+ credit score, up to 30 years, 4.5% APR
- Personal Loan: $25k min annual income, 600+ credit score, up to 3 years, 10% APR
- Education Loan: no minimum income, 600+ credit score, up to 10 years, 6% APR

## Code Map

- `src/lib/loan.ts` — data shape, 10-step flow, validation, eligibility rules, storage helpers
- `src/routes/index.tsx` — landing page
- `src/routes/chat.tsx` — chat logic (send, typing indicator, quick replies, progress, reset)
- `src/routes/summary.tsx` — summary, eligibility badge, submit + confirmation modal
- `src/styles.css` — banking design tokens (blue #1A56DB primary), bubble and animation utilities

## Validation

- Name: min 2 characters, letters only
- Email: regex-validated
- Income / loan amount: positive numbers
- Repayment years: whole number 1–30
