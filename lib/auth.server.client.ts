// Серверный клиент для использования в Client Components через "use server"
// Этот файл использует cookies и cookies API

'use server';

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { type Session } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Получаем серверный клиент
const getServerClient = async (): Promise<any> => {
  const cookieStore = await cookies();
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch (error) {
          // Silently fail if cookie cannot be set
        }
      },
    },
  });
};

// Проверка аутентификации пользователя
export async function checkAuth(): Promise<Session | null> {
  try {
    const supabase = await getServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    return user;
  } catch (error) {
    return null;
  }
}

// Перенаправление, если пользователь не аутентифицирован
export async function requireAuth(): Promise<Session> {
  const user = await checkAuth();

  if (!user) {
    redirect('/login');
  }

  return user;
}

// Вход пользователя
export async function signIn(email: string, password: string) {
  try {
    const supabase = await getServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: { message: error.message } };
    }

    return { data };
  } catch (err) {
    return { error: { message: 'Ошибка аутентификации' } };
  }
}

// Регистрация пользователя
export async function signUp(email: string, password: string) {
  try {
    const supabase = await getServerClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return { error: { message: error.message } };
    }

    return { data };
  } catch (err) {
    return { error: { message: 'Ошибка регистрации' } };
  }
}

// Выход пользователя
export async function signOut() {
  try {
    const supabase = await getServerClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { error: { message: error.message } };
    }

    return { success: true };
  } catch (err) {
    return { error: { message: 'Ошибка выхода' } };
  }
}

// Получение текущей сессии
export async function getSession(): Promise<Session | null> {
  try {
    const supabase = await getServerClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    return session;
  } catch (error) {
    return null;
  }
}

// Удаление сессии при выходе
export async function deleteSession() {
  try {
    const cookieStore = await cookies();
    const cookiesToDelete = [
      'sb-*',
      '__session',
      'auth_token',
      'token',
      'access_token',
      'refresh_token',
    ];

    cookiesToDelete.forEach((pattern) => {
      cookieStore.delete(pattern);
    });
  } catch (error) {
    console.error('Error deleting session cookies:', error);
  }
}
