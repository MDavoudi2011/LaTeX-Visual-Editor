import React, { useRef, useEffect } from 'react';

interface InlineEditorProps {
  html: string;
  onChange: (html: string) => void;
  tagName?: string;
  className?: string;
  placeholder?: string;
}

export function InlineEditor({ html, onChange, tagName = 'div', className = '', placeholder }: InlineEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  useEffect(() => {
    resize();
  }, [html]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey && e.key === 'b') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const val = target.value;
      const selected = val.substring(start, end);
      const newVal = val.substring(0, start) + `**${selected}**` + val.substring(end);
      onChange(newVal);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = start + 2;
          textareaRef.current.selectionEnd = end + 2;
        }
      }, 0);
    }
  };

  return (
    <textarea
      ref={textareaRef}
      value={html}
      onChange={(e) => {
        onChange(e.target.value);
        resize();
      }}
      onKeyDown={handleKeyDown}
      className={`w-full bg-transparent resize-none overflow-hidden outline-none ${className}`}
      placeholder={placeholder}
      rows={1}
      dir={html ? "auto" : "rtl"}
      style={{ minHeight: '1.5em' }}
    />
  );
}
