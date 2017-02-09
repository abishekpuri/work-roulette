drop table account cascade;
drop table tasks;

create table account (
user_id serial primary key,
username text unique,
points int);

create table tasks (
t_id serial primary key,
acct int references account(user_id) on delete cascade,
points int,
category text,
description text);
