// zone - A 2D array representing walls/floor
// this would have been called 'Map' but that is taken by a native js structure

import { IComponent } from '../engine/registry'

// Named this class
export class Zone implements IComponent {
    public type = 'zone'

    public width: number
    public height: number
    public tiles: Array<Array<number>>

    constructor(width: number, height: number, tiles?: Array<Array<number>>) {
        this.width = width
        this.height = height
        this.tiles = tiles
    }
}
