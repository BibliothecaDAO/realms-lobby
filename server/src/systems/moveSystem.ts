// moveSystem.ts - Move things (e.g. characters) around the map
// Client sends potential moves, server validates them and responds w/ a validMove
// Client can send moveRequests to the server which will then send back a validMove event.

import EventEmitter from 'events'
import { ISystem, Registry } from '../engine/registry'

// Components
import { Transform } from '../components/transform'

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
    // Process a move for a player to an adjacent node
    moveEntity = (entity: string, transform: Transform) => {
        // Keep track of current location to calculate if this is a valid move
        const prevTransform = this.ecs.getComponent(entity, 'transform') as Transform    
        const prevNode = prevTransform.node

        if (prevNode) {
            // Calculate valid move
        } else {
            throw new Error(`cannot find curent node for entity ${entity}`)
        }

        // Make sure this is a valid move
        
            // Let the pathfinding system know where we're moving from and where we're moving to
            // this.events.emit('validMove', entity, transform.x, transform.y)
            // this.events.emit('updateColliders', entity, prevX, prevY, transform.x, transform.y)
    }
}
