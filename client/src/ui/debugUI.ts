// debugUI - A panel that shows the current game state, events firing, and netowrk requests

import { GameObjects } from 'phaser'
import { IComponent, Registry } from '../engine/registry'

export class DebugUI {
    private ecs: Registry
    private events: Phaser.Events.EventEmitter
    private scene: Phaser.Scene

    // Variables representing our ECS state
    private entityMap: Map<string, IComponent[]> = new Map()
    private active = false

    // UI elements to display our entity data
    private panel
    private entityPanels: GameObjects.Text[] = [] // Create one box for each entity

    constructor(ecs: Registry, events: Phaser.Events.EventEmitter, scene: Phaser.Scene) {
        this.ecs = ecs
        this.events = events
        this.scene = scene

        this.panel = this.scene.add.rectangle(
            (3 * this.scene.cameras.main.width) / 4,
            this.scene.cameras.main.height / 2,
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height,
            0x000000
        ) as Phaser.GameObjects.Rectangle
        this.panel.visible = false

        // Setup keybinds
        this.scene.input.keyboard.on(
            'keydown-BACKTICK',
            () => {
                this.active = !this.active
                this.panel.visible = !this.panel.visible

                // Delete all of the debug gameobjects to get them out of memory
                while (this.entityPanels.length > 0) {
                    this.entityPanels.pop().destroy()
                }
            },
            this
        )
    }

    update = () => {
        if (this.active) {
            // Grab the latest state
            const state = this.ecs.getDebugState()
            this.entityMap = state.entitiesToComponents

            const sceneWidth = this.scene.cameras.main.width
            const sceneHeight = this.scene.cameras.main.height

            // Check if we need any more UI elements (or delete the ones we don't)
            if (this.entityMap.size > this.entityPanels.length) {
                // We need to add some panels
                const numPanels = this.entityMap.size - this.entityPanels.length
                for (let i = 0; i < numPanels; i++) {
                    // const panel = this.scene.add.text(sceneWidth + 20, this.entityPanels.length * 30, '', { color: 'white' })
                    const panel = this.scene.add.text(sceneWidth / 2 + 20, 50 + (this.entityPanels.length + i) * 50, '', { color: '#FFFFFF' })
                    panel.setDepth(5)
                    this.entityPanels.push(panel)
                }
            } else if (this.entityMap.size < this.entityPanels.length) {
                // We need to remove some panels
                for (let i = this.entityPanels.length - 1; i > this.entityMap.size; i--) {
                    this.entityPanels[i].destroy() // Get rid of the last panel
                    this.entityPanels.pop() // Pop the dead panel off
                }
            }

            // Update any elements that have changed
            let iterator = 0

            // tODO - Figure out why this for loop isn't triggering
            this.entityMap.forEach((value: IComponent[], key: string) => {
                this.drawEntity(key, value, iterator)
                iterator++
            })
        }
    }

    drawEntity = (entity, components, iterator) => {
        this.entityPanels[iterator].setText(
            `${entity}: \n${components
                .map((component) => component.type)
                .sort()
                .join(', ')}`
        )
    }
}
