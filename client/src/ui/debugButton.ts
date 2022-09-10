// debugButton.ts - Contains ui logic to enable debug mode

import { Button } from './button'
import { GameObjects } from 'phaser'
import { GRID_SIZE } from '../config'

export class DebugButton extends Button {
    private worldEvents: Phaser.Events.EventEmitter

    private debugGrid!: GameObjects.Grid // Display the grid of tiles a player can move between
    private debugCursor!: GameObjects.Text // Displays a small label above the mouse cursor with the current 'grid' position we would pass to the server

    constructor(scene, state, size, data, callback) {
        const xOffset = 125
        super(scene, state, xOffset, 0, size, size, '⋮⋮', null, callback)

        if (data.events) {
            this.worldEvents = data.events
        }
    }

    public toggleDebugGrid = () => {
        // Let other ui systems know the debug menu is availalbe (e.g. debugCursorUI)
        this.worldEvents.emit('toggleDebug')

        if (!this.debugGrid) {
            // Draw our grid - might take a few seconds but we rarely use this (vs slowing down startup every time)
            this.debugGrid = this.scene.add.grid(
                0,
                0,
                this.scene.sys.game.canvas.width * 2,
                this.scene.sys.game.canvas.height * 2,
                GRID_SIZE,
                GRID_SIZE,
                null,
                0,
                0xfffdfd0f,
                100
            )
        } else {
            // Show or hide the grid
            this.debugGrid.active = !this.debugGrid.active
            this.debugGrid.visible = !this.debugGrid.visible
        }
    }
}
