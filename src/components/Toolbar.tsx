import React, { useEffect, useState } from 'react';
import { Bold, Italic, Underline } from 'lucide-react';

export function FormattingToolbar() {
  const [formats, setFormats] = useState({ bold: false, italic: false, underline: false });

  const updateFormatState = () => {
    setFormats({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline')
    });
  };

  useEffect(() => {
    document.addEventListener('selectionchange', updateFormatState);
    return () => document.removeEventListener('selectionchange', updateFormatState);
  }, []);

  const handleCommand = (command: string) => {
    document.execCommand(command, false);
    updateFormatState();
  };

  return (
    <div className="flex items-center gap-1 p-1 bg-white border border-gray-200 rounded-md shadow-sm h-10">
      <button 
        onMouseDown={(e) => { e.preventDefault(); handleCommand('bold'); }}
        className={`p-1.5 rounded transition-colors ${formats.bold ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`} title="تیره (Bold)"
      >
        <Bold className="w-4 h-4" />
      </button>
      <button 
        onMouseDown={(e) => { e.preventDefault(); handleCommand('italic'); }}
        className={`p-1.5 rounded transition-colors ${formats.italic ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`} title="مورب (Italic)"
      >
        <Italic className="w-4 h-4" />
      </button>
      <button 
        onMouseDown={(e) => { e.preventDefault(); handleCommand('underline'); }}
        className={`p-1.5 rounded transition-colors ${formats.underline ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`} title="زیرخط (Underline)"
      >
        <Underline className="w-4 h-4" />
      </button>
    </div>
  );
}
