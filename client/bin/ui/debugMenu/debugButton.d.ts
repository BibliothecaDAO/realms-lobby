import { Button } from '../button';
export declare class DebugButton extends Button {
    private worldEvents;
    private debugGrid;
    private debugCursor;
    constructor(scene: any, state: any, size: any, data: any, callback: any);
    toggleDebugGrid: () => void;
}
