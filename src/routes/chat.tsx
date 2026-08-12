import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { RotateCcw, Send } from "lucide-react";
import {
  STEPS,
  TOTAL_STEPS,
  cleanValue,
  calculateEligibility,
  emptyApplication,
  storage,
  type ChatMessage,
  type LoanApplication,
} from "@/lib/loan";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Loan Application Chat — LoanBank" },
      {
        name: "description",
        content:
          "Chat with LoanBot to complete your LoanBank application in 10 guided steps and get an instant decision.",
      },
      { property: "og:title", content: "Loan Application Chat — LoanBank" },
      {
        property: "og:description",
        content: "Answer 10 quick questions and LoanBot checks your loan eligibility instantly.",
      },
    ],
  }),
  component: ChatPage,
});

let seq = 0;
const nextId = () => `m${Date.now()}-${seq++}`;

function ChatPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [step, setStep] = useState(1);
  const [application, setApplication] = useState<LoanApplication>(emptyApplication);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [typing, setTyping] = useState(false);
  const [ready, setReady] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const current = STEPS[step - 1];

  /** startChat(): restore any saved session, otherwise greet the user. */
  useEffect(() => {
    const saved = storage.loadHistory();
    setApplication(storage.loadApplication());
    if (saved.length > 0) {
      setMessages(saved);
      setStep(storage.loadStep());
    } else {
      setMessages([{ id: nextId(), role: "bot", text: STEPS[0].question }]);
      setStep(1);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    storage.saveHistory(messages);
    storage.saveStep(step);
    storage.saveApplication(application);
  }, [ready, messages, step, application]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const addBotMessage = useCallback((text: string) => {
    setTyping(true);
    window.setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { id: nextId(), role: "bot", text }]);
    }, 700);
  }, []);

  const addUserMessage = useCallback((text: string) => {
    setMessages((m) => [...m, { id: nextId(), role: "user", text }]);
  }, []);

  /** saveAnswer + goToStep: commit the answer and advance the flow. */
  const submitAnswer = useCallback(
    (raw: string) => {
      const value = cleanValue(raw);
      if (current.validate) {
        const problem = current.validate(value);
        if (problem) {
          setError(problem);
          return;
        }
      }
      setError(null);
      addUserMessage(raw);
      setInput("");

      const numeric = current.kind === "number";
      const nextApp: LoanApplication = {
        ...application,
        [current.field]: numeric ? Number(value) : value,
      } as LoanApplication;
      nextApp.eligibility = calculateEligibility(nextApp);
      setApplication(nextApp);

      const nextStep = step + 1;
      if (nextStep > TOTAL_STEPS) {
        addBotMessage(STEPS[TOTAL_STEPS - 1].question);
        setStep(TOTAL_STEPS);
        window.setTimeout(() => navigate({ to: "/summary" }), 1400);
        return;
      }
      setStep(nextStep);
      addBotMessage(STEPS[nextStep - 1].question);
    },
    [addBotMessage, addUserMessage, application, current, navigate, step],
  );

  /** resetChat() */
  const resetChat = useCallback(() => {
    storage.reset();
    setApplication(emptyApplication);
    setMessages([{ id: nextId(), role: "bot", text: STEPS[0].question }]);
    setStep(1);
    setInput("");
    setError(null);
  }, []);

  const isFinal = step >= TOTAL_STEPS;
  const percent = Math.round((step / TOTAL_STEPS) * 100);
  const showQuickReplies = !typing && current.kind === "options";

  return (
    <div className="flex h-dvh flex-col bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-3xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <span aria-hidden="true" className="shrink-0 text-xl">
              🏦
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">LoanBank</p>
              <h1 className="truncate text-xs text-muted-foreground">Loan Application</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">
              Step {step}/{TOTAL_STEPS}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={resetChat}
              aria-label="Start the application over"
              className="min-h-11"
            >
              <RotateCcw aria-hidden="true" />
              <span className="hidden sm:inline">Start Over</span>
            </Button>
          </div>
        </div>
        <div
          className="h-2 w-full bg-secondary"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Application progress: step ${step} of ${TOTAL_STEPS}`}
        >
          <div
            className="gradient-progress h-full transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="mx-auto max-w-3xl px-4 py-1 text-right text-[11px] text-muted-foreground">
          {percent}% complete
        </p>
      </header>

      <div
        ref={scrollRef}
        id="chatMessages"
        className="flex-1 overflow-y-auto px-4 py-6"
        role="log"
        aria-live="polite"
        aria-label="Chat conversation"
      >
        <div className="mx-auto flex max-w-3xl flex-col gap-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className={m.role === "bot" ? "flex justify-start" : "flex justify-end"}
            >
              <p
                className={`animate-message-in max-w-[85%] px-4 py-2.5 text-sm shadow-bank ${
                  m.role === "bot" ? "bubble-bot" : "bubble-user"
                }`}
              >
                {m.text}
              </p>
            </div>
          ))}

          {typing && (
            <div className="flex justify-start" aria-label="LoanBot is typing">
              <span className="bubble-bot flex items-center gap-1 px-4 py-3">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="dot-bounce size-2 rounded-full bg-primary"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </span>
            </div>
          )}

          {showQuickReplies && (
            <div className="flex flex-wrap gap-2 pt-1" role="group" aria-label="Quick replies">
              {current.options?.map((option) => (
                <button
                  key={option}
                  type="button"
                  data-value={option}
                  onClick={() =>
                    isFinal ? navigate({ to: "/summary" }) : submitAnswer(option)
                  }
                  className="min-h-11 rounded-full border border-primary bg-card px-4 py-2 text-sm font-medium text-primary transition-all hover:scale-105 hover:bg-primary hover:text-primary-foreground"
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border bg-card px-4 py-3">
        <form
          className="mx-auto flex max-w-3xl items-start gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!input.trim() || current.kind === "options") return;
            submitAnswer(input.trim());
          }}
        >
          <div className="min-w-0 flex-1">
            <label htmlFor="chatInput" className="sr-only">
              Your answer
            </label>
            <Input
              id="chatInput"
              type={current.kind === "email" ? "email" : current.kind === "number" ? "number" : "text"}
              inputMode={current.kind === "number" ? "numeric" : undefined}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={current.kind === "options"}
              placeholder={
                current.kind === "options" ? "Choose an option above" : current.placeholder
              }
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "chatInputError" : undefined}
              className="min-h-11"
            />
            {error && (
              <p id="chatInputError" role="alert" className="mt-1 text-xs font-medium text-destructive">
                {error}
              </p>
            )}
          </div>
          <Button
            type="submit"
            disabled={current.kind === "options" || !input.trim()}
            aria-label="Send message"
            className="min-h-11 min-w-11"
          >
            <Send aria-hidden="true" />
          </Button>
        </form>
        <p className="mx-auto mt-2 max-w-3xl text-center text-xs text-muted-foreground">
          <Link to="/" className="underline hover:text-primary">
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
