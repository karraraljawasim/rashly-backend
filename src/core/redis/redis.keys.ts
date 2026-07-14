export const REDIS_KEYS = {
  inventory: {
    available: (inventoryId: string) =>
      `rashly:inventory:${inventoryId}:available`,
  },
};
