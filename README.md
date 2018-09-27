# Distinguishing Shapes

For research conducted at NYU Tandon School of Engineering

## Running on Local Machine:

On Windows systems, run `npm run debug-windows`

On other systems, run `npm run debug`

## Running on Production Server:

Run `npm start`

## DATABASE SCHEMA:

All tables have a development and production version, indicated by the `dev_` or `prod_` prefix.

* `admin`: This table handles storing all of the settings for the study
	- `id` (**primary**, integer, serial)
	- `N` (integer): the total number of polygons presented
	- `n` (integer): the number of different types of polygons presented to the user
	- `polygons` (string): binary string representation of polygons selected:
		- i.e. if `polygons = 101111000`, then the selected polygons are:  9-gon, 7-gon, 6-gon, 5-gon, 4-gon
	- `m` (integer): the number of non-decoy polygons that the subject needs to consider
	- `true_polygons` (string): binary string representation of non-decoy polygons:
		- i.e. if `polygons = 001110000`, then the selected polygons are:  7-gon, 6-gon, 5-gon
	- `max_delta` (integer): the difference in highest and lowest number of polygons in non-decoy class (i.e. if `m = 3` and polygon-1 appears in highest amount and polygon-2 appears in lowest amount, equal to the n(polygon-1) - n(polygon-2))
		- mathematically, `max_delta < N/n * (n - m)`
	- `mid_delta` (integer): the difference in middle and lowest number of polygons in non-decoy class (i.e. if `m = 3` and polygon-3 appears in mid amount and polygon-2 appears in lowest amount, equal to the n(polygon-3) - n(polygon-2))
		- mathematically, `mid_delta < max_delta`
	- `mud_delta` (integer): decoy counts will be shifted randomly within range [-mud_delta, mud_delta]
		- mathematically, `mud_delta <= 1/m * ((N/n) * (n - m) - max_delta - mid_delta)`

* `participants`: This table handles storing all participant relevant data (i.e. survey responses)"# distinguish-shapes" 
