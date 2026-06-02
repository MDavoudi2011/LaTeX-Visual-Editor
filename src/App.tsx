import React, { useState, useEffect } from 'react';
import { Editor } from './components/Editor';
import { VisualPreview } from './components/VisualPreview';
import { CodePreview } from './components/CodePreview';
import { AnyBlock, BlockType, InnerBlock } from './types';
import { Download, Loader2, CheckCircle, Code, Eye, FileCode } from 'lucide-react';
import { generateLatex } from './lib/latexGenerator';
import { LATEX_PREAMBLE } from './constants';

function App() {
  const [blocks, setBlocks] = useState<AnyBlock[]>([]);
  const [isCompiling, setIsCompiling] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<'visual' | 'code'>('visual');

  // Auto-load
  useEffect(() => {
    const saved = localStorage.getItem('latex-blocks');
    if (saved) {
      try { setBlocks(JSON.parse(saved)); } catch (e) {}
    }
    setIsLoaded(true);
  }, []);

  // Auto-save
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('latex-blocks', JSON.stringify(blocks));
    }
  }, [blocks, isLoaded]);

  const handleUpdateBlock = (id: string, partialData: any) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, data: { ...b.data, ...partialData } } as AnyBlock : b));
  };

  const handleUpdateInnerBlock = (boxId: string, itemId: string, partialData: any) => {
    setBlocks(prev => prev.map(b => {
      if (b.id !== boxId) return b;
      const newItems = ((b.data as any).items || []).map((item: any) => 
        item.id === itemId ? { ...item, data: { ...item.data, ...partialData } } : item
      );
      return { ...b, data: { ...b.data, items: newItems } } as AnyBlock;
    }));
  };

  const handleDropBlock = (type: BlockType, index?: number) => {
    const newId = crypto.randomUUID();
    let newBlock: AnyBlock;
    switch (type) {
      case 'header': newBlock = { id: newId, type: 'header', data: { title: '', subtitle: '', instructor: '', mentor: 'مهندس مینا طرهانی' } }; break;
      case 'section': newBlock = { id: newId, type: 'section', data: { title: '' } }; break;
      case 'paragraph': newBlock = { id: newId, type: 'paragraph', data: { content: '' } }; break;
      case 'list': newBlock = { id: newId, type: 'list', data: { items: [''] } }; break;
      case 'code': newBlock = { id: newId, type: 'code', data: { language: 'python', code: '' } }; break;
      case 'notebox':
      case 'warnbox':
      case 'examplebox': newBlock = { id: newId, type, data: { title: '', items: [] } }; break;
      default: return;
    }
    setBlocks(prev => {
       if (type === 'header') return [newBlock, ...prev];
       if (index !== undefined && index >= 0) {
         const arr = [...prev];
         arr.splice(index, 0, newBlock);
         return arr;
       }
       return [...prev, newBlock];
    });
  };

  const handleDropInnerBlock = (boxId: string, type: BlockType, index?: number) => {
    const newId = crypto.randomUUID();
    let newBlock: any;
    switch (type) {
      case 'paragraph': newBlock = { id: newId, type: 'paragraph', data: { content: '' } }; break;
      case 'list': newBlock = { id: newId, type: 'list', data: { items: [''] } }; break;
      case 'code': newBlock = { id: newId, type: 'code', data: { language: 'python', code: '' } }; break;
      default: return; // Only these 3 are allowed as InnerBlocks
    }
    setBlocks(prev => prev.map(b => {
      if (b.id !== boxId) return b;
      const items = [...((b.data as any).items || [])];
      if (index !== undefined && index >= 0) items.splice(index, 0, newBlock);
      else items.push(newBlock);
      return { ...b, data: { ...b.data, items } } as AnyBlock;
    }));
  };

  const handleCompile = async () => {
    setIsCompiling(true);
    
    try {
      const content = generateLatex(blocks);
      const fullLatex = `${LATEX_PREAMBLE}\n\\begin{document}\n\n\\setstretch{1.5}\n\\addwatermark\n\n${content}\\end{document}\n`;
      
      const response = await fetch("https://texapi.aminmadani.xyz:3001/api/compile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ texCode: fullLatex }),
      });
      
      const data = await response.json();
      
      if (data.success && data.pdfUrl) {
        const link = document.createElement('a');
        link.href = data.pdfUrl;
        link.download = 'document.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert("خطا در کامپایل فایل.");
      }
    } catch (error) {
      console.error("Compilation error:", error);
      alert("خطا در ارتباط با سرور.");
    } finally {
      setIsCompiling(false);
    }
  };

  const handleNestBlock = (sourceId: string, targetBoxId: string) => {
    setBlocks(prev => {
      let sourceItem: any = prev.find(b => b.id === sourceId);
      let newPrev = prev;
      
      if (sourceItem) {
        if (!['paragraph', 'list', 'code'].includes(sourceItem.type)) {
          alert('این بلوک را نمی‌توان داخل باکس قرار داد.');
          return prev;
        }
        newPrev = prev.filter(b => b.id !== sourceId);
      } else {
        for (const b of prev) {
          if (b.type === 'notebox' || b.type === 'warnbox' || b.type === 'examplebox') {
             const it = (b.data as any).items?.find((i: any) => i.id === sourceId);
             if (it) {
               sourceItem = it;
               newPrev = newPrev.map(box => box.id === b.id ? { ...box, data: { ...box.data, items: (box.data as any).items.filter((i:any) => i.id !== sourceId) } } as AnyBlock : box);
               break;
             }
          }
        }
      }

      if (!sourceItem) return prev;

      return newPrev.map(b => {
        if (b.id === targetBoxId) {
           return { ...b, data: { ...b.data, items: [...((b.data as any).items || []), sourceItem] } } as AnyBlock;
        }
        return b;
      });
    });
  };

    const handleExtractBlock = (sourceBoxId: string, itemId: string) => {
     setBlocks(prev => {
        let extracted: any = null;
        const newPrev = prev.map(b => {
           if (b.id === sourceBoxId) {
              const data = b.data as any;
              extracted = (data.items || []).find((i:any) => i.id === itemId);
              return { ...b, data: { ...data, items: (data.items || []).filter((i:any) => i.id !== itemId) } } as AnyBlock;
           }
           return b;
        });
        if (extracted) {
           newPrev.push(extracted);
        }
        return newPrev;
     });
  };

  const [sidebarWidth, setSidebarWidth] = useState(300);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      // In RTL, the sidebar is on the right. 
      // clientX is from the left edge. Distance from the right edge is window.innerWidth - clientX.
      let newWidth = window.innerWidth - e.clientX;
      if (newWidth < 200) newWidth = 200;
      if (newWidth > 600) newWidth = 600;
      setSidebarWidth(newWidth);
    };
    const handleMouseUp = () => {
      setIsResizing(false);
    };
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
  }, [isResizing]);

  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);

  const handleAddInnerBlock = (boxId: string, type: BlockType) => {
    setBlocks(prev => {
      let newItem: InnerBlock | null = null;
      const id = Date.now().toString();
      if (type === 'paragraph') {
        newItem = { id, type: 'paragraph', data: { content: '' } };
      } else if (type === 'code') {
        newItem = { id, type: 'code', data: { language: 'javascript', code: '' } };
      } else if (type === 'list') {
        newItem = { id, type: 'list', data: { items: [''] } };
      }

      if (!newItem) {
        alert('این نوع بلوک را نمی‌توان داخل باکس قرار داد.');
        return prev;
      }

      return prev.map(b => {
        if (b.id === boxId) {
             return { ...b, data: { ...b.data, items: [...((b.data as any).items || []), newItem] } } as AnyBlock;
        }
        return b;
      });
    });
  };

  if (!isLoaded) return null;

  return (
    <div className="flex flex-col md:flex-row h-screen w-full overflow-hidden bg-[#F8FAFC]" style={{ direction: 'rtl' }}>
      
      {/* Sidebar Editor (Right) */}
      <div 
         className="relative flex-shrink-0 h-full bg-gray-50/50 border-r border-gray-200 z-20 flex max-md:h-[40vh] max-md:!w-full max-md:border-b md:border-l"
         style={{ width: sidebarWidth }}
      >
        <div className="flex-1 overflow-hidden w-full h-full">
           <Editor 
             blocks={blocks} 
             setBlocks={setBlocks} 
             onNestBlock={handleNestBlock}
             onExtractBlock={handleExtractBlock}
             onAddInnerBlock={handleAddInnerBlock}
             activeBlockId={activeBlockId}
           />
        </div>
        {/* Resizer Handle */}
        <div 
          className="w-1.5 cursor-col-resize hover:bg-blue-400 active:bg-blue-600 bg-transparent absolute left-0 top-0 bottom-0 z-50 transform -translate-x-1/2 max-md:hidden"
          onMouseDown={(e) => { e.preventDefault(); setIsResizing(true); }}
        />
      </div>

      {/* Main Content (Left) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative border-r border-gray-200">
        
        {/* Top bar tabs */}
        <div className="flex max-md:flex-col items-center max-md:justify-center justify-between px-6 py-3 bg-white border-b border-gray-200 z-10 w-full shadow-sm sticky top-0 gap-3">
          <div className="flex items-center flex-wrap max-md:justify-center gap-4">
             <span className="flex items-center gap-1 text-sm font-semibold text-green-600 bg-green-50 px-4 py-2 rounded-md border border-green-100">
               <CheckCircle className="w-5 h-5" /> ذخیره شد
             </span>
             
             <div className="h-6 w-px bg-gray-300 mx-1"></div>
             
             <button 
               onClick={() => setActiveTab('visual')}
               className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === 'visual' ? 'bg-[#2B547E] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
             >
               <Eye className="w-4 h-4" /> پیش‌نمایش
             </button>
             <button 
               onClick={() => setActiveTab('code')}
               className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === 'code' ? 'bg-[#2B547E] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
             >
               <Code className="w-4 h-4" /> کد LaTeX
             </button>
          </div>
          
          <button 
            onClick={handleCompile}
            disabled={isCompiling}
            className="flex items-center max-md:w-full justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-colors bg-[#2B547E] text-white shadow-sm hover:bg-[#1a334d] disabled:opacity-70"
          >
            {isCompiling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {isCompiling ? 'در حال کامپایل...' : 'کامپایل و دانلود PDF'}
          </button>
        </div>

        {/* Canvas Editing Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50/50" style={{ direction: 'ltr' }}>
          <div className="min-h-full p-6 flex flex-col" style={{ direction: 'rtl' }}>
            <div className="flex-1 max-w-5xl mx-auto w-full">
               {activeTab === 'visual' ? (
                  <VisualPreview 
                  blocks={blocks}
                  onUpdateBlock={handleUpdateBlock}
                  onUpdateInnerBlock={handleUpdateInnerBlock}
                  onDropBlock={handleDropBlock}
                  onDropInnerBlock={handleDropInnerBlock}
                  setActiveBlockId={setActiveBlockId}
                />
             ) : (
                <CodePreview blocks={blocks} />
             )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

export default App;
