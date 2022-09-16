import { Registry } from './registry';
import { Connection } from './connection';
export declare class World {
    ecs: Registry;
    events: Phaser.Events.EventEmitter;
    connection: Connection;
    constructor();
    update: () => void;
}
