// world.ts - Listens to events from server and spawns Map and Characters
import { Registry } from './registry'
import { ActionQueue } from './actionQueue'
import { Connection } from './connection'

export class World {
	public ecs: Registry // ECS Registry containing our entities, components, and systems

	public actions: ActionQueue // Queue of actions to run in sequence (e.g. move here then attack then get an item)
	public events: Phaser.Events.EventEmitter // Event Emitter where components can listen for changes
	public connection: Connection

	constructor() {
		// Create our event bus to pass data between components
		this.events = new Phaser.Events.EventEmitter()

		// Setup ECS registry
		this.ecs = new Registry()

		// Setup action queue so player can execute actions in sequence
		this.actions = new ActionQueue()

		// We should only have one world map instance (this might change as we introduce multiple zones)
		this.connection = new Connection(this.events)

		// Setup initial state
		// TODO - Migrate to SpawnSystem so we can dynamically load all objects
		this.events.on('snapshot', (playerId: string, state) => {
			// Spawn all entities into the world
			for (const entity of Object.keys(state)) {
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
