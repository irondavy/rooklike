drop table if exists boards;
create table boards (
  id integer primary key autoincrement,
  title string not null,
  template string not null
);