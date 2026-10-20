"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Fingerprint,
  Loader2,
  LockKeyhole,
  LogIn,
} from "lucide-react";
import { PasswordField } from "@/components/liquid/PasswordField";
import { validateEmail, validatePassword } from "@/lib/validation";

interface FieldErrors {
  email: string | null;
  password: string | null;
}

interface LoginApiResponse {
  message?: string;
  errors?: {
    email?: string | null;
    password?: string | null;
  };
}

export function LoginForm() {
  const router = useRouter();
  const emailInputId = useId();
  const emailErrorId = `${emailInputId}-error`;
  const formErrorId = useId();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({
    email: null,
    password: null,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement | null>(null);

  function clearEmailError() {
    setFieldErrors((current) =>
      current.email ? { ...current, email: null } : current
    );
  }

  function validateEmailField() {
    const emailError = validateEmail(email);
    setFieldErrors((current) => ({ ...current, email: emailError }));
    return emailError;
  }

  function handleEmailBlur() {
    // Instant inline feedback, mirroring the submit-time validation.
    if (email.length > 0) validateEmailField();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    setFormError(null);
    const emailError = validateEmailField();
    const passwordError = validatePassword(password);
    setFieldErrors({ email: emailError, password: passwordError });

    if (emailError || passwordError) {
      // Move focus to the first invalid field (keyboard/screen-reader UX).
      const target = emailError ? emailInputRef : passwordInputRef;
      target.current?.focus();
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = (await response.json().catch(() => null)) as
        | LoginApiResponse
        | null;

      if (response.ok) {
        // The httpOnly session cookie is already set by this response;
        // the proxy will allow /dashboard from now on.
        router.replace("/dashboard");
        return;
      }

      if (response.status === 400 && data?.errors) {
        setFieldErrors({
          email: data.errors.email ?? null,
          password: data.errors.password ?? null,
        });
      }
      setFormError(
        data?.message ?? "Não foi possível entrar. Tente novamente."
      );
    } catch {
      setFormError(
        "Não foi possível conectar ao servidor. Verifique sua conexão."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <header className="flex flex-col items-center gap-3 text-center">
        <span className="glass-brand-tile">
          <Fingerprint className="h-7 w-7" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-semibold tracking-wide" style={{ color: "var(--glass-ink)" }}>
            GlassID
          </p>
          <p className="text-xs" style={{ color: "var(--glass-ink-muted)" }}>
            Portal Corporativo
          </p>
        </div>
      </header>

      <div className="w-full text-center">
        <h1
          id="login-title"
          className="text-2xl font-semibold tracking-tight sm:text-3xl"
          style={{ color: "var(--glass-ink)" }}
        >
          Entrar
        </h1>
        <p
          className="mt-1.5 text-sm sm:text-base"
          style={{ color: "var(--glass-ink-muted)" }}
        >
          Acesse sua conta para continuar.
        </p>
      </div>

      {formError ? (
        <div
          id={formErrorId}
          className="glass-alert w-full"
          role="alert"
          aria-live="polite"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <span>{formError}</span>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} noValidate className="flex w-full flex-col gap-5">
        <div>
          <label
            htmlFor={emailInputId}
            className="mb-2 block text-sm font-medium"
            style={{ color: "var(--glass-ink-label)" }}
          >
            E-mail
          </label>
          <div className="glass-input-wrap">
            <input
              id={emailInputId}
              ref={emailInputRef}
              type="email"
              className="glass-input"
              placeholder="voce@empresa.com.br"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                clearEmailError();
              }}
              onBlur={handleEmailBlur}
              disabled={isSubmitting}
              required
              autoComplete="email"
              inputMode="email"
              autoFocus
              aria-invalid={fieldErrors.email ? true : undefined}
              aria-describedby={fieldErrors.email ? emailErrorId : undefined}
            />
            <span className="glass-input-sweep" aria-hidden="true" />
          </div>
          {fieldErrors.email ? (
            <p id={emailErrorId} className="field-error" role="alert">
              <span aria-hidden="true">•</span>
              {fieldErrors.email}
            </p>
          ) : null}
        </div>

        <PasswordField
          value={password}
          inputRef={passwordInputRef}
          onChange={(value) => {
            setPassword(value);
            setFieldErrors((current) =>
              current.password ? { ...current, password: null } : current
            );
          }}
          onBlur={() => {
            if (password.length > 0) {
              setFieldErrors((current) => ({
                ...current,
                password: validatePassword(password),
              }));
            }
          }}
          error={fieldErrors.password}
          disabled={isSubmitting}
        />

        <button
          type="submit"
          className="glass-button glass-button--full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              Entrando…
            </>
          ) : (
            <>
              <LogIn className="h-5 w-5" aria-hidden="true" />
              Entrar
            </>
          )}
        </button>
      </form>

      <p
        className="flex items-center gap-1.5 text-xs"
        style={{ color: "var(--glass-ink-muted)" }}
      >
        <LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" />
        Conexão segura e criptografada
      </p>
    </div>
  );
}
