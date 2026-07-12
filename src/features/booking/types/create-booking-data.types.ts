export class CreateBookingData {
  userId: string;
  inventoryItemId: string;
  quantity: number;
  idempotencyKey: string;
}
