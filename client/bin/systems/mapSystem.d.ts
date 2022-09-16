import { ISystem, Registry } from '../engine/registry';
import { js as Finder } from 'easystarjs';
import { Zone } from '../components/zone';
export declare class MapSystem implements ISystem {
    private events;
    private ecs;
    private scene;
    private finder;
    constructor(events: Phaser.Events.EventEmitter, ecs: Registry, scene: Phaser.Scene, finder: Finder);
    update: () => void;
    setupMap: (entity: string, zone: Zone) => void;
    placeStaticColliders: (entity: any) => void;
    placeDynamicColliders: (entity: any, prevX: any, prevY: any, currentX: any, currentY: any) => void;
    setupTileset: (zone: Zone) => void;
    setupPathing: (zone: Zone) => void;
    generate2DArrayFromTiled: (tileMap: any) => Array<Array<number>>;
}
