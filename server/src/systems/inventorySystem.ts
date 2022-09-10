// inventorySystem.ts - Allows entities to hold and transfer items

import EventEmitter from 'events'
import { ISystem, Registry } from '../engine/registry'

// Components
import { Inventory } from '../components/inventory'

export class InventorySystem implements ISystem {
    private events: EventEmitter
    private ecs: Registry

    constructor(events: EventEmitter, ecs: Registry) {
        this.events = events
        this.ecs = ecs

        // Listen for events
        this.events.on('transferItemAttempt', this.transferItem)
    }

    update = () => {
        //  Regular updates go here
    }

    // Event responders
    transferItem = (sender: string, recipient: string, item: string) => {
        const senderInventory = this.ecs.getComponent(sender, 'inventory') as Inventory
        const recipientInventory = this.ecs.getComponent(recipient, 'inventory') as Inventory

        // Remove item from the sender
        const index = senderInventory.items.indexOf(item)
        senderInventory.items.splice(index, 1)

        // Add item to the recipient
        recipientInventory.items.push(item)
        this.events.emit('transferItemSuccess', sender, recipient, item)
    }

    // Utility functions
}
