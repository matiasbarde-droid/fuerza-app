/** Componentes de interfaz reutilizables (botones grandes, chips, cabecera). */
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from './Icon';

export function PageHeader({
  title,
  back,
  action,
}: {
  title: string;
  back?: boolean;
  action?: ReactNode;
}) {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-2 bg-bg/95 px-2 backdrop-blur">
      {back && (
        <button
          onClick={() => navigate(-1)}
          className="grid h-11 w-11 place-items-center rounded-full text-muted active:bg-surface-2"
          aria-label="Volver"
        >
          <Icon name="back" className="h-6 w-6" />
        </button>
      )}
      <h1 className={`flex-1 truncate text-xl font-bold ${back ? '' : 'px-2'}`}>{title}</h1>
      {action}
    </header>
  );
}

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-accent text-accent-ink active:brightness-90',
  secondary: 'bg-surface-2 text-text active:bg-line',
  danger: 'bg-danger/15 text-danger active:bg-danger/25',
  ghost: 'text-muted active:bg-surface-2',
};

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      {...props}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 font-semibold disabled:opacity-40 ${VARIANTS[variant]} ${className}`}
    />
  );
}

export function Chip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`h-9 shrink-0 rounded-full border px-3.5 text-sm font-medium ${
        active ? 'border-accent bg-accent text-accent-ink' : 'border-line bg-surface text-text'
      }`}
    >
      {children}
    </button>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl bg-surface p-4 ${className}`}>{children}</div>;
}
