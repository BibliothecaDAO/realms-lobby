// status - Enable or Disable an entity

import { IComponent } from '../engine/registry'

export class Enabled implements IComponent {
    public type = 'enabled'

    public active: boolean

    constructor(active: boolean) {
        this.active = active
    }
}
