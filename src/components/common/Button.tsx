import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  icon?: IconDefinition;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  icon,
  iconPosition = 'left',
  loading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 text-sm px-4 py-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-glow-cyan font-semibold',
    secondary: 'bg-dark-800 hover:bg-dark-700 text-slate-200 border border-slate-700/60',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white shadow-glow-rose',
    ghost: 'hover:bg-dark-800/80 text-slate-400 hover:text-slate-100',
    outline: 'border border-sky-500/40 text-sky-400 hover:bg-sky-500/10',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {icon && iconPosition === 'left' && (
        <FontAwesomeIcon icon={icon} className={loading ? 'animate-spin' : ''} />
      )}
      {children}
      {icon && iconPosition === 'right' && (
        <FontAwesomeIcon icon={icon} className={loading ? 'animate-spin' : ''} />
      )}
    </button>
  );
};
