// destination - This entity is trying to move somewhere

import { IComponent } from '../engine/registry'

export class Destination implements IComponent {
    public type = 'destination'

    public x: number
    public y: number

    // Most values will likely be null as objects won't have an innate direction
    constructor(x: number, y: number) {
        this.x = x
        this.y = y
    }
}
