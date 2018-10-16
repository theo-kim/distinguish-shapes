-- You need to use spaces and not tabs!
-- this table stores the data settings as multiple rows (in case each row may need to be restored)
CREATE TABLE prod_admin (
	id              SERIAL             PRIMARY KEY,
	total_n	        int,
	n               int,
	polygons        varchar(20),
	m               int,
	true_polygons   varchar(20),
	max_delta       int,
	mid_delta       int,
	mud_delta       int,
	rounds          int,
	max_payout      numeric(4, 2)
);

CREATE TABLE dev_admin (
	id              SERIAL             PRIMARY KEY,
	total_n	        int,
	n               int,
	polygons        varchar(20),
	m               int,
	true_polygons   varchar(20),
	max_delta       int,
	mid_delta       int,
	mud_delta       int,
	rounds          int,
	max_payout      numeric(4, 2)
);

-- store the tables as a whole for later JOIN queries
CREATE TABLE prod_tables (
	id              SERIAL              PRIMARY KEY,
	start_round     int,
	end_round       int
);

CREATE TABLE dev_tables (
	id              SERIAL              PRIMARY KEY,
	start_round     int,
	end_round       int
);

CREATE TABLE prod_actions (
	id              SERIAL              PRIMARY KEY,
	tableid         int                 REFERENCES prod_tables(id),
	payout          int,
	action          int,
	shape           int
);

CREATE TABLE dev_actions (
	id              SERIAL              PRIMARY KEY,
	tableid         int                 REFERENCES dev_tables(id),
	payout          int,
	action          int,
	shape           int
);

CREATE TABLE prod_participants (
	id              SERIAL              PRIMARY KEY,
	gender          varchar(10),
	age             int,
	welcome_time    int,
	surveycode      varchar(200),
	ipaddress       varchar(50),
	city            varchar(100),
	country         varchar(100)
);

CREATE TABLE dev_participants (
	id              SERIAL              PRIMARY KEY,
	gender          varchar(10),
	age             int,
	welcome_time    int,
	surveycode      varchar(200),
	ipaddress       varchar(50),
	city            varchar(100),
	country         varchar(100)
);

CREATE TABLE prod_tests (
	id              SERIAL              PRIMARY KEY,
	userid          int                 REFERENCES prod_participants(id),
	duration        int,
	final_payout    int,
	total_payout    int,
	start           timestamp           default NOW(),
	ending          timestamp,
	selected_round  int
);

CREATE TABLE dev_tests (
	id              SERIAL              PRIMARY KEY,
	userid          int                 REFERENCES dev_participants(id),
	duration        int,
	final_payout    int,
	total_payout    int,
	start           timestamp           default NOW(),
	ending          timestamp,
	selected_round  int   
);

CREATE TABLE prod_rounds (
	id              SERIAL              PRIMARY KEY,
	testid          int                 REFERENCES prod_tests(id),
	used_table      int                 REFERENCES prod_tables(id),
	duration        int,
	payout          int,
	selection       int,
	polygons        varchar(50),
	mudding         int
);

CREATE TABLE dev_rounds (
	id              SERIAL              PRIMARY KEY,
	testid          int                 REFERENCES dev_tests(id),
	used_table      int                 REFERENCES dev_tables(id),
	duration        int,
	payout          int,
	selection       int,
	polygons        varchar(50),
	mudding         int
);

--INSERT STATEMENTS for default settings:
INSERT INTO prod_admin (n, polygons, m, true_polygons, max_delta, mid_delta, mud_delta, rounds, max_payout)
VALUES (5, '0011111000', 3, '0001110000', 2, 1, 2, 30, 10.00);

INSERT INTO dev_admin (n, polygons, m, true_polygons, max_delta, mid_delta, mud_delta, rounds, max_payout)
VALUES (5, '0011111000', 3, '0001110000', 2, 1, 2, 30, 10.00);

-- INSERT STATEMENT for default action tables
INSERT INTO prod_tables (start_round, end_round)
VALUES (1, 15), (16, 30);

INSERT INTO dev_tables (start_round, end_round)
VALUES (1, 15), (16, 30);

-- INSERT STATEMENT for default action table values
INSERT INTO prod_actions (tableid, payout, action, shape)
VALUES 	(1, 10, 0, 0), (1, 0, 0, 1), (1, 0, 0, 2), (1, 0, 1, 0), (1, 0, 1, 1), (1, 10, 1, 2), (1, 2, 2, 0), (1, 2, 2, 1), (1, 2, 2, 2),
		(2, 0, 0, 0), (2, 10, 0, 1), (2, 0, 0, 2), (2, 0, 1, 0), (2, 0, 1, 1), (2, 0, 1, 2), (2, 2, 2, 0), (2, 2, 2, 1), (2, 2, 2, 2);

INSERT INTO dev_actions (tableid, payout, action, shape)
VALUES (1, 10, 0, 0), (1, 0, 0, 1), (1, 0, 0, 2), (1, 0, 1, 0), (1, 0, 1, 1), (1, 10, 1, 2), (1, 2, 2, 0), (1, 2, 2, 1), (1, 2, 2, 2),
		(2, 0, 0, 0), (2, 10, 0, 1), (2, 0, 0, 2), (2, 0, 1, 0), (2, 0, 1, 1), (2, 0, 1, 2), (2, 2, 2, 0), (2, 2, 2, 1), (2, 2, 2, 2);
