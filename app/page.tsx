"use client";

import { useState, useEffect } from "react";
import { checkAuth } from "@/lib/auth-client";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await checkAuth();
        setUser(currentUser);
      } catch (error) {
        console.error("Error checking auth:", error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  return (
    <div className="flex pt-2">
      {loading ? (
        <span>Загрузка...</span>
      ) : user ? (
        <div>
          <h1>Привет, {user.email}!</h1>
          <p>ID: {user.id}</p>
          <p>Дата регистрации: {new Date(user.created_at).toLocaleDateString()}</p>
          <p>Отпуск: {user.data}</p>
        </div>
      ) : (
        <div>Вы не авторизованы. Пожалуйста, войдите в аккаунт.</div>
      )}
    </div>
  );
}
