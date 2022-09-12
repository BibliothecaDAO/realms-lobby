// mapSystem.ts - Reads in a zone file and creates a tilemap and pathing info based on said data (e.g. to be used in moveSystem)

import { ISystem, Registry } from '../engine/registry'

import { js as Finder } from 'easystarjs' // https://github.com/prettymuchbryce/easystarjs

// Components
import { Zone } from '../components/zone'
import { Transform } from '../components/transform'

export class MapSystem implements ISystem {
    private events: Phaser.Events.EventEmitter
    private ecs: Registry
    private scene: Phaser.Scene

    private finder: Finder

    constructor(events: Phaser.Events.EventEmitter, ecs: Registry, scene: Phaser.Scene, finder: Finder) {
        this.events = events
        this.ecs = ecs
        this.scene = scene

        this.finder = finder

        // HACK - manually create a map entity
        // const map = new Map(30, 30) // HACK - Reduced map size for perf reasons. Need to figure out how to efficently handle larger maps.
        const zone = new Zone(100, 50)
    
        // Create the entity and add our map to it
        const entity = this.ecs.createEntity()
        this.ecs.addComponent(entity, zone)

        // Listen for events
        // When anything with a collider spawns, update pathfinding so entities can't move to that spot
        this.events.on('spawnZone', this.setupMap)
        this.events.on('spawnSuccess', this.placeStaticColliders)

        // When something moves, update pathfinding so entities can't move to that spot
        this.events.on('move', this.placeDynamicColliders)
    }

    update = () => {
        //  Regular updates go here
    }

    // Event functions
    // Received a map component, setup tilemap and pathing
    setupMap = (entity: string, zone: Zone) => {
        // Setup graphical tileset so we can render the map
        this.setupTileset(zone)

        // Add tiles to A*Star pathfinding system
        this.setupPathing(zone)
    }

    // Place a blocker in pathfinding for any static objects (no velocity / cannot move)
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
    // Create a tileset/tilemap so we can display the map in Phaser
    setupTileset = (zone: Zone) => {
        // setup tilemap
        const tileSize = 16
        const tilemap = this.scene.make.tilemap({
            data: zone.tiles,
            tileWidth: tileSize,
            tileHeight: tileSize
        })

        const tileSet = tilemap.addTilesetImage('tilemap')

        // TODO - Look into cheaper ways to create this tilemap
        tilemap.createLayer(0, tileSet, 0, 0).randomize(0, 0, tilemap.width, tilemap.height, [0, 1, 2, 3, 4, 5])
        zone.tileMap = tilemap
    }

    // Pathfinding algorithm
    // Sets up an A* path through the map so we can calculate player moves
    // Uses easystar pathing library: https://github.com/prettymuchbryce/easystarjs
    // width: width of tilemap
    // height: height of tilemap
    setupPathing = (zone: Zone) => {
        this.finder.setGrid(zone.tiles) // Submit a 2d grid of tiles with id's to consider
        this.finder.setAcceptableTiles([0,1]) // The ID's of tiles that can be walked (not walls)
    }
}
