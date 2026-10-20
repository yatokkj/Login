"use client";

import { useId, useState, type Ref } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordFieldProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string | null;
  disabled?: boolean;
  inputRef?: Ref<HTMLInputElement>;
}

/**
 * Password input with a show/hide toggle. The light-sweep layer sits right
 * after the input (sibling selector drives the CSS refraction effect).
 */
export function PasswordField({
  value,
  onChange,
  onBlur,
  error,
  disabled,
  inputRef,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const inputId = useId();
  const errorId = `${inputId}-error`;

  return (
    <div>
      <label
        htmlFor={inputId}
        className="mb-2 block text-sm font-medium"
        style={{ color: "var(--glass-ink-label)" }}
      >
        Senha
      </label>
      <div className="glass-input-wrap">
        <input
          id={inputId}
          ref={inputRef}
          type={visible ? "text" : "password"}
          className="glass-input glass-input--password"
          placeholder="Digite sua senha"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          required
          autoComplete="current-password"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
        />
        <span className="glass-input-sweep" aria-hidden="true" />
        <button
          type="button"
          className="glass-eye"
          onClick={() => setVisible((current) => !current)}
          disabled={disabled}
          aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
          aria-pressed={visible}
        >
          {visible ? (
            <EyeOff className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Eye className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </div>
      {error ? (
        <p id={errorId} className="field-error" role="alert">
          <span aria-hidden="true">•</span>
          {error}
        </p>
      ) : null}
    </div>
  );
}
