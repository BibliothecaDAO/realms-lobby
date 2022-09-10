// template - Fake component template for making new components

import { IComponent } from '../engine/registry'

export class Transform implements IComponent {
    public type = 'transform'

    public x: number
    public y: number

    constructor(x: number, y: number) {
        this.x = x
        this.y = y
    }
}
