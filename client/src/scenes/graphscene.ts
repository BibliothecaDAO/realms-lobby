// graphscene.ts - Displays a graph that adventurers can explore

import { Registry } from '../engine/registry'
import { World } from '../engine/world'

// Initialize sub-scenes
import { GameUIScene } from './uiscene'

// Initialize systems
import { GraphSystem } from '../systems/graphSystem/graphSystem'
import { SpawnSystem } from '../systems/spawnSystem'
import { RenderNodeSystem } from '../systems/graphSystem/renderNode'
import { RenderEdgeSystem } from '../systems/graphSystem/renderEdge'

// Components

export class GraphScene extends Phaser.Scene {
    public static Name = 'graph-scene'

    // Event bus
    public events: Phaser.Events.EventEmitter

    // ECS system to initialize entities and systems
    public ecs: Registry

    // World to store our connection (so it persists between scenes)
    public world: World

    constructor() {
        super(GraphScene.Name)
    }

    preload(): void {
        // Load necessary files for this map
    }

    create(data): void {
        // initialize engine
        this.ecs = data.ecs
        this.events = data.events
        this.world = data.world

        // Setup 

        // Initialize subscenes
        this.scene.add(GameUIScene.Name, GameUIScene, false, { events: this.events, ecs: this.ecs })

        // Initialize Game Logic systems
        this.ecs.addSystem(new GraphSystem(this.events, this.ecs, this))
        this.ecs.addSystem(new SpawnSystem(this.events, this.ecs, this))
   
        // Initialize Game Rendering systems
        this.ecs.addSystem(new RenderNodeSystem(this.events, this.ecs, this))
        this.ecs.addSystem(new RenderEdgeSystem(this.events, this.ecs, this))


        // this.ecs.addSystem(new RenderNodeSystem(this.events, this.ecs, this))

        // Running this up front because the camera can scroll before setPollAlways has been called (Resulting in improper values)
        this.input.setPollAlways() // The cursor should poll for new positions while the camera is moving

        // Monitor for events

        // Enable UI Scene
        this.scene.launch(GameUIScene.Name)

        // We've loaded all our systems and event handlers so request data from server
        this.events.emit('requestSnapshot')
    }

    update(): void {
        // Run through our systems and run each update function
        this.ecs.update()
    }

}
