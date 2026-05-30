import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { AnyBlock } from '../types';
import { generateLatex } from '../lib/latexGenerator';
import { LATEX_PREAMBLE } from '../constants';
import { Copy, Download, Check } from 'lucide-react';

interface CodePreviewProps {
  blocks: AnyBlock[];
}

export function CodePreview({ blocks }: CodePreviewProps) {
  const [copied, setCopied] = React.useState(false);
  const content = generateLatex(blocks);
  const fullLatex = `${LATEX_PREAMBLE}\n\\begin{document}\n\n\\setstretch{1.5}\n\\addwatermark\n\n${content}\\end{document}\n`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullLatex);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([fullLatex], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'document.tex';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col pt-4">
      <div className="flex justify-between items-center mb-4 rtl:flex-row-reverse" dir="ltr">
        <h2 className="text-lg font-bold text-gray-800 font-sans">LaTeX Code</h2>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mainColor transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            {copied ? 'کپی شد' : 'کپی کد'}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-[#2B547E] rounded-md hover:bg-[#1E3A5A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2B547E] transition-colors"
          >
            <Download className="w-4 h-4" />
            دانلود فایل
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto rounded-lg border border-gray-200 bg-[#1E1E1E]">
        <SyntaxHighlighter
          language="latex"
          style={vscDarkPlus}
          customStyle={{ margin: 0, padding: '1rem', minHeight: '100%', borderRadius: '0.5rem', fontSize: '14px', direction: 'ltr' }}
          wrapLines={true}
          wrapLongLines={true}
        >
          {fullLatex}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
