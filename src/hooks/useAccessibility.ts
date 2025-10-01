import { useEffect, useState } from 'react';
import { announcer, focusManager, ariaUtils, keyboardNav } from '../utils/accessibility';

// Hook for managing announcements
export function useAnnouncer() {
  return {
    announce: announcer.announce.bind(announcer),
    announceLoading: announcer.announceLoading.bind(announcer),
    announceSuccess: announcer.announceSuccess.bind(announcer),
    announceError: announcer.announceError.bind(announcer),
    announcePokemonSelection: announcer.announcePokemonSelection.bind(announcer),
    announceTeamChange: announcer.announceTeamChange.bind(announcer)
  };
}

// Hook for focus management
export function useFocusManagement() {
  return {
    saveFocus: focusManager.saveFocus,
    restoreFocus: focusManager.restoreFocus,
    trapFocus: focusManager.trapFocus,
    setInitialFocus: focusManager.setInitialFocus
  };
}

// Hook for detecting user preferences
export function useAccessibilityPreferences() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  const [prefersHighContrast, setPrefersHighContrast] = useState(
    window.matchMedia('(prefers-contrast: high)').matches
  );

  const [prefersLargeFonts, setPrefersLargeFonts] = useState(
    window.matchMedia('(prefers-reduced-data: reduce)').matches
  );

  useEffect(() => {
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    const largeFontsQuery = window.matchMedia('(prefers-reduced-data: reduce)');

    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    const handleHighContrastChange = (e: MediaQueryListEvent) => {
      setPrefersHighContrast(e.matches);
    };

    const handleLargeFontsChange = (e: MediaQueryListEvent) => {
      setPrefersLargeFonts(e.matches);
    };

    reducedMotionQuery.addEventListener('change', handleReducedMotionChange);
    highContrastQuery.addEventListener('change', handleHighContrastChange);
    largeFontsQuery.addEventListener('change', handleLargeFontsChange);

    return () => {
      reducedMotionQuery.removeEventListener('change', handleReducedMotionChange);
      highContrastQuery.removeEventListener('change', handleHighContrastChange);
      largeFontsQuery.removeEventListener('change', handleLargeFontsChange);
    };
  }, []);

  return {
    prefersReducedMotion,
    prefersHighContrast,
    prefersLargeFonts
  };
}

// Hook for managing ARIA attributes
export function useAriaAttributes(elementRef: React.RefObject<HTMLElement>) {
  const setExpanded = (expanded: boolean) => {
    if (elementRef.current) {
      ariaUtils.setExpanded(elementRef.current, expanded);
    }
  };

  const setSelected = (selected: boolean) => {
    if (elementRef.current) {
      ariaUtils.setSelected(elementRef.current, selected);
    }
  };

  const setPressed = (pressed: boolean) => {
    if (elementRef.current) {
      ariaUtils.setPressed(elementRef.current, pressed);
    }
  };

  const setChecked = (checked: boolean) => {
    if (elementRef.current) {
      ariaUtils.setChecked(elementRef.current, checked);
    }
  };

  const setDisabled = (disabled: boolean) => {
    if (elementRef.current) {
      ariaUtils.setDisabled(elementRef.current, disabled);
    }
  };

  const setLabel = (label: string) => {
    if (elementRef.current) {
      ariaUtils.setLabel(elementRef.current, label);
    }
  };

  const setDescription = (description: string, descriptionId?: string) => {
    if (elementRef.current) {
      ariaUtils.setDescription(elementRef.current, description, descriptionId);
    }
  };

  return {
    setExpanded,
    setSelected,
    setPressed,
    setChecked,
    setDisabled,
    setLabel,
    setDescription
  };
}

// Hook for keyboard navigation
export function useKeyboardNavigation() {
  const [focusedIndex, setFocusedIndex] = useState(0);

  const handleGridNavigation = (
    event: KeyboardEvent,
    totalItems: number,
    columns: number,
    onNavigate?: (newIndex: number) => void
  ) => {
    const handleNavigation = (newIndex: number) => {
      setFocusedIndex(newIndex);
      onNavigate?.(newIndex);
    };

    // Use the keyboard navigation utility
    keyboardNav.handleGridNavigation(event, focusedIndex, totalItems, columns, handleNavigation);
  };

  const handleListNavigation = (
    event: KeyboardEvent,
    totalItems: number,
    onNavigate?: (newIndex: number) => void,
    onSelect?: (index: number) => void
  ) => {
    const handleNavigation = (newIndex: number) => {
      setFocusedIndex(newIndex);
      onNavigate?.(newIndex);
    };

    // Use the keyboard navigation utility
    keyboardNav.handleListNavigation(event, focusedIndex, totalItems, handleNavigation, onSelect);
  };

  return {
    focusedIndex,
    setFocusedIndex,
    handleGridNavigation,
    handleListNavigation
  };
}

// Hook for live region management
export function useLiveRegion(initialText = '') {
  const [text, setText] = useState(initialText);
  const [priority, setPriority] = useState<'polite' | 'assertive'>('polite');

  const announce = (message: string, urgency: 'polite' | 'assertive' = 'polite') => {
    setText(message);
    setPriority(urgency);

    // Clear after announcement
    setTimeout(() => {
      setText('');
    }, 1000);
  };

  return {
    text,
    priority,
    announce
  };
}

// Hook for managing roving tabindex
export function useRovingTabIndex(itemCount: number, initialIndex = 0) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  const getTabIndex = (index: number) => (index === activeIndex ? 0 : -1);

  const setActiveItem = (index: number) => {
    if (index >= 0 && index < itemCount) {
      setActiveIndex(index);
    }
  };

  const moveToNext = () => {
    setActiveIndex((prev) => (prev + 1) % itemCount);
  };

  const moveToPrevious = () => {
    setActiveIndex((prev) => (prev - 1 + itemCount) % itemCount);
  };

  const moveToFirst = () => {
    setActiveIndex(0);
  };

  const moveToLast = () => {
    setActiveIndex(itemCount - 1);
  };

  return {
    activeIndex,
    getTabIndex,
    setActiveItem,
    moveToNext,
    moveToPrevious,
    moveToFirst,
    moveToLast
  };
}

// Hook for managing expandable content
export function useExpandable(initialExpanded = false) {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const triggerId = `expandable-trigger-${Math.random().toString(36).substr(2, 9)}`;
  const contentId = `expandable-content-${Math.random().toString(36).substr(2, 9)}`;

  const toggle = () => {
    setIsExpanded((prev) => !prev);
  };

  const expand = () => {
    setIsExpanded(true);
  };

  const collapse = () => {
    setIsExpanded(false);
  };

  const triggerProps = {
    'aria-expanded': isExpanded,
    'aria-controls': contentId,
    id: triggerId
  };

  const contentProps = {
    'aria-labelledby': triggerId,
    id: contentId,
    hidden: !isExpanded
  };

  return {
    isExpanded,
    toggle,
    expand,
    collapse,
    triggerProps,
    contentProps
  };
}

// Hook for managing modal/dialog state
export function useModal(initialOpen = false) {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const open = () => {
    focusManager.saveFocus();
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    focusManager.restoreFocus();
  };

  const toggle = () => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  };

  return {
    isOpen,
    open,
    close,
    toggle
  };
}

// Hook for skip links
export function useSkipLinks(links: Array<{ href: string; label: string }>) {
  useEffect(() => {
    const skipLinksContainer = document.createElement('div');
    skipLinksContainer.className = 'skip-links';
    skipLinksContainer.style.cssText = `
      position: absolute;
      top: -40px;
      left: 0;
      z-index: 1000;
    `;

    links.forEach(({ href, label }) => {
      const skipLink = document.createElement('a');
      skipLink.href = href;
      skipLink.textContent = label;
      skipLink.className = 'skip-link';
      skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: #000;
        color: #fff;
        padding: 8px 12px;
        text-decoration: none;
        border-radius: 0 0 4px 4px;
        transition: top 0.3s;
        margin-right: 8px;
      `;

      skipLink.addEventListener('focus', () => {
        skipLink.style.top = '0';
        skipLinksContainer.style.top = '0';
      });

      skipLink.addEventListener('blur', () => {
        skipLink.style.top = '-40px';
        skipLinksContainer.style.top = '-40px';
      });

      skipLinksContainer.appendChild(skipLink);
    });

    document.body.insertBefore(skipLinksContainer, document.body.firstChild);

    return () => {
      if (skipLinksContainer.parentNode) {
        skipLinksContainer.parentNode.removeChild(skipLinksContainer);
      }
    };
  }, [links]);
}