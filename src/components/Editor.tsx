import React from 'react';
import { AnyBlock, BlockType } from '../types';
import { GripVertical, Trash2, ChevronUp, ChevronDown, PlusCircle } from 'lucide-react';
import { motion, Reorder } from 'motion/react';

interface EditorProps {
  blocks: AnyBlock[];
  setBlocks: (blocks: AnyBlock[]) => void;
}

export function Editor({ blocks, setBlocks }: EditorProps) {
  
  const hasHeader = blocks.some(b => b.type === 'header');

  const addBlock = (type: BlockType) => {
    const newId = crypto.randomUUID();
    let newBlock: AnyBlock;
    
    switch (type) {
      case 'header':
        newBlock = { id: newId, type: 'header', data: { title: '', subtitle: '', instructor: '', mentor: 'مهندس مینا طرهانی' } };
        break;
      case 'section':
        newBlock = { id: newId, type: 'section', data: { title: '' } };
        break;
      case 'paragraph':
        newBlock = { id: newId, type: 'paragraph', data: { content: '' } };
        break;
      case 'notebox':
      case 'warnbox':
      case 'examplebox':
        newBlock = { id: newId, type, data: { title: '', content: '' } };
        break;
    }
    
    // Header should ideally be at the top
    if (type === 'header') {
      setBlocks([newBlock, ...blocks]);
    } else {
      setBlocks([...blocks, newBlock]);
    }
  };

  const updateBlock = (id: string, partialData: any) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, data: { ...b.data, ...partialData } } : b));
  };

  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === blocks.length - 1)) return;
    
    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
    setBlocks(newBlocks);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50/50 border-l border-gray-200 shadow-sm z-10 w-[450px]">
      <div className="p-4 bg-white border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-800 mb-4">افزودن بلوک جدید</h2>
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={() => addBlock('header')} 
            disabled={hasHeader}
            className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-[#2B547E] bg-[#2B547E]/10 rounded border border-[#2B547E]/20 hover:bg-[#2B547E]/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlusCircle className="w-4 h-4" /> هدر (Header)
          </button>
          <button 
            onClick={() => addBlock('section')}
            className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white rounded border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <PlusCircle className="w-4 h-4" /> بخش (Section)
          </button>
          <button 
            onClick={() => addBlock('paragraph')}
            className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white rounded border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <PlusCircle className="w-4 h-4" /> پاراگراف
          </button>
          <button 
            onClick={() => addBlock('notebox')}
            className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded border border-blue-200 hover:bg-blue-100 transition-colors"
          >
            <PlusCircle className="w-4 h-4" /> باکس نکته
          </button>
          <button 
            onClick={() => addBlock('warnbox')}
            className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 rounded border border-red-200 hover:bg-red-100 transition-colors"
          >
            <PlusCircle className="w-4 h-4" /> باکس مهم
          </button>
          <button 
            onClick={() => addBlock('examplebox')}
            className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-green-700 bg-green-50 rounded border border-green-200 hover:bg-green-100 transition-colors"
          >
            <PlusCircle className="w-4 h-4" /> باکس مثال
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {blocks.length === 0 ? (
          <div className="text-center text-sm text-gray-500 mt-10">
            برای شروع یک بلوک از بالا اضافه کنید.
          </div>
        ) : (
          <Reorder.Group axis="y" values={blocks} onReorder={setBlocks} className="space-y-4">
            {blocks.map((block, index) => (
              <Reorder.Item key={block.id} value={block} className="bg-white rounded-lg border border-gray-200 shadow-sm relative group overflow-hidden">
                 <div className="flex items-center bg-gray-50 px-3 py-2 border-b border-gray-100">
                    <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors ml-2" title="جابجایی (Drag)">
                      <GripVertical className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 flex-1">
                      {block.type === 'header' && 'سربرگ (Header)'}
                      {block.type === 'section' && 'بخش (Section)'}
                      {block.type === 'paragraph' && 'پاراگراف'}
                      {block.type === 'notebox' && 'باکس نکته'}
                      {block.type === 'warnbox' && 'باکس مهم'}
                      {block.type === 'examplebox' && 'باکس مثال'}
                    </span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => moveBlock(index, 'up')} disabled={index === 0} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed">
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button onClick={() => moveBlock(index, 'down')} disabled={index === blocks.length - 1} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed">
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteBlock(block.id)} className="p-1 text-red-400 hover:text-red-600 ml-1 hover:bg-red-50 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                 </div>
                 
                 <div className="p-4 space-y-3">
                   {block.type === 'header' && (
                     <>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">عنوان سند</label>
                          <input type="text" value={block.data.title} onChange={(e) => updateBlock(block.id, { title: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:border-[#2B547E] focus:ring-1 focus:ring-[#2B547E] outline-none" placeholder="مانند: CSS چیست؟" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">عنوان جلسه</label>
                          <input type="text" value={block.data.subtitle} onChange={(e) => updateBlock(block.id, { subtitle: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:border-[#2B547E] focus:ring-1 focus:ring-[#2B547E] outline-none" placeholder="مانند: جلسه اول" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">نام مدرس</label>
                            <input type="text" value={block.data.instructor} onChange={(e) => updateBlock(block.id, { instructor: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:border-[#2B547E] focus:ring-1 focus:ring-[#2B547E] outline-none" placeholder="نام مدرس" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">نام منتور</label>
                            <input type="text" value={block.data.mentor} onChange={(e) => updateBlock(block.id, { mentor: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:border-[#2B547E] focus:ring-1 focus:ring-[#2B547E] outline-none" placeholder="مهندس..." />
                          </div>
                        </div>
                     </>
                   )}

                   {block.type === 'section' && (
                     <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">عنوان بخش</label>
                        <input type="text" value={block.data.title} onChange={(e) => updateBlock(block.id, { title: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:border-[#2B547E] focus:ring-1 focus:ring-[#2B547E] outline-none" placeholder="عنوان بخش..." />
                     </div>
                   )}

                   {block.type === 'paragraph' && (
                     <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">متن</label>
                        <textarea value={block.data.content} onChange={(e) => updateBlock(block.id, { content: e.target.value })} rows={4} className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:border-[#2B547E] focus:ring-1 focus:ring-[#2B547E] outline-none resize-y" placeholder="متن پاراگراف خود را بنویسید..." />
                     </div>
                   )}

                   {(block.type === 'notebox' || block.type === 'warnbox' || block.type === 'examplebox') && (
                     <>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">عنوان باکس</label>
                          <input type="text" value={block.data.title} onChange={(e) => updateBlock(block.id, { title: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:border-[#2B547E] focus:ring-1 focus:ring-[#2B547E] outline-none" placeholder="عنوان باکس..." />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">محتوای باکس</label>
                          <textarea value={block.data.content} onChange={(e) => updateBlock(block.id, { content: e.target.value })} rows={3} className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:border-[#2B547E] focus:ring-1 focus:ring-[#2B547E] outline-none resize-y" placeholder="توضیحات و متن داخل باکس را اینجا بنویسید..." />
                        </div>
                     </>
                   )}
                 </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        )}
      </div>
    </div>
  );
}
