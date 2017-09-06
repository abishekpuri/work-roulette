drop table account cascade;
drop table tasks;
drop table meetings;

create table account (
user_id serial primary key,
points int);

create table tasks (
t_id serial primary key,
acct int references account(user_id) on delete cascade,
priority int,
points int,
category text,
description text,
estimatedCompletion float,
actualCompletion float,
datecompleted timestamp,
completed bool);

create table meetings (
  m_id serial primary key,
  acct int references account(user_id) on delete cascade,
  category text,
  description text,
  meeting_time timestamp,
  completed bool
)
