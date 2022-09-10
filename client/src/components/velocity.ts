// velocity - This entity can move

import { IComponent } from '../engine/registry'

export class Velocity implements IComponent {
    public type = 'velocity'

    public speed: number // How fast should an object move
    public dirX: number // Right (1) or Left (-1)
    public dirY: number // Right (1) or Left (-1)

    // Most values will likely be null as objects won't have an innate direction
    constructor(speed?: number, dirX?: number, dirY?: number) {
        this.speed = speed
        this.dirX = dirX
        this.dirY = dirY
    }
}
