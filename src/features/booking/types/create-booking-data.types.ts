export class CreateBookingData {
  userId: string;
  inventoryItemId: string;
  holdExpiresAt: Date;
  quantity: number;
  idempotencyKey: string;
}
