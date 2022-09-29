// graphscene.ts - Displays a graph that adventurers can explore

import { Registry } from '../engine/registry'

import { GameUIScene } from './uiscene'
import { GRID_SIZE } from '../config'

// Initialize systems
import { GraphSystem } from '../systems/graphSystem/graphSystem'

// Components

export class GraphScene extends Phaser.Scene {
    public static Name = 'graph-scene'

    // Event bus
    public events: Phaser.Events.EventEmitter

    // ECS system to initialize entities and systems
    public ecs: Registry

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

        // Initialize subscenes
        // this.scene.add(GameUIScene.Name, GameUIScene, false, { events: this.events, ecs: this.ecs })

        // Initialize systems
        this.ecs.addSystem(new GraphSystem(this.events, this.ecs, this))

        // Running this up front because the camera can scroll before setPollAlways has been called (Resulting in improper values)
        this.input.setPollAlways() // The cursor should poll for new positions while the camera is moving

        // Monitor for events

        // Enable UI Scene
        // this.scene.launch(GameUIScene.Name)
    }

    update(): void {
        // Run through our systems and run each update function
        this.ecs.update()
    }

}
