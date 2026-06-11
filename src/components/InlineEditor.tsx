import React, { Component, createRef } from 'react';

interface InlineEditorProps {
  html: string;
  onChange: (html: string) => void;
  tagName?: string;
  className?: string;
  placeholder?: string;
}

export class InlineEditor extends Component<InlineEditorProps> {
  private ref = createRef<HTMLElement>();
  private lastHtml: string;

  constructor(props: InlineEditorProps) {
    super(props);
    this.lastHtml = props.html;
  }

  shouldComponentUpdate(nextProps: InlineEditorProps) {
    // Always update if structural props change
    if (
      nextProps.tagName !== this.props.tagName ||
      nextProps.className !== this.props.className ||
      nextProps.placeholder !== this.props.placeholder
    ) {
      return true;
    }

    // Only update if the html change came from OUTSIDE (e.g. block deleted/swapped, or loaded from DB)
    // If nextProps.html equals what's currently in the DOM, it was just our own onChange propagating back down!
    if (this.ref.current) {
      if (nextProps.html !== this.ref.current.innerHTML && nextProps.html !== this.props.html) {
        return true;
      }
    }
    
    // Ignore updates that reflect our own typing, preventing cursor jumps!
    return false;
  }

  componentDidUpdate() {
    // If we did legitimately update from outside, sync the DOM manually to be safe
    if (this.ref.current && this.props.html !== this.ref.current.innerHTML) {
      this.ref.current.innerHTML = this.props.html;
      this.lastHtml = this.props.html;
    }
  }

  handleInput = (e: React.FormEvent<HTMLElement>) => {
    const value = e.currentTarget.innerHTML;
    this.lastHtml = value;
    this.props.onChange(value);
  };

  handleBlur = (e: React.FocusEvent<HTMLElement>) => {
    const value = e.currentTarget.innerHTML;
    this.lastHtml = value;
    this.props.onChange(value);
  };

  handlePaste = (e: React.ClipboardEvent<HTMLElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
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

  render() {
    return React.createElement(this.props.tagName || 'div', {
      ref: this.ref,
      className: `outline-none min-h-[1.5em] empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 cursor-text ${this.props.className || ''}`,
      contentEditable: true,
      onInput: this.handleInput,
      onBlur: this.handleBlur,
      onPaste: this.handlePaste,
      onKeyDown: this.handleKeyDown,
      'data-placeholder': this.props.placeholder,
      suppressContentEditableWarning: true,
      dangerouslySetInnerHTML: { __html: this.props.html } // Only processed on initial mount or force update
    });
  }
}
