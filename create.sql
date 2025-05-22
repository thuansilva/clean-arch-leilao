drop schema if exists branas cascade;

create schema branas;

create table branas.auction (
    auction_id uuid,
    start_date timestamptz,
    end_date timestamptz,
    min_increment numeric,
    start_amount numeric
);

create table branas.bid (
    bid_id uuid,
    auction_id uuid,
    customer text,
    amount numeric,
    date timestamptz
);