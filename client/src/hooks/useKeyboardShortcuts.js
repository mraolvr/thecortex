import { useEffect, useCallback } from 'react';

export function useKeyboardShortcuts(shortcuts) {
  const handleKeyDown = useCallback((event) => {
    const { key, ctrlKey, shiftKey, altKey } = event;
    
    // Find matching shortcut
    const shortcut = shortcuts.find(s => 
      s.key === key && 
      s.ctrlKey === ctrlKey && 
      s.shiftKey === shiftKey && 
      s.altKey === altKey
    );

    if (shortcut) {
      event.preventDefault();
      shortcut.action();
    }
  }, [shortcuts]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// Common shortcuts
export const COMMON_SHORTCUTS = {
  NEW_ITEM: { key: 'n', ctrlKey: true, description: 'Create new item' },
  SAVE: { key: 's', ctrlKey: true, description: 'Save changes' },
  DELETE: { key: 'Delete', description: 'Delete selected item' },
  EDIT: { key: 'e', ctrlKey: true, description: 'Edit selected item' },
  SEARCH: { key: 'f', ctrlKey: true, description: 'Search' },
  ESCAPE: { key: 'Escape', description: 'Close modal/cancel' },
}; 