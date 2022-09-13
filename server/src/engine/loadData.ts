// loadData - Loads data for a zone into our ecs system
// Game data (e.g. where should a tree spawn) is stored in json objects in ts files in the /srv/data folder (we use ts vs json so we can add comments)
// When a zone is loaded (via world.ts), we parse a file (e.g. /srv/data/defaultZone.ts) and iterate through each entity
// We then pull from a list of templates used in the scene which represent default values for each entity 'type'
// We use these files to populate characters, objects, etc from the zone and send it down to the client.

import { promises as fs } from 'fs'
import { join, resolve } from 'path'
import { EventEmitter } from 'stream'

// JSON parsing
import * as JSON5 from 'json5'

// Deep Cloning objects
import * as _ from 'lodash'

export class LoadData {
    private dataDirectory = './server/src/data' // Directory is relative to project root, not current file

    // Directory is relative to project root, not current file
    private templatesDirectory = './server/src/data/templates/' // Include trailing slash so we can call templates with `items/rock` vs `/items/rock`

    private templates: Map<string, Array<object>> = new Map()
    // private templates: string

    private events: EventEmitter

    constructor(events: EventEmitter) {
        this.events = events

        // Load templates
        this.loadTemplates()

        // Listen for events
        this.events.on('loadEntity', this.loadEntity)
    }

    loadTemplates = async () => {
        // Load template files from disk
        const fileList = await this.getFiles(this.templatesDirectory)

        // Parse objects and components
        for (let i = 0; i < fileList.length; i++) {
            const file = await fs.readFile(fileList[i], 'utf8')
            const dirPrefix = join(process.cwd(), this.templatesDirectory) // Assemble the template directory so we can isolate our template files (entities are referenced by filename)

            // filter out the cwd (incl trailing slash) from our filename
            const entity = fileList[i].substr(dirPrefix.length)

            // Store our template w/ the relative filename (e.g. /environment/tree.ts) as the key
            this.templates.set(entity, JSON5.parse(file).components) // We use json5 (vs json.parse) because it allows comments
        }
        this.events.emit('templatesLoaded')
    }

    // Load zone files from disk and spawn templates (with any modifications)
    loadZone = async (zone: string) => {
        const zoneFilename = `${this.dataDirectory}/${zone}.ts`
        const zoneFile = await fs.readFile(zoneFilename, 'utf8')
        const zoneData = JSON5.parse(zoneFile)

        // Run through each enitity, grab its template, and override any custom variables
        for (let i = 0; i < zoneData.entities.length; i++) {
            let components

            // Check if the entity has a base template and copy it
            if (zoneData.entities[i].base) {
                // Grab the template for this entity
                const template = zoneData.entities[i].base ? this.templates.get(`${zoneData.entities[i].base}.ts`) : {}

                // Pull in any custom logic from the current zone definitino file
                components = this.merge(template, zoneData.entities[i].components)
            } else {
                components = zoneData.entities[i].components

                // HACK - Load zone data from disk
                for (let i = 0; i < components.length; i++) {
                    if (components[i].type === 'zone') {
                        if (components[i].tileMap) {
                            const tileMap = await fs.readFile(`${this.dataDirectory}/tilemaps/${components[i].tileMap}`, 'utf8')
                            components[i].tileMap = JSON.parse(tileMap)
                        }else {
                            throw new Error('No tilemap found for zone')
                        }
                    } 
                }
            }

            // Spawn the entity
            // First parameter is `null` because we don't have any hardcoded entity id's (e.g. a player connecting which we want to generate in advance)
            this.events.emit('spawnAttempt', null, components)
        }
    }

    // Loads the data for a single entity and then spawns it
    loadEntity = async (template: string, entity?: string) => {
        // Grab a template and pull components
        const components = this.clone(this.templates.get(`${template}.ts`))

        // Make sure the template loads correctly
        if (!components) {
            throw new Error(`template not found: ${template}`)
        }

        // Send a spawn w/ the (optional) entity id and a set of components
        this.events.emit('spawnAttempt', entity, components) //
    }

    // Recursively crawl the directory to find any files underneath it
    getFiles = async (directory: string) => {
        // Grab files and directories in our data directory
        const filesOrDirectories = await fs.readdir(directory, { withFileTypes: true })

        const files = await Promise.all(
            filesOrDirectories.map((entry) => {
                const result = resolve(directory, entry.name)
                return entry.isDirectory() ? this.getFiles(result) : result
            })
        )
        return files.flat()
    }

    merge = (first, second) => {
        // We need to 'clone' or deep copy an object because javascript copies by reference by default (meaning we'd be overwriting the template)
        // cloneDeep is the fastest way to deep copy an object as per https://frontbackend.com/javascript/what-is-the-the-fastest-way-to-deep-clone-an-object-in-javascript#:~:text=According%20to%20the%20benchmark%20test,deep%20clone%20function%20since%20Object.
        const clone = this.clone(first) // Filename is not stored in templates in case we need to change it

        // Check for overrides/custom components.
        if (second) {
            for (let j = 0; j < second.length; j++) {
                const component = second[j]

                // Check to make sure our templates are all set
                if (clone != undefined) {
                    // If component exists, overwrite it
                    const index = clone.findIndex((element) => element.type === component.type)
                    // findIndex returns -1 if index isn't found
                    if (index != -1) {
                        clone[index] = component
                    } else {
                        // component doesn't exist, push it onto the array
                        clone.push(component)
                    }
                } else {
                    throw new Error('missing template file')
                }
                
            }
        }

        return clone
    }

    // Deep Copy a object (e.g. if we want to pluck a template)
    clone = (value) => {
        return _.cloneDeep(value, true)
    }
}
