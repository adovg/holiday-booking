'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Select,
  Button,
  Card,
  Table,
  Modal,
  message,
  Tag,
  Popconfirm,
  Space,
  Typography
} from 'antd';
import {
  CalendarOutlined,
  PlusOutlined,
  DeleteOutlined,
  CheckOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';

dayjs.locale('ru');

type Booking = {
  id: string;
  date: string;
  customerName: string;
  type: 'отпуск' | 'командировка' | 'сервис';
  status: 'подтверждено' | 'ожидает' | 'отклонено' | 'отменено';
};

interface CalendarProps {
  bookings: Booking[];
  onAddBooking: (date: string) => void;
  onEditBooking: (booking: Booking) => void;
  onDeleteBooking: (id: string) => void;
}

export default function CalendarComponent({
  bookings,
  onAddBooking,
  onEditBooking,
  onDeleteBooking
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [bookingType, setBookingType] = useState<string>('отпуск');
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  const handleDateChange = (date: dayjs.Dayjs) => {
    setSelectedDate(date.format('YYYY-MM-DD'));
  };

  const handleAddBooking = () => {
    if (!selectedDate) return;
    
    if (editingBooking) {
      const updatedBooking = {
        ...editingBooking,
        date: selectedDate,
        customerName,
        type: bookingType as Booking['type'],
        status: 'подтверждено'
      };
      onEditBooking(updatedBooking);
      setEditingBooking(null);
      message.success('Запись обновлена');
    } else {
      const newBooking: Booking = {
        id: `booking-${Date.now()}`,
        date: selectedDate,
        customerName,
        type: bookingType as Booking['type'],
        status: 'подтверждено'
      };
      onAddBooking(newBooking);
      message.success('Запись создана');
    }

    setCustomerName('');
    setBookingType('отпуск');
    setSelectedDate(null);
    setIsModalOpen(false);
    setCurrentDate(dayjs());
  };

  const openAddModal = () => {
    if (!selectedDate) {
      message.warning('Выберите дату в календаре');
      return;
    }
    setEditingBooking(null);
    setCustomerName('');
    setBookingType('отпуск');
    setIsModalOpen(true);
  };

  const openEditModal = (booking: Booking) => {
    setEditingBooking(booking);
    setCustomerName(booking.customerName);
    setBookingType(booking.type);
    setIsModalOpen(true);
  };

  const getStatusColor = (status: Booking['status']) => {
    const colors: Record<string, string> = {
      'подтверждено': 'green',
      'ожидает': 'orange',
      'отклонено': 'red',
      'отменено': 'gray'
    };
    return colors[status] || 'default';
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

      {selectedDate && (
        <Card style={{ marginTop: 16 }} title="Бронирования">
          <div style={{ marginBottom: 12 }}>
            <Button
              type="primary"
              onClick={openAddModal}
              icon={<PlusOutlined />}
            >
              Добавить запись
            </Button>
          </div>

          <Table
            dataSource={bookings?.filter((b) => b.date === selectedDate) || []}
            columns={[
              {
                title: 'Дата',
                dataIndex: 'date',
                width: 120,
                render: (date: string) => date
              },
              {
                title: 'Клиент',
                dataIndex: 'customerName',
                render: (name: string) => (
                  <Typography.Text>{name}</Typography.Text>
                )
              },
              {
                title: 'Тип',
                dataIndex: 'type',
                width: 100,
                render: (type: Booking['type']) => {
                  const icons: Record<string, React.ReactNode> = {
                    'отпуск': <ClockCircleOutlined />,
                    'командировка': <ClockCircleOutlined />,
                    'сервис': <ClockCircleOutlined />
                  };
                  return (
                    <Space>
                      {icons[type]}
                      <Typography.Text>{type}</Typography.Text>
                    </Space>
                  );
                }
              },
              {
                title: 'Статус',
                dataIndex: 'status',
                width: 120,
                render: (status: Booking['status']) => (
                  <Tag color={getStatusColor(status)}>
                    {status}
                  </Tag>
                )
              },
              {
                title: 'Действия',
                key: 'actions',
                width: 150,
                render: (_, record: Booking) => (
                  <Space>
                    <Button
                      type="link"
                      onClick={() => openEditModal(record)}
                      icon={<CheckOutlined />}
                    >
                      Редактировать
                    </Button>
                    <Popconfirm
                      title="Удалить запись?"
                      onConfirm={() => onDeleteBooking(record.id)}
                      okText="Да"
                      cancelText="Отмена"
                    >
                      <Button
                        danger
                        type="link"
                        icon={<DeleteOutlined />}
                      >
                        Удалить
                      </Button>
                    </Popconfirm>
                  </Space>
                )
              }
            ]}
            rowKey="id"
          />
        </Card>
      )}

      <Modal
        title={editingBooking ? 'Редактировать запись' : 'Новая запись'}
        open={isModalOpen}
        onOk={handleAddBooking}
        onCancel={() => setIsModalOpen(false)}
      >
        <div style={{ marginBottom: 16 }}>
          <label>
            Имя клиента:
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Введите имя клиента"
              style={{ width: '100%', marginTop: 4 }}
            />
          </label>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label>
            Тип бронирования:
            <Select
              value={bookingType}
              onChange={(value) => setBookingType(value)}
              options={[
                { value: 'отпуск', label: 'Отпуск' },
                { value: 'командировка', label: 'Командировка' },
                { value: 'сервис', label: 'Сервис' }
              ]}
              style={{ width: '100%', marginTop: 4 }}
            />
          </label>
        </div>
      </Modal>
    </Card>
  );
}
