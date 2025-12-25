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
  image?: string;
}

// NO FALLBACK USERS - DB ONLY AS REQUESTED
const FALLBACK_USERS: StoredUser[] = [];

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
             // If we can't write to DB (e.g. recursion), but Auth created the user, we might be in an inconsistent state.
             // But usually RLS allows INSERT.
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
          // Fetch Profile including is_approved
          let { data: profile, error: dbError } = await supabase!
            .from('personnel')
            .select('id, name, clearance, registered_at, is_approved')
            .eq('id', authData.user.id)
            .maybeSingle();
            
          if (dbError) {
              console.error("Login Profile Fetch Error:", JSON.stringify(dbError, null, 2));
              
              // CRITICAL: If DB has RLS recursion (42P17) or Permission Denied (42501), Admin should still get in.
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

              // Normal users fail
              return { success: false, message: `ОШИБКА БАЗЫ ДАННЫХ: ${dbError.code || 'НЕИЗВЕСТНАЯ ОШИБКА'}` };
          }

          // Handle Approval Check
          // If field is missing (old schema), default to true for safety or false for strictness. 
          // Assuming strict: default to false unless it's the specific admin email.
          const isApproved = profile?.is_approved ?? (isTargetAdmin ? true : false);

          if (!isApproved) {
              await supabase!.auth.signOut();
              return { success: false, message: 'ДОСТУП ОГРАНИЧЕН: ОЖИДАЕТСЯ ПОДТВЕРЖДЕНИЕ АДМИНИСТРАТОРА' };
          }

          // Force Override if Super Admin Email
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
            // Defaults
            title: isTargetAdmin ? 'Администратор' : 'Полевой Агент', 
            department: isTargetAdmin ? 'Командование О5' : 'Общие обязанности',
            site: isTargetAdmin ? 'Зона-01' : 'Зона-19'
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
      // Check approval locally
      if (!localUser.is_approved && !localUser.isSuperAdmin) {
          return { success: false, message: 'ДОСТУП ОГРАНИЧЕН: ОЖИДАЕТСЯ ПОДТВЕРЖДЕНИЕ АДМИНИСТРАТОРА' };
      }

      // Refresh admin status on login just in case
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

  logout: () => {
    localStorage.removeItem(SESSION_KEY);
    if (isSupabaseConfigured()) {
        supabase!.auth.signOut();
    }
  }
};
