// Node - a single node in the graph (which is connected by edges)
// Nodes have a unique identifier and can be clicked on to move to the next node

import { GameObjects } from 'phaser'
import { ISystem, Registry } from '../../engine/registry'
import { COLORS } from '../../config'

// Components
import { Zone } from '../../components/zone'

export class RenderNodeSystem implements ISystem{
    private ecs: Registry
    private events: Phaser.Events.EventEmitter
    private scene: Phaser.Scene

    private selectedNode: number = 0
    private selectedCircle: GameObjects.Arc

    // 'global' values from graph system
    private graphEntity: string
    private container: GameObjects.Container

    constructor(events: Phaser.Events.EventEmitter, ecs: Registry, scene: Phaser.Scene) {
        this.events = events
        this.ecs = ecs
        this.scene = scene

        // Event Handlers
        // We received a graph from the server, parse it and calculate ndoes
        this.events.on('spawnZone', this.setupGraph)
        this.events.on('createNode', this.drawNode)
        this.events.on('selectNode', this.drawSelectedNode)
    }
    
    update = () => {
    }

    // Store the entity for our graph so we can pull it down when needed
    setupGraph = (entity: string, component: Zone) => {
        this.graphEntity = entity
    }

    drawNode = (index: number, x: number, y: number, container: Phaser.GameObjects.Container) => {
        // Save our container for future use
        if (!this.container) {
            this.container = container
        }
        // Draw the circular background
        const circle = this.scene.add.circle(x, y, 30, COLORS.primary.hex)
        container.add(circle)

        // Draw the node number
        const text = this.scene.add.text(x, y, index.toString(), { color: 'white' })
            .setOrigin(0.5)
            .setFontSize(20)
        container.add(text)
        
        // TODO - Make sure this renders correctly
    }

    drawSelectedNode = (index: number) => {
        console.log('got here')
        if (this.selectedNode != index) {
            // Remove old selection
            this.selectedCircle.destroy()

            // Create new selection
            // Draw the a circle around the currently selected node
            this.selectedCircle = this.scene.add.circle(0, 0, 36, 0x000000, 0)
                .setStrokeStyle(2, COLORS.primary.hex, 1) // To draw a circle w/o fill, we set fill alpha to 0 and add a stroke
            this.container.add(this.selectedCircle)

            // Node selector should pulse to indicate it's selected
            this.scene.tweens.add({
                targets: this.selectedCircle,
                alpha: { value: 0.3, duration: 600 },
                ease: 'Sine.easeInOut',
                // delay: 50,
                yoyo: true,
                loop: -1,
            });
        }
        
        // if index = us,
    }
}