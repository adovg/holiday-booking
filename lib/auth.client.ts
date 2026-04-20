// Клиентская версия для использования в Client Components
// Импортирует серверные функции и предоставляет их для клиентского использования

import { signIn as serverSignIn, signUp as serverSignUp, signOut as serverSignOut, checkAuth as serverCheckAuth } from './auth.server.client';

// Выход пользователя
export async function signOut() {
  const result = await serverSignOut();
  if (result.error) {
    console.error('Ошибка выхода:', result.error.message);
  }
  return result;
}

// Вход пользователя
export async function signIn(email: string, password: string) {
  const result = await serverSignIn(email, password);
  if (result.error) {
    console.error('Ошибка входа:', result.error.message);
  }
  return result;
}

// Регистрация пользователя
export async function signUp(email: string, password: string) {
  const result = await serverSignUp(email, password);
  if (result.error) {
    console.error('Ошибка регистрации:', result.error.message);
  }
  return result;
}

// Проверка аутентификации пользователя
export async function checkAuth() {
  const user = await serverCheckAuth();
  return user;
}
