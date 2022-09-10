// destinationSystem.ts - Manages a destination where an entity wants to go

import EventEmitter from 'events'
import { ISystem, Registry } from '../engine/registry'

// Components
import { Destination } from '../components/destination'
import { Transform } from '../components/transform'

export class DestinationSystem implements ISystem {
    private events: EventEmitter
    private ecs: Registry

    constructor(events: EventEmitter, ecs: Registry) {
        this.events = events
        this.ecs = ecs

        // Listen for events
        // Move the character to anohter position on the map
        this.events.on('setDestination', this.setDestination)
    }

    update = () => {
        // Remove destination components from any object that reached its destination
        const listOfDestinationEntities = this.ecs.getEntitiesByComponentType('destination')

        if (listOfDestinationEntities) {
            for (let i = 0; i < listOfDestinationEntities.length; i++) {
                const transform = this.ecs.getComponent(listOfDestinationEntities[i], 'transform') as Transform
                const destination = this.ecs.getComponent(listOfDestinationEntities[i], 'destination') as Destination

                // Check if we've reached our destination
                if (transform.x == destination.x && transform.y == destination.y) {
                    this.ecs.removeComponent(listOfDestinationEntities[i], destination)
                }
            }
        }
    }

    // Event responders
    // Receive a destination point the client wants to move to
    setDestination = (entity, x, y) => {
        // TODO: Make sure the destination is valid (noone there)

        let destination = this.ecs.getComponent(entity, 'destination') as Destination
        const transform = this.ecs.getComponent(entity, 'transform') as Transform

        // If entity already has a destination, update it (This will happen when a player tries to move despite already moving)
        if (destination) {
            destination.x = x
            destination.y = y
        } else {
            // Otherwise add a new destination component
            destination = new Destination(x, y)
            this.ecs.addComponent(entity, destination)
        }
    }

    // Utility functions
}
