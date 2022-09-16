import { Button } from '../button';
export declare class MoveButton extends Button {
    private worldEvents;
    private player;
    private debugCursor;
    constructor(scene: any, state: any, size: any, data: any, callback: any);
    moveUpdate: () => void;
    enter: () => void;
    exit: () => void;
}
