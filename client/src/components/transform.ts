// template - Fake component template for making new components

import { IComponent } from '../engine/registry'

export class Transform implements IComponent {
    public type = 'transform'

    public x: integer
    public y: integer

    constructor(x: integer, y: integer) {
        this.x = x
        this.y = y
    }
}
