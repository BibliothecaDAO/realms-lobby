// Template for a player in the game
// contains the components to load for this object type and the default values that will be loaded unless overridden

{
    components: [
        { type: 'transform', x: 5, y: 5 },
        {
            type: 'sprite',
            name: 'mage'
        },
        {
            type: 'collider'
        },
        {
            type: 'inventory',
            items: [] // Player spawns w/ empty inventory
        },
        {
            type: 'velocity',
            delay: 25
        }
    ]
}
