import React from 'react';
import { AnyBlock } from '../types';
import { Info, AlertTriangle, Lightbulb } from 'lucide-react';

interface VisualPreviewProps {
  blocks: AnyBlock[];
}

export function VisualPreview({ blocks }: VisualPreviewProps) {
  return (
    <div className="h-full overflow-auto p-8 bg-white border border-gray-200 rounded-lg shadow-sm w-full max-w-4xl mx-auto mt-4" style={{ direction: 'rtl', lineHeight: '1.8' }}>
      {blocks.length === 0 && (
        <div className="flex items-center justify-center h-full text-gray-400">
          بلوکی برای نمایش وجود ندارد. از منوی سمت راست بلوک اضافه کنید.
        </div>
      )}

      {blocks.map((block) => {
        switch (block.type) {
          case 'header':
            return (
              <div key={block.id} className="text-center mb-12">
                <h1 className="text-4xl font-bold text-[#2B547E] mb-6">{block.data.title || 'عنوان سند'}</h1>
                <h2 className="text-2xl font-bold text-[#1a334d] mb-4">{block.data.subtitle || 'عنوان جلسه'}</h2>
                <div className="text-xl font-bold text-[#1a334d] mb-4">تهیه شده توسط گروه برنامه نویسی هوشیار</div>
                <div className="text-lg">
                  مدرس دوره: {block.data.instructor || 'نام'} <span className="mx-4 font-normal text-gray-400">|</span> منتور: {block.data.mentor || 'مهندس مینا طرهانی'}
                </div>
              </div>
            );
          case 'section':
            return (
              <div key={block.id} className="mb-6 mt-8">
                <h3 className="text-2xl font-bold text-[#2B547E] border-b-2 border-[#2B547E] pb-2 mb-4">
                  {block.data.title || 'عنوان بخش'}
                </h3>
              </div>
            );
          case 'paragraph':
            return (
              <p key={block.id} className="mb-6 whitespace-pre-wrap text-gray-800 text-lg">
                {block.data.content || 'متن پاراگراف...'}
              </p>
            );
          case 'notebox':
            return (
              <div key={block.id} className="mb-6 bg-[#E8F4F8] border border-[#2B547E] rounded-md overflow-hidden shadow-md">
                <div className="bg-[#2B547E] px-4 py-2 text-white font-bold flex items-center gap-2">
                  <Info className="w-5 h-5 rtl:-scale-x-100" />
                  {block.data.title || 'نکته'}
                </div>
                <div className="p-4 text-gray-800 text-lg whitespace-pre-wrap">
                  {block.data.content || 'متن نکته...'}
                </div>
              </div>
            );
          case 'warnbox':
            return (
              <div key={block.id} className="mb-6 bg-[#FDF2E9] border border-[#E74C3C] rounded-md overflow-hidden shadow-md">
                <div className="bg-[#E74C3C] px-4 py-2 text-white font-bold flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  {block.data.title || 'مهم'}
                </div>
                <div className="p-4 text-gray-800 text-lg whitespace-pre-wrap">
                  {block.data.content || 'متن هشدار...'}
                </div>
              </div>
            );
          case 'examplebox':
            return (
              <div key={block.id} className="mb-6 bg-[#EAFBF1] border-2 border-[#27AE60] rounded-xl overflow-hidden shadow-md">
                <div className="bg-[#27AE60] px-4 py-2 text-white font-bold flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  {block.data.title || 'مثال'}
                </div>
                <div className="p-4 text-gray-800 text-lg whitespace-pre-wrap">
                  {block.data.content || 'متن مثال...'}
                </div>
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
