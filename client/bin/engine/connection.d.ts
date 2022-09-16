import { Socket } from 'socket.io-client';
export declare class Connection {
    socket: Socket<ServerToClientEvents, ClientToServerEvents>;
    events: Phaser.Events.EventEmitter;
    constructor(events: Phaser.Events.EventEmitter);
}
