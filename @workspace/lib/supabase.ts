import { createClient, SingleClient } from '@supabase/supabase-js';

// URL и ключ для Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Создаем один глобальный клиент при загрузке модуля (ленивая инициализация не нужна,
// так как createClient возвращает один экземпляр и повторно вызов создаёт новый)
// Чтобы избежать множественных экземпляров, нужно использовать createBrowserClient с теми же
// URL и ключом в каждом клиентском компоненте, либо использовать Server-side cookies через @supabase/ssr
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
