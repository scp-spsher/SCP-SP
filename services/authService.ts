
import { SecurityClearance } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

export const SESSION_KEY = 'scp_net_current_session';
const STORAGE_KEY = 'scp_net_users';
export const ADMIN_EMAIL = 'arseniychekrigin@gmail.com';

export interface StoredUser {
  id: string;
  email?: string;
  name: string;
  password: string;
  clearance: SecurityClearance;
  registeredAt: string;
  isSuperAdmin?: boolean;
  is_approved?: boolean;
  title?: string;
  department?: string;
  site?: string;
  avatar_url?: string;
}

export const authService = {
  getSession: (): StoredUser | null => {
    try {
      const session = localStorage.getItem(SESSION_KEY);
      if (!session) return null;
      const user = JSON.parse(session);
      // Sanitize session data
      return {
        ...user,
        clearance: Number(user.clearance) as SecurityClearance
      };
    } catch (e) {
      return null;
    }
  },

  tryRecoverSession: async (): Promise<StoredUser | null> => {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data: { session } } = await supabase!.auth.getSession();
      if (!session || !session.user) return null;

      const { data: profile, error } = await supabase!
        .from('personnel')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (!profile || error) return null;

      const isTargetAdmin = (session.user.email || '').toLowerCase() === ADMIN_EMAIL.toLowerCase();

      const user: StoredUser = {
        id: profile.id,
        email: session.user.email || '',
        name: String(profile.name || 'Агент'),
        password: '***',
        clearance: (isTargetAdmin ? 6 : Number(profile.clearance || 0)) as SecurityClearance,
        registeredAt: profile.registered_at || new Date().toISOString(),
        isSuperAdmin: isTargetAdmin,
        is_approved: !!profile.is_approved,
        title: profile.title || '',
        department: profile.department || '',
        site: profile.site || '',
        avatar_url: profile.avatar_url || ''
      };

      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      return user;
    } catch (e) {
      return null;
    }
  },

  getUserById: async (id: string): Promise<StoredUser | null> => {
    if (isSupabaseConfigured()) {
      try {
        const { data: profile, error } = await supabase!
          .from('personnel')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        
        if (!profile || error) return null; 

        return {
          id: profile.id,
          name: String(profile.name || 'Сотрудник'),
          password: '***',
          clearance: Number(profile.clearance || 0) as SecurityClearance,
          registeredAt: profile.registered_at,
          title: profile.title || '',
          department: profile.department || '',
          site: profile.site || '',
          avatar_url: profile.avatar_url || '',
          is_approved: !!profile.is_approved
        };
      } catch (e) { console.error(e); }
    }

    const localData = localStorage.getItem(STORAGE_KEY);
    if (localData) {
       const users: StoredUser[] = JSON.parse(localData);
       const user = users.find(u => u.id === id);
       return user ? { ...user, clearance: Number(user.clearance) as SecurityClearance } : null;
    }
    return null;
  },

  refreshSession: async (): Promise<StoredUser | null> => {
    const currentSession = authService.getSession();
    if (!currentSession) return null;

    const isTargetAdmin = (currentSession.email || '').toLowerCase() === ADMIN_EMAIL.toLowerCase();

    if (isSupabaseConfigured()) {
      try {
        const { data: { session: sbSession } } = await supabase!.auth.getSession();
        
        if (!sbSession) {
            authService.logout();
            return null;
        }

        let { data: profile, error } = await supabase!
          .from('personnel')
          .select('*')
          .eq('id', currentSession.id)
          .maybeSingle();

        if (!profile || error) {
            authService.logout();
            return null;
        }

        const updatedUser: StoredUser = {
            ...currentSession,
            name: String(profile.name || currentSession.name),
            clearance: (isTargetAdmin ? 6 : Number(profile.clearance || 0)) as SecurityClearance,
            is_approved: !!profile.is_approved,
            title: profile.title || currentSession.title,
            department: profile.department || currentSession.department,
            site: profile.site || currentSession.site,
            avatar_url: profile.avatar_url || currentSession.avatar_url,
            registeredAt: profile.registered_at || currentSession.registeredAt,
            isSuperAdmin: isTargetAdmin
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
        return updatedUser;
      } catch (e) { return currentSession; }
    }

    const localData = localStorage.getItem(STORAGE_KEY);
    if (localData) {
        const users: StoredUser[] = JSON.parse(localData);
        const freshData = users.find(u => u.id === currentSession.id);
        if (!freshData) {
            authService.logout();
            return null;
        }
        return { 
          ...currentSession, 
          ...freshData, 
          clearance: Number(freshData.clearance) as SecurityClearance,
          isSuperAdmin: isTargetAdmin 
        };
    }
    return currentSession;
  },

  updateUser: async (userId: string, updates: Partial<StoredUser>): Promise<{ success: boolean; message: string }> => {
    if (isSupabaseConfigured()) {
      try {
        // We only allow updating basic info via this method
        const { error } = await supabase!
          .from('personnel')
          .update(updates)
          .eq('id', userId);
        
        if (error) throw error;
      } catch (e: any) {
        return { success: false, message: `ОШИБКА БД: ${e.message}` };
      }
    }

    // Update Local Registry
    const localData = localStorage.getItem(STORAGE_KEY);
    if (localData) {
      try {
        const users: StoredUser[] = JSON.parse(localData);
        const updatedUsers = users.map(u => u.id === userId ? { ...u, ...updates } : u);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUsers));
      } catch (e) {}
    }

    // Update Session if it's the current user
    const currentSession = authService.getSession();
    if (currentSession && currentSession.id === userId) {
      const updatedSession = { ...currentSession, ...updates };
      localStorage.setItem(SESSION_KEY, JSON.stringify(updatedSession));
    }

    return { success: true, message: 'ПРОФИЛЬ ОБНОВЛЕН' };
  },

  register: async (email: string, name: string, password: string, clearance: number): Promise<{ success: boolean; message: string }> => {
    const isTargetAdmin = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
    const finalClearance = isTargetAdmin ? 6 : 0; 
    const isApproved = true; 

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
      clearance: Number(finalClearance) as SecurityClearance,
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
            name: String(profile?.name || 'Неизвестный агент'),
            password: '***',
            clearance: (isTargetAdmin ? 6 : Number(profile?.clearance ?? 0)) as SecurityClearance,
            registeredAt: profile?.registered_at || new Date().toISOString(),
            isSuperAdmin: isTargetAdmin,
            is_approved: true,
            title: profile?.title || (isTargetAdmin ? 'Администратор' : 'Сотрудник L-0'), 
            department: profile?.department || (isTargetAdmin ? 'Командование О5' : 'Общие обязанности'),
            site: profile?.site || (isTargetAdmin ? 'Зона-01' : 'Зона-19'),
            avatar_url: profile?.avatar_url || ''
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
      const sanitized = { ...localUser, clearance: Number(localUser.clearance) as SecurityClearance };
      localStorage.setItem(SESSION_KEY, JSON.stringify(sanitized));
      return { success: true, user: sanitized, message: 'ЛИЧНОСТЬ ПОДТВЕРЖДЕНА [LOCAL]' };
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
