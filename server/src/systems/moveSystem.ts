// moveSystem.ts - Move things (e.g. characters) around the map
// Client sends potential moves, server validates them and responds w/ a validMove
// Client can send moveRequests to the server which will then send back a validMove event.

import EventEmitter from 'events'
import { ISystem, Registry } from '../engine/registry'

import { js as Finder } from 'easystarjs' // https://github.com/prettymuchbryce/easystarjs

// Components
import { Transform } from '../components/transform'
import { Destination } from '../components/destination'
import { Velocity } from '../components/velocity'

export class MoveSystem implements ISystem {
    private events: EventEmitter
    private ecs: Registry

    private finder: Finder

    constructor(events: EventEmitter, ecs: Registry, finder: Finder) {
        this.events = events
        this.ecs = ecs

        this.finder = finder

        // Event responders
    }

    update = () => {
        // Check which entities have a destination
        const listOfDestinationEntities = this.ecs.getEntitiesByComponentType('destination')

        // process destinations then move each entity
        if (listOfDestinationEntities) {
            // Run through each entity with a destination
            for (let i = 0; i < listOfDestinationEntities.length; i++) {
                const entity = listOfDestinationEntities[i]

                const velocity = this.ecs.getComponent(entity, 'velocity') as Velocity

                // Delay based on our move speed
                if (velocity.ticksRemaining == 0) {
                    // Get current position
                    const transform = this.ecs.getComponent(entity, 'transform') as Transform
                    const destination = this.ecs.getComponent(entity, 'destination') as Destination

                    // Generate a new A* path for this frame (in case anyone moved between this frame and last)
                    this.checkPath(entity, transform, destination)
                    // this.moveEntity will be called as a callback once checkPath completes
                } else {
                    // Skip this frame - wait until move cooldown has completed
                    velocity.ticksRemaining--
                }
            }
        }
    }

    // Utility functions

    // Checks whehter a path from (x1, y1) to (x2, y2) is valid
    public checkPath = (entity, transform: Transform, destination: Destination) => {
        this.finder.findPath(transform.x, transform.y, destination.x, destination.y, (path) => {
            this.moveEntity(entity, transform, path)
        })

        this.finder.calculate()
    }

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
