CREATE TYPE "public"."booking_status_enum" AS ENUM('pending', 'canceled', 'expired', 'confirmed');--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"inventory_item_id" uuid NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"status" "booking_status_enum" DEFAULT 'pending' NOT NULL,
	"idempotencyKey" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "bookings_idempotencyKey_unique" UNIQUE("idempotencyKey")
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_inventory_item_id_inventory_items_id_fk" FOREIGN KEY ("inventory_item_id") REFERENCES "public"."inventory_items"("id") ON DELETE no action ON UPDATE no action;