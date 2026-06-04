import { createClient } from '@supabase/supabase-js';
import { Project, User as AppUser, AnyBlock } from '../types';

const supabaseUrl = 'https://uuqnmcpeouvreywxqnjz.supabase.co';
const supabaseAnonKey = 'sb_publishable_Q7zkJts5IghXhnrYPoPd7g_sG6q0LvW';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const isConfigured = true;

// --- Mock Fallback for UI testing before env is set ---
const MockUsers: AppUser[] = [
  { id: '1', email: 'user@example.com', name: 'کاربر تست' },
];

let mockProjects: Project[] = [
  { id: '101', user_id: '1', name: 'پروژه تست ۱', data: [], updated_at: new Date().toISOString() },
];
// --------------------------------------------------------

export const supabaseAuth = {
  async sendOtp(email: string, mode: 'login' | 'register', username?: string): Promise<{ error: Error | null }> {
    if (!isConfigured) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const user = MockUsers.find(u => u.email === email);
      if (mode === 'login' && !user) return { error: new Error('کاربر در سیستم یافت نشد') };
      if (mode === 'register' && user) return { error: new Error('این ایمیل قبلا ثبت نام کرده است') };
      return { error: null };
    }

    const { error } = await supabase.auth.signInWithOtp({ 
      email,
      options: {
        shouldCreateUser: mode === 'register',
        emailRedirectTo: window.location.origin,
        ...(username ? { data: { name: username } } : {})
      }
    });
    return { error };
  },

  async verifyOtp(email: string, token: string): Promise<{ user: AppUser | null; error: Error | null }> {
    if (!isConfigured) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const user = MockUsers.find(u => u.email === email);
      if (user && token === '123456') {
        localStorage.setItem('mock_user_session', JSON.stringify(user));
        return { user, error: null };
      }
      return { user: null, error: new Error('کد اشتباه است (کد آزمایشی: 123456)') };
    }

    const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
    if (error) return { user: null, error };
    return { 
      user: data.session?.user ? { id: data.session.user.id, email: data.session.user.email!, name: data.session.user.user_metadata?.name } : null,
      error: null 
    };
  },
  
  async logout(): Promise<void> {
    if (!isConfigured) {
      await new Promise(resolve => setTimeout(resolve, 500));
      localStorage.removeItem('mock_user_session');
      return;
    }
    await supabase.auth.signOut();
  },
  
  async getUser(): Promise<AppUser | null> {
    if (!isConfigured) {
      const session = localStorage.getItem('mock_user_session');
      return session ? JSON.parse(session) : null;
    }
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      return { id: session.user.id, email: session.user.email!, name: session.user.user_metadata?.name };
    }
    return null;
  }
};

export const supabaseDb = {
  async getProjects(userId: string): Promise<Project[]> {
    if (!isConfigured) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockProjects.filter(p => p.user_id === userId);
    }
    const { data, error } = await supabase.from('projects').select('*').order('updated_at', { ascending: false });
    if (error) {
      console.error("Error loading projects:", error);
      return [];
    }
    return data as Project[];
  },

  async createProject(userId: string, name: string, data: AnyBlock[]): Promise<Project> {
    if (!isConfigured) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const newProject: Project = { id: crypto.randomUUID(), user_id: userId, name, data, updated_at: new Date().toISOString() };
      mockProjects.unshift(newProject);
      return newProject;
    }
    const { data: inserted, error } = await supabase.from('projects').insert([{ user_id: userId, name, data }]).select().single();
    if (error) throw error;
    return inserted as Project;
  },

  async updateProject(projectId: string, data: Partial<Project>): Promise<Project | null> {
    if (!isConfigured) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const index = mockProjects.findIndex(p => p.id === projectId);
      if (index !== -1) {
        mockProjects[index] = { ...mockProjects[index], ...data, updated_at: new Date().toISOString() };
        return mockProjects[index];
      }
      return null;
    }
    const { data: updated, error } = await supabase.from('projects').update(data).eq('id', projectId).select().single();
    if (error) {
      console.error("Error updating project:", error);
      return null;
    }
    return updated as Project;
  },

  async deleteProject(projectId: string): Promise<boolean> {
    if (!isConfigured) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const initialLength = mockProjects.length;
      mockProjects = mockProjects.filter(p => p.id !== projectId);
      return mockProjects.length < initialLength;
    }
    const { error } = await supabase.from('projects').delete().eq('id', projectId);
    if (error) {
       console.error("Error deleting project:", error);
       return false;
    }
    return true;
  },

  async copyProject(projectId: string): Promise<Project | null> {
    if (!isConfigured) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const project = mockProjects.find(p => p.id === projectId);
      if (project) {
        const newProject: Project = { ...project, id: crypto.randomUUID(), name: `${project.name} (کپی)`, updated_at: new Date().toISOString() };
        mockProjects.unshift(newProject);
        return newProject;
      }
      return null;
    }
    
    // Fetch original project
    const { data: original, error: fetchErr } = await supabase.from('projects').select('*').eq('id', projectId).single();
    if (fetchErr || !original) return null;
    
    // Insert new duplicated project
    const { data: inserted, error: insertErr } = await supabase.from('projects').insert([{
        user_id: original.user_id,
        name: `${original.name} (کپی)`,
        data: original.data
    }]).select().single();
    
    if (insertErr) {
        console.error("Error copying project:", insertErr);
        return null;
    }
    return inserted as Project;
  }
};
