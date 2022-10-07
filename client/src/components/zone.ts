// zone - A 2D array representing walls/floor
// this would have been called 'Map' but that is taken by a native js structure

import { IComponent } from '../engine/registry'

export class Zone implements IComponent {
    public type = 'zone'

    public width: number
    public height: number
    // TODO - Write interface for graph so we can validate them
    public graph

    constructor(width: number, height: number, graph) {
        this.width = width
        this.height = height
        this.graph = graph
    }
}
