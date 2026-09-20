# مملكة الراعي الملكي — Asset Pipeline

## Production structure
- assets/characters
- assets/buildings
- assets/environment
- assets/enemies
- assets/ui
- assets/vfx
- assets/audio
- assets/animations

## Asset rules
All final game art must be actual raster PNG/WebP assets or sprite sheets, not SVG placeholders.
Each animated character uses a sprite sheet with documented frame size and FPS.
Naming: category_subject_action_direction.png

## Runtime
game.js loads assets through a central manifest and falls back gracefully if an optional asset is unavailable.
The gameplay systems remain independent from art assets.

## Canva
Canva asset sheets:
- RSK Game Assets — Farmer Sprite Sheet
- RSK Game Assets — King Sprite Sheet

## Figma
Production asset library:
https://www.figma.com/design/NUy7Bvbs3sIruMftWyvyvu

## Next asset batches
1. King: idle/walk/run/horse/collect/build/hit
2. Farmer: idle/walk/work/carry
3. Archer: idle/walk/shoot/hit
4. Enemy families: scout/brute/flyer with idle/walk/attack/hit/death
5. Castle, walls, tower, farm, house, mill
6. Forest, rocks, grass, road, water, day/night layers
7. UI icons and particles
