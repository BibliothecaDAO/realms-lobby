// world.ts - Listens to events from server and spawns Map and Characters
import { Registry } from './registry'
import { Connection } from './connection'

export class World {
	public ecs: Registry // ECS Registry containing our entities, components, and systems

	public events: Phaser.Events.EventEmitter // Event Emitter where components can listen for changes
	public connection: Connection

	constructor() {
		// Create our event bus to pass data between components
		this.events = new Phaser.Events.EventEmitter()

		// Setup ECS registry
		this.ecs = new Registry()

		// We should only have one world map instance (this might change as we introduce multiple zones)
		this.connection = new Connection(this.events)

		// Setup initial state
		// TODO - Migrate to SpawnSystem so we can dynamically load all objects
		this.events.on('snapshot', (playerId: string, state) => {
			// Populate each entity
			for (const entity of Object.keys(state)) {
				console.log(state[entity])

				this.events.emit('spawn', entity, state[entity])
			}

			// TODO - Dedupe these events
			// Make sure we flag our player's entity (e.g. attach player component)

			this.events.emit('setupPlayer', playerId)
		})
	}

	// Update - called once per 'tick' by Phaser
	update = () => {
		//
	}
}
