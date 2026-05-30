import React from 'react';
import { AnyBlock, BlockType, InnerBlock } from '../types';
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
      case 'pic':
        newBlock = { id: newId, type: 'pic', data: { url: '' } };
        break;
      case 'code':
        newBlock = { id: newId, type: 'code', data: { language: 'CSS', code: '' } };
        break;
      case 'notebox':
      case 'warnbox':
      case 'examplebox':
        newBlock = { id: newId, type, data: { title: '', items: [] } };
        break;
    }
    
    if (type === 'header') {
      setBlocks([newBlock, ...blocks]);
    } else {
      setBlocks([...blocks, newBlock]);
    }
  };

  const updateBlock = (id: string, partialData: any) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, data: { ...b.data, ...partialData } } as AnyBlock : b));
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

  const addInnerBlock = (boxId: string, type: InnerBlock['type']) => {
    setBlocks(blocks.map(b => {
      if (b.id !== boxId) return b;
      const newItemId = crypto.randomUUID();
      let newItem: any;
      if (type === 'paragraph') newItem = { id: newItemId, type: 'paragraph', data: { content: '' } };
      else if (type === 'pic') newItem = { id: newItemId, type: 'pic', data: { url: '' } };
      else if (type === 'code') newItem = { id: newItemId, type: 'code', data: { language: 'html', code: '' } };
      
      const prevItems = (b.data as any).items || [];
      return { ...b, data: { ...b.data, items: [...prevItems, newItem] } } as AnyBlock;
    }));
  };

  const updateInnerBlock = (boxId: string, itemId: string, partialData: any) => {
    setBlocks(blocks.map(b => {
      if (b.id !== boxId) return b;
      const newItems = ((b.data as any).items || []).map((item: any) => 
        item.id === itemId ? { ...item, data: { ...item.data, ...partialData } } : item
      );
      return { ...b, data: { ...b.data, items: newItems } } as AnyBlock;
    }));
  };

  const deleteInnerBlock = (boxId: string, itemId: string) => {
    setBlocks(blocks.map(b => {
      if (b.id !== boxId) return b;
      const newItems = ((b.data as any).items || []).filter((item: any) => item.id !== itemId);
      return { ...b, data: { ...b.data, items: newItems } } as AnyBlock;
    }));
  };

  const moveInnerBlock = (boxId: string, index: number, direction: 'up' | 'down') => {
    setBlocks(blocks.map(b => {
      if (b.id !== boxId) return b;
      const items = [...((b.data as any).items || [])];
      if ((direction === 'up' && index === 0) || (direction === 'down' && index === items.length - 1)) return b;
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      [items[index], items[targetIndex]] = [items[targetIndex], items[index]];
      return { ...b, data: { ...b.data, items } } as AnyBlock;
    }));
  };

  return (
    <div className="flex flex-col h-full bg-gray-50/50 border-l border-gray-200 shadow-sm z-10 w-[450px]">
      <div className="p-4 bg-white border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-800 mb-4">افزودن بلوک جدید</h2>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => addBlock('header')} disabled={hasHeader} className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-[#2B547E] bg-[#2B547E]/10 rounded border border-[#2B547E]/20 hover:bg-[#2B547E]/20 transition-colors disabled:opacity-50">
            <PlusCircle className="w-4 h-4" /> هدر (Header)
          </button>
          <button onClick={() => addBlock('section')} className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white rounded border border-gray-300 hover:bg-gray-50 transition-colors">
            <PlusCircle className="w-4 h-4" /> بخش (Section)
          </button>
          <button onClick={() => addBlock('paragraph')} className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white rounded border border-gray-300 hover:bg-gray-50 transition-colors">
            <PlusCircle className="w-4 h-4" /> پاراگراف
          </button>
          <button onClick={() => addBlock('pic')} className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white rounded border border-gray-300 hover:bg-gray-50 transition-colors">
            <PlusCircle className="w-4 h-4" /> عکس
          </button>
          <button onClick={() => addBlock('code')} className="col-span-2 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white rounded border border-gray-300 hover:bg-gray-50 transition-colors">
            <PlusCircle className="w-4 h-4" /> بلوک کد
          </button>
          <button onClick={() => addBlock('notebox')} className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded border border-blue-200 hover:bg-blue-100 transition-colors">
            <PlusCircle className="w-4 h-4" /> باکس نکته
          </button>
          <button onClick={() => addBlock('warnbox')} className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 rounded border border-red-200 hover:bg-red-100 transition-colors">
            <PlusCircle className="w-4 h-4" /> باکس مهم
          </button>
          <button onClick={() => addBlock('examplebox')} className="col-span-2 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-green-700 bg-green-50 rounded border border-green-200 hover:bg-green-100 transition-colors">
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
                      {block.type === 'pic' && 'تصویر'}
                      {block.type === 'code' && 'کد'}
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
                          <input type="text" value={block.data.title} onChange={(e) => updateBlock(block.id, { title: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:border-[#2B547E] outline-none" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">عنوان جلسه</label>
                          <input type="text" value={block.data.subtitle} onChange={(e) => updateBlock(block.id, { subtitle: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:border-[#2B547E] outline-none" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div><input type="text" value={block.data.instructor} onChange={(e) => updateBlock(block.id, { instructor: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:border-[#2B547E] outline-none" placeholder="نام مدرس" /></div>
                          <div><input type="text" value={block.data.mentor} onChange={(e) => updateBlock(block.id, { mentor: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:border-[#2B547E] outline-none" placeholder="مهندس..." /></div>
                        </div>
                     </>
                   )}

                   {block.type === 'section' && (
                     <input type="text" value={block.data.title} onChange={(e) => updateBlock(block.id, { title: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-300 rounded outline-none" placeholder="عنوان بخش..." />
                   )}

                   {block.type === 'paragraph' && (
                     <textarea value={block.data.content} onChange={(e) => updateBlock(block.id, { content: e.target.value })} rows={4} className="w-full px-3 py-2 text-sm border border-gray-300 rounded outline-none resize-y" placeholder="متن پاراگراف..." />
                   )}
                   
                   {block.type === 'pic' && (
                     <input type="text" value={block.data.url} onChange={(e) => updateBlock(block.id, { url: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-300 rounded outline-none text-left" dir="ltr" placeholder="آدرس تصویر (URL یا نام فایل)" />
                   )}
                   
                   {block.type === 'code' && (
                     <>
                      <input type="text" value={block.data.language} onChange={(e) => updateBlock(block.id, { language: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-300 rounded outline-none text-left mb-2" dir="ltr" placeholder="Language (CSS, JS, etc...)" />
                      <textarea value={block.data.code} onChange={(e) => updateBlock(block.id, { code: e.target.value })} rows={5} className="w-full px-3 py-2 text-sm border border-gray-300 rounded outline-none resize-y text-left font-mono bg-gray-50" dir="ltr" placeholder="کد را اینجا قرار دهید..." />
                     </>
                   )}

                   {(block.type === 'notebox' || block.type === 'warnbox' || block.type === 'examplebox') && (
                     <>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">عنوان باکس</label>
                          <input type="text" value={block.data.title} onChange={(e) => updateBlock(block.id, { title: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:border-[#2B547E] outline-none" placeholder="عنوان باکس..." />
                        </div>
                        
                        <div className="border border-gray-200 rounded p-2 bg-gray-50">
                           <label className="block text-xs font-bold text-gray-700 mb-2">محتوای درون باکس</label>
                           
                           <div className="space-y-3 mb-3">
                             {(block.data.items || []).map((item: any, i: number) => (
                               <div key={item.id} className="relative bg-white border border-gray-200 p-2 rounded flex flex-col gap-2">
                                  <div className="flex justify-between items-center bg-gray-100 p-1 rounded text-xs text-gray-500">
                                    <span>{item.type === 'paragraph' ? 'پاراگراف' : item.type === 'pic' ? 'تبصره (عکس)' : 'کد'}</span>
                                    <div className="flex gap-1">
                                      <button onClick={() => moveInnerBlock(block.id, i, 'up')} disabled={i===0} className="hover:text-black disabled:opacity-30 p-1"><ChevronUp className="w-3 h-3"/></button>
                                      <button onClick={() => moveInnerBlock(block.id, i, 'down')} disabled={i===((block.data.items?.length||0)-1)} className="hover:text-black disabled:opacity-30 p-1"><ChevronDown className="w-3 h-3"/></button>
                                      <button onClick={() => deleteInnerBlock(block.id, item.id)} className="text-red-500 hover:text-red-700 p-1"><Trash2 className="w-3 h-3"/></button>
                                    </div>
                                  </div>
                                  
                                  {item.type === 'paragraph' && (
                                     <textarea value={item.data.content} onChange={(e) => updateInnerBlock(block.id, item.id, { content: e.target.value })} rows={2} className="w-full px-2 py-1 text-sm border border-gray-300 rounded outline-none" placeholder="متن پاراگراف..." />
                                  )}
                                  {item.type === 'pic' && (
                                     <input type="text" value={item.data.url} onChange={(e) => updateInnerBlock(block.id, item.id, { url: e.target.value })} className="w-full px-2 py-1 text-sm border border-gray-300 rounded outline-none text-left" dir="ltr" placeholder="آدرس تصویر" />
                                  )}
                                  {item.type === 'code' && (
                                     <>
                                        <input type="text" value={item.data.language} onChange={(e) => updateInnerBlock(block.id, item.id, { language: e.target.value })} className="w-full px-2 py-1 text-sm border border-gray-300 rounded outline-none text-left" dir="ltr" placeholder="Language (CSS, HTML...)" />
                                        <textarea value={item.data.code} onChange={(e) => updateInnerBlock(block.id, item.id, { code: e.target.value })} rows={4} className="w-full px-2 py-1 text-sm border border-gray-300 rounded outline-none text-left font-mono bg-gray-50" dir="ltr" placeholder="Code..." />
                                     </>
                                  )}
                               </div>
                             ))}
                             {(!block.data.items || block.data.items.length === 0) && (
                                <div className="text-xs text-gray-400 text-center py-2">هنوز محتوایی به باکس اضافه نشده است.</div>
                             )}
                           </div>
                           
                           <div className="flex gap-2">
                              <button onClick={() => addInnerBlock(block.id, 'paragraph')} className="flex-1 py-1 bg-white border border-gray-300 text-xs text-gray-600 rounded hover:bg-gray-100">+ متن</button>
                              <button onClick={() => addInnerBlock(block.id, 'pic')} className="flex-1 py-1 bg-white border border-gray-300 text-xs text-gray-600 rounded hover:bg-gray-100">+ تصویر</button>
                              <button onClick={() => addInnerBlock(block.id, 'code')} className="flex-1 py-1 bg-white border border-gray-300 text-xs text-gray-600 rounded hover:bg-gray-100">+ کد</button>
                           </div>
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
