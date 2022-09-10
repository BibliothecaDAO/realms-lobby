// inventory - Allows an entity to hold inventory

import { IComponent } from '../engine/registry'

export class Inventory implements IComponent {
    public type = 'inventory'

    public items: string[] = []

    constructor(items: Array<string>) {
        this.items = items
    }
}
