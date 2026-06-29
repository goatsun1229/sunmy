# Original Companion Robot Asset Requirements

This project currently renders the robot with SVG/DOM layers in `src/pet-visual`.

If professional frame assets are produced later, place them under:

`assets/pets/original-companion-robot/`

## Canvas

- Logical canvas: `184 x 176`
- Recommended export: `368 x 352` or `552 x 528`
- Transparent background
- Anchor: `x=92`, `y=134`
- Keep body center stable across frames
- Keep shadow or hover center stable
- Avoid excess transparent padding

## File Format

- Preferred: PNG sequence with alpha or WebP with alpha
- Sprite sheet is allowed if manifest includes frame coordinates
- Maximum recommended size per action: 1 MB
- No text, watermark, brand logo, or copied reference art

## Naming

`companion_robot_01/<action>/<action>_<frame>.png`

Example:

`companion_robot_01/idle/idle_0001.png`

## FPS And Frames

- idle: 8 frames, 8 fps, loop
- blink: 4 frames, 10 fps, non-loop
- look-left: 8 frames, 8 fps, loop optional
- look-right: 8 frames, 8 fps, loop optional
- walk: 12 frames, 10 fps, loop
- float: 8 frames, 8 fps, loop
- wave: 10 frames, 10 fps, non-loop
- happy: 8 frames, 10 fps, non-loop
- surprised: 6 frames, 10 fps, non-loop
- sad: 6 frames, 8 fps, loop optional
- sleepy: 8 frames, 8 fps, loop
- sleep: 8 frames, 6 fps, loop
- wake: 8 frames, 10 fps, non-loop
- drink-reminder: 12 frames, 10 fps, non-loop
- rest-reminder: 12 frames, 10 fps, non-loop
- mouse-follow: 8 frames per direction, 10 fps, loop
- click-reaction: 6 frames, 12 fps, non-loop
- celebration: 12 frames, 12 fps, non-loop

## Layers

If exporting layered source files, keep these layers:

- body shell
- head shell
- dark face visor
- eyes/expression
- mouth/expression
- chest core
- blue light strips
- warm indicator lights
- left arm
- right arm
- hands
- hover fins
- shadow
- accessories by slot

## Accessory Anchors

- head: around `x=92`, `y=24`
- face: around `x=92`, `y=56`
- neck: around `x=92`, `y=94`
- body: around `x=92`, `y=112`
- hand: left `x=35`, `y=124`, right `x=149`, `y=124`
- back: around `x=92`, `y=102`
- effect: whole canvas

## Expressions

Required expression names:

- happy
- calm
- blink
- sleepy
- sleep
- surprised
- confused
- shy
- sad
- celebrate
- angry
- playful
- focused
- worried
- expecting

## Safety

- Do not copy, crop, trace, or embed the reference image.
- Do not include weapons or combat parts.
- Keep the silhouette distinct from known robot characters.
- Missing action assets must fall back to idle.
