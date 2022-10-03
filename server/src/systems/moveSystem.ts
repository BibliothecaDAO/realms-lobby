// moveSystem.ts - Move things (e.g. characters) around the map
// Client sends potential moves, server validates them and responds w/ a validMove
// Client can send moveRequests to the server which will then send back a validMove event.

import EventEmitter from 'events'
import { ISystem, Registry } from '../engine/registry'

// Components
import { Transform } from '../components/transform'
import { Velocity } from '../components/velocity'

export class MoveSystem implements ISystem {
    private events: EventEmitter
    private ecs: Registry

    constructor(events: EventEmitter, ecs: Registry) {
        this.events = events
        this.ecs = ecs

        // Event responders
    }

    update = () => {
    }

    // Utility functions
    // Process a move for a player after pathfinding toward the destination
    moveEntity = (entity: string, transform: Transform, path) => {
        // TODO - Make sure we don't move off the map
        const prevX = transform.x
        const prevY = transform.y

        if (path) {
            // Move to the first step of the path
            transform.x = path[1].x
            transform.y = path[1].y

            // Let the pathfinding system know where we're moving from and where we're moving to
            this.events.emit('validMove', entity, transform.x, transform.y)
            this.events.emit('updateColliders', entity, prevX, prevY, transform.x, transform.y)
        }

        // We moved so reset our move timer (ticksRemaining)
        const velocity = this.ecs.getComponent(entity, 'velocity') as Velocity
        velocity.ticksRemaining = velocity.delay
    }
}
