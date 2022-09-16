import Phaser from 'phaser';
import { ISystem, Registry } from '../engine/registry';
import { Zone } from '../components/zone';
export declare class CameraSystem implements ISystem {
    private events;
    private ecs;
    private scene;
    constructor(events: Phaser.Events.EventEmitter, ecs: Registry, scene: Phaser.Scene);
    update: () => void;
    setMapBounds: (entity: any, zone: Zone) => void;
    enableCameraFollow: (entity: any) => void;
}
