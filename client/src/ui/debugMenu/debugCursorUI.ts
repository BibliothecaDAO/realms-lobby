// debugCursor - Places a small label on the user's cursor (for dev purposes)

import { GameObjects } from 'phaser'
import { Registry } from '../../engine/registry'
import { GRID_SIZE } from '../../config'

export class DebugCursorUI {
    private ecs: Registry
    private events: Phaser.Events.EventEmitter
    private scene: Phaser.Scene

    private debugCursor: GameObjects.Text

    constructor(ecs: Registry, events: Phaser.Events.EventEmitter, scene: Phaser.Scene) {
        this.ecs = ecs
        this.events = events
        this.scene = scene

        // Listen to events that trigger debug

        // Player chops a tree
        this.events.on('toggleDebug', this.toggleCursor)
    }

    // Event listeners
    toggleCursor = () => {
        if (!this.debugCursor) {
            // Same mouse logic as moveModeSystem
            this.debugCursor = this.scene.add.text(-100, -100, '', { color: 'yellow' })
        } else {
            // Show or hide the cursor
            this.debugCursor.active = !this.debugCursor.active
            this.debugCursor.visible = !this.debugCursor.visible
        }
    }

    update = () => {
        if (this.debugCursor && this.debugCursor.active) {
            this.debugCursor.x = this.scene.input.mousePointer.x
            this.debugCursor.y = this.scene.input.mousePointer.y

            const mouseX = Math.floor(Phaser.Math.Snap.To(this.scene.input.mousePointer.worldX, GRID_SIZE) / GRID_SIZE)
            const mouseY = Math.floor(Phaser.Math.Snap.To(this.scene.input.mousePointer.worldY + 30, GRID_SIZE) / GRID_SIZE)
            this.debugCursor.text = `(${mouseX}, ${mouseY})` // Adjusts display position based on
        }
    }
}
