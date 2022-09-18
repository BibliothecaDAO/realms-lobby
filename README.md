# realms-lobby
Battle other lords in a multiplayer lobby

## Installation
1. clone this repository
2. install dependencies: `yarn`
3. create environment variables in `.env` (see **Environment Variables** below)
4. run dev server: `yarn all:dev`
5. visit http://localhost:8080 in your browser

## Environment Variables

To facilitate local development and production deployment, we use environment variables in the file `.env` located in the root of this project. 

Create this file and populate the following variables:
```
# Hostname and port of the system hosting/serving html and js iles
WWW_HOSTNAME="localhost"    # game client will be served via this hostname (use `localhost` for local dev)
WWW_PORT="8080"             # game client will be served on this port

# Hostname and port of the system running game server and communicating via web sockers
WS_HOSTNAME="localhost"     # game server will run on this hostname (use `localhost` for local dev)
WS_PORT="8081"              # game server will run on this port
```

# Tech used
* [Phaser 3](https://photonstorm.github.io/phaser3-docs/) - javascript game engine which handles rendering, input, animations, and the game loop
* [ECS Engine](http://t-machine.org/index.php/category/entity-systems/) - Entity, Component, Systems library by [@threepwave](https://twitter.com/threepwave) to allow us to query/attach components. See below (Architecture: ECS) for more details. Library is very minimal but should be relatively performant.    
* [socket.io](https://socket.io/) - communicates between client/server via websockets
* [NodeJS](https://nodejs.org/en/) - Server runs standard nodeJS w/ aforementioned ECS library and socket.io
* [Typescript](https://www.typescriptlang.org/) - Type checking for nodejs

# Architecture overview
There is a client that is loaded via www (port 8080). It loads the Phaser game engine then connects to the server via socket.io. The server loads a zone and entities (characters, trees, etc) from a set of templates defined in `/server/src/data`. It also generates a new playerId for that player and spawns a new character. It sends all of this down to the client via socket.io (see: `/server/src/engine/connections.ts` and `/client/src/engine/connections.ts`).

The client receives this data and renders the entities sent down from the server. It fires events when the data arrives and attaches a `Player` component to the player. The player can issue commands like 'move' (by clicking to set a destionation but we can find whatever locomotion methods work best for us).

While the client/server are loading data, the client also renders a ui which does not use the ECS system (so UI doesn't block the game loop). The UI creates affordances like buttons the player can click. This is all housed in `/client/src/ui`)

# Game Architecture: ECS (Entity, Component, Systems)

ECS is a common architecture used in realtime games. It favors composability (e.g. a tree is made up of a transform which defines x/y location, a sprite, and a 'harvestable' component) over inheritance (a tree extends class EnvironmentObject which extends class Object). For more detail on ECS systems, check out t-machine's excellent blog post [overview of ECS systems](http://t-machine.org/index.php/category/entity-systems/).

**Entities** - an ID (string) that refers to a set of components
**Components** - contain data (no logic) and are referenced by systems.
**Systems** - contain logic that act on components

Entities should never contain data or logic. Components should never contain logic. Each component and each system should do one thing (and only one thing !) well.

Here's an example. Let's say we want to define a character in our game controlled by a player. First we'd initiate a new entity: `ecs.createEntity()`. This gives us a unique id e.g. `1234abc`.

Next let's say we want our player to have a Name and a Class and an x/y position on a map. We'd create three components: `Name('bob')`, `Classs('rogue')`, and `Transform(5, 7)`. In our ECS system, these are typescript classes stored in `/client/src/components` and `/server/src/components`.

We'll add these components to our entity via `ecs.addComponent('1234abc', Name)`, `ecs.addComponent('1234abc', Class)`, and `ecs.addComponent('1234abc', Transform)`. So the entity becomes a reference or label for this set of components. 

If we wanted to figure out the x/y location of player 1234abc, we'd call `ecs.getComponent('1234abc', Transform) as Transform` (we need `as Transform` so typescript knows what type to expect).

If we wanted an enemy that had a name, an xy position, no class, but a faction, we'd just create a new entity then define a new `Faction('evil')` component and add it along with a `Name` and `Transform` component.

If you've been coding OOP for years, a few alarm bells are probably going off in your head. We're not inheriting from any classes (except for a generic `IComponent` interface). That's a good thing. It means you don't need to create deep and complicated nested trees for a bunch of players, enemies, environment objects, npcs, etc who may not have all that much in common. Instead, we compose objects on the fly.

Once you've got your entities and components loaded up, you can create systems which can read/write state from components.

Here's an example: Let's say we want to add a random fireball that falls from the sky and kills any player within a 20 tile radius.

We'd first query for all components with an x/y coordinate (which players/monsters both do): `ecs.getComponentsByType('transform')`. This will return an array of transform components. We can then check the x/y of each component to see which ones are in range of our fireball. We can then get the entity associated with that component via `ecs.getEntitiesByComponent(component)`. Once we have this entity, we can destroy it via `this.ecs.destroy(entity)`.

This is a very contrived set of examples but you get the idea. Feel free to ask any questions in the Realms Discord and I'll answer them as best I can.

# Writing multiplayer code

Rule number one of a multiplayer game: Never trust the client.

Because the client may be maliscious or trying to manipulate our server data, we perform all logic (checks/actions) on the server. The client keeps a local copy of the state to predict the next action from the server so everything appears smooth on the client.

A common workflow looks like this:
1. Create feature on server (e.g. a new system that checks which monsters are wearing pants)
2. Emit an event when something happens (e.g. `'move' (x, y)` and send that event to the client via socket.io (see `/server/src/engine/connections.ts`).
3. Listen for said event on the client (see `/client/src/engine/connections.ts`) and emit an event in the client-side code
4. Handle that event (e.g. in a client-side system).

The connections classes act as routers between client an server.


# Getting Help
If you're stuck or have questions, ask @threepwave on the Realms discord.


