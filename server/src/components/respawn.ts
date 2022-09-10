// respawn - This entity should respawn after 'timer' seconds

import { IComponent } from '../engine/registry'

export class Respawn implements IComponent {
    public type = 'respawn'
    public hidden = true // We should hide this from the client
    public template
    public spawnTime // The amount of time to wait when a respawn is triggered

    constructor(template: string, spawnTime: string) {
        this.template = template
        this.spawnTime = spawnTime
    }
}
