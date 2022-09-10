// Template for a skeleton enemy
// contains the components to load for this object type and the default values that will be loaded unless overridden

{
    components: [
        { type: 'transform', x: 5, y: 5 },
        {
            type: 'sprite',
            name: '_enemy'
        },
        {
            type: 'collider'
        },
        {
            type: 'inventory',
            items: [] // Monsters spawn w/ empty inventory (can be overridden by loot tables)
        },
        {
            type: 'velocity',
            delay: 75 // Move 3x slower than a player
        }
    ]
}
