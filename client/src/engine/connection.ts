// connection.ts - connects and manages connection to server
import { io, Socket } from 'socket.io-client'

// Debug events
import { DEBUG } from '../config'

export class Connection {
    socket: Socket<ServerToClientEvents, ClientToServerEvents>
    events: Phaser.Events.EventEmitter

    constructor(events: Phaser.Events.EventEmitter) {
        this.events = events

        // Connect to the server
        this.socket = io('ws://localhost:3000')

        this.socket.on('connect', () => {
            console.log('💻 connected to server')
            // Any logic to make sure we stay connected goes here
        })

        // DEBUG - Enable this flag in config.ts to see all events in console.log
        if (DEBUG) {
            this.socket.onAny(function (eventName, ...args) {
                console.log(`⬅️ left-a[${eventName}] fired: ${args}`)
            })
        }

        // Server -> Client Events
        // Load initial game state onto client (so we can only update deltas afterwards)
        this.socket.on('snapshot', (playerId, state) => {
            this.events.emit('snapshot', playerId, JSON.parse(state))
        })

        // Tell clients about new entities that connect or spawn
        this.socket.on('spawnSuccess', (entity, components) => {
            this.events.emit('spawn', entity, JSON.parse(components))
        })

        // Tell clients about new entities that connect or spawn
        this.socket.on('despawnSuccess', (entity) => {
            this.events.emit('despawn', entity)
        })

        // Move a character around the map
        this.socket.on('move', (uid, x, y) => {
            this.events.emit('move', uid, x, y)
        })

        // Client -> Server events
        // Send move to the server
        this.events.on('input:move', (x, y) => {
            this.socket.emit('setDestination', x, y)
        })

        // Request state so we can load the map
        this.events.on('requestSnapshot', () => {
            this.socket.emit('requestSnapshot')
        })
    }
}
