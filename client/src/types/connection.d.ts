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

        // noArg: () => void
        // basicEmit: (a: number, b: string, c: Buffer) => void
        // withAck: (d: string, callback: (e: number) => void) => void
    }

    interface ClientToServerEvents {
        // Request snapshot of state from server
        requestSnapshot: () => void

        // Handle player input
        setDestination: (x: number, y: number) => void
    }

    interface InterServerEvents {
        ping: () => void
    }

    interface SocketData {
        name: string
        age: number
    }
}
