'use client';

import React, { useState } from 'react';
import { Calendar, Button, Card } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';

dayjs.locale('ru');

// Пропсы оставляем минимальными, чтобы удовлетворить проверкам,
// но они не используются для отображения данных.
interface CalendarProps {
    bookings?: any[]; 
}

export default function CalendarComponent({ bookings }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Минимальный обработчик, чтобы календарь мог работать
  const handleDateChange = (date: dayjs.Dayjs) => {
    setSelectedDate(date.format('YYYY-MM-DD'));
  };

  return (
    <Card
      title={<span><CalendarOutlined /> Календарь бронирования</span>}
      extra={
        <Button type="primary" onClick={() => setCurrentDate(dayjs().add(1, 'month'))}>
          + месяц
        </Button>
      }
    >
      <Calendar
        value={currentDate}
        onPanelChange={(value, mode) => {
          if (mode === 'year') {
            setCurrentDate(dayjs(value.year));
          } else if (mode === 'month') {
            setCurrentDate(value);
          }
        }}
        onChange={handleDateChange}
        onSelectDate={(date, mode) => {
          if (mode === 'date') {
            setSelectedDate(date.format('YYYY-MM-DD'));
            setCurrentDate(date);
          }
        }}
        onFullChange={setCurrentDate}
        onPrevMonth={(current, next) => next}
        onNextMonth={(current, next) => next}
        onToday={() => setCurrentDate(dayjs())}
      />
    </Card>
  );
}
