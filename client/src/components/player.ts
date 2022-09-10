// player - Component to indicate that this is the player (e.g. controlling things in this instance)

import { IComponent } from '../engine/registry'

export class Player implements IComponent {
    public type = 'player'
}
