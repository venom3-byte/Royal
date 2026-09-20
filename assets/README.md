# Royal Shepherd Kingdom — Production Assets

This folder contains the game's production raster asset bundle.

## Included
- `rsk_assets.js` — runtime PNG asset bundle
- King sprite sheet — 8 animation frames
- Farmer sprite sheet — 6 frames
- Archer sprite sheet — 6 frames
- Enemy sprite sheet — 6 frames
- Castle, farm, house, tower, wall — raster building assets
- Ground tile

## Runtime
`index.html` loads `assets/rsk_assets.js` before `game.js`. The game therefore runs without an external asset server.

## Visual pipeline
Canva source designs:
- RSK Game Assets — Farmer Sprite Sheet
- RSK Game Assets — King Sprite Sheet

Figma production library:
https://www.figma.com/design/NUy7Bvbs3sIruMftWyvyvu

The runtime assets are raster PNG data, not SVG placeholders.
