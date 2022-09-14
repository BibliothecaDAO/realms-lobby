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
console.log(zone)
        const mapData = Phaser.Tilemaps.Parsers.Tiled.ParseJSONTiled('tiledMap', zone.tileMap, false)
        const tileMap = new Phaser.Tilemaps.Tilemap(this.scene, mapData)
        const tileSet = tileMap.addTilesetImage('lobby-tileset', 'lobby-tileset', tileSize, tileSize, 0, 0)
        tileMap.createLayer(0, tileSet, 0, 0)

        zone.tileMap = tileMap
        
    }

    // Pathfinding algorithm
    // Sets up an A* path through the map so we can calculate player moves
    // Uses easystar pathing library: https://github.com/prettymuchbryce/easystarjs
    // width: width of tilemap
    // height: height of tilemap
    setupPathing = (zone: Zone) => {    
        const map = this.generate2DArrayFromTiled(zone.tileMap)
        this.finder.setGrid(map) // Submit a 2d grid of tiles with id's to consider
        this.finder.setAcceptableTiles([0,12, 24, 30, 42, 48, 49, 50, 51, 52, 53, 60, 61, 62]) // The ID's of tiles that can be walked (not walls)
    }

    generate2DArrayFromTiled = (tileMap): Array<Array<number>> => {
        console.log(tileMap)
        const map = []
        for (let y = 0; y < tileMap.height; y++) {
            const row = []
            for (let x = 0; x < tileMap.width; x++) {
                // If the tile is not walkable, add it to the pathfinding grid
                row.push(tileMap.layers[0].data[y][x].index)
            }
            map.push(row)
        }
        // console.log(map)
        return (map)
    }
}
