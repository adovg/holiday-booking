"use client";

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Клиент Supabase для клиентских компонентов
export const supabaseClient = createClient(supabaseUrl, supabaseKey);

// Проверка аутентификации пользователя
export async function checkAuth() {
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();
  
  return user;
}

// Обработка пропущенной аутентификации
export async function requireAuth() {
  const user = await checkAuth();
  
  if (!user) {
    // Для клиентских компонентов нужно использовать window.location
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return null;
  }
  
  return user;
}

// Вход пользователя
export async function signIn(email: string, password: string) {
  const { data, error } = await supabaseClient.auth.signInWithPassword({
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
  const { data, error } = await supabaseClient.auth.signUp({
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
  const { error } = await supabaseClient.auth.signOut();
  
  if (error) {
    return { error };
  }
  
  return { success: true };
}

// Получение сессии пользователя
export async function getSession() {
  const {
    data: { session },
  } = await supabaseClient.auth.getSession();
  
  return session;
}
