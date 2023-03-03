CREATE TABLE "product" (
	"ID"	INTEGER UNIQUE,
	"pokemon_name"	NUMERIC,
	"move1"	TEXT,
	"move2"	TEXT,
	"move3"	TEXT,
	"move4"	TEXT,
	"shiny"	TEXT,
	"type"	TEXT,
	"amount"	INTEGER,
	"price"	INTEGER,
	PRIMARY KEY("ID" AUTOINCREMENT)
);

CREATE TABLE "feedback" (
	"ID"	INTEGER,
	"product_id"	INTEGER,
	"counts"	INTEGER,
	"avg_score"	INTEGER,
	PRIMARY KEY("ID")
);

CREATE TABLE "text_review" (
	"product_id"	INTEGER,
	"review"	TEXT
);

CREATE TABLE "transcation" (
	"transcation_id"	TEXT,
	"item_id"	NUMERIC COLLATE UTF16CI,
	"buyer_name"	TEXT,
	FOREIGN KEY("item_id") REFERENCES "product"("ID")
);

CREATE TABLE "user" (
	"ID"	INTEGER,
	"username"	TEXT UNIQUE,
	"password"	TEXT,
	"balance"	INTEGER,
	"sessionid"	TEXT,
	PRIMARY KEY("ID" AUTOINCREMENT)
);