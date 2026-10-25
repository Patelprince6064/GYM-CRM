import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'

interface FieldShellProps {
  label: string
  error?: string
  hint?: string
  children: (id: string) => ReactNode
}

/** Label + control + error message, wired together with a real <label>. */
export function Field({ label, error, hint, children }: FieldShellProps) {
  const id = useId()
  return (
    <div>
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      {children(id)}
      {error ? <div className="field-error" role="alert">{error}</div> : null}
      {!error && hint ? <div className="text-faint text-xs mt-1.5">{hint}</div> : null}
    </div>
  )
}

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
  hint?: string
}

export function TextField({ label, error, hint, className = '', ...rest }: TextFieldProps) {
  return (
    <Field label={label} error={error} hint={hint}>
      {(id) => <input id={id} className={`input-glass ${error ? 'input-error' : ''} ${className}`} {...rest} />}
    </Field>
  )
}

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
  error?: string
  hint?: string
}

export function SelectField({ label, error, hint, className = '', children, ...rest }: SelectFieldProps) {
  return (
    <Field label={label} error={error} hint={hint}>
      {(id) => (
        <select id={id} className={`input-glass ${error ? 'input-error' : ''} ${className}`} {...rest}>
          {children}
        </select>
      )}
    </Field>
  )
}

type TextAreaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string
  error?: string
  hint?: string
}

export function TextAreaField({ label, error, hint, className = '', ...rest }: TextAreaFieldProps) {
  return (
    <Field label={label} error={error} hint={hint}>
      {(id) => <textarea id={id} className={`input-glass ${error ? 'input-error' : ''} ${className}`} {...rest} />}
    </Field>
  )
}

/** Inline alert used for form-level success / failure messages. */
export function FormAlert({ tone, children }: { tone: 'error' | 'success'; children: ReactNode }) {
  const styles =
    tone === 'error'
      ? { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.2)', color: '#FFFFFF' }
      : { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.3)', color: '#FFFFFF' }
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} style={{ ...styles, borderRadius: 10, padding: '10px 14px', fontSize: '0.82rem', fontWeight: 600 }}>
      {children}
    </div>
  )
}
