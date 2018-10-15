CREATE TABLE prod_admin (
	id              SERIAL,
	n               int,
	polygons        varchar(20),
	m               int,
	true_polygons   varchar(20),
	max_delta       int,
	mid_delta       int,
	mud_delta       int,
	action_weights  varchar(20),
	rounds			int,
	max_payout		numeric(3, 2)
);

CREATE TABLE dev_admin (
	id              SERIAL,
	n               int,
	polygons        varchar(20),
	m               int,
	true_polygons   varchar(20),
	max_delta       int,
	mid_delta       int,
	mud_delta       int,
	action_weights  varchar(20),
	rounds			int,
	max_payout		numeric(3, 2)
);

CREATE TABLE prod_complexity (
	id              SERIAL,
	complex         int,
	n               int
);

CREATE TABLE dev_complexity (
	id              SERIAL,
	complex         int,
	n               int
);

CREATE TABLE prod_participants (
	id              SERIAL,
	gender          varchar(10),
	age             int,
	welcome_time    int,
	surveycode      varchar(200),
	ipaddress       varchar(50),
	city            varchar(100),
	country         varchar(100)
);

CREATE TABLE dev_participants (
	id              SERIAL,
	gender          varchar(10),
	age             int,
	welcome_time    int,
	surveycode      varchar(200),
	ipaddress       varchar(50),
	city            varchar(100),
	country         varchar(100)
);

CREATE TABLE prod_tests (
	id              SERIAL,
	userid          int,
	duration        int,
	final_payout    int,
	total_payout    int,
	start           timestamp        default NOW(),
	ending          timestamp,
	selected_timer  int
);

CREATE TABLE dev_tests (
	id              SERIAL,
	userid          int,
	duration        int,
	final_payout    int,
	total_payout    int,
	start           timestamp        default NOW(),
	ending          timestamp,
	selected_round  int,
	selected_timer  int   
);

CREATE TABLE prod_rounds (
	id              SERIAL,
	testid          int,
	duration        int,
	payout          int,
	selection       int,
	polygons        varchar(50),
	prob            int,
	mudding         int,
	selected_round  int
);

CREATE TABLE dev_rounds (
	id              SERIAL,
	testid          int,
	duration        int,
	payout          int,
	selection       int,
	polygons        varchar(50),
	prob            int,
	mudding         int
);

