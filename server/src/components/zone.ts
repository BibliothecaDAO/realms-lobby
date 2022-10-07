// zone - A dungeon a player can explore
// Each dungeon is procedurally generated via a seed and outputs a graph

import { IComponent } from '../engine/registry'

export class Zone implements IComponent {
    public type = 'zone'

    public width: number
    public height: number
    // TODO - Write interface for graph so we can validate them
    public graph

    constructor(width: number, height: number, graph) {
        if (!graph) {
            throw new Error(`graph is required for this ${this.type} component`)
        }
        this.width = width
        this.height = height
        this.graph = graph
    }
}
