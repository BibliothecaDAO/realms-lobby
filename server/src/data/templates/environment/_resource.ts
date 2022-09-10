// Template for a tree in the game
// contains the components to load for this object type and the default values that will be loaded unless overridden

{
    components: [
        { type: 'transform', x: 5, y: 5 },
        {
            type: 'respawn',
            template: 'environment/_resource',
            spawnTime: 1000
        },
        {
            type: 'sprite',
            name: '_resource'
        },
        {
            type: 'collider'
        },
        {
            type: 'inventory',
            items: []
        }
    ]
}
