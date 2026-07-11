CREATE TABLE "events" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"sale_starts_at" timestamp NOT NULL,
	"sale_ends_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
