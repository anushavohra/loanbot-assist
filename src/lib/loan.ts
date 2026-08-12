/**
 * Loan chatbot domain logic: data shape, chat flow steps, validation,
 * eligibility rules and localStorage persistence.
 */

export type LoanType = "Car Loan" | "House Loan" | "Personal Loan" | "Education Loan";

export interface LoanApplication {
  loanType: string;
  fullName: string;
  monthlyIncome: number;
  employmentStatus: string;
  loanAmount: number;
  repaymentYears: number;
  existingLoans: string;
  creditScore: string;
  email: string;
  eligibility: { approved: boolean; message: string };
}

export interface ChatMessage {
  id: string;
  role: "bot" | "user";
  text: string;
}

export const emptyApplication: LoanApplication = {
  loanType: "",
  fullName: "",
  monthlyIncome: 0,
  employmentStatus: "",
  loanAmount: 0,
  repaymentYears: 0,
  existingLoans: "",
  creditScore: "",
  email: "",
  eligibility: { approved: false, message: "" },
};

export const LOAN_TYPES = [
  { emoji: "🚗", name: "Car Loan", term: "Up to 5 years", apr: "7% APR", minIncome: 30000, minScore: 650 },
  { emoji: "🏠", name: "House Loan", term: "Up to 30 years", apr: "4.5% APR", minIncome: 50000, minScore: 700 },
  { emoji: "💼", name: "Personal Loan", term: "Up to 3 years", apr: "10% APR", minIncome: 25000, minScore: 600 },
  { emoji: "🎓", name: "Education Loan", term: "Up to 10 years", apr: "6% APR", minIncome: 0, minScore: 600 },
] as const;

export type StepField = keyof Omit<LoanApplication, "eligibility">;

export interface Step {
  step: number;
  field: StepField;
  question: string;
  label: string;
  kind: "options" | "text" | "number" | "email";
  options?: string[];
  placeholder?: string;
  validate?: (raw: string) => string | null;
}

const nameRe = /^[A-Za-z][A-Za-z\s'-]{1,}$/;
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const STEPS: Step[] = [
  {
    step: 1,
    field: "loanType",
    label: "Loan type",
    question:
      "Welcome to LoanBot 🤖! I'm here to help you apply for a loan. What type of loan are you interested in?",
    kind: "options",
    options: ["🚗 Car Loan", "🏠 House Loan", "💼 Personal Loan", "🎓 Education Loan"],
  },
  {
    step: 2,
    field: "fullName",
    label: "Full name",
    question: "Great choice! What is your full name?",
    kind: "text",
    placeholder: "e.g. Anusha Vohra",
    validate: (v) =>
      nameRe.test(v.trim()) ? null : "Please enter at least 2 characters, letters only.",
  },
  {
    step: 3,
    field: "monthlyIncome",
    label: "Monthly income",
    question: "What is your monthly income?",
    kind: "number",
    placeholder: "e.g. 4500",
    validate: (v) => (Number(v) > 0 ? null : "Please enter a positive amount in dollars."),
  },
  {
    step: 4,
    field: "employmentStatus",
    label: "Employment status",
    question: "What is your current employment status?",
    kind: "options",
    options: ["Employed", "Self-Employed", "Business Owner", "Unemployed", "Student"],
  },
  {
    step: 5,
    field: "loanAmount",
    label: "Loan amount",
    question: "How much loan amount do you need?",
    kind: "number",
    placeholder: "e.g. 25000",
    validate: (v) => (Number(v) > 0 ? null : "Please enter a positive amount in dollars."),
  },
  {
    step: 6,
    field: "repaymentYears",
    label: "Repayment period",
    question: "How many years do you need to repay?",
    kind: "number",
    placeholder: "1 - 30",
    validate: (v) => {
      const n = Number(v);
      return Number.isInteger(n) && n >= 1 && n <= 30 ? null : "Enter a whole number between 1 and 30.";
    },
  },
  {
    step: 7,
    field: "existingLoans",
    label: "Existing loans",
    question: "Do you have any existing loans?",
    kind: "options",
    options: ["Yes", "No"],
  },
  {
    step: 8,
    field: "creditScore",
    label: "Credit score",
    question: "What is your credit score range?",
    kind: "options",
    options: ["750+ (Excellent)", "700-749 (Good)", "650-699 (Fair)", "600-649 (Poor)", "Below 600"],
  },
  {
    step: 9,
    field: "email",
    label: "Email address",
    question: "What is your email address?",
    kind: "email",
    placeholder: "you@example.com",
    validate: (v) => (emailRe.test(v.trim()) ? null : "Please enter a valid email address."),
  },
  {
    step: 10,
    field: "email",
    label: "Review",
    question: "Thank you! Here's a summary of your application. Please review and submit.",
    kind: "options",
    options: ["View summary"],
  },
];

export const TOTAL_STEPS = 10;

/** Safe step accessor (1-indexed). */
export function getStep(step: number): Step {
  const clamped = Math.min(Math.max(step, 1), TOTAL_STEPS);
  return STEPS[clamped - 1] as Step;
}

/** Strips leading emoji from quick reply labels ("🚗 Car Loan" -> "Car Loan"). */
export function cleanValue(v: string): string {
  return v.replace(/^[^\p{L}\d$]+/u, "").trim();
}

export function scoreFloor(range: string): number {
  if (range.startsWith("750")) return 750;
  if (range.startsWith("700")) return 700;
  if (range.startsWith("650")) return 650;
  if (range.startsWith("600")) return 600;
  return 550;
}

export function calculateEligibility(app: LoanApplication): LoanApplication["eligibility"] {
  const rules = LOAN_TYPES.find((l) => l.name === app.loanType);
  if (!rules) return { approved: false, message: "Select a loan type to check eligibility." };

  const annualIncome = app.monthlyIncome * 12;
  const score = scoreFloor(app.creditScore);
  const reasons: string[] = [];

  if (rules.minIncome > 0 && annualIncome < rules.minIncome) {
    reasons.push(
      `annual income of $${annualIncome.toLocaleString()} is below the $${rules.minIncome.toLocaleString()} minimum`,
    );
  }
  if (score < rules.minScore) {
    reasons.push(`credit score is below the ${rules.minScore} minimum`);
  }

  if (reasons.length === 0) {
    return {
      approved: true,
      message: `You are pre-approved for a ${app.loanType} of $${app.loanAmount.toLocaleString()} over ${app.repaymentYears} year${app.repaymentYears === 1 ? "" : "s"}.`,
    };
  }
  return {
    approved: false,
    message: `A loan officer will review your application because your ${reasons.join(" and ")}.`,
  };
}

export interface SummaryRow {
  step: number;
  label: string;
  value: string;
}

export function generateSummary(app: LoanApplication): SummaryRow[] {
  return [
    { step: 1, label: "Loan type", value: app.loanType || "—" },
    { step: 2, label: "Full name", value: app.fullName || "—" },
    { step: 3, label: "Monthly income", value: app.monthlyIncome ? `$${app.monthlyIncome.toLocaleString()}` : "—" },
    { step: 4, label: "Employment status", value: app.employmentStatus || "—" },
    { step: 5, label: "Loan amount", value: app.loanAmount ? `$${app.loanAmount.toLocaleString()}` : "—" },
    { step: 6, label: "Repayment period", value: app.repaymentYears ? `${app.repaymentYears} years` : "—" },
    { step: 7, label: "Existing loans", value: app.existingLoans || "—" },
    { step: 8, label: "Credit score", value: app.creditScore || "—" },
    { step: 9, label: "Email address", value: app.email || "—" },
  ];
}

/* ---------- localStorage persistence ---------- */

const APP_KEY = "loanApplication";
const HISTORY_KEY = "chatHistory";
const STEP_KEY = "loanCurrentStep";
const SUBMITTED_KEY = "loanSubmitted";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
}

export const storage = {
  loadApplication: () => read<LoanApplication>(APP_KEY, emptyApplication),
  saveApplication: (app: LoanApplication) => write(APP_KEY, app),
  loadHistory: () => read<ChatMessage[]>(HISTORY_KEY, []),
  saveHistory: (msgs: ChatMessage[]) => write(HISTORY_KEY, msgs),
  loadStep: () => read<number>(STEP_KEY, 1),
  saveStep: (step: number) => write(STEP_KEY, step),
  loadSubmitted: () => read<boolean>(SUBMITTED_KEY, false),
  saveSubmitted: (v: boolean) => write(SUBMITTED_KEY, v),
  reset: () => {
    if (typeof window === "undefined") return;
    [APP_KEY, HISTORY_KEY, STEP_KEY, SUBMITTED_KEY].forEach((k) => window.localStorage.removeItem(k));
  },
};
