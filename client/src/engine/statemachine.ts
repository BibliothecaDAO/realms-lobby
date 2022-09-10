// StateMachine - Allows transition from one state to another

export class State {
    public name: symbol
    public exit
    public update
    public enter

    /**
     * State - Creates a state that can be switched between (e.g. 'on' or 'off')
     * @param name The name we'll use to reference this state
     * @param enter The function to call when we transition into this state
     * @param update The function to call when the state gets updated
     * @param exit The function to call when we transition out of the state
     */
    constructor(name: symbol, enter, update, exit) {
        this.name = name
        this.enter = enter
        this.update = update
        this.exit = exit
    }
}

export class StateMachine {
    public current: symbol

    // State Machine for which UI mode the player is in (Move character / Attack / etc)
    public States = {}

    // initial - index in the array of _States to start with
    // _States - an array of objects with the following structure:
    // * name: symbol to reference the state
    // * enter: funciton() called when we transition to this state
    // * exit: function() called when we transition from this state
    constructor(initial, _States: State[]) {
        this.current = initial
        for (const _state of _States) {
            // Create a new state for each entry passed in
            this.States[_state.name] = _state
        }

        if (this.States[initial].enter) {
            this.States[initial].enter() // We need to explicitly call this the first time we run the function
        }
    }

    // Transition from one state to another
    public transition = (nextState: symbol) => {
        // Make sure we're actually transitioning
        if (this.current != nextState) {
            if (this.States[this.current].exit) {
                this.States[this.current].exit()
            }

            this.current = nextState

            if (this.States[this.current].enter) {
                this.States[this.current].enter()
            }
        }
    }

    // Run the current state's update function
    public update = () => {
        if (this.States[this.current].update) {
            this.States[this.current].update()
        }
    }
}
