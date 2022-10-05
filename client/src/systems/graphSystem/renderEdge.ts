/*// Node - a single node in the graph (which is connected by edges)
// Nodes have a unique identifier and can be clicked on to move to the next node

import { GameObjects } from 'phaser'
import { ISystem, Registry } from '../../engine/registry'
import { COLORS } from '../../config'
import { Edge} from './edge'

export class RenderEdgeSystem implements ISystem{
    private ecs: Registry
    private events: Phaser.Events.EventEmitter
    private scene: Phaser.Scene

    private src: number
    private dst: number

    private text: GameObjects.Text

    constructor(events: Phaser.Events.EventEmitter, ecs: Registry, scene: Phaser.Scene) {
        this.events = events
        this.ecs = ecs
        this.scene = scene

        // Event Handlers
        // We received a graph from the server, parse it and calculate ndoes
        this.events.on('createEdge', this.drawEdge)
    }
    
    update = () => {
    }

    drawEdge = (srcId: number, dstId: number, container: Phaser.GameObjects.Container) => {
        const srcEdge = this.ecs.getComponent(srcId, 'edge') as Edge
        // Get the source and destination nodes for this edge
        // const src = this.ecs.getComponent(srcId, 'node') as Node
            // const src = graph.edges[i].src_identifier
            // const dst = graph.edges[i].dst_identifier

            // TODO separate logic (node #'s) from x,y, etc
             
            // get the text object so we can determine its location
            const srcNode = this.nodeTexts[src]
            const dstNode = this.nodeTexts[dst]

            // Draw our line
            const graphics = this.scene.add.graphics()
            graphics.lineStyle(2, 0xFFFFFF)
            const tmp = graphics.lineBetween(srcNode.x, srcNode.y, dstNode.x, dstNode.y)
            this.container.add(tmp).sendToBack(tmp) // Containers ignore setDepth so instead we send this object to the back of the queue
    }

    selectNode = (index: number) => {
        // TODO - implement logic to draw selected node graphics (or deselect if another node is selected)
        // if index = us,
    }
}*/