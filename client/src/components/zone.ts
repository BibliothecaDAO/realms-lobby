// zone - A 2D array representing walls/floor
// this would have been called 'Map' but that is taken by a native js structure

import { IComponent } from '../engine/registry'

export class Zone implements IComponent {
    public type = 'zone'

    public width: number
    public height: number
    public tileMap

    constructor(width: number, height: number, tileMap?) {
        this.width = width
        this.height = height
        this.tileMap = tileMap
    }
}
