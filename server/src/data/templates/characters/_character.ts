// Template for a player in the game
// contains the components to load for this object type and the default values that will be loaded unless overridden

{
    components: [
        { type: 'transform', x: 5, y: 5 },
        {
            type: 'sprite',
            name: '_character'
        },
        {
            type: 'collider'
        },
        {
            // TODO Figure out why they aren't renderin c
            type: 'inventory',
            items: [] // Player spawns w/ empty inventory
        },
        {
            type: 'velocity',
            delay: 25
        }
    ]
}
