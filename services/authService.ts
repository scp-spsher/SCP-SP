import { SecurityClearance } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

// Exporting constants at the top level clearly for build tools
export const SESSION_KEY = 'scp_net_current_session';
const STORAGE_KEY = 'scp_net_users';

// --- CONFIGURATION ---
export const ADMIN_EMAIL = 'arseniychekrigin@gmail.com';

export interface StoredUser {
  id: string; // Used for Email in this context (Local) or UUID (Remote)
  email?: string; // Explicit email field
  name: string;
  password: string; // Kept for local fallback compatibility
  clearance: SecurityClearance;
  registeredAt: string;
  isSuperAdmin?: boolean; // New Flag
  is_approved?: boolean; // New Approval Flag
  // New Profile Fields
  title?: string;
  department?: string;
  site?: string;
  avatar_url?: string; // Changed from 'image' to 'avatar_url' for Storage support
}

export const authService = {
  // Check if a user is currently logged in (Session Persistence)
  getSession: (): StoredUser | null => {
    try {
      const session = localStorage.getItem(SESSION_KEY);
      return session ? JSON.parse(session) : null;
    } catch (e) {
      return null;
    }
  },

  // Fetch any user by ID
  getUserById: async (id: string): Promise<StoredUser | null> => {
    // 1. Check DB
    if (isSupabaseConfigured()) {
      try {
        const { data: profile, error } = await supabase!
          .from('personnel')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        
        if (profile && !error) {
           return {
              id: profile.id,
              name: profile.name,
              password: '***',
              clearance: profile.clearance,
              registeredAt: profile.registered_at,
              title: profile.title,
              department: profile.department,
              site: profile.site,
              avatar_url: profile.avatar_url,
              is_approved: profile.is_approved
           };
        }
      } catch (e) { console.error(e); }
    }

    // 2. Check Local
    const localData = localStorage.getItem(STORAGE_KEY);
    if (localData) {
       const users: StoredUser[] = JSON.parse(localData);
       const user = users.find(u => u.id === id);
       if (user) return user;
    }

    return null;
  },

  // Fetch all admins
  getAdmins: async (): Promise<StoredUser[]> => {
     if (isSupabaseConfigured()) {
        const { data } = await supabase!
          .from('personnel')
          .select('*')
          .gte('clearance', 5);
        if (data) return data.map(d => ({ ...d, registeredAt: d.registered_at, password: '***' }));
     }
     const localData = localStorage.getItem(STORAGE_KEY);
     if (localData) {
        return JSON.parse(localData).filter((u: StoredUser) => u.clearance >= 5);
     }
     return [];
  },

  // Attempt to recover a lost local session from an active Supabase session
  tryRecoverSession: async (): Promise<StoredUser | null> => {
    if (!isSupabaseConfigured()) return null;

    try {
      const { data: { session } } = await supabase!.auth.getSession();
      if (!session || !session.user) return null;

      // Found a Supabase session but no local profile session
      const isTargetAdmin = session.user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

      let { data: profile, error } = await supabase!
        .from('personnel')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (error || !profile) {
        return null;
      }

      const recoveredUser: StoredUser = {
        id: profile.id,
        email: session.user.email,
        name: profile.name || 'Агент',
        password: '***',
        clearance: isTargetAdmin ? 6 : (profile.clearance || 0),
        registeredAt: profile.registered_at || new Date().toISOString(),
        isSuperAdmin: isTargetAdmin,
        is_approved: profile.is_approved,
        title: profile.title,
        department: profile.department,
        site: profile.site,
        avatar_url: profile.avatar_url
      };

      localStorage.setItem(SESSION_KEY, JSON.stringify(recoveredUser));
      return recoveredUser;
    } catch (e) {
      console.error("Session Recovery Error:", e);
      return null;
    }
  },

  // Refresh session data
  refreshSession: async (): Promise<StoredUser | null> => {
    const currentSession = authService.getSession();
    if (!currentSession) return null;

    const isTargetAdmin = (currentSession.email || '').toLowerCase() === ADMIN_EMAIL.toLowerCase();

    if (isSupabaseConfigured()) {
      try {
        const { data: { session: sbSession } } = await supabase!.auth.getSession();
        if (!sbSession) return null;

        let { data: profile, error } = await supabase!
          .from('personnel')
          .select('*')
          .eq('id', currentSession.id)
          .maybeSingle();

        if (profile) {
            const updatedUser: StoredUser = {
                ...currentSession,
                name: profile.name,
                clearance: isTargetAdmin ? 6 : profile.clearance,
                is_approved: profile.is_approved,
                title: profile.title || currentSession.title,
                department: profile.department || currentSession.department,
                site: profile.site || currentSession.site,
                avatar_url: profile.avatar_url || currentSession.avatar_url,
                registeredAt: profile.registered_at || currentSession.registeredAt,
                isSuperAdmin: isTargetAdmin
            };
            localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
            return updatedUser;
        }
      } catch (e) { return currentSession; }
    }

    const localData = localStorage.getItem(STORAGE_KEY);
    if (localData) {
        const users: StoredUser[] = JSON.parse(localData);
        const freshData = users.find(u => u.id === currentSession.id || (u.email && u.email === currentSession.email));
        if (freshData) {
             const updatedUser: StoredUser = {
                 ...currentSession,
                 ...freshData,
                 clearance: isTargetAdmin ? 6 : freshData.clearance,
                 isSuperAdmin: isTargetAdmin,
                 is_approved: true
             };
             localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
             return updatedUser;
        }
    }
    return currentSession;
  },

  // Register a new user
  register: async (email: string, name: string, password: string, clearance: number): Promise<{ success: boolean; message: string }> => {
    const isTargetAdmin = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
    const finalClearance = isTargetAdmin ? 6 : 0; // Начальный уровень теперь 0
    const isApproved = true; // Теперь подтверждение не требуется

    if (isSupabaseConfigured()) {
      try {
        const { data: authData, error: authError } = await supabase!.auth.signUp({
          email,
          password,
        });

        if (authError) {
          return { success: false, message: `ОШИБКА РЕГИСТРАЦИИ: ${authError.message.toUpperCase()}` };
        }

        if (authData.user) {
          const { error: dbError } = await supabase!
            .from('personnel')
            .upsert([{ 
              id: authData.user.id,
              name: name, 
              clearance: finalClearance,
              is_approved: isApproved
            }]);
          if (dbError) console.error("DB Register Error:", dbError);
        }
        
        return { success: true, message: 'РЕГИСТРАЦИЯ ЗАВЕРШЕНА. ВХОД РАЗРЕШЕН.' };
      } catch (err: any) {
        return { success: false, message: `ОШИБКА ПОДКЛЮЧЕНИЯ: ${err?.message || 'НЕИЗВЕСТНО'}` };
      }
    }

    const localData = localStorage.getItem(STORAGE_KEY);
    const localUsers: StoredUser[] = localData ? JSON.parse(localData) : [];
    
    if (localUsers.some(u => (u.email || u.id).toLowerCase() === email.toLowerCase())) {
      return { success: false, message: 'ОШИБКА: EMAIL УЖЕ ЗАРЕГИСТРИРОВАН' };
    }

    const newUser: StoredUser = {
      id: email,
      email: email,
      name,
      password,
      clearance: finalClearance as SecurityClearance,
      registeredAt: new Date().toISOString(),
      title: isTargetAdmin ? 'Администратор' : 'Стажер',
      department: isTargetAdmin ? 'Фонд SCP' : 'Общий сектор',
      site: isTargetAdmin ? '[УДАЛЕНО]' : 'Зона-19',
      isSuperAdmin: isTargetAdmin,
      is_approved: isApproved
    };
    
    localUsers.push(newUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(localUsers));
    
    return { success: true, message: 'ЛОКАЛЬНАЯ ЗАПИСЬ СОЗДАНА. ВХОД РАЗРЕШЕН.' };
  },

  login: async (email: string, password: string): Promise<{ success: boolean; user?: StoredUser; message: string }> => {
    const isTargetAdmin = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

    if (isSupabaseConfigured()) {
      try {
        const { data: authData, error: authError } = await supabase!.auth.signInWithPassword({
          email,
          password,
        });
        if (authError) return { success: false, message: `ДОСТУП ЗАПРЕЩЕН: ${authError.message.toUpperCase()}` };

        if (authData.user) {
          let { data: profile, error: dbError } = await supabase!
            .from('personnel')
            .select('*')
            .eq('id', authData.user.id)
            .maybeSingle();
            
          const user: StoredUser = {
            id: profile?.id || authData.user.id,
            email: authData.user.email || email,
            name: profile?.name || 'Неизвестный агент',
            password: '***',
            clearance: isTargetAdmin ? 6 : (profile?.clearance ?? 0),
            registeredAt: profile?.registered_at || new Date().toISOString(),
            isSuperAdmin: isTargetAdmin,
            is_approved: true,
            title: profile?.title || (isTargetAdmin ? 'Администратор' : 'Сотрудник L-0'), 
            department: profile?.department || (isTargetAdmin ? 'Командование О5' : 'Общие обязанности'),
            site: profile?.site || (isTargetAdmin ? 'Зона-01' : 'Зона-19'),
            avatar_url: profile?.avatar_url
          };
          
          localStorage.setItem(SESSION_KEY, JSON.stringify(user));
          return { success: true, user, message: 'ЛИЧНОСТЬ ПОДТВЕРЖДЕНА' };
        }
      } catch (err: any) { return { success: false, message: `СИСТЕМНАЯ ОШИБКА: ${err.message}` }; }
    }

    const localData = localStorage.getItem(STORAGE_KEY);
    const localUsers: StoredUser[] = localData ? JSON.parse(localData) : [];
    const localUser = localUsers.find(u => (u.email || u.id).toLowerCase() === email.toLowerCase() && u.password === password);

    if (localUser) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(localUser));
      return { success: true, user: localUser, message: 'ЛИЧНОСТЬ ПОДТВЕРЖДЕНА [LOCAL]' };
    }
    return { success: false, message: 'ДОСТУП ЗАПРЕЩЕН: ПОЛЬЗОВАТЕЛЬ НЕ НАЙДЕН' };
  },

  uploadAvatar: async (userId: string, file: File): Promise<{ success: boolean; url?: string; message: string }> => {
     if (!isSupabaseConfigured()) return { success: false, message: 'ХРАНИЛИЩЕ НЕДОСТУПНО (OFFLINE)' };
     try {
       const fileExt = file.name.split('.').pop();
       const fileName = `${userId}-${Date.now()}.${fileExt}`;
       const filePath = `${fileName}`;
       const { error: uploadError } = await supabase!.storage.from('avatars').upload(filePath, file);
       if (uploadError) return { success: false, message: `ОШИБКА ЗАГРУЗКИ: ${uploadError.message}` };
       const { data } = supabase!.storage.from('avatars').getPublicUrl(filePath);
       const publicUrl = data.publicUrl;
       await supabase!.from('personnel').update({ avatar_url: publicUrl }).eq('id', userId);
       return { success: true, url: publicUrl, message: 'БИОМЕТРИЯ ОБНОВЛЕНА' };
     } catch (e: any) { return { success: false, message: `СИСТЕМНЫЙ СБОЙ: ${e.message}` }; }
  },

  logout: () => {
    localStorage.removeItem(SESSION_KEY);
    if (isSupabaseConfigured()) supabase!.auth.signOut();
  }
};
