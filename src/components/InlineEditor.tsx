import React, { useRef, useEffect } from 'react';

interface InlineEditorProps {
  html: string;
  onChange: (html: string) => void;
  tagName?: string;
  className?: string;
  placeholder?: string;
}

export function InlineEditor({ html, onChange, tagName = 'div', className = '', placeholder }: InlineEditorProps) {
  const ref = useRef<HTMLElement>(null);
  const lastHtml = useRef(html);

  useEffect(() => {
    if (ref.current && html !== lastHtml.current) {
      if (document.activeElement !== ref.current) {
        ref.current.innerHTML = html;
        lastHtml.current = html;
      }
    }
  }, [html]);

  const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
    const value = e.currentTarget.innerHTML;
    lastHtml.current = value;
    onChange(value);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.ctrlKey && e.key === 'b') {
      e.preventDefault();
      document.execCommand('bold', false);
    } else if (e.ctrlKey && e.key === 'i') {
      e.preventDefault();
      document.execCommand('italic', false);
    } else if (e.ctrlKey && e.key === 'u') {
      e.preventDefault();
      document.execCommand('underline', false);
    }
  };

  return React.createElement(tagName, {
    ref,
    className: `outline-none min-h-[1.5em] empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 cursor-text ${className}`,
    contentEditable: true,
    onBlur: handleBlur,
    onPaste: handlePaste,
    onKeyDown: handleKeyDown,
    'data-placeholder': placeholder,
    suppressContentEditableWarning: true,
    dangerouslySetInnerHTML: { __html: html }
  });
}
