import React, { useState } from 'react';
import { Editor } from './components/Editor';
import { VisualPreview } from './components/VisualPreview';
import { CodePreview } from './components/CodePreview';
import { AnyBlock } from './types';

function App() {
  const [blocks, setBlocks] = useState<AnyBlock[]>([]);
  const [activeTab, setActiveTab] = useState<'visual' | 'code'>('visual');

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F8FAFC]">
      
      {/* Sidebar Editor (Right) */}
      <Editor blocks={blocks} setBlocks={setBlocks} />

      {/* Main Content (Left) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative border-r border-gray-200">
        
        {/* Top bar tabs */}
        <div className="flex items-center gap-2 px-6 py-3 bg-white border-b border-gray-200 z-10 w-full shadow-sm sticky top-0">
          <button 
            onClick={() => setActiveTab('visual')}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === 'visual' ? 'bg-[#2B547E] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
          >
            پیش‌نمایش زنده
          </button>
          <button 
            onClick={() => setActiveTab('code')}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === 'code' ? 'bg-[#2B547E] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
          >
            کد LaTeX
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden p-6 bg-gray-50/50">
          <div className="h-full max-w-5xl mx-auto">
            {activeTab === 'visual' ? (
              <VisualPreview blocks={blocks} />
            ) : (
              <CodePreview blocks={blocks} />
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

export default App;
