# node-minecraft-launcher
A fast Minecraft launcher written in Node.JS with no large dependencies.
Yes, you do need Java installed.

## Installation
```
npm i
```

## Running
```
node . <ver> [username] [javaPath]
```

## Known issues
This does not support custom Minecraft versions (Fabric, Forge, hacked clients etc.)
Sometimes it'll error out while refreshing versions. Run it again to fix.
Sometimes it'll take too long refreshing broken downloads. Run it again to hopefully fix, or just wait a moment.
