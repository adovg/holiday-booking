"use client";
import { useState, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function DatesCalendar() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [savedDates, setSavedDates] = useState<Date[]>([]);
  const [uiSelectedDates, setUiSelectedDates] = useState<Date[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ------------------------------------------------------------------
   * 1️⃣ Авторизация и загрузка дат
   */
  useEffect(() => {
    const init = async () => {
      try {
        const { data: authData } = await supabase.auth.getUser();
        setUser(authData.user ?? null);
        if (authData.user) {
          await fetchSavedDates(authData.user.id);
        }
        // Подгружаем даты из localStorage
        const stored = localStorage.getItem("unsent-dates");
        if (stored) {
          try {
            const parsedDates = JSON.parse(stored);
            setUiSelectedDates(parsedDates.map((s: string) => new Date(s)));
          } catch (e) {
            console.error("Ошибка парсинга дат из localStorage:", e);
            localStorage.removeItem("unsent-dates");
          }
        }
      } catch (err) {
        console.error("Ошибка авторизации:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  /* ------------------------------------------------------------------
   * 2️⃣ Загрузка сохранённых дат из Supabase
   */
  const fetchSavedDates = async (userId: string | null) => {
    if (!userId) return;
    try {
      const { data, error } = await supabase
        .from("dates")
        .select("date")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        setSavedDates(data.map((r: any) => new Date(r.date)));
      }
    } catch (e) {
      console.error("Ошибка загрузки дат:", e);
      toast.error("Не удалось загрузить сохранённые даты");
    }
  };

  /* ------------------------------------------------------------------
   * 3️⃣ Обработчик выбора дат (ИСПРАВЛЕНО)
   */
  const handleSelect = (dates: Date[] | undefined) => {
    if (!dates) {
      setUiSelectedDates([]);
      return;
    }
    setUiSelectedDates(dates);
  };

  /* ------------------------------------------------------------------
   * 4️⃣ Удалить дату до отправки
   */
  const removeDate = (dateToRemove: Date) => {
    setUiSelectedDates((prev) =>
      prev.filter((d) => d.toDateString() !== dateToRemove.toDateString())
    );
  };

  /* ------------------------------------------------------------------
   * 5️⃣ Сохранить выбранные даты в БД
   */
  const saveDates = async () => {
    if (!user?.id) {
      toast.error("Необходимо авторизоваться");
      return;
    }

    if (!uiSelectedDates.length) {
      toast.info("Нет дат для сохранения");
      return;
    }

    setIsSubmitting(true);
    try {
      // Только новые даты
      const datesToInsert = uiSelectedDates.filter(
        (d) =>
          !savedDates.some((sd) => sd.toDateString() === d.toDateString())
      );

      if (!datesToInsert.length) {
        toast.info("Все выбранные даты уже сохранены");
        setUiSelectedDates([]);
        localStorage.removeItem("unsent-dates");
        return;
      }

      const payload = datesToInsert.map((d) => ({
        date: d.toISOString().split("T")[0],
        user_id: user.id,
        selected: true,
      }));

      const { error } = await supabase.from("dates").insert(payload);

      if (error) throw error;

      toast.success(`Сохранено ${payload.length} дат(а/ы)!`);
      setUiSelectedDates([]);
      localStorage.removeItem("unsent-dates");
      await fetchSavedDates(user.id);
    } catch (e: any) {
      console.error("Ошибка сохранения дат:", e);
      toast.error(e.message || "Не удалось сохранить даты");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ------------------------------------------------------------------
   * 6️⃣ Сохраняем выбранные даты в localStorage при каждом изменении
   */
  useEffect(() => {
    if (uiSelectedDates.length > 0) {
      localStorage.setItem(
        "unsent-dates",
        JSON.stringify(uiSelectedDates.map((d) => d.toISOString()))
      );
    } else {
      localStorage.removeItem("unsent-dates");
    }
  }, [uiSelectedDates]);

  /* ------------------------------------------------------------------
   * 7️⃣ UI
   */
  if (loading) return <div className="text-center py-8">Загрузка...</div>;

  if (!user)
    return (
      <div className="text-center py-8">
        <p className="text-lg">Пожалуйста, войдите в аккаунт</p>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Календарь дат
      </h1>

      <div className="flex justify-center mb-6">
        <DayPicker
          mode="multiple"
          selected={uiSelectedDates}
          onSelect={handleSelect}
          disabled={(date) => {
            // Блокируем даты до 2026 года
            return date.getFullYear() < 2026;
          }}
          className="rounded-lg border bg-card text-card-foreground shadow-sm p-4"
        />
      </div>

      {/* Список выбранных дат */}
      {uiSelectedDates.length > 0 && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Выбранные даты:</h3>
          <div className="flex flex-wrap gap-2">
            {uiSelectedDates.map((d, i) => (
              <span
                key={i}
                className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
              >
                {d.toLocaleDateString("ru-RU")}
                <button
                  onClick={() => removeDate(d)}
                  className="ml-2 text-red-500 hover:text-red-700 font-bold"
                  aria-label="Удалить дату"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Кнопка сохранения */}
      <div className="flex justify-center">
        <button
          onClick={saveDates}
          disabled={!uiSelectedDates.length || isSubmitting}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Сохранение...
            </span>
          ) : (
            `Сохранить ${uiSelectedDates.length} дат(у/ы)`
          )}
        </button>
      </div>
    </div>
  );
}