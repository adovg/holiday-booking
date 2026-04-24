-- Создаем таблицу для хранения дат
-- id: уникальный идентификатор даты
-- date: выбранная дата
-- user_id: ID пользователя (аутентифицированный пользователь)
-- created_at: время создания записи
-- selected: флаг выбора даты

create table public.dates (
  id uuid default gen_random_uuid() primary key,
  date date not null,
  user_id uuid references auth.users not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  selected boolean default false,
  
  unique(date, user_id)
);

-- Создаем RLS (Row Level Security) политики
alter table dates enable row level security;

-- Пользователи могут читать свои собственные даты
create policy "Пользователи могут читать свои даты"
  on dates
  for select
  using ( auth.uid() = user_id );

-- Пользователи могут вставлять свои собственные даты
create policy "Пользователи могут вставлять свои даты"
  on dates
  for insert
  with check ( auth.uid() = user_id );

-- Пользователи могут обновлять свои собственные даты
create policy "Пользователи могут обновлять свои даты"
  on dates
  for update
  using ( auth.uid() = user_id );

-- Пользователи могут удалять свои собственные даты
create policy "Пользователи могут удалять свои даты"
  on dates
  for delete
  using ( auth.uid() = user_id );

-- Создаем индексы для производительности
create index idx_dates_user_id on dates(user_id);
create index idx_dates_date on dates(date);
