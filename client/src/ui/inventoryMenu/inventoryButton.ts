// inventoryButton.ts - Display an inventory (backpack) so a player can see what they have

import { Button } from '../button'

export class InventoryButton extends Button {
    private worldEvents: Phaser.Events.EventEmitter

    private showInventory = false // State variable to keep track of whether we're showing the inventory or not

    constructor(scene, state, size, data, callback) {
        const xOffset = 24 // Where should we position this relative to its parent container's

        super(scene, state, xOffset, 0, size, size, '👝', null, callback)

        if (data.events) {
            this.worldEvents = data.events
        }
    }

    public toggleInventory = () => {
        this.toggleSelected()

        if (this.showInventory) {
            this.worldEvents.emit('hideInventory')
        } else {
            this.worldEvents.emit('showInventory')
        }

        // Update our state variable for next time it's clicked
        this.showInventory = !this.showInventory
    }
}
