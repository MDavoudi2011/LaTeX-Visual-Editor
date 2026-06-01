import React, { useState } from 'react';
import { AnyBlock, BlockType, InnerBlock } from '../types';
import { GripVertical, Trash2, ChevronUp, ChevronDown, PlusCircle, Heading1, Hash, AlignLeft, List as ListIcon, Code2, Info, AlertTriangle, Lightbulb, MoveUpRight, ArrowDownToLine, CornerDownLeft, ChevronLeft } from 'lucide-react';

interface EditorProps {
  blocks: AnyBlock[];
  setBlocks: (blocks: AnyBlock[]) => void;
  onNestBlock: (sourceId: string, targetBoxId: string) => void;
  onExtractBlock: (sourceBoxId: string, itemId: string) => void;
  onAddInnerBlock: (boxId: string, type: BlockType) => void;
  activeBlockId?: string | null;
}

export function Editor({ blocks, setBlocks, onNestBlock, onExtractBlock, onAddInnerBlock, activeBlockId }: EditorProps) {
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [draggedSourceIndex, setDraggedSourceIndex] = useState<number | null>(null);
  const [draggedSourceId, setDraggedSourceId] = useState<string | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const hasHeader = blocks.some(b => b.type === 'header');

  const addBlock = (type: BlockType) => {
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
    }
    if (type === 'header') setBlocks([newBlock, ...blocks]);
    else setBlocks([...blocks, newBlock]);
  };

  const deleteBlock = (id: string) => setBlocks(blocks.filter(b => b.id !== id));

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === blocks.length - 1)) return;
    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
    setBlocks(newBlocks);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50/50 shadow-sm w-full">
      <div className="p-4 bg-white border-b border-gray-200">
        <h2 className="text-sm font-bold text-gray-800 mb-3 text-center">افزودن بلوک (Dragable)</h2>
        <div className="grid grid-cols-2 gap-2">
          <button draggable onDragStart={(e) => e.dataTransfer.setData('blockType', 'header')} onClick={() => addBlock('header')} disabled={hasHeader} className="flex flex-col items-center gap-1 p-2 text-xs font-medium text-[#2B547E] bg-[#2B547E]/5 rounded border border-[#2B547E]/20 hover:bg-[#2B547E]/10 disabled:opacity-50">
            <Heading1 className="w-5 h-5" /> هدر
          </button>
          <button draggable onDragStart={(e) => e.dataTransfer.setData('blockType', 'section')} onClick={() => addBlock('section')} className="flex flex-col items-center gap-1 p-2 text-xs font-medium text-gray-700 bg-white rounded border border-gray-200 hover:bg-gray-50">
            <Hash className="w-5 h-5" /> بخش
          </button>
          <button draggable onDragStart={(e) => e.dataTransfer.setData('blockType', 'paragraph')} onClick={() => addBlock('paragraph')} className="flex flex-col items-center gap-1 p-2 text-xs font-medium text-gray-700 bg-white rounded border border-gray-200 hover:bg-gray-50">
            <AlignLeft className="w-5 h-5" /> پاراگراف
          </button>
          <button draggable onDragStart={(e) => e.dataTransfer.setData('blockType', 'list')} onClick={() => addBlock('list')} className="flex flex-col items-center gap-1 p-2 text-xs font-medium text-gray-700 bg-white rounded border border-gray-200 hover:bg-gray-50">
            <ListIcon className="w-5 h-5" /> لیست
          </button>
          <button draggable onDragStart={(e) => e.dataTransfer.setData('blockType', 'code')} onClick={() => addBlock('code')} className="flex flex-col items-center gap-1 p-2 text-xs font-medium text-gray-700 bg-white rounded border border-gray-200 hover:bg-gray-50">
            <Code2 className="w-5 h-5" /> کد
          </button>
          <button draggable onDragStart={(e) => e.dataTransfer.setData('blockType', 'notebox')} onClick={() => addBlock('notebox')} className="flex flex-col items-center gap-1 p-2 text-xs font-medium text-blue-700 bg-blue-50 rounded border border-blue-200 hover:bg-blue-100">
            <Info className="w-5 h-5" /> نکته
          </button>
          <button draggable onDragStart={(e) => e.dataTransfer.setData('blockType', 'warnbox')} onClick={() => addBlock('warnbox')} className="flex flex-col items-center gap-1 p-2 text-xs font-medium text-red-700 bg-red-50 rounded border border-red-200 hover:bg-red-100">
            <AlertTriangle className="w-5 h-5" /> مهم
          </button>
          <button draggable onDragStart={(e) => e.dataTransfer.setData('blockType', 'examplebox')} onClick={() => addBlock('examplebox')} className="flex flex-col items-center gap-1 p-2 text-xs font-medium text-green-700 bg-green-50 rounded border border-green-200 hover:bg-green-100">
            <Lightbulb className="w-5 h-5" /> مثال
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar" dir="ltr">
        <div dir="rtl">
          <h2 className="text-sm font-bold text-gray-800 mb-3 text-center">ساختار سند (Outline)</h2>
          {blocks.length === 0 ? (
            <div className="text-center text-xs text-gray-400 mt-4">خالی است</div>
          ) : (
            <div className="space-y-2">
              {(() => {
                 let currentSectionId: string | null = null;
                 return blocks.map((block, index) => {
                   if (block.type === 'section') {
                      currentSectionId = block.id;
                   }
                   const isInsideSection = block.type !== 'section' && currentSectionId !== null;
                   const isHidden = block.type !== 'section' && currentSectionId && collapsedSections[currentSectionId];
                   
                   if (isHidden) return null;

                   return (
                <div 
                  key={block.id} 
                  draggable 
                  onDragStart={(e) => { 
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('sourceId', block.id);
                    e.dataTransfer.setData('sourceIndex', index.toString());
                    setDraggedSourceIndex(index);
                    setDraggedSourceId(block.id);
                  }}
                  onDragEnd={() => {
                    setDraggedSourceIndex(null);
                    setDraggedSourceId(null);
                    setDragOverIndex(null);
                  }}
                  onDragOver={(e) => {
                     e.preventDefault();
                     setDragOverIndex(index);
                  }}
                  onDragLeave={() => {
                     if (dragOverIndex === index) {
                         setDragOverIndex(null);
                     }
                  }}
                  onDrop={(e) => {
                     e.preventDefault();
                     e.stopPropagation();
                     setDragOverIndex(null);
                     
                     const blockType = e.dataTransfer.getData('blockType');
                     
                     if (draggedSourceIndex !== null) {
                         if (draggedSourceIndex !== index) {
                             const newBlocks = [...blocks];
                             const [moved] = newBlocks.splice(draggedSourceIndex, 1);
                             newBlocks.splice(index, 0, moved);
                             setBlocks(newBlocks);
                         }
                     } else if (blockType) {
                         // Dragged from Add Block menu
                         const newId = crypto.randomUUID();
                         let newBlock: AnyBlock | null = null;
                         switch (blockType as BlockType) {
                           case 'header': newBlock = { id: newId, type: 'header', data: { title: '', subtitle: '', instructor: '', mentor: 'مهندس مینا طرهانی' } }; break;
                           case 'section': newBlock = { id: newId, type: 'section', data: { title: '' } }; break;
                           case 'paragraph': newBlock = { id: newId, type: 'paragraph', data: { content: '' } }; break;
                           case 'list': newBlock = { id: newId, type: 'list', data: { items: [''] } }; break;
                           case 'code': newBlock = { id: newId, type: 'code', data: { language: 'python', code: '' } }; break;
                           case 'notebox':
                           case 'warnbox':
                           case 'examplebox': newBlock = { id: newId, type: blockType as any, data: { title: '', items: [] } }; break;
                         }
                         if (newBlock) {
                             const newBlocks = [...blocks];
                             newBlocks.splice(index, 0, newBlock);
                             setBlocks(newBlocks);
                         }
                     }
                  }}
                  className={`bg-white rounded border shadow-sm px-2 py-2 flex flex-col transition-all duration-200 group ${isInsideSection ? 'mr-4' : ''} ${block.type === 'section' ? 'border-gray-300 bg-gray-50' : ''} ${dragOverIndex === index ? 'border-t-2 border-t-blue-500 bg-blue-50 border-x-blue-300 border-b-blue-300' : activeBlockId === block.id ? 'border-2 border-blue-400 bg-blue-50/30' : 'border-gray-200'} relative overflow-hidden`}
                >
                 {activeBlockId === block.id && <div className="absolute right-0 top-0 bottom-0 w-1 bg-blue-500" />}
                 <div className="flex items-center w-full">
                   {block.type === 'section' && (
                     <button 
                        onClick={() => setCollapsedSections(prev => ({...prev, [block.id]: !prev[block.id]}))}
                        className="text-gray-400 hover:text-gray-600 p-0.5 rounded hover:bg-gray-200 ml-1"
                     >
                       {collapsedSections[block.id] ? <ChevronLeft className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                     </button>
                   )}
                   <div className="cursor-grab text-gray-400 hover:text-gray-600 mr-2 ml-1">
                     <GripVertical className="w-4 h-4" />
                   </div>
                   <span className="text-xs font-medium text-gray-700 flex-1 truncate">
                     {block.type === 'header' && (block.data.title || 'سربرگ')}
                     {block.type === 'section' && (block.data.title || 'بخش')}
                     {block.type === 'paragraph' && 'پاراگراف'}
                     {block.type === 'list' && 'لیست'}
                     {block.type === 'code' && 'کد'}
                     {block.type === 'notebox' && 'باکس نکته'}
                     {block.type === 'warnbox' && 'باکس مهم'}
                     {block.type === 'examplebox' && 'باکس مثال'}
                   </span>
                   <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity bg-white pl-1 absolute left-1">
                     <button onClick={() => moveBlock(index, 'up')} disabled={index === 0} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30" title="بالا">
                       <ChevronUp className="w-3 h-3" />
                     </button>
                     <button onClick={() => moveBlock(index, 'down')} disabled={index === blocks.length - 1} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30" title="پایین">
                       <ChevronDown className="w-3 h-3" />
                     </button>
                     <button onClick={() => deleteBlock(block.id)} className="p-1 text-red-400 hover:text-red-600" title="حذف">
                       <Trash2 className="w-3 h-3" />
                     </button>
                   </div>
                 </div>
                 
                 { (block.type === 'notebox' || block.type === 'warnbox' || block.type === 'examplebox') && (
                    <div className="pr-6 mt-1 border-r-2 border-gray-100 flex flex-col gap-1 w-full text-right">
                       {block.data.items && block.data.items.length > 0 && block.data.items.map((item: any) => (
                          <div key={item.id} className="text-[10px] text-gray-500 bg-gray-50 px-2 py-1 flex items-center justify-between rounded group">
                              <span className="flex items-center gap-1">
                                <CornerDownLeft className="w-3 h-3" />
                                {item.type === 'paragraph' ? 'پاراگراف' : item.type === 'list' ? 'لیست' : 'کد'}
                              </span>
                             <button onClick={() => onExtractBlock(block.id, item.id)} className="text-blue-500 hover:text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity" title="انتقال به بیرون">
                               <MoveUpRight className="w-3 h-3" />
                             </button>
                          </div>
                       ))}
                       <div 
                          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                          onDrop={(e) => {
                             e.preventDefault();
                             e.stopPropagation();
                             const sourceId = draggedSourceId || e.dataTransfer.getData('sourceId');
                             const blockType = e.dataTransfer.getData('blockType');
                             if (sourceId) {
                               onNestBlock(sourceId, block.id);
                             } else if (blockType) {
                               onAddInnerBlock(block.id, blockType as BlockType);
                             }
                          }}
                          className="text-[10px] text-gray-400 border border-dashed border-gray-300 rounded text-center py-1 bg-gray-50 mt-1 cursor-default hover:bg-blue-50 hover:border-blue-300 hover:text-blue-500 transition-colors"
                       >
                          <ArrowDownToLine className="w-3 h-3 inline-block ml-1" />
                          اینجا رها کنید (Drop)
                       </div>
                    </div>
                 )}
              </div>
            );
         })})()}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
