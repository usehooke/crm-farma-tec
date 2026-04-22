import { useEffect } from 'react';

/**
 * useAutoResizeTextArea (@Agent-Ergonomics)
 * Hook para expandir dinamicamente a altura de uma textarea com base no conteúdo.
 */
export const useAutoResizeTextArea = (
  textAreaRef: HTMLTextAreaElement | null,
  value: string
) => {
  useEffect(() => {
    if (textAreaRef) {
      // Reset height to calculate scrollHeight correctly
      textAreaRef.style.height = 'auto';
      const scrollHeight = textAreaRef.scrollHeight;

      // Set the height based on scrollHeight
      textAreaRef.style.height = `${scrollHeight}px`;
    }
  }, [textAreaRef, value]);
};
