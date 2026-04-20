import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Получаем server client
const getServerClient = async () => {
  const cookieStore = await cookies();
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
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
export async function checkAuth() {
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  return user;
}

// Обработка пропущенной аутентификации
export async function requireAuth() {
  const user = await checkAuth();
  
  if (!user) {
    redirect('/login');
  }
  
  return user;
}

// Вход пользователя
export async function signIn(email: string, password: string) {
  const supabase = await getServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    return { error };
  }
  
  return { data };
}

// Регистрация пользователя
export async function signUp(email: string, password: string) {
  const supabase = await getServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (error) {
    return { error };
  }
  
  return { data };
}

// Выход пользователя
export async function signOut() {
  const supabase = await getServerClient();
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    return { error };
  }
  
  return { success: true };
}

// Получение сессии пользователя
export async function getSession() {
  const supabase = await getServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  
  return session;
}
