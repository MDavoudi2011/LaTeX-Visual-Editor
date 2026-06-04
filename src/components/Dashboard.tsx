import React, { useState, useEffect } from 'react';
import { supabaseDb } from '../lib/supabase';
import { Project, User, AnyBlock } from '../types';
import { Loader2, Plus, Edit2, Trash2, Copy, FileText, X } from 'lucide-react';

interface DashboardModalProps {
  user: User;
  onClose: () => void;
  onOpenProject: (project: Project) => void;
  currentProjectId?: string;
  currentBlocks: AnyBlock[]; // To allow saving current state as new project
}

export function DashboardModal({ user, onClose, onOpenProject, currentProjectId, currentBlocks }: DashboardModalProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  
  // For inline editing logic
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    loadProjects();
  }, [user]);

  const loadProjects = async () => {
    setLoading(true);
    const data = await supabaseDb.getProjects(user.id);
    setProjects(data);
    setLoading(false);
  };

  const handleCreateNew = async () => {
    setCreating(true);
    // Standard new project title
    const nDate = new Intl.DateTimeFormat('fa-IR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date());
    const name = `پروژه جدید - ${nDate}`;
    
    const newProject = await supabaseDb.createProject(user.id, name, []);
    setProjects([newProject, ...projects]);
    setCreating(false);
    onOpenProject(newProject);
  };

  const handleSaveCurrentAsNew = async () => {
    if (currentBlocks.length === 0) return;
    setCreating(true);
    const nDate = new Intl.DateTimeFormat('fa-IR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date());
    const name = `ذخیره شده - ${nDate}`;
    
    const newProject = await supabaseDb.createProject(user.id, name, currentBlocks);
    setProjects([newProject, ...projects]);
    setCreating(false);
    onOpenProject(newProject);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('آیا از حذف این پروژه اطمینان دارید؟')) {
      await supabaseDb.deleteProject(id);
      setProjects(projects.filter(p => p.id !== id));
      if (currentProjectId === id) {
          // You might want to handle what happens when we delete currently open project.
          // For now, let's keep it simple.
      }
    }
  };

  const handleCopy = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newProject = await supabaseDb.copyProject(id);
    if (newProject) {
      setProjects([newProject, ...projects]);
    }
  };

  const handleStartEdit = (e: React.MouseEvent, proj: Project) => {
    e.stopPropagation();
    setEditingId(proj.id);
    setEditName(proj.name);
  };

  const handleSaveEdit = async (e: React.FormEvent, proj: Project) => {
    e.preventDefault();
    if (!editName.trim()) return;
    
    const updated = await supabaseDb.updateProject(proj.id, { name: editName.trim() });
    if (updated) {
      setProjects(projects.map(p => p.id === updated.id ? updated : p));
    }
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" dir="rtl">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[85vh] flex flex-col relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">پروژه‌های من</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          
          <div className="flex gap-4 mb-6">
            <button 
              onClick={handleCreateNew}
              disabled={creating}
              className="flex items-center gap-2 px-4 py-2 bg-[#2B547E] text-white rounded-md shadow hover:bg-[#1a334d] transition-colors disabled:opacity-70 font-medium"
            >
              {creating ? <Loader2 className="w-5 h-5 animate-spin"/> : <Plus className="w-5 h-5"/>}
              ایجاد پروژه جدید
            </button>

            {!currentProjectId && currentBlocks.length > 0 && (
                <button 
                  onClick={handleSaveCurrentAsNew}
                  disabled={creating}
                  className="flex items-center gap-2 px-4 py-2 border border-[#2B547E] text-[#2B547E] rounded-md shadow-sm hover:bg-[#2B547E]/10 transition-colors disabled:opacity-70 font-medium"
                >
                  <FileText className="w-5 h-5"/>
                  ذخیره فایل فعلی به عنوان پروژه
                </button>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[#2B547E]" />
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              هیچ پروژه‌ای یافت نشد. می‌توانید یک پروژه جدید ایجاد کنید.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map(proj => (
                <div 
                  key={proj.id} 
                  onClick={() => onOpenProject(proj)}
                  className={`bg-white border rounded-lg p-5 cursor-pointer flex flex-col transition-all hover:shadow-md ${
                    proj.id === currentProjectId ? 'border-[#2B547E] ring-1 ring-[#2B547E]' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    {editingId === proj.id ? (
                      <form onSubmit={(e) => handleSaveEdit(e, proj)} className="w-full flex" onClick={e => e.stopPropagation()}>
                        <input 
                          autoFocus
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          className="flex-1 border-b border-gray-300 focus:border-[#2B547E] focus:outline-none px-1 text-gray-900 font-medium"
                          onBlur={(e) => handleSaveEdit(e as any, proj)}
                        />
                      </form>
                    ) : (
                      <h3 className="font-medium text-gray-900 truncate" title={proj.name}>
                        {proj.name}
                      </h3>
                    )}
                    {proj.id === currentProjectId && (
                        <span className="text-xs bg-[#2B547E]/10 text-[#2B547E] px-2 py-0.5 rounded flex-shrink-0">باز شده</span>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-500 mt-auto flex justify-between items-center pt-2">
                    <span className="text-xs" dir="ltr">
                      {new Intl.DateTimeFormat('fa-IR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(proj.updated_at))}
                    </span>
                    
                    <div className="flex items-center gap-1">
                      <button onClick={(e) => handleStartEdit(e, proj)} className="p-1.5 text-gray-400 hover:text-[#2B547E] hover:bg-[#2B547E]/10 rounded transition-colors" title="ویرایش نام">
                        <Edit2 className="w-4 h-4"/>
                      </button>
                      <button onClick={(e) => handleCopy(e, proj)} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors" title="کپی گرفتن">
                        <Copy className="w-4 h-4"/>
                      </button>
                      <button onClick={(e) => handleDelete(e, proj.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="حذف">
                        <Trash2 className="w-4 h-4"/>
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
