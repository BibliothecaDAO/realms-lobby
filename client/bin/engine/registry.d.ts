export interface IComponent {
    type: string;
}
export interface ISystem {
    awake?: () => void;
    start?: () => void;
    update?: () => void;
    destroy?: () => void;
}
export declare class Registry {
    private entities;
    private entitiesToComponents;
    private componentTypesToEntities;
    private systems;
    private queuedForStart;
    createEntity: (id?: string) => any;
    getEntity: (id: string) => string;
    destroyEntity: (id: string) => void;
    addComponent: (entity: string, component: IComponent) => void;
    removeComponent: (entity: string, component: IComponent) => void;
    getComponent: (entity: string, type: string) => IComponent;
    getComponentsByEntity: (entity: string) => IComponent[];
    getComponentsByType: (type: string) => any[];
    getEntitiesByComponentType: (type: string) => string[];
    addSystem: (system: ISystem) => void;
    update: () => void;
    destroySystem: () => void;
    getDebugState: () => {
        entites: string[];
        entitiesToComponents: Map<string, IComponent[]>;
        componentTypesToEntities: Map<string, string[]>;
    };
}
