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

  // Attempt to recover a lost local session from an active Supabase session
  tryRecoverSession: async (): Promise<StoredUser | null> => {
    if (!isSupabaseConfigured()) return null;

    try {
      const { data: { session } } = await supabase!.auth.getSession();
      if (!session || !session.user) return null;

      // Found a Supabase session but no local profile session
      // Fetch the profile to reconstruct the StoredUser object
      const isTargetAdmin = session.user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

      let { data: profile, error } = await supabase!
        .from('personnel')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (error || !profile) {
        // If profile fetch fails, we can't reliably reconstruct the UI user
        return null;
      }

      const recoveredUser: StoredUser = {
        id: profile.id,
        email: session.user.email,
        name: profile.name || 'Агент',
        password: '***',
        clearance: isTargetAdmin ? 6 : (profile.clearance || 1),
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

  // Refresh session data from Source of Truth (DB or LocalStorage Registry)
  refreshSession: async (): Promise<StoredUser | null> => {
    const currentSession = authService.getSession();
    if (!currentSession) return null;

    const isTargetAdmin = (currentSession.email || '').toLowerCase() === ADMIN_EMAIL.toLowerCase();

    // 1. DATABASE REFRESH
    if (isSupabaseConfigured()) {
      try {
        // Check if Supabase auth session is still valid
        const { data: { session: sbSession } } = await supabase!.auth.getSession();
        if (!sbSession) {
          // If Supabase says we're logged out, we should be logged out
          return null;
        }

        let { data: profile, error } = await supabase!
          .from('personnel')
          .select('*')
          .eq('id', currentSession.id)
          .maybeSingle();

        // Handle missing columns error (Schema mismatch)
        if (error && error.code === '42703') {
             const retry = await supabase!
                .from('personnel')
                .select('id, name, clearance, registered_at, is_approved, avatar_url')
                .eq('id', currentSession.id)
                .maybeSingle();
             profile = retry.data;
             error = retry.error;
        }

        if (error) {
             console.warn("Session Refresh DB Error:", error);
             // Return current session if DB is unreachable (Offline tolerance)
             // BUT only if it's a network error, not a logic error
             return currentSession; 
        }

        if (profile) {
            // Check Approval
            if (!profile.is_approved && !isTargetAdmin) return null; // Force Logout

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
        } else {
            // User not found in personnel table? This is strange if Auth session exists.
            // Possibly deleted by admin.
            return null;
        }
      } catch (e) {
        return currentSession;
      }
    }

    // 2. LOCAL FALLBACK REFRESH
    const localData = localStorage.getItem(STORAGE_KEY);
    if (localData) {
        const users: StoredUser[] = JSON.parse(localData);
        const freshData = users.find(u => u.id === currentSession.id || (u.email && u.email === currentSession.email));
        
        if (freshData) {
             if (!freshData.is_approved && !isTargetAdmin) return null;

             const updatedUser: StoredUser = {
                 ...currentSession,
                 ...freshData,
                 clearance: isTargetAdmin ? 6 : freshData.clearance,
                 isSuperAdmin: isTargetAdmin,
                 is_approved: isTargetAdmin ? true : freshData.is_approved
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
    const finalClearance = isTargetAdmin ? 6 : 1;
    const isApproved = isTargetAdmin ? true : false;

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

          if (dbError) {
             console.error("DB Register Error:", dbError);
          }
        }
        
        if (isTargetAdmin) {
            return { success: true, message: 'АДМИНИСТРАТОР ОПОЗНАН. ДОСТУП РАЗРЕШЕН.' };
        }
        return { success: true, message: 'ЗАЯВКА ПРИНЯТА. ОЖИДАЙТЕ ОДОБРЕНИЯ АДМИНИСТРАТОРА.' };

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
      title: isTargetAdmin ? 'Администратор' : 'Рекрут',
      department: isTargetAdmin ? 'Фонд SCP' : 'Отдел Кадров',
      site: isTargetAdmin ? '[УДАЛЕНО]' : 'Зона-19',
      isSuperAdmin: isTargetAdmin,
      is_approved: isApproved
    };
    
    localUsers.push(newUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(localUsers));
    
    return { success: true, message: isTargetAdmin ? 'ЛОКАЛЬНАЯ ЗАПИСЬ СОЗДАНА [ADMIN]' : 'ЗАЯВКА СОЗДАНА. ТРЕБУЕТСЯ ОДОБРЕНИЕ.' };
  },

  login: async (email: string, password: string): Promise<{ success: boolean; user?: StoredUser; message: string }> => {
    
    const isTargetAdmin = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

    if (isSupabaseConfigured()) {
      try {
        const { data: authData, error: authError } = await supabase!.auth.signInWithPassword({
          email,
          password,
        });

        if (authError) {
           return { success: false, message: `ДОСТУП ЗАПРЕЩЕН: ${authError.message.toUpperCase()}` };
        }

        if (authData.user) {
          let { data: profile, error: dbError } = await supabase!
            .from('personnel')
            .select('id, name, clearance, registered_at, is_approved, avatar_url, title, department, site')
            .eq('id', authData.user.id)
            .maybeSingle();
          
          if (dbError && dbError.code === '42703') {
             const retry = await supabase!
                .from('personnel')
                .select('id, name, clearance, registered_at, is_approved, avatar_url')
                .eq('id', authData.user.id)
                .maybeSingle();
             profile = retry.data;
             dbError = retry.error;
          }
            
          if (dbError) {
              if (isTargetAdmin) {
                 const recoveryUser: StoredUser = {
                    id: authData.user.id,
                    email: authData.user.email || email,
                    name: 'АДМИНИСТРАТОР [ВОССТАНОВЛЕНИЕ]',
                    password: '***',
                    clearance: 6,
                    registeredAt: new Date().toISOString(),
                    isSuperAdmin: true,
                    is_approved: true,
                    title: 'Смотритель Системы',
                    department: 'Режим Восстановления',
                    site: 'Зона-01'
                 };
                 localStorage.setItem(SESSION_KEY, JSON.stringify(recoveryUser));
                 return { success: true, user: recoveryUser, message: 'СБОЙ БД: АВАРИЙНЫЙ ВХОД АДМИНИСТРАТОРА' };
              }
              return { success: false, message: `ОШИБКА БАЗЫ ДАННЫХ: ${dbError.code}` };
          }

          const isApproved = profile?.is_approved ?? (isTargetAdmin ? true : false);

          if (!isApproved) {
              await supabase!.auth.signOut();
              return { success: false, message: 'ДОСТУП ОГРАНИЧЕН: ОЖИДАЕТСЯ ПОДТВЕРЖДЕНИЕ АДМИНИСТРАТОРА' };
          }

          const user: StoredUser = {
            id: profile?.id || authData.user.id,
            email: authData.user.email || email,
            name: profile?.name || 'Неизвестный агент',
            password: '***',
            clearance: isTargetAdmin ? 6 : (profile?.clearance ?? 1),
            registeredAt: profile?.registered_at || new Date().toISOString(),
            isSuperAdmin: isTargetAdmin,
            is_approved: true,
            title: profile?.title || (isTargetAdmin ? 'Администратор' : 'Полевой Агент'), 
            department: profile?.department || (isTargetAdmin ? 'Командование О5' : 'Общие обязанности'),
            site: profile?.site || (isTargetAdmin ? 'Зона-01' : 'Зона-19'),
            avatar_url: profile?.avatar_url
          };
          
          localStorage.setItem(SESSION_KEY, JSON.stringify(user));
          return { success: true, user, message: 'ЛИЧНОСТЬ ПОДТВЕРЖДЕНА [REMOTE]' };
        }
      } catch (err: any) {
         return { success: false, message: `СИСТЕМНАЯ ОШИБКА: ${err.message}` };
      }
    }

    const localData = localStorage.getItem(STORAGE_KEY);
    const localUsers: StoredUser[] = localData ? JSON.parse(localData) : [];
    const localUser = localUsers.find(u => (u.email || u.id).toLowerCase() === email.toLowerCase() && u.password === password);

    if (localUser) {
      if (!localUser.is_approved && !localUser.isSuperAdmin) {
          return { success: false, message: 'ДОСТУП ОГРАНИЧЕН: ОЖИДАЕТСЯ ПОДТВЕРЖДЕНИЕ АДМИНИСТРАТОРА' };
      }
      if ((localUser.email || '').toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
          localUser.isSuperAdmin = true;
          localUser.clearance = 6;
          localUser.is_approved = true;
      }
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

       const { error: uploadError } = await supabase!.storage
         .from('avatars')
         .upload(filePath, file);

       if (uploadError) return { success: false, message: `ОШИБКА ЗАГРУЗКИ: ${uploadError.message}` };

       const { data } = supabase!.storage.from('avatars').getPublicUrl(filePath);
       const publicUrl = data.publicUrl;

       await supabase!.from('personnel').update({ avatar_url: publicUrl }).eq('id', userId);

       const sessionData = localStorage.getItem(SESSION_KEY);
       if (sessionData) {
          const session = JSON.parse(sessionData);
          session.avatar_url = publicUrl;
          localStorage.setItem(SESSION_KEY, JSON.stringify(session));
       }

       return { success: true, url: publicUrl, message: 'БИОМЕТРИЯ ОБНОВЛЕНА' };
     } catch (e: any) {
        return { success: false, message: `СИСТЕМНЫЙ СБОЙ: ${e.message}` };
     }
  },

  logout: () => {
    localStorage.removeItem(SESSION_KEY);
    if (isSupabaseConfigured()) {
        supabase!.auth.signOut();
    }
  }
};
