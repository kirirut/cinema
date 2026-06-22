import { useState } from 'react';

interface PasswordInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  placeholder?: string;
}

export function PasswordInput({
  id,
  value,
  onChange,
  autoComplete,
  required,
  minLength,
  placeholder,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="password-field">
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="button"
        className="password-field__toggle"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Скрыть пароль' : 'Показать пароль'}
        tabIndex={-1}
      >
        {visible ? '🙈' : '👁'}
      </button>
    </div>
  );
}
