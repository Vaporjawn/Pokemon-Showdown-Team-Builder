/**
 * Accessibility utilities for Pokemon Team Builder
 * Provides comprehensive accessibility support and WCAG compliance
 */

// Screen reader announcements
export class AccessibilityAnnouncer {
  private static instance: AccessibilityAnnouncer;
  private announceElement!: HTMLElement;

  private constructor() {
    this.createAnnounceElement();
  }

  static getInstance(): AccessibilityAnnouncer {
    if (!this.instance) {
      this.instance = new AccessibilityAnnouncer();
    }
    return this.instance;
  }

  private createAnnounceElement(): void {
    this.announceElement = document.createElement('div');
    this.announceElement.setAttribute('aria-live', 'polite');
    this.announceElement.setAttribute('aria-atomic', 'true');
    this.announceElement.setAttribute('id', 'a11y-announcer');
    this.announceElement.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;
    document.body.appendChild(this.announceElement);
  }

  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    this.announceElement.setAttribute('aria-live', priority);
    this.announceElement.textContent = message;

    // Clear after announcement
    setTimeout(() => {
      this.announceElement.textContent = '';
    }, 1000);
  }

  announceLoading(action: string): void {
    this.announce(`Loading ${action}...`, 'polite');
  }

  announceSuccess(action: string): void {
    this.announce(`${action} completed successfully`, 'polite');
  }

  announceError(error: string): void {
    this.announce(`Error: ${error}`, 'assertive');
  }

  announcePokemonSelection(pokemonName: string): void {
    this.announce(`${pokemonName} selected`, 'polite');
  }

  announceTeamChange(action: string, pokemonName?: string): void {
    const message = pokemonName
      ? `${action}: ${pokemonName}`
      : action;
    this.announce(message, 'polite');
  }
}

// Focus management utilities
export class FocusManager {
  private static focusStack: HTMLElement[] = [];

  static saveFocus(): void {
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement && activeElement !== document.body) {
      this.focusStack.push(activeElement);
    }
  }

  static restoreFocus(): void {
    const previousElement = this.focusStack.pop();
    if (previousElement && previousElement.isConnected) {
      previousElement.focus();
    }
  }

  static trapFocus(container: HTMLElement): (event: KeyboardEvent) => void {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    return (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };
  }

  static setInitialFocus(container: HTMLElement): void {
    const autoFocusElement = container.querySelector('[data-autofocus]') as HTMLElement;
    if (autoFocusElement) {
      autoFocusElement.focus();
      return;
    }

    const firstInput = container.querySelector('input, select, textarea') as HTMLElement;
    if (firstInput) {
      firstInput.focus();
      return;
    }

    const firstButton = container.querySelector('button') as HTMLElement;
    if (firstButton) {
      firstButton.focus();
    }
  }
}

// Keyboard navigation utilities
export class KeyboardNavigation {
  static readonly KEYS = {
    ENTER: 'Enter',
    SPACE: ' ',
    ARROW_UP: 'ArrowUp',
    ARROW_DOWN: 'ArrowDown',
    ARROW_LEFT: 'ArrowLeft',
    ARROW_RIGHT: 'ArrowRight',
    HOME: 'Home',
    END: 'End',
    ESCAPE: 'Escape',
    TAB: 'Tab'
  } as const;

  static handleGridNavigation(
    event: KeyboardEvent,
    currentIndex: number,
    totalItems: number,
    columns: number,
    onNavigate: (newIndex: number) => void
  ): void {
    const { key } = event;
    let newIndex = currentIndex;

    switch (key) {
      case KeyboardNavigation.KEYS.ARROW_LEFT:
        newIndex = Math.max(0, currentIndex - 1);
        break;
      case KeyboardNavigation.KEYS.ARROW_RIGHT:
        newIndex = Math.min(totalItems - 1, currentIndex + 1);
        break;
      case KeyboardNavigation.KEYS.ARROW_UP:
        newIndex = Math.max(0, currentIndex - columns);
        break;
      case KeyboardNavigation.KEYS.ARROW_DOWN:
        newIndex = Math.min(totalItems - 1, currentIndex + columns);
        break;
      case KeyboardNavigation.KEYS.HOME:
        newIndex = 0;
        break;
      case KeyboardNavigation.KEYS.END:
        newIndex = totalItems - 1;
        break;
      default:
        return;
    }

    if (newIndex !== currentIndex) {
      event.preventDefault();
      onNavigate(newIndex);
    }
  }

  static handleListNavigation(
    event: KeyboardEvent,
    currentIndex: number,
    totalItems: number,
    onNavigate: (newIndex: number) => void,
    onSelect?: (index: number) => void
  ): void {
    const { key } = event;
    let newIndex = currentIndex;

    switch (key) {
      case KeyboardNavigation.KEYS.ARROW_UP:
        newIndex = currentIndex > 0 ? currentIndex - 1 : totalItems - 1;
        break;
      case KeyboardNavigation.KEYS.ARROW_DOWN:
        newIndex = currentIndex < totalItems - 1 ? currentIndex + 1 : 0;
        break;
      case KeyboardNavigation.KEYS.HOME:
        newIndex = 0;
        break;
      case KeyboardNavigation.KEYS.END:
        newIndex = totalItems - 1;
        break;
      case KeyboardNavigation.KEYS.ENTER:
      case KeyboardNavigation.KEYS.SPACE:
        if (onSelect) {
          event.preventDefault();
          onSelect(currentIndex);
          return;
        }
        break;
      default:
        return;
    }

    if (newIndex !== currentIndex) {
      event.preventDefault();
      onNavigate(newIndex);
    }
  }
}

// ARIA utilities
export class AriaUtils {
  static setExpanded(element: HTMLElement, expanded: boolean): void {
    element.setAttribute('aria-expanded', expanded.toString());
  }

  static setSelected(element: HTMLElement, selected: boolean): void {
    element.setAttribute('aria-selected', selected.toString());
  }

  static setPressed(element: HTMLElement, pressed: boolean): void {
    element.setAttribute('aria-pressed', pressed.toString());
  }

  static setChecked(element: HTMLElement, checked: boolean): void {
    element.setAttribute('aria-checked', checked.toString());
  }

  static setDisabled(element: HTMLElement, disabled: boolean): void {
    if (disabled) {
      element.setAttribute('aria-disabled', 'true');
      element.setAttribute('tabindex', '-1');
    } else {
      element.removeAttribute('aria-disabled');
      element.removeAttribute('tabindex');
    }
  }

  static setLabel(element: HTMLElement, label: string): void {
    element.setAttribute('aria-label', label);
  }

  static setDescription(element: HTMLElement, description: string, descriptionId?: string): void {
    if (descriptionId) {
      element.setAttribute('aria-describedby', descriptionId);
    } else {
      element.setAttribute('aria-description', description);
    }
  }

  static setLive(element: HTMLElement, live: 'polite' | 'assertive' | 'off' = 'polite'): void {
    element.setAttribute('aria-live', live);
  }

  static setRole(element: HTMLElement, role: string): void {
    element.setAttribute('role', role);
  }

  static setControls(element: HTMLElement, controlsId: string): void {
    element.setAttribute('aria-controls', controlsId);
  }

  static setOwns(element: HTMLElement, ownsId: string): void {
    element.setAttribute('aria-owns', ownsId);
  }

  static setHaspopup(element: HTMLElement, hasPopup: boolean | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog' = true): void {
    element.setAttribute('aria-haspopup', hasPopup.toString());
  }
}

// Color contrast utilities
export class ColorContrastUtils {
  static getContrastRatio(color1: string, color2: string): number {
    const getLuminance = (color: string): number => {
      const rgb = this.hexToRgb(color);
      if (!rgb) return 0;

      const [r, g, b] = rgb.map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });

      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);

    return (brightest + 0.05) / (darkest + 0.05);
  }

  private static hexToRgb(hex: string): [number, number, number] | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : null;
  }

  static meetsWCAGAA(color1: string, color2: string): boolean {
    return this.getContrastRatio(color1, color2) >= 4.5;
  }

  static meetsWCAGAAA(color1: string, color2: string): boolean {
    return this.getContrastRatio(color1, color2) >= 7;
  }

  static validateThemeColors(colors: Record<string, string>): {
    valid: boolean;
    violations: string[];
  } {
    const violations: string[] = [];

    // Check common color combinations
    const combinations = [
      { text: colors.text, background: colors.background, name: 'text on background' },
      { text: colors.primary, background: colors.background, name: 'primary on background' },
      { text: colors.secondary, background: colors.background, name: 'secondary on background' },
      { text: colors.background, background: colors.primary, name: 'background on primary' },
    ];

    combinations.forEach(({ text, background, name }) => {
      if (text && background && !this.meetsWCAGAA(text, background)) {
        violations.push(`Low contrast: ${name} (ratio: ${this.getContrastRatio(text, background).toFixed(2)})`);
      }
    });

    return {
      valid: violations.length === 0,
      violations
    };
  }
}

// Skip link utility
export function createSkipLink(): HTMLElement {
  const skipLink = document.createElement('a');
  skipLink.href = '#main-content';
  skipLink.textContent = 'Skip to main content';
  skipLink.className = 'skip-link';
  skipLink.style.cssText = `
    position: absolute;
    top: -40px;
    left: 6px;
    background: #000;
    color: #fff;
    padding: 8px;
    z-index: 1000;
    text-decoration: none;
    border-radius: 0 0 4px 4px;
    transition: top 0.3s;
  `;

  skipLink.addEventListener('focus', () => {
    skipLink.style.top = '0';
  });

  skipLink.addEventListener('blur', () => {
    skipLink.style.top = '-40px';
  });

  return skipLink;
}

// Reduced motion detection
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// High contrast detection
export function prefersHighContrast(): boolean {
  return window.matchMedia('(prefers-contrast: high)').matches;
}

// Initialize accessibility features
export function initializeA11y(): void {
  // Initialize announcer
  AccessibilityAnnouncer.getInstance();

  // Add skip link
  const skipLink = createSkipLink();
  document.body.insertBefore(skipLink, document.body.firstChild);

  // Add main landmark if not present
  if (!document.getElementById('main-content') && !document.querySelector('main')) {
    const main = document.createElement('main');
    main.id = 'main-content';

    // Move app content into main
    const app = document.getElementById('root');
    if (app && app.children.length > 0) {
      while (app.firstChild) {
        main.appendChild(app.firstChild);
      }
      app.appendChild(main);
    }
  }

  // Set document lang if not present
  if (!document.documentElement.lang) {
    document.documentElement.lang = 'en';
  }
}

// Export singleton instances
export const announcer = AccessibilityAnnouncer.getInstance();
export const focusManager = FocusManager;
export const keyboardNav = KeyboardNavigation;
export const ariaUtils = AriaUtils;
export const colorContrast = ColorContrastUtils;