// respawnTimer - This entity counts down until it hits zero and then it deletes itself (and respawns the entity)

import { IComponent } from '../engine/registry'

export class RespawnTimer implements IComponent {
    public type = 'respawnTimer'
    public timer // Iterator which counts down until it hits zero (then it spawns)
    public hidden = true // Don't share how long until this cools down

    constructor(timer: number) {
        this.timer = timer
    }
}
