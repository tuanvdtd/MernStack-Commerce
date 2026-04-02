import { redisPubsubService } from "~/services/redisPubsub.service"

class InventoryTest {
  constructor() {
    redisPubsubService.subscribe('purchase_events', (channel, message) => {
      console.log("Received message", message)
      InventoryTest.updateInventory(message)
    })
    
  }
  static updateInventory({ productId, quantity }) {
    // logic updateInventory
    //.....
    console.log(`Updated inventory for Product ID ${productId} with quantity ${quantity}`)
  }
}
export const inventoryTest = new InventoryTest();

