// MoveMode - Component that triggers pathfinding
// This component will be placed on an entity when 'move mode' is activated.
// The MoveModeSystem will search for any entities in 'move mode' and run pathfinding for them

import { IComponent } from '../engine/registry'
import { GameObjects } from 'phaser'

export class MoveMode implements IComponent {
    public type = 'movemode'

    // Line representing our path
    public line: GameObjects.Arc[]

    // Cache last known x/y
    public lastX: integer
    public lastY: integer
}
