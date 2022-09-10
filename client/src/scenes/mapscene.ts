// mapscene.ts - Renders the current map so the player can explore it.

import { Registry } from '../engine/registry'
import { js as Finder } from 'easystarjs' // https://github.com/prettymuchbryce/easystarjs

import { GameUIScene } from './uiscene'
import { GRID_SIZE, WORLD_SIZE } from '../config'

// Initialize systems
import { FollowMouseSystem } from '../systems/followMouseSystem'
import { RenderSystem } from '../systems/renderSystem'
import { MoveSystem } from '../systems/moveSystem'
import { MoveModeSystem } from '../systems/moveModeSystem'
import { SpawnSystem } from '../systems/spawnSystem'
import { MapSystem } from '../systems/mapSystem'
import { InventorySystem } from '../systems/inventorySystem'

// Components
import { Player } from '../components/player'
import { Sprite } from '../components/sprite'
import { Zone } from '../components/zone'


export class MapScene extends Phaser.Scene {
    public static Name = 'map-scene'

    // Event bus
    public events: Phaser.Events.EventEmitter

    // ECS system to initialize entities and systems
    public ecs: Registry

    constructor() {
        super(MapScene.Name)
    }

    preload(): void {
        // Load necessary files for this map
    }

    create(data): void {
        // Pull in world map
        // this.map = data.map
        this.ecs = data.ecs
        this.events = data.events

        // Initialize subscenes
        this.scene.add(GameUIScene.Name, GameUIScene, false, { events: this.events, ecs: this.ecs })

        // HACK - Initialize a*star pathing
        const finder = new Finder()

        // Initialize systems
        this.ecs.addSystem(new MoveSystem(this.events, this.ecs))
        this.ecs.addSystem(new MoveModeSystem(this.events, this.ecs, this, finder))
        this.ecs.addSystem(new MapSystem(this.events, this.ecs, this, finder))
        this.ecs.addSystem(new FollowMouseSystem(this.events, this.ecs, this)) // Create map cursor
        this.ecs.addSystem(new RenderSystem(this.events, this.ecs)) // Update any transforms that moved this turn
        this.ecs.addSystem(new SpawnSystem(this.events, this.ecs, this))
        this.ecs.addSystem(new InventorySystem(this.events, this.ecs))

        // Running this up front because the camera can scroll before setPollAlways has been called (Resulting in improper values)
        this.input.setPollAlways() // The cursor should poll for new positions while the camera is moving

        // Monitor for events
        this.events.on('setupPlayer', this.initPlayer) // Add our player to the game (e.g. attach input components)

        // Request snapshot from server (to populate above events)
        // If we try to load data from server earlier, it won't be ready when the scene is loaded
        this.events.emit('requestSnapshot')

        // Enable UI Scene
        this.scene.launch(GameUIScene.Name)
    }

    update(): void {
        // Run through our systems and run each update function
        this.ecs.update()
    }

    initPlayer = (entity: string) => {
        // Select our character from those available
        const player = new Player()

        // HACK - We currently get the player component from the server (which feels wrong longterm)
        this.ecs.addComponent(entity, player)

        // Clamp camera to player now that player is setup
        this.initCamera(entity)
    }

    initCamera = (entity) => {
        // Set bounds of world to the same size as our tilemap.
        const mapEntities = this.ecs.getEntitiesByComponentType('zone')
        const map = this.ecs.getComponent(mapEntities[0], 'zone') as Zone

        // This allows us to call world coordinates (e.g. via mouse pointer)
        this.physics.world.setBounds(0, 0, map.width * GRID_SIZE, map.height * GRID_SIZE)

        // Setup camera to follow player around
        this.cameras.main.setBounds(0, 0, map.width * GRID_SIZE, map.height * GRID_SIZE)

        const sprite = this.ecs.getComponent(entity, 'sprite') as Sprite
        this.cameras.main.startFollow(sprite.sprite, false, 0.01, 0.01)
    }
}
