export declare class State {
    name: symbol;
    exit: any;
    update: any;
    enter: any;
    /**
     * State - Creates a state that can be switched between (e.g. 'on' or 'off')
     * @param name The name we'll use to reference this state
     * @param enter The function to call when we transition into this state
     * @param update The function to call when the state gets updated
     * @param exit The function to call when we transition out of the state
     */
    constructor(name: symbol, enter: any, update: any, exit: any);
}
export declare class StateMachine {
    current: symbol;
    States: {};
    constructor(initial: any, _States: State[]);
    transition: (nextState: symbol) => void;
    update: () => void;
}
