import { createClient } from '@supabase/supabase-js';
import { createServerClient as createServerClientBase } from '@supabase/ssr';
import { cookies } from 'next/headers';

// URL и ключ для Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Создаем клиент для клиентской стороны (браузер)
export const createBrowserClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey);
};

// Создаем клиент для серверной стороны (Node.js) с управлением сессиями
export const createServerClient = async () => {
  const cookieStore = await cookies();
  return createServerClientBase(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options: any }>) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch (error) {
          // Молчаливо проваливаем, если cookie не может быть установлен
        }
      },
    },
  });
};
