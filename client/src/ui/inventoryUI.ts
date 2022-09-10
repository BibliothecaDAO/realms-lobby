// inventoryUI - Display any items in our inventory

import { GameObjects } from 'phaser'
import { Inventory } from '../components/inventory'
import { Sprite } from '../components/sprite'
import { Registry } from '../engine/registry'

export class InventoryUI {
    private ecs: Registry
    private events: Phaser.Events.EventEmitter
    private scene: Phaser.Scene

    // Constants for UI placement
    widthMultiplier = 0.75
    heightMultiplier = 1.25
    itemSpacer = 80
    itemsPerRow = 5

    // Inventory UI elements
    inventoryContainer: GameObjects.Container
    inventoryBg: GameObjects.Rectangle
    hoverCursor: GameObjects.Rectangle

    inventoryItems: Array<GameObjects.Sprite> = []

    constructor(ecs: Registry, events: Phaser.Events.EventEmitter, scene: Phaser.Scene) {
        this.ecs = ecs
        this.events = events
        this.scene = scene

        // Event Listeners
        this.events.on('showInventory', this.enableInventoryView)
        this.events.on('hideInventory', this.disableInventoryView)

        // Create and hide inventory UI
        this.inventoryContainer = this.scene.add.container(this.scene.cameras.main.centerX, this.scene.cameras.main.centerY).setVisible(false)

        // Center our container

        this.inventoryBg = this.scene.add.rectangle(
            0, // Anchor to top left corner of container
            0,
            this.scene.cameras.main.centerX * this.widthMultiplier,
            this.scene.cameras.main.centerY * this.heightMultiplier,
            0x000000
        )
        this.inventoryContainer.add(this.inventoryBg)

        // Initialize our hover cursor (for when we hover over an item)
        this.hoverCursor = this.scene.add.rectangle(0, 0, this.itemSpacer, this.itemSpacer, 0xcccccc, 0.5).setVisible(false)
        this.inventoryContainer.add(this.hoverCursor)
    }

    update = () => {
        // Only update ui when inventory is visible to user
        if (this.inventoryContainer.visible) {
            const player = this.ecs.getEntitiesByComponentType('player')[0] // There can only be one player component
            const inventory = this.ecs.getComponent(player, 'inventory') as Inventory

            // See if player has any items in inventory
            if (inventory.items.length != this.inventoryItems.length) {
                // Items changed, update our inventory
                // HACK - In the future we should just add/subtract vs rolling it from scratch
                this.updateInventory(inventory.items)
            }
        }
    }

    // Event Handlers
    enableInventoryView = () => {
        this.inventoryContainer.visible = true
    }

    disableInventoryView = () => {
        this.inventoryContainer.visible = false
    }

    // Utility Functions
    updateInventory = (items) => {
        // Destroy old inventory items
        this.inventoryItems.forEach((sprite: GameObjects.Sprite) => {
            // TODO - get rid of sprite object
            sprite.destroy()
        })

        // Remove references to old inventory items
        this.inventoryItems = []

        const sortedInventory = this.sortSprites(items)

        // Create new inventory items by copying
        for (let i = 0; i < sortedInventory.length; i++) {
            // Pull the original item we want to store in our inventory
            const baseSprite = this.ecs.getComponent(sortedInventory[i], 'sprite') as Sprite

            // Make a copy of the sprite at our new location
            const cloneSprite = this.drawItem(baseSprite, i)

            // Each inventory item should be interactive
            this.enableHover(cloneSprite)

            // Keep track of the item so we can manipulate/destroy it layer
            this.inventoryItems.push(cloneSprite)
            this.inventoryContainer.add(cloneSprite)
        }
    }

    drawItem = (sprite: Sprite, index: number) => {
        // Calculate position in grid
        const row = Math.floor(index / this.itemsPerRow) // Round down to the nearest integer (e.g. index 0->4 = 0, 5->8 = 1)
        const column = index % this.itemsPerRow

        // Calculate distance between origin (Center) and top left corner of panel
        const startX = this.inventoryBg.width / 2
        const startY = this.inventoryBg.height / 2

        // Add it all together
        const x = -startX + this.itemSpacer + sprite.sprite.width * column
        const y = -startY + this.itemSpacer + sprite.sprite.height * row

        // Add the sprite to the scene so we can render it
        const cloneSprite = this.scene.add.sprite(x, y, sprite.filename).setScale(4)

        return cloneSprite
    }

    enableHover = (sprite: GameObjects.Sprite) => {
        sprite.setInteractive()

        // Add tint / cursor when we enter the state
        sprite.on('pointerover', () => {
            this.hoverCursor.setPosition(sprite.x, sprite.y)
            this.scene.input.setDefaultCursor('pointer')
            this.hoverCursor.setVisible(true)
        })

        // Remove tint / cursor when we stop hovering
        sprite.on('pointerout', () => {
            this.scene.input.setDefaultCursor('default')
            this.hoverCursor.setVisible(false)
        })

        // Process a click and try to figure out what action they're taking
        // sprite.on('pointerup', (pointer) => {
        // this.events.emit('harvestAttempt', entity, this.player)
        // })
    }

    sortSprites = (entities: Array<string>) => {
        const sortedList = entities.sort((a, b) => {
            const aSprite = this.ecs.getComponent(a, 'sprite') as Sprite
            const bSprite = this.ecs.getComponent(b, 'sprite') as Sprite

            return aSprite.filename < bSprite.filename ? -1 : 1
        })

        return sortedList
    }
}
