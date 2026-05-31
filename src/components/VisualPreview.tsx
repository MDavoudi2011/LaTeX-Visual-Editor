import React, { useState } from 'react';
import { AnyBlock, InnerBlock, BlockType } from '../types';
import { Info, AlertTriangle, Lightbulb, Plus } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { InlineEditor } from './InlineEditor';

function DropZone({ onDrop, className = "h-4 w-full" }: { onDrop: (type: BlockType) => void, className?: string }) {
  const [isOver, setIsOver] = useState(false);
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsOver(true); }}
      onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsOver(false); }}
      onDrop={(e) => { 
        e.preventDefault(); 
        e.stopPropagation();
        setIsOver(false); 
        onDrop(e.dataTransfer.getData('blockType') as BlockType); 
      }}
      className={`transition-all rounded ${isOver ? 'bg-blue-300 border border-blue-500 shadow-inner' : 'opacity-0'} ${className}`}
    />
  );
}

interface VisualPreviewProps {
  blocks: AnyBlock[];
  onUpdateBlock: (id: string, data: any) => void;
  onUpdateInnerBlock?: (boxId: string, itemId: string, data: any) => void;
  onDropBlock?: (type: BlockType, index?: number) => void;
  onDropInnerBlock?: (boxId: string, type: BlockType, index?: number) => void;
}

export function VisualPreview({ blocks, onUpdateBlock, onUpdateInnerBlock, onDropBlock, onDropInnerBlock }: VisualPreviewProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const type = e.dataTransfer.getData('blockType') as BlockType;
    if (type && onDropBlock) {
      onDropBlock(type);
    }
  };

  const handleAddInnerBlock = (boxId: string, type: BlockType, currentIndexes: any[]) => {
    const newId = crypto.randomUUID();
    let newBlock: any;
    switch (type) {
      case 'paragraph': newBlock = { id: newId, type: 'paragraph', data: { content: '' } }; break;
      case 'list': newBlock = { id: newId, type: 'list', data: { items: [''] } }; break;
      case 'code': newBlock = { id: newId, type: 'code', data: { language: 'css', code: '' } }; break;
      default: return; // Only these 3 are allowed as InnerBlocks
    }
    const newItems = [...(currentIndexes || []), newBlock];
    onUpdateBlock(boxId, { items: newItems });
  };

  const renderInnerBlock = (item: InnerBlock, boxId: string) => {
    const isStandalone = !boxId;
    
    switch (item.type) {
      case 'paragraph':
        return (
          <div key={item.id} className="mb-4 group relative">
            <InlineEditor 
              html={item.data.content || ''}
              onChange={(html) => isStandalone ? onUpdateBlock(item.id, { content: html }) : onUpdateInnerBlock?.(boxId, item.id, { content: html })}
              className="whitespace-pre-wrap text-gray-800 text-lg border border-transparent hover:border-gray-200 focus:border-blue-400 p-2 rounded transition-colors"
              placeholder="متن پاراگراف را اینجا بنویسید..."
            />
          </div>
        );
      case 'list':
        return (
          <div key={item.id} className="mb-4 pr-6 mt-4">
            <ul className="list-disc space-y-2">
              {(item.data.items || []).map((liText: string, liIdx: number) => (
                 <li key={liIdx}>
                   <InlineEditor
                     html={liText}
                     onChange={(h) => {
                        const newItems = [...(item.data.items || [])];
                        newItems[liIdx] = h;
                        isStandalone ? onUpdateBlock(item.id, { items: newItems }) : onUpdateInnerBlock?.(boxId, item.id, { items: newItems });
                     }}
                     className="text-gray-800 border-b border-transparent hover:border-gray-200 focus:border-blue-400 leading-relaxed min-h-[1.5em] outline-none pt-0 -mt-1"
                     placeholder="مورد را اینجا بنویسید..."
                   />
                 </li>
              ))}
              <div 
                onClick={() => {
                  const newItems = [...(item.data.items || []), ''];
                  isStandalone ? onUpdateBlock(item.id, { items: newItems }) : onUpdateInnerBlock?.(boxId, item.id, { items: newItems });
                }}
                className="text-xs text-blue-500 hover:text-blue-700 mt-2 flex items-center gap-1 cursor-pointer w-fit"
               >
                 <Plus className="w-4 h-4" /> افزودن مورد
               </div>
            </ul>
          </div>
        );
      case 'code':
        return (
          <div key={item.id} className="mb-4 mt-6 overflow-hidden bg-[#1E1E1E] rounded-xl shadow-lg border border-gray-700 hover:border-blue-500 transition-colors" dir="ltr">
             <div className="flex items-center justify-between px-4 py-2 bg-[#1E1E1E] border-b border-gray-800">
                <div className="flex gap-2">
                   <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
                   <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
                   <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
                </div>
                <select 
                  value={item.data.language || 'html'} 
                  onChange={(e) => isStandalone ? onUpdateBlock(item.id, { language: e.target.value }) : onUpdateInnerBlock?.(boxId, item.id, { language: e.target.value })}
                  className="bg-transparent text-gray-400 text-xs outline-none text-right w-fit cursor-pointer"
                >
                  <option value="css">CSS</option>
                  <option value="html">HTML</option>
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="python">Python</option>
                  <option value="c">C/C++</option>
                  <option value="java">Java</option>
                </select>
             </div>
             <div className="text-left text-sm relative">
               <textarea 
                  value={item.data.code || ''}
                  onChange={(e) => isStandalone ? onUpdateBlock(item.id, { code: e.target.value }) : onUpdateInnerBlock?.(boxId, item.id, { code: e.target.value })}
                  className="absolute inset-0 w-full h-full z-10 font-mono text-sm resize-y outline-none"
                  placeholder="Insert Code..."
                  style={{ minHeight: '100px', background: 'transparent', color: 'transparent', caretColor: 'white', padding: '0.1rem 1rem 1rem 4.9rem', border: 'none' }}
                  spellCheck={false}
               />
               <div className="pointer-events-none" style={{ minHeight: '100px', padding: '0 1rem 1rem 1rem'}}>
                 <SyntaxHighlighter
                   language={(item.data.language || 'html').toLowerCase()}
                   style={vscDarkPlus}
                   customStyle={{ margin: 0, padding: 0, background: 'transparent', fontSize: '14px' }}
                   showLineNumbers={true}
                   lineNumberStyle={{ minWidth: '3em', paddingRight: '1em', color: '#858585', textAlign: 'left' }}
                   wrapLines={true}
                 >
                   {item.data.code || 'Code here...'}
                 </SyntaxHighlighter>
               </div>
             </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`h-full overflow-auto p-8 bg-white border-2 rounded-lg shadow-sm w-full max-w-4xl mx-auto mt-4 transition-colors ${isDragOver ? 'border-dashed border-blue-500 bg-blue-50/50' : 'border-gray-200'}`} 
      style={{ direction: 'rtl', lineHeight: '1.8' }}
    >
      {blocks.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
          <div className="p-6 bg-gray-50 rounded-full border border-dashed border-gray-300">
             <div className="text-4xl text-gray-300 mb-2 text-center">📥</div>
          </div>
          <p>بلوک‌ها را از منوی بالا بکشید و اینجا رها کنید (Drag & Drop)</p>
        </div>
      )}

      {blocks.map((block, index) => {
        const renderRootBlock = () => {
          switch (block.type) {
            case 'header':
              return (
                <div className="text-center mb-12 relative group rounded p-4 border border-transparent hover:border-gray-200 transition-colors">
                  <input 
                    value={block.data.title || ''}
                    onChange={(e) => onUpdateBlock(block.id, { title: e.target.value })}
                    placeholder="عنوان سند"
                    className="text-4xl font-bold text-[#2B547E] mb-6 text-center w-full outline-none bg-transparent"
                  />
                  <input 
                    value={block.data.subtitle || ''}
                    onChange={(e) => onUpdateBlock(block.id, { subtitle: e.target.value })}
                    placeholder="عنوان جلسه"
                    className="text-2xl font-bold text-[#1a334d] mb-4 text-center w-full outline-none bg-transparent"
                  />
                  <div className="text-xl font-bold text-[#1a334d] mb-4">تهیه شده توسط گروه برنامه نویسی هوشیار</div>
                  <div className="text-lg flex items-center justify-center gap-2">
                    مدرس دوره: 
                    <input 
                      value={block.data.instructor || ''}
                      onChange={(e) => onUpdateBlock(block.id, { instructor: e.target.value })}
                      placeholder="نام"
                      className="w-32 bg-transparent outline-none border-b border-transparent focus:border-gray-300 text-center"
                    />
                    <span className="mx-4 font-normal text-gray-400">|</span> منتور: 
                    <input 
                      value={block.data.mentor || ''}
                      onChange={(e) => onUpdateBlock(block.id, { mentor: e.target.value })}
                      placeholder="مهندس..."
                      className="w-40 bg-transparent outline-none border-b border-transparent focus:border-gray-300 text-center"
                    />
                  </div>
                </div>
              );
            case 'section':
              return (
                <div className="mb-6 mt-8 relative group">
                  <input 
                    value={block.data.title || ''}
                    onChange={(e) => onUpdateBlock(block.id, { title: e.target.value })}
                    className="section-counter text-2xl font-bold text-[#2B547E] border-b-2 border-[#2B547E] pb-2 mb-4 w-full outline-none bg-transparent"
                    placeholder="عنوان بخش"
                  />
                </div>
              );
            case 'paragraph':
            case 'list':
            case 'code':
              return renderInnerBlock(block as InnerBlock, '');
            case 'notebox':
              return (
                <div className="mb-6 bg-[#E8F4F8] border border-[#2B547E] rounded-md overflow-hidden shadow-md group">
                  <div className="bg-[#2B547E] px-4 py-2 text-white font-bold flex items-center gap-2">
                    <Info className="w-5 h-5 rtl:-scale-x-100" />
                    <input 
                      value={block.data.title || ''}
                      onChange={(e) => onUpdateBlock(block.id, { title: e.target.value })}
                      className="bg-transparent outline-none text-white placeholder:text-blue-200"
                      placeholder="نکته"
                    />
                  </div>
                  <div className="p-4 text-gray-800 text-lg whitespace-pre-wrap flex flex-col">
                    {block.data.items && block.data.items.length > 0 ? (
                      block.data.items.map((b: any, bIdx: number) => (
                        <React.Fragment key={b.id}>
                          <DropZone onDrop={(type) => onDropInnerBlock?.(block.id, type, bIdx)} />
                          {renderInnerBlock(b, block.id)}
                        </React.Fragment>
                      ))
                    ) : (
                      <InlineEditor 
                        html={block.data.content || ''}
                        onChange={(html) => onUpdateBlock(block.id, { content: html })}
                        className="min-h-[2em]"
                        placeholder="متن نکته..."
                      />
                    )}
                    <DropZone onDrop={(type) => onDropInnerBlock?.(block.id, type, block.data.items?.length || 0)} className="h-8 border-dashed border-2 border-gray-300 mt-2 flex items-center justify-center text-xs text-gray-400 bg-gray-50/50" />
                  </div>
                </div>
              );
            case 'warnbox':
              return (
                <div className="mb-6 bg-[#FDF2E9] border border-[#E74C3C] rounded-md overflow-hidden shadow-md group">
                  <div className="bg-[#E74C3C] px-4 py-2 text-white font-bold flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    <input 
                      value={block.data.title || ''}
                      onChange={(e) => onUpdateBlock(block.id, { title: e.target.value })}
                      className="bg-transparent outline-none text-white placeholder:text-red-200"
                      placeholder="مهم"
                    />
                  </div>
                  <div className="p-4 text-gray-800 text-lg whitespace-pre-wrap flex flex-col">
                    {block.data.items && block.data.items.length > 0 ? (
                      block.data.items.map((b: any, bIdx: number) => (
                        <React.Fragment key={b.id}>
                          <DropZone onDrop={(type) => onDropInnerBlock?.(block.id, type, bIdx)} />
                          {renderInnerBlock(b, block.id)}
                        </React.Fragment>
                      ))
                    ) : (
                      <InlineEditor 
                        html={block.data.content || ''}
                        onChange={(html) => onUpdateBlock(block.id, { content: html })}
                        className="min-h-[2em]"
                        placeholder="متن هشدار..."
                      />
                    )}
                    <DropZone onDrop={(type) => onDropInnerBlock?.(block.id, type, block.data.items?.length || 0)} className="h-8 border-dashed border-2 border-gray-300 flex items-center mt-2 justify-center text-xs text-gray-400 bg-gray-50/50" />
                  </div>
                </div>
              );
            case 'examplebox':
              return (
                <div className="mb-6 bg-[#EAFBF1] border-2 border-[#27AE60] rounded-xl overflow-hidden shadow-md group">
                  <div className="bg-[#27AE60] px-4 py-2 text-white font-bold flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    <input 
                      value={block.data.title || ''}
                      onChange={(e) => onUpdateBlock(block.id, { title: e.target.value })}
                      className="bg-transparent outline-none text-white placeholder:text-green-200"
                      placeholder="مثال"
                    />
                  </div>
                  <div className="p-4 text-gray-800 text-lg whitespace-pre-wrap flex flex-col">
                    {block.data.items && block.data.items.length > 0 ? (
                      block.data.items.map((b: any, bIdx: number) => (
                        <React.Fragment key={b.id}>
                          <DropZone onDrop={(type) => onDropInnerBlock?.(block.id, type, bIdx)} />
                          {renderInnerBlock(b, block.id)}
                        </React.Fragment>
                      ))
                    ) : (
                      <InlineEditor 
                        html={block.data.content || ''}
                        onChange={(html) => onUpdateBlock(block.id, { content: html })}
                        className="min-h-[2em]"
                        placeholder="متن مثال..."
                      />
                    )}
                    <DropZone onDrop={(type) => onDropInnerBlock?.(block.id, type, block.data.items?.length || 0)} className="h-8 border-dashed border-2 border-gray-300 flex mt-2 items-center justify-center text-xs text-gray-400 bg-gray-50/50" />
                  </div>
                </div>
              );
            default:
              return null;
          }
        };

        return (
          <React.Fragment key={block.id}>
             <DropZone onDrop={(type) => onDropBlock?.(type, index)} />
             {renderRootBlock()}
             {index === blocks.length - 1 && (
               <DropZone onDrop={(type) => onDropBlock?.(type, index + 1)} className="h-8 mt-4" />
             )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
