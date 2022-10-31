// connections.ts - Handles player connects and disconnects

// Engine
import EventEmitter from 'events'

// Libraries
import { randomUUID } from 'crypto'
import { Server as Socket } from 'socket.io'
import * as dotenv from 'dotenv'

export class Connections {
	private users: Record<string, Socket> // Allow socket id lookups by uid
	private sockets: Record<string, string> // Allow uid lookups by socket id

	// Keep track of connection info
	public io: Socket
	private events: EventEmitter

	constructor(events: EventEmitter) {
		this.events = events

		this.users = {} // Allow player/socket lookups by uid
		this.sockets = {} // Allow uid lookups by socket

		// Load environment variables
		dotenv.config()

		// Start the server
		this.io = new Socket(parseInt(process.env.WS_PORT), {
			cors: {
				origin: `${process.env.WS_CORS}`,
				credentials: true, // Pass the required CORS Access-Control-Allow-Credentials header so browser doesn't complain
			},
		})

		console.log(`💻 Starting Server on port ${parseInt(process.env.WS_PORT)}`)

		this.setupExternalEvents()

		this.setupInternalEvents()
	}

	private setupExternalEvents = () => {
		// Listen for external events
		this.io.on('connect', (socket) => {
			// Generate a uuid for this player's character
			const playerId = randomUUID()

			this.users[playerId] = socket as unknown as Socket // HACK to assign sockets
			this.sockets[socket.id] = playerId // Keep track of socket id so we can look up by it

			this.events.emit('connect', playerId) // Braodcast to systems: New player has connected

			// Handle client requesting a snapshot of state
			socket.on('requestSnapshot', () => {
				this.events.emit('setupPlayer', playerId)
			})

			// Client is trying to move
			socket.on('moveAttempt', (node: number) => {
				const playerId = this.sockets[socket.id]
				this.events.emit('moveAttempt', playerId, node)
			})

			// Clear the character array when our player disconnects
			socket.on('disconnect', () => {
				const playerId = this.sockets[socket.id]
				this.events.emit('despawnAttempt', playerId)
				// TODO: Remove all the event listeners
			})
		})
	}

	private setupInternalEvents = () => {
		// Listen for internal events
		this.events.on('setupPlayer', (id, charClass, x, y) => {
			const socket = this.getSocketByUid(id)
			// Only send 'setup' to the player who connectedted
			socket.emit('setupPlayer', id, charClass, x, y)
			// Tell every other player to spawn this player as a 3rd party
			// socket.broadcast('newPlayer', id, charClass, x, y) // HACK - We should switch to broadcast asap
			socket.emit('newPlayer', id, charClass, x, y)
		})

		// Clients: Spawn a new entity (e.g. player) into the scene
		this.events.on('spawnSuccess', (entity, components) => {
			this.io.emit('spawnSuccess', entity, components)
		})

		// Clients: Despawn a new entity (e.g. player) into the scene
		this.events.on('despawnSuccess', (entity) => {
			this.io.emit('despawnSuccess', entity)
		})

		this.events.on(
			'moveSuccess',
			(entity: string, srcNode: number, dstNode: number) => {
				this.io.emit('moveSuccess', entity, srcNode, dstNode)
			}
		)

		this.events.on('snapshot', (playerId: string, state) => {
			const socket = this.getSocketByUid(playerId)
			// Send a snapshot of state to the client so they load initial entities
			// TODO: use broadcast, not emit (otherwise everyone gets it)
			socket.emit('snapshot', playerId, state)
		})
	}

	public getUidBySocket = (socketId: string) => {
		return this.sockets[socketId]
	}

	public getSocketByUid = (uid: string) => {
		return this.users[uid]
		// return this.io.sockets[this.users[uid]]
	}
}
