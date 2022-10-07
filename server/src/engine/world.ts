// world.ts - keeps track of players,

import { randomUUID } from 'crypto'
import EventEmitter from 'events'

import { LoadData } from './loadData'
import { TICK_RATE } from '../config'
import { Registry } from './registry'

export class World {
	public id: string

	private events: EventEmitter
	private ecs: Registry

	private loadData: LoadData

	// Setup zones when we start the server
	constructor(ecs: Registry, events: EventEmitter, loadData: LoadData) {
		this.id = randomUUID()

		this.events = events
		this.ecs = ecs

		// Load our templates (Async - will fire an event once they're loaded)
		this.loadData = loadData

		// Start game loop
		setInterval(this.update, TICK_RATE)

		// Template data is loaded, start up zones
		this.events.on('templatesLoaded', () => {
			// const zone = 'defaultZone'
			const zone = 'placeholderZone'
			this.loadData.loadZone(zone)
		})

		// Handle new player connections
		this.events.on('connect', this.addPlayer)

		// Handle client requesting snapshot
		this.events.on('requestSnapshot', (playerId) => {
			// send down initial state (we'll send deltas from here on out)
			this.events.emit('snapshot', playerId, this.getState())
		})

		// Handle clients disconnecting
		this.events.on('disconnect', (playerId) => {
			this.removePlayer(playerId)
		})
	}

	// Create a new player and add it to our list of players
	addPlayer = (entity: string) => {
		// Hardcode spawn values for now
		// this.loadData.loadEntity('characters/bard', entity)
		this.loadData.loadEntity('characters/knight', entity)
	}

	// Remove a player that times out
	removePlayer = (entity) => {
		// Remove player instance
		this.ecs.destroyEntity(entity)
	}

	// Grab the latest state and send it down to client
	getState = () => {
		return this.ecs.getState()
	}

	update = () => {
		// Update each system
		this.ecs.update()
	}
}
