// inventory.ts - Allows an entity to hold an item (which can later be dropped, deposited, etc)

import Phaser from 'phaser'
import { ISystem, Registry } from '../engine/registry'
import { Inventory } from '../components/inventory'

export class InventorySystem implements ISystem {
    private events: Phaser.Events.EventEmitter
    private ecs: Registry

    constructor(events: Phaser.Events.EventEmitter, ecs: Registry) {
        this.events = events
        this.ecs = ecs

        // Listen for events
        this.events.on('transferItem', this.giveItem)
    }

    update = () => {
        //
    }

    // Event responders
    giveItem = (sender: string, recipient: string, item: string) => {
        const senderInventory = this.ecs.getComponent(sender, 'inventory') as Inventory
        const recipientInventory = this.ecs.getComponent(recipient, 'inventory') as Inventory

        // Remove item from the sender
        const index = senderInventory.items.indexOf(item)
        senderInventory.items.splice(index, 1)

        // Add item to the recipient
        recipientInventory.items.push(item)
    }

    // Utility functions
}
