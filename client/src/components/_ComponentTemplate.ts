// template - Fake component template for making new components

import { IComponent } from '../engine/registry'

export class Template implements IComponent {
    public type = 'template'

    public x: integer

    constructor(x: integer) {
        this.x = x
    }
}
