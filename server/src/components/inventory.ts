// inventory - Allows an entity to hold inventory (a set of items)

import { IComponent } from '../engine/registry'

export class Inventory implements IComponent {
    public type = 'inventory'

    public items: string[] = []

    // TODO - Hotkey to bring up/displayinventory
    constructor(items?: Array<string>) {
        this.items = items ? items : []
    }
}
