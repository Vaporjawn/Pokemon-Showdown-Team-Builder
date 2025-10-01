import React, { useEffect, useRef, useState } from 'react';
import { keyboardNav, focusManager, announcer } from '../utils/accessibility';

interface AccessibleDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
  initialFocus?: 'first' | 'last' | 'auto';
  closeOnEscape?: boolean;
  closeOnBackdrop?: boolean;
  role?: 'dialog' | 'alertdialog';
}

export const AccessibleDialog: React.FC<AccessibleDialogProps> = ({
  open,
  onClose,
  title,
  children,
  className = '',
  initialFocus = 'auto',
  closeOnEscape = true,
  closeOnBackdrop = true,
  role = 'dialog'
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useRef(`dialog-title-${Math.random().toString(36).substr(2, 9)}`);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (open) {
      focusManager.saveFocus();
      setIsVisible(true);
      announcer.announce(`${title} dialog opened`);
    } else {
      setIsVisible(false);
      focusManager.restoreFocus();
    }

    return () => {
      if (open) {
        focusManager.restoreFocus();
      }
    };
  }, [open, title]);

  useEffect(() => {
    if (!open || !dialogRef.current) return;

    const dialog = dialogRef.current;
    const trapFocus = focusManager.trapFocus(dialog);

    // Set initial focus
    setTimeout(() => {
      if (initialFocus === 'first') {
        const firstFocusable = dialog.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') as HTMLElement;
        firstFocusable?.focus();
      } else if (initialFocus === 'last') {
        const focusableElements = dialog.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;
        lastFocusable?.focus();
      } else {
        focusManager.setInitialFocus(dialog);
      }
    }, 100);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === keyboardNav.KEYS.ESCAPE && closeOnEscape) {
        event.preventDefault();
        onClose();
        return;
      }
      trapFocus(event);
    };

    dialog.addEventListener('keydown', handleKeyDown);

    return () => {
      dialog.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose, closeOnEscape, initialFocus]);

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (closeOnBackdrop && event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 ${className}`}
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role={role}
        aria-labelledby={titleId.current}
        aria-modal="true"
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-screen overflow-y-auto"
      >
        <div className="p-6">
          <h2 id={titleId.current} className="text-lg font-semibold mb-4">
            {title}
          </h2>
          {children}
        </div>
      </div>
    </div>
  );
};

interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  loading = false,
  loadingText = 'Loading...',
  disabled,
  className = '',
  children,
  onClick,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500'
  };

  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg'
  };

  const isDisabled = disabled || loading;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (loading) return;
    onClick?.(event);
  };

  return (
    <button
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      disabled={isDisabled}
      aria-label={loading ? loadingText : props['aria-label']}
      onClick={handleClick}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-3 h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {loading ? loadingText : children}
    </button>
  );
};

interface AccessibleGridProps {
  items: Array<{ id: string; content: React.ReactNode }>;
  columns?: number;
  onItemSelect?: (id: string, index: number) => void;
  selectedId?: string;
  className?: string;
  itemClassName?: string;
  ariaLabel?: string;
}

export const AccessibleGrid: React.FC<AccessibleGridProps> = ({
  items,
  columns = 3,
  onItemSelect,
  selectedId,
  className = '',
  itemClassName = '',
  ariaLabel = 'Grid'
}) => {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    keyboardNav.handleGridNavigation(
      event.nativeEvent,
      focusedIndex,
      items.length,
      columns,
      (newIndex) => {
        setFocusedIndex(newIndex);
        const newItem = gridRef.current?.children[newIndex] as HTMLElement;
        newItem?.focus();
      }
    );

    if ((event.key === keyboardNav.KEYS.ENTER || event.key === keyboardNav.KEYS.SPACE) && onItemSelect) {
      event.preventDefault();
      onItemSelect(items[focusedIndex].id, focusedIndex);
    }
  };

  return (
    <div
      ref={gridRef}
      role="grid"
      aria-label={ariaLabel}
      className={`grid gap-4 ${className}`}
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      onKeyDown={handleKeyDown}
    >
      {items.map((item, index) => (
        <div
          key={item.id}
          role="gridcell"
          tabIndex={index === focusedIndex ? 0 : -1}
          aria-selected={selectedId === item.id}
          className={`
            cursor-pointer rounded-lg border-2 transition-colors
            ${selectedId === item.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
            ${index === focusedIndex ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
            ${itemClassName}
          `}
          onClick={() => onItemSelect?.(item.id, index)}
          onFocus={() => setFocusedIndex(index)}
        >
          {item.content}
        </div>
      ))}
    </div>
  );
};

interface AccessibleListProps {
  items: Array<{ id: string; label: string; content?: React.ReactNode }>;
  onItemSelect?: (id: string, index: number) => void;
  selectedId?: string;
  multiSelect?: boolean;
  selectedIds?: string[];
  className?: string;
  itemClassName?: string;
  ariaLabel?: string;
}

export const AccessibleList: React.FC<AccessibleListProps> = ({
  items,
  onItemSelect,
  selectedId,
  multiSelect = false,
  selectedIds = [],
  className = '',
  itemClassName = '',
  ariaLabel = 'List'
}) => {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  const isSelected = (id: string) => {
    return multiSelect ? selectedIds.includes(id) : selectedId === id;
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    keyboardNav.handleListNavigation(
      event.nativeEvent,
      focusedIndex,
      items.length,
      (newIndex) => {
        setFocusedIndex(newIndex);
        const newItem = listRef.current?.children[newIndex] as HTMLElement;
        newItem?.focus();
      },
      (index) => {
        onItemSelect?.(items[index].id, index);
      }
    );
  };

  return (
    <ul
      ref={listRef}
      role={multiSelect ? 'listbox' : 'listbox'}
      aria-label={ariaLabel}
      aria-multiselectable={multiSelect}
      className={`space-y-1 ${className}`}
      onKeyDown={handleKeyDown}
    >
      {items.map((item, index) => (
        <li
          key={item.id}
          role="option"
          tabIndex={index === focusedIndex ? 0 : -1}
          aria-selected={isSelected(item.id)}
          className={`
            cursor-pointer rounded-md px-3 py-2 transition-colors
            ${isSelected(item.id) ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}
            ${index === focusedIndex ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
            ${itemClassName}
          `}
          onClick={() => onItemSelect?.(item.id, index)}
          onFocus={() => setFocusedIndex(index)}
        >
          <span className="block font-medium">{item.label}</span>
          {item.content && (
            <div className="mt-1 text-sm opacity-75">{item.content}</div>
          )}
        </li>
      ))}
    </ul>
  );
};