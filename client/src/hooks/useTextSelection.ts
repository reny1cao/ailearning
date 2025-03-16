import { useState, useEffect, RefObject } from 'react';

interface Position {
  x: number;
  y: number;
}

export function useTextSelection(contentRef: RefObject<HTMLElement>) {
  const [selectedText, setSelectedText] = useState('');
  const [position, setPosition] = useState<Position | null>(null);
  const [showFormatting, setShowFormatting] = useState(false);

  const handleTextSelection = (e: MouseEvent) => {
    const selection = window.getSelection();
    if (!selection || !contentRef.current) return;

    const selectedContent = selection.toString().trim();
    
    // Only clear if there's no text selected
    if (selectedContent.length <= 1) {
      clearSelection();
      return;
    }

    // Check if selection is within content area
    const range = selection.getRangeAt(0);
    const contentRect = contentRef.current.getBoundingClientRect();
    const selectionRect = range.getBoundingClientRect();

    // Ensure selection is within content boundaries
    if (
      selectionRect.top < contentRect.top ||
      selectionRect.bottom > contentRect.bottom ||
      selectionRect.left < contentRect.left ||
      selectionRect.right > contentRect.right
    ) {
      clearSelection();
      return;
    }

    // Update selection without clearing existing one
    setSelectedText(selectedContent);

    // Calculate popup position
    const scrollTop = window.scrollY;
    const scrollLeft = window.scrollX;
    
    // Position the popup above the selection
    const x = (selectionRect.left + selectionRect.right) / 2 + scrollLeft;
    const y = selectionRect.top + scrollTop - 10; // 10px above selection

    setPosition({ x, y });
    setShowFormatting(true);
  };

  const clearSelection = () => {
    setSelectedText('');
    setShowFormatting(false);
    setPosition(null);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        contentRef.current && 
        !contentRef.current.contains(e.target as Node) &&
        !(e.target as Element).closest('.selection-popup') &&
        !(e.target as Element).closest('.ai-response')
      ) {
        clearSelection();
        window.getSelection()?.removeAllRanges();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        clearSelection();
        window.getSelection()?.removeAllRanges();
      }
    };

    const handleScroll = () => {
      if (!showFormatting) {
        clearSelection();
        window.getSelection()?.removeAllRanges();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    document.addEventListener('scroll', handleScroll);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('scroll', handleScroll);
    };
  }, [contentRef, showFormatting]);

  return {
    selectedText,
    position,
    showFormatting,
    handleTextSelection,
    clearSelection
  };
}