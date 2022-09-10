// collider - This entity should collide with other objects (e.g. other entities can't walk where it's placed)

import { IComponent } from '../engine/registry'

export class Collider implements IComponent {
    public type = 'collider'
}
