// graphscene.ts - Displays a graph that adventurers can explore

import { Registry } from '../engine/registry'
import { World } from '../engine/world'

// Initialize sub-scenes

// Initialize systems
import { GraphSystem } from '../systems/graphSystem/graphSystem'
import { SpawnSystem } from '../systems/spawnSystem'

import { ActionQueueSystem } from '../systems/actionQueueSystem'
import { RenderNodeSystem } from '../systems/graphSystem/renderNodeSystem'
import { RenderEdgeSystem } from '../systems/graphSystem/renderEdgeSystem'
import { RenderDepthSystem } from '../systems/graphSystem/debug/renderDepthSystem'

// UI Systems
import { ActionUI } from '../systems/graphSystem/debug/ui/ActionUI'

// Components

export class DebugScene extends Phaser.Scene {
	public static Name = 'debug-scene'

	// Event bus
	public events: Phaser.Events.EventEmitter

	// ECS system to initialize entities and systems
	public ecs: Registry

	// World to store our connection (so it persists between scenes)
	public world: World

	constructor() {
		super(DebugScene.Name)
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

		// Initialize Game Rendering systems
		this.ecs.addSystem(new ActionQueueSystem(this.events, this.ecs))
		this.ecs.addSystem(new RenderNodeSystem(this.events, this.ecs, this))
		this.ecs.addSystem(new RenderEdgeSystem(this.events, this.ecs, this))
		this.ecs.addSystem(new RenderDepthSystem(this.events, this.ecs, this))

		// Initialize Game Logic systems
		this.ecs.addSystem(new GraphSystem(this.events, this.ecs, this))
		this.ecs.addSystem(new SpawnSystem(this.events, this.ecs, this))

		// Initialize UI systems (HACK - Consider migrating this to its own component)
		this.ecs.addSystem(new ActionUI(this.events, this.ecs, this))

		// Running this up front because the camera can scroll before setPollAlways has been called (Resulting in improper values)
		this.input.setPollAlways() // The cursor should poll for new positions while the camera is moving

		// We've loaded all our systems and event handlers so request data from server
		this.events.emit('requestSnapshot')
	}

	update(): void {
		// Run through our systems and run each update function
		this.ecs.update()
	}
}
