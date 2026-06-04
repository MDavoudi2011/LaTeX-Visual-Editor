import React from 'react';
import { BlockType } from '../types';
import { Heading1, Hash, AlignLeft, List as ListIcon, Code2, Info, AlertTriangle, Lightbulb } from 'lucide-react';

interface SidebarRightProps {
  blocks: any[];
  setBlocks: (blocks: any[]) => void;
}

export function SidebarRight({ blocks, setBlocks }: SidebarRightProps) {
  const hasHeader = blocks.some(b => b.type === 'header');

  const addBlock = (type: BlockType) => {
    const newId = crypto.randomUUID();
    let newBlock: any;
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

  return (
    <div className="flex flex-col h-full bg-white w-full border-l border-gray-200">
      <h2 className="text-base font-bold text-[#1a334d] p-4 text-center border-b border-gray-100 flex-shrink-0 relative z-10 bg-white">افزودن بلوک</h2>
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="flex flex-col gap-3 h-full pb-2">
          <button draggable onDragStart={(e) => e.dataTransfer.setData('blockType', 'header')} onClick={() => addBlock('header')} disabled={hasHeader} className="flex-1 min-h-[48px] flex items-center justify-center gap-3 px-3 text-lg font-bold text-[#2B547E]/60 bg-[#2B547E]/5 rounded-xl border border-[#2B547E]/20 hover:bg-[#2B547E]/10 disabled:opacity-50 transition-colors w-full shadow-sm">
            <Heading1 className="w-6 h-6 flex-shrink-0" /> <span>هدر</span>
          </button>
          <button draggable onDragStart={(e) => e.dataTransfer.setData('blockType', 'section')} onClick={() => addBlock('section')} className="flex-1 min-h-[48px] flex items-center justify-center gap-3 px-3 text-lg font-bold text-[#2B547E] bg-white rounded-xl border border-gray-200 hover:border-[#2B547E]/40 hover:bg-gray-50 transition-colors w-full shadow-sm">
            <Hash className="w-6 h-6 flex-shrink-0" /> <span>بخش</span>
          </button>
          <button draggable onDragStart={(e) => e.dataTransfer.setData('blockType', 'paragraph')} onClick={() => addBlock('paragraph')} className="flex-1 min-h-[48px] flex items-center justify-center gap-3 px-3 text-lg font-bold text-[#2B547E] bg-white rounded-xl border border-gray-200 hover:border-[#2B547E]/40 hover:bg-gray-50 transition-colors w-full shadow-sm">
            <AlignLeft className="w-6 h-6 flex-shrink-0" /> <span>پاراگراف</span>
          </button>
          <button draggable onDragStart={(e) => e.dataTransfer.setData('blockType', 'list')} onClick={() => addBlock('list')} className="flex-1 min-h-[48px] flex items-center justify-center gap-3 px-3 text-lg font-bold text-[#2B547E] bg-white rounded-xl border border-gray-200 hover:border-[#2B547E]/40 hover:bg-gray-50 transition-colors w-full shadow-sm">
            <ListIcon className="w-6 h-6 flex-shrink-0" /> <span>لیست</span>
          </button>
          <button draggable onDragStart={(e) => e.dataTransfer.setData('blockType', 'code')} onClick={() => addBlock('code')} className="flex-1 min-h-[48px] flex items-center justify-center gap-3 px-3 text-lg font-bold text-[#2B547E] bg-white rounded-xl border border-gray-200 hover:border-[#2B547E]/40 hover:bg-gray-50 transition-colors w-full shadow-sm">
            <Code2 className="w-6 h-6 flex-shrink-0" /> <span>کد</span>
          </button>
          <button draggable onDragStart={(e) => e.dataTransfer.setData('blockType', 'notebox')} onClick={() => addBlock('notebox')} className="flex-1 min-h-[48px] flex items-center justify-center gap-3 px-3 text-lg font-bold text-blue-700 bg-blue-50 rounded-xl border border-blue-200 hover:bg-blue-100 transition-colors w-full shadow-sm">
            <Info className="w-6 h-6 flex-shrink-0" /> <span>نکته</span>
          </button>
          <button draggable onDragStart={(e) => e.dataTransfer.setData('blockType', 'warnbox')} onClick={() => addBlock('warnbox')} className="flex-1 min-h-[48px] flex items-center justify-center gap-3 px-3 text-lg font-bold text-red-700 bg-red-50 rounded-xl border border-red-200 hover:bg-red-100 transition-colors w-full shadow-sm">
            <AlertTriangle className="w-6 h-6 flex-shrink-0" /> <span>مهم</span>
          </button>
          <button draggable onDragStart={(e) => e.dataTransfer.setData('blockType', 'examplebox')} onClick={() => addBlock('examplebox')} className="flex-1 min-h-[48px] flex items-center justify-center gap-3 px-3 text-lg font-bold text-green-700 bg-green-50 rounded-xl border border-green-200 hover:bg-green-100 transition-colors w-full shadow-sm">
            <Lightbulb className="w-6 h-6 flex-shrink-0" /> <span>مثال</span>
          </button>
        </div>
      </div>
    </div>
  );
}
