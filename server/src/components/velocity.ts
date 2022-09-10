// velocity - This entity can move

import { IComponent } from '../engine/registry'

export class Velocity implements IComponent {
    public type = 'velocity'

    public delay: number // How many frames should we wait between each move
    public dirX: number // Right (1) or Left (-1)
    public dirY: number // Right (1) or Left (-1)
    public ticksRemaining = 0 // Internal server data used to determine movement rate

    // Most values will likely be null as objects won't have an innate direction
    constructor(delay?: number, dirX?: number, dirY?: number) {
        this.delay = delay
        this.dirX = dirX
        this.dirY = dirY
    }
}
