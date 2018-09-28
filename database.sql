CREATE TABLE prod_admin (
	id              SERIAL,
	total_n	        int,
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
	total_n	        int,
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

CREATE TABLE prod_prob (
	id              SERIAL,
	prob.           int,
	n               int
);

CREATE TABLE dev_prob (
	id              SERIAL,
	prob            int,
	n               int
);