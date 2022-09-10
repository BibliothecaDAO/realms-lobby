// sprite - This entity shows up in the scene

import { IComponent } from '../engine/registry'

export class Sprite implements IComponent {
    public type = 'sprite'

    public name: string

    constructor(name: string) {
        this.name = name
    }
}
