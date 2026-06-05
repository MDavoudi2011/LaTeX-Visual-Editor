import React, { useState, useEffect } from 'react';
import { SidebarRight } from './components/SidebarRight';
import { SidebarLeft } from './components/SidebarLeft';
import { VisualPreview } from './components/VisualPreview';
import { CodePreview } from './components/CodePreview';
import { AnyBlock, BlockType, InnerBlock, User, Project } from './types';
import { Download, Loader2, CheckCircle, Code, Eye, FileCode, LogIn, User as UserIcon, LayoutDashboard, LogOut } from 'lucide-react';
import { generateLatex } from './lib/latexGenerator';
import { LATEX_PREAMBLE } from './constants';
import { supabaseAuth, supabaseDb } from './lib/supabase';
import { LoginModal } from './components/Auth';
import { DashboardModal } from './components/Dashboard';
import { Routes, Route, useNavigate, useParams, Navigate } from 'react-router-dom';

function EditorApp() {
  const [blocks, setBlocks] = useState<AnyBlock[]>([]);
  const [isCompiling, setIsCompiling] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<'visual' | 'code'>('visual');

  const [user, setUser] = useState<User | null>(null);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [savingState, setSavingState] = useState<'saved' | 'saving' | 'error'>('saved');
  const [isEditingProjectName, setIsEditingProjectName] = useState(false);
  const [editingNameValue, setEditingNameValue] = useState("");

  const navigate = useNavigate();
  const { username, projectId } = useParams();

  // Load user session
  useEffect(() => {
    supabaseAuth.getUser().then(u => {
      setUser(u);
    });
  }, []);

  // Fetch project from URL if available
  useEffect(() => {
    if (!user || !projectId || !username) return;
    // Ensure the URL matches the logged in user
    const dbUserName = user.name || user.email.split('@')[0];
    if (dbUserName !== username) {
      navigate('/');
      return;
    }
    
    supabaseDb.getProjects(user.id).then(projects => {
      const proj = projects.find(p => p.id === projectId);
      if (proj) {
        setCurrentProject(proj);
        setBlocks(proj.data || []);
      } else {
        navigate('/');
      }
    });
  }, [user, projectId, username, navigate]);

  // Initial load logic with unsaved changes transfer
  useEffect(() => {
    const saved = localStorage.getItem('latex-blocks');
    let loadedBlocks: AnyBlock[] = [];
    if (saved) {
      try { loadedBlocks = JSON.parse(saved); } catch (e) {}
    }
    
    if (!projectId) {
      setBlocks(loadedBlocks);
    }
    setIsLoaded(true);
  }, [projectId]);

  // Handle first time login conversion
  useEffect(() => {
    if (isLoaded && user && !currentProject && !projectId && blocks.length > 0) {
      // Create first default project
      const nDate = new Intl.DateTimeFormat('fa-IR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date());
      const name = `ذخیره شده - ${nDate}`;
      supabaseDb.createProject(user.id, name, blocks).then(p => {
        handleOpenProject(p);
      });
    }
  }, [user, currentProject, projectId, isLoaded]);

  // Auto-save logic
  useEffect(() => {
    if (!isLoaded) return;
    
    // Always save locally as fallback
    localStorage.setItem('latex-blocks', JSON.stringify(blocks));
    
    // Auto-save to server if embedded in a project
    if (user && currentProject && projectId) {
      setSavingState('saving');
      const timer = setTimeout(() => {
        supabaseDb.updateProject(currentProject.id, { data: blocks })
          .then(() => setSavingState('saved'))
          .catch(() => setSavingState('error'));
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setSavingState('saved');
    }
  }, [blocks, isLoaded, user, currentProject, projectId]);

  const handleOpenProject = (project: Project) => {
    setCurrentProject(project);
    setBlocks(project.data || []);
    setShowDashboard(false);
    
    // Navigate to user project URL
    const dbUserName = user?.name || user?.email.split('@')[0] || 'user';
    navigate(`/${dbUserName}/${project.id}`);
  };

  const handleRenameProject = async (newName: string) => {
    setIsEditingProjectName(false);
    if (!currentProject || !newName.trim() || newName === currentProject.name) return;
    
    const prevProject = currentProject;
    setCurrentProject({ ...currentProject, name: newName });
    
    try {
      setSavingState('saving');
      await supabaseDb.updateProject(currentProject.id, { name: newName });
      setSavingState('saved');
    } catch (e) {
      setCurrentProject(prevProject);
      setSavingState('error');
    }
  };

  const handleLogout = async () => {
    await supabaseAuth.logout();
    setUser(null);
    setCurrentProject(null);
    navigate('/');
  };

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

  const [rightSidebarWidth, setRightSidebarWidth] = useState(180);
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(250);
  const [isResizingRight, setIsResizingRight] = useState(false);
  const [isResizingLeft, setIsResizingLeft] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Direction is RTL.
      if (isResizingRight) {
        // Right sidebar is on the right side of the screen visually.
        // width = window width - mouse X
        let newWidth = window.innerWidth - e.clientX;
        if (newWidth < 120) newWidth = 120;
        if (newWidth > 350) newWidth = 350;
        setRightSidebarWidth(newWidth);
      } else if (isResizingLeft) {
        // Left sidebar is on the left side of the screen visually.
        // width = mouse X
        let newWidth = e.clientX;
        if (newWidth < 150) newWidth = 150;
        if (newWidth > 450) newWidth = 450;
        setLeftSidebarWidth(newWidth);
      }
    };
    
    const handleMouseUp = () => {
      setIsResizingRight(false);
      setIsResizingLeft(false);
    };
    
    if (isResizingRight || isResizingLeft) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
  }, [isResizingRight, isResizingLeft]);

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
    <div className="flex flex-col h-screen w-full overflow-hidden bg-[#F8FAFC]" style={{ direction: 'rtl' }}>
      
      {/* Top bar (Header) - Full width */}
      <div className="flex max-md:flex-col items-center max-md:justify-center justify-between px-6 py-3 bg-white border-b border-gray-200 z-30 w-full shadow-sm flex-shrink-0 gap-3">
        
        {/* Right side of header: App Name + Saved status */}
        <div className="flex items-center flex-wrap max-md:justify-center gap-4 flex-1">
           <div className="flex items-center gap-2">
             <FileCode className="w-6 h-6 text-[#2B547E]" />
             <h1 className="text-lg font-bold text-[#2B547E]">جزوه ساز هوشیار</h1>
           </div>
           <span className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-md ${savingState === 'saving' ? 'bg-blue-50 text-blue-600' : savingState === 'error' ? 'bg-red-50 text-red-600' : 'text-emerald-700 bg-emerald-50'}`}>
             {savingState === 'saving' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} 
             {savingState === 'saving' ? 'در حال ذخیره...' : savingState === 'error' ? 'خطا در ذخیره' : 'ذخیره شد'}
           </span>
        </div>
        
        {/* Center of header: Tabs and Download */}
        <div className="flex items-center justify-center gap-2 flex-shrink-0">
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
           
           <div className="w-px h-6 bg-gray-300 mx-2 max-md:hidden"></div>
           
           <button 
             onClick={handleCompile}
             disabled={isCompiling}
             className="flex items-center justify-center gap-2 px-5 py-2 text-sm font-bold rounded-md transition-all bg-emerald-600 text-white shadow-md hover:bg-emerald-700 disabled:opacity-70 flex-1 md:flex-none border border-emerald-700/50"
           >
             {isCompiling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
             {isCompiling ? 'درحال کامپایل' : 'دانلود PDF'}
           </button>
        </div>
        
        {/* Left side of header: User details and Avatar */}
        <div className="flex items-center justify-end flex-1 gap-3 relative z-50">
           {user ? (
             <>
               <div className="flex items-center text-base font-semibold max-md:mx-auto" dir="ltr">
                 <button 
                    onClick={() => setShowDashboard(true)} 
                    className="text-[#2B547E] hover:bg-[#2B547E]/10 px-2 py-1 rounded transition-colors"
                 >
                   {user.name || user.email.split('@')[0]}
                 </button>
                 <span className="text-gray-400 mx-1">/</span>
                 {isEditingProjectName ? (
                    <input
                      autoFocus
                      type="text"
                      className="text-gray-900 font-bold px-1 py-0 border border-[#2B547E] rounded outline-none h-7 w-[300px] text-right bg-white"
                      dir="rtl"
                      value={editingNameValue}
                      onChange={(e) => setEditingNameValue(e.target.value)}
                      onBlur={() => handleRenameProject(editingNameValue)}
                      onKeyDown={(e) => {
                         if (e.key === 'Enter') handleRenameProject(editingNameValue);
                         if (e.key === 'Escape') {
                            setIsEditingProjectName(false);
                            setEditingNameValue('');
                         }
                      }}
                    />
                 ) : (
                    <span 
                      className="text-gray-900 truncate max-w-[300px] font-bold px-1 cursor-pointer hover:bg-gray-100 rounded transition-colors" 
                      dir="rtl" 
                      title={currentProject?.name || 'بدون پروژه'}
                      onClick={() => {
                         if (currentProject) {
                            setEditingNameValue(currentProject.name);
                            setIsEditingProjectName(true);
                         }
                      }}
                    >
                       {currentProject?.name || 'بدون پروژه'}
                    </span>
                 )}
               </div>
               
               <div className="relative group flex-shrink-0 max-md:hidden">
                 <button
                   className="w-10 h-10 rounded-full bg-[#2B547E] text-white flex items-center justify-center font-bold shadow-sm hover:bg-[#1a334d] transition-colors focus:outline-none focus:ring-2 focus:ring-[#2B547E] focus:ring-offset-2"
                 >
                   {user.name ? user.name.charAt(0) : user.email.charAt(0).toUpperCase()}
                 </button>
                 
                 <div className="absolute left-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                   <div className="w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1" dir="rtl">
                     <div className="px-4 py-2 border-b border-gray-100 text-sm text-gray-500 truncate">
                       {user.email}
                     </div>
                     <button
                       onClick={() => setShowDashboard(true)}
                       className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                     >
                       <LayoutDashboard className="w-4 h-4" /> پروژه‌های من
                     </button>
                     <button
                       onClick={handleLogout}
                       className="w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                     >
                       <LogOut className="w-4 h-4" /> خروج
                     </button>
                   </div>
                 </div>
               </div>
             </>
           ) : (
             <button
               onClick={() => setShowLoginModal(true)}
               className="flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-md transition-colors bg-white text-[#2B547E] border border-[#2B547E] shadow-sm hover:bg-[#2B547E] hover:text-white"
             >
               <LogIn className="w-4 h-4" /> ورود
             </button>
           )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
      
        {/* Sidebar Form Tools (Right in RTL) */}
        <div 
           className="relative flex-shrink-0 h-full bg-white border-l border-gray-200 z-20 flex w-[180px]"
        >
          <div className="flex-1 overflow-hidden w-full h-full">
             <SidebarRight 
               blocks={blocks} 
               setBlocks={setBlocks} 
             />
          </div>
        </div>

        {/* Main Content Preview Canvas (Center) */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
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

        {/* Sidebar Outline Navigation (Left in RTL) */}
        <div 
           className="relative flex-shrink-0 h-full bg-white border-r border-gray-200 z-20 flex"
           style={{ width: leftSidebarWidth }}
        >
          {/* Resizer Handle */}
          <div 
            className="w-1.5 cursor-col-resize hover:bg-blue-400 active:bg-blue-600 bg-transparent absolute right-0 top-0 bottom-0 z-50 transform translate-x-1/2 max-md:hidden"
            onMouseDown={(e) => { e.preventDefault(); setIsResizingLeft(true); }}
          />
          <div className="flex-1 overflow-hidden w-full h-full">
             <SidebarLeft 
               blocks={blocks} 
               setBlocks={setBlocks} 
               onNestBlock={handleNestBlock}
               onExtractBlock={handleExtractBlock}
               onAddInnerBlock={handleAddInnerBlock}
               activeBlockId={activeBlockId}
             />
          </div>
        </div>

      </div>

      {showLoginModal && (
        <LoginModal 
          onClose={() => setShowLoginModal(false)} 
          onLogin={(u) => setUser(u)} 
        />
      )}
      
      {showDashboard && user && (
        <DashboardModal 
          user={user} 
          currentProjectId={currentProject?.id}
          currentBlocks={blocks}
          onClose={() => setShowDashboard(false)} 
          onOpenProject={handleOpenProject}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<EditorApp />} />
      <Route path="/:username/:projectId" element={<EditorApp />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
