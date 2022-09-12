// floatingText - Pops up a little floating text whenever an event happens

import { GameObjects } from 'phaser'
import { Sprite } from '../components/sprite'
import { Registry } from '../engine/registry'

export type transfer = {
    type: string
    sender: string
    recipient: string
}

export class FloatingTextUI {
    private ecs: Registry
    private events: Phaser.Events.EventEmitter
    private scene: Phaser.Scene

    private spawnQueue: Map<string, transfer> = new Map()

    constructor(ecs: Registry, events: Phaser.Events.EventEmitter, scene: Phaser.Scene) {
        this.ecs = ecs
        this.events = events
        this.scene = scene

        // Listen to events that trigger floating text

        // Player chops a tree -> enqueue and wait for spawn
        this.events.on('transferItem', this.transferItem)

        // Listen for queued items to spawn and fire an animation when they're ready
        // We need this because the server doesn't always fire events sequentially (e.g. havest->spawn->transfer sometimes we get harvest->transfer->spawn)
        this.events.on('spawnSuccess', this.processSpawnQueue)
    }

    // Event listeners
    transferItem = (sender: string, recipient: string, item: string) => {
        if (sender && recipient && item) {
            this.spawnQueue.set(item, { type: 'image', sender: sender, recipient: recipient })
        } else {
            throw new Error('Failed to receive all expected fields')
        }
    }

    processSpawnQueue = (entity: string) => {
        const transfer = this.spawnQueue.get(entity)
        if (transfer) {
            // Delete the item from the queue so we don't double-register
            this.spawnQueue.delete(entity)

            const item = entity // Assign entity to item for readibility

            // Grab the sprite of the entity where this should spawn
            const targetSprite = this.ecs.getComponent(transfer.recipient, 'sprite') as Sprite

            // TODO - Account for world x/y
            const x = targetSprite.sprite.x
            const y = targetSprite.sprite.y - 45
            const floatDestination = y - 50

            const itemSprite = this.ecs.getComponent(item, 'sprite') as Sprite

            // const floater = targetSprite.sprite.scene.add.text(x, y, `+1 ${item}`, { color: '#FFFF00', fontSize: 'x-large' })
            const floater = targetSprite.sprite.scene.add.sprite(x, y, itemSprite.filename)

            targetSprite.sprite.scene.tweens.add({
                targets: floater,
                y: floatDestination,
                ease: 'Quad.easeOut',
                delay: 100,
                // TODO - figure out why our alpha isn't going to zero
                // Fade out the text object on completion
                onComplete: () => {
                    targetSprite.sprite.scene.tweens.add({
                        targets: floater,
                        alpha: 0,
                        ease: 'Quad.easeOut',
                        duration: 100,
                        // Destroy our object on completion
                        onComplete: () => {
                            floater.destroy()
                        }
                    })
                }
            })
        }
    }
}
