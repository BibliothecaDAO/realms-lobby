// mapSystem.ts - Reads in a zone file and creates a tilemap and pathing info based on said data (e.g. to be used in moveSystem)

import EventEmitter from 'events'
import { ISystem, Registry } from '../engine/registry'

import { js as Finder } from 'easystarjs' // https://github.com/prettymuchbryce/easystarjs

// Components
import { Zone } from '../components/zone'
import { Transform } from '../components/transform'

export class MapSystem implements ISystem {
    private events: EventEmitter
    private ecs: Registry

    private finder: Finder

    constructor(events: EventEmitter, ecs: Registry, finder: Finder) {
        this.events = events
        this.ecs = ecs

        this.finder = finder

        // HACK - manually create a map entity
        const zone = this.constructMap(100, 50)
        this.finder.setGrid(zone.tiles) // Submit a 2d grid of tiles with id's to consider
        this.finder.setAcceptableTiles([0]) // The ID's of tiles that can be walked (not walls)

        // Create the entity and add our map to it
        const entity = this.ecs.createEntity()
        this.ecs.addComponent(entity, zone)

        // Listen for events
        this.events.on('spawnSuccess', this.placeStaticColliders)
        this.events.on('validMove', this.placeDynamicColliders)
    }

    update = () => {
        //  Regular updates go here
    }

    // Event functions
    // Place a blocker in pathfinding for any static objects (no velocity / cannot move)
    // TODO: Figure out how to place dynamic objects without having them block themselves 🙃
    placeStaticColliders = (entity) => {
        // Make sure this is a static object (velocity means it can move)
        const transform = this.ecs.getComponent(entity, 'transform') as Transform
        if (transform) {
            this.finder.avoidAdditionalPoint(transform.x, transform.y)
        }
    }

    // When an entity moves, update its collider position
    placeDynamicColliders = (entity, prevX, prevY, currentX, currentY) => {
        this.finder.stopAvoidingAdditionalPoint(prevX, prevY)
        this.finder.avoidAdditionalPoint(currentX, currentY)
    }

    // Utility functions
    constructMap = (width, height) => {
        const zone = new Zone(width, height)
        const tiles = []

        for (let y = 0; y < height; y++) {
            const col = []
            for (let x = 0; x < width; x++) {
                col.push(0) // Push a '1' because the tile should be acceptable
            }
            tiles.push(col)
        }

        zone.tiles = tiles

        return zone
    }
}
