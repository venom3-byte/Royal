# مملكة الراعي الملكي — Asset Pipeline

## Production structure
- assets/rsk_assets.js — actual raster PNG runtime bundle
- assets/characters — planned source exports
- assets/buildings — planned source exports
- assets/environment — planned source exports
- assets/enemies — planned source exports
- assets/ui
- assets/vfx
- assets/audio
- assets/animations

## Implemented runtime assets
- King sprite sheet: 8 frames
- Farmer sprite sheet: 6 frames
- Archer sprite sheet: 6 frames
- Enemy sprite sheet: 6 frames
- Castle
- Farm
- House
- Tower
- Wall
- Ground tile

The runtime uses raster PNG data embedded in `assets/rsk_assets.js`; no SVG placeholders are used.

## Gameplay integration
- Day/night cycle
- Resource economy: gold, wood, food
- Population/capacity
- Worker production
- Archer combat
- Night enemy waves
- Castle HP and defeat state
- Building system
- Horse toggle
- Save/load using localStorage

## Canva
Source designs located:
- RSK Game Assets — Farmer Sprite Sheet
- RSK Game Assets — King Sprite Sheet

## Figma
Production asset library:
https://www.figma.com/design/NUy7Bvbs3sIruMftWyvyvu

## Future expansion slots
- King horse/build/collect/hit animation variants
- Additional farmer and archer action frames
- Brute/flyer enemy families
- Mill, advanced walls and upgraded towers
- Forest/rocks/roads/water/season layers
- UI icon pack and VFX sprite sheets
