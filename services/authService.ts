import { SecurityClearance } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const STORAGE_KEY = 'scp_net_users';
const SESSION_KEY = 'scp_net_current_session';

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

  // Refresh session data from Source of Truth (DB or LocalStorage Registry)
  refreshSession: async (): Promise<StoredUser | null> => {
    const currentSession = authService.getSession();
    if (!currentSession) return null;

    const isTargetAdmin = currentSession.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

    // 1. DATABASE REFRESH
    if (isSupabaseConfigured()) {
      try {
        // Try to select all fields first
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
             return currentSession; 
        }

        if (profile) {
            // If user exists in DB, update session
            // Check Approval
            if (!profile.is_approved && !isTargetAdmin) return null; // Force Logout

            const updatedUser: StoredUser = {
                ...currentSession,
                name: profile.name,
                clearance: isTargetAdmin ? 6 : profile.clearance,
                is_approved: profile.is_approved,
                // Optional fields
                title: profile.title || currentSession.title,
                department: profile.department || currentSession.department,
                site: profile.site || currentSession.site,
                avatar_url: profile.avatar_url || currentSession.avatar_url,
                registeredAt: profile.registered_at || currentSession.registeredAt
            };
            
            localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
            return updatedUser;
        } else {
            // User not found in DB (Deleted?)
            // If we are relying on DB, this means account is gone.
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
                 // Ensure Admin
                 clearance: isTargetAdmin ? 6 : freshData.clearance,
                 isSuperAdmin: isTargetAdmin
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
    
    // Auto-promote specific email to OMNI and Approve immediately
    // For everyone else: Force Level 1 and Require Approval
    const finalClearance = isTargetAdmin ? 6 : 1;
    const isApproved = isTargetAdmin ? true : false;

    // --- REAL DATABASE MODE ---
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
             console.error("DB Register Error:", JSON.stringify(dbError, null, 2));
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

    // --- LOCAL FALLBACK MODE ---
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
    
    if (isTargetAdmin) {
        return { success: true, message: 'ЛОКАЛЬНАЯ ЗАПИСЬ СОЗДАНА [ADMIN]' };
    }
    return { success: true, message: 'ЗАЯВКА СОЗДАНА. ТРЕБУЕТСЯ ОДОБРЕНИЕ.' };
  },

  // Login
  login: async (email: string, password: string): Promise<{ success: boolean; user?: StoredUser; message: string }> => {
    
    const isTargetAdmin = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

    // 1. DATABASE LOGIN
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
          // Fetch Profile including is_approved and avatar_url
          // We try to fetch everything first
          let { data: profile, error: dbError } = await supabase!
            .from('personnel')
            .select('id, name, clearance, registered_at, is_approved, avatar_url, title, department, site')
            .eq('id', authData.user.id)
            .maybeSingle();
          
          // ERROR HANDLING: 42703 = Column does not exist
          // If the DB schema isn't updated yet, fall back to basic fields so user can still login
          if (dbError && dbError.code === '42703') {
             console.warn("DB Schema mismatch: Missing new columns. Falling back to basic profile fetch.");
             const retry = await supabase!
                .from('personnel')
                .select('id, name, clearance, registered_at, is_approved, avatar_url') // Removed title/dept/site
                .eq('id', authData.user.id)
                .maybeSingle();
             
             profile = retry.data;
             dbError = retry.error;
          }
            
          if (dbError) {
              console.error("Login Profile Fetch Error:", JSON.stringify(dbError, null, 2));
              
              if (isTargetAdmin && (dbError.code === '42P17' || dbError.code === '42501')) {
                 const recoveryUser: StoredUser = {
                    id: authData.user.id,
                    email: authData.user.email,
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
              return { success: false, message: `ОШИБКА БАЗЫ ДАННЫХ: ${dbError.code || 'НЕИЗВЕСТНАЯ ОШИБКА'}` };
          }

          const isApproved = profile?.is_approved ?? (isTargetAdmin ? true : false);

          if (!isApproved) {
              await supabase!.auth.signOut();
              return { success: false, message: 'ДОСТУП ОГРАНИЧЕН: ОЖИДАЕТСЯ ПОДТВЕРЖДЕНИЕ АДМИНИСТРАТОРА' };
          }

          const effectiveClearance = isTargetAdmin ? 6 : (profile?.clearance ?? 1);

          const user: StoredUser = {
            id: profile?.id || authData.user.id,
            email: authData.user.email,
            name: profile?.name || 'Неизвестный агент',
            password: '***',
            clearance: effectiveClearance,
            registeredAt: profile?.registered_at || new Date().toISOString(),
            isSuperAdmin: isTargetAdmin,
            is_approved: true,
            title: profile?.title || (isTargetAdmin ? 'Администратор' : 'Полевой Агент'), 
            department: profile?.department || (isTargetAdmin ? 'Командование О5' : 'Общие обязанности'),
            site: profile?.site || (isTargetAdmin ? 'Зона-01' : 'Зона-19'),
            avatar_url: profile?.avatar_url
          };
          
          if (isTargetAdmin) {
             user.clearance = 6;
          }

          localStorage.setItem(SESSION_KEY, JSON.stringify(user));
          return { success: true, user, message: 'ЛИЧНОСТЬ ПОДТВЕРЖДЕНА [REMOTE]' };
        }
      } catch (err: any) {
         console.error("Login System Error:", err);
         return { success: false, message: `СИСТЕМНАЯ ОШИБКА: ${err.message}` };
      }
    }

    // 2. LOCAL FALLBACK
    const localData = localStorage.getItem(STORAGE_KEY);
    const localUsers: StoredUser[] = localData ? JSON.parse(localData) : [];
    const localUser = localUsers.find(u => (u.email || u.id).toLowerCase() === email.toLowerCase() && u.password === password);

    if (localUser) {
      if (!localUser.is_approved && !localUser.isSuperAdmin) {
          return { success: false, message: 'ДОСТУП ОГРАНИЧЕН: ОЖИДАЕТСЯ ПОДТВЕРЖДЕНИЕ АДМИНИСТРАТОРА' };
      }
      if (localUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
          localUser.isSuperAdmin = true;
          localUser.clearance = 6;
          localUser.is_approved = true;
      }
      localStorage.setItem(SESSION_KEY, JSON.stringify(localUser));
      return { success: true, user: localUser, message: 'ЛИЧНОСТЬ ПОДТВЕРЖДЕНА [LOCAL]' };
    }

    return { success: false, message: 'ДОСТУП ЗАПРЕЩЕН: ПОЛЬЗОВАТЕЛЬ НЕ НАЙДЕН' };
  },

  // Update Avatar via Storage
  uploadAvatar: async (userId: string, file: File): Promise<{ success: boolean; url?: string; message: string }> => {
     if (!isSupabaseConfigured()) {
       return { success: false, message: 'ХРАНИЛИЩЕ НЕДОСТУПНО (OFFLINE)' };
     }

     try {
       const fileExt = file.name.split('.').pop();
       const fileName = `${userId}-${Date.now()}.${fileExt}`;
       const filePath = `${fileName}`;

       // 1. Upload
       const { error: uploadError } = await supabase!.storage
         .from('avatars')
         .upload(filePath, file);

       if (uploadError) {
         console.error('Storage Upload Error:', uploadError);
         return { success: false, message: `ОШИБКА ЗАГРУЗКИ: ${uploadError.message}` };
       }

       // 2. Get URL
       const { data } = supabase!.storage.from('avatars').getPublicUrl(filePath);
       const publicUrl = data.publicUrl;

       // 3. Update DB
       const { error: dbError } = await supabase!
         .from('personnel')
         .update({ avatar_url: publicUrl })
         .eq('id', userId);

       if (dbError) {
         console.error('DB Update Error:', dbError);
         return { success: false, message: `ОШИБКА БД: ${dbError.message}` };
       }

       // 4. Update Session
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
