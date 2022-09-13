// mapSystem.ts - Reads in a zone file and creates a tilemap and pathing info based on said data (e.g. to be used in moveSystem)

import { ISystem, Registry } from '../engine/registry'

import { js as Finder } from 'easystarjs' // https://github.com/prettymuchbryce/easystarjs

// Components
import { Zone } from '../components/zone'
import { Transform } from '../components/transform'
import { GRID_SIZE } from '../config'

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
        const tileSize = GRID_SIZE

        console.log(zone.tiles)

        const mapData = Phaser.Tilemaps.Parsers.Tiled.ParseJSONTiled('tiledMap', zone.tiles, false)
        console.log(mapData)
        const layers = Phaser.Tilemaps.Parsers.Tiled.ParseTileLayers(zone.tiles, false)
        console.log(layers)

        // this.scene.make.tilemap({ data: mapData, layers:})
        const tileMap = this.scene.make.tilemap(mapData)
        const tileSet = tileMap.addTilesetImage('lobby-tileset', 'lobby-tileset', tileSize, tileSize, 0, 0)
        
        tileMap.layers = layers
        

        // Generates Error:
        // "Invalid Tilemap Layer ID: layer0"
        // "Valid tilelayer names: []"
        tileMap.createLayer('layer0', tileSet, 0, 0)

        // Generates Error:
        // "Invalid Tilemap Layer ID: Tile Layer 1"
        // "Valid tilelayer names: []"
        console.log(tileMap)
        tileMap.createLayer("Tile Layer 1", tileSet, 0, 0)

        // Generates Error:
        // "Invalid Tilemap Layer ID: 0"
        tileMap.createLayer(0, tileSet, 0, 0)

        // Generates Error:
        // "Invalid Tilemap Layer ID: 1"
        tileMap.createLayer(1, tileSet, 0, 0)


        // const tileset = tileMap.tilesets..addTilesetImage("tuxmon-sample-32px-extruded", "tiles")
        
        zone.tileMap = tileMap
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
