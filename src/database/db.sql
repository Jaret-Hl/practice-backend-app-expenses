-- Tabla de usuarios
create table if not exists User (
  id serial primary key,
  email text unique not null,
  password text not null
);

-- Tabla de gastos
create table if not exists Expense (
  id serial primary key,
  title text not null,
  category text not null,
  amount numeric not null,
  date timestamptz not null default now(),
  user_id int references users(id)
);
