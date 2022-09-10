// shared types for use by the client and server (e.g. events passed back and forth)
export {}

// TODO define types for internal events

declare global {
    interface ServerToClientEvents {
        // Spawn players
        setupPlayer: (uid: string, character: string, x: number, y: number) => void
        newPlayer: (uid: string, character: string, x: number, y: number) => void
        spawnSuccess: (entity: string, components: string) => void
        despawnSuccess: (entity: string) => void

        // Send a snapshot of current state (e.g. when new players connect)
        snapshot: (playerId: string, state: string) => void

        // Entity updates
        move: (uid: string, x: number, y: number) => void

        // Verify that a player successfully hit a tree to chop it down
        harvestSuccess: (resource: string, harvester: string) => void

        // An item is transferred between two entities
        transferItem: (sender: string, recipient: string, item: string) => void

        // noArg: () => void
        // basicEmit: (a: number, b: string, c: Buffer) => void
        // withAck: (d: string, callback: (e: number) => void) => void
    }

    interface ClientToServerEvents {
        // Request snapshot of state from server
        requestSnapshot: () => void

        // Handle player input
        setDestination: (x: number, y: number) => void

        // Player wants to chop down a tree / rock / etc
        harvestAttempt: (resource: string, harvester: string) => void
    }

    interface InterServerEvents {
        ping: () => void
    }

    interface SocketData {
        name: string
        age: number
    }
}
