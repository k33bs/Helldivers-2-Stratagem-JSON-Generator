# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Stratagem Icon Generator is a Node.js CLI tool that generates PNG icons and a unified JSON database for HELLDIVERS 2 stratagems. It downloads SVG icons from an external GitHub repository (as a ZIP from master branch), converts them to PNG, and combines them with manually-maintained input sequences.

## Commands

```bash
# Install dependencies
npm install

# Generate icons (default 126px)
npm run generate

# Generate with custom size (16-1024px, short flag: -s)
node generate.js --size 64

# Generate with PNG optimization (short flag: -o, requires zopflipng)
node generate.js --optimize

# Pass flags via npm script
npm run generate -- --size 64 --optimize

# Show help (short flag: -h)
# Note: help text incorrectly says optipng, code uses zopflipng
node generate.js --help

# Serve viewer locally (required due to fetch/CORS)
python3 -m http.server 8000
# Or with Node.js:
npx serve .
# Then open http://localhost:8000/viewer.html
```

## Requirements

- **Node.js 18+** - Required for global `fetch` and ESM support
- **rsvg-convert** - SVG to PNG conversion
  - macOS: `brew install librsvg`
  - Linux: `apt install librsvg2-bin`
- **zopflipng** (optional) - PNG optimization; if not found, `--optimize` warns and continues without optimization
  - macOS: `brew install zopfli`
  - Linux: `apt install zopfli`

## Architecture

**Data Pipeline:** GitHub SVG repo (ZIP) → Extract to `temp/` → Convert to PNG → Merge with sequences.json → Sort by category/name → Output JSON + icons → Clean up `temp/`

**Key Files:**
- `generate.js` - Main CLI script with all conversion logic
- `sequences.json` - Manual database of 96 stratagem input sequences (format: `{ "Name": ["W", "A", "S", "D"] }`)
- `viewer.html` - Standalone browser viewer with search/filter/grouping (no build step, self-contained)
- `output/stratagems.json` - Generated JSON **array** with stratagem objects (sorted by `CATEGORY_ORDER` then name for deterministic diffs)
- `output/icons/` - Generated PNG files (kebab-case filenames)

**Important Mappings in generate.js:**
- `NAME_MAP` (62 entries) - SVG filenames to official stratagem names. Multiple SVGs mapping to the same name will overwrite each other (last wins).
- `DEPT_MAP` (16 entries) - Folder names to department/warbond names
- `SHARED_ICONS` - Stratagems that reuse another stratagem's icon (creates physical duplicate PNG). Dept defaults to 'Objectives', can only be overridden to 'Common' via `COMMON_STRATAGEMS`. **Remove from SHARED_ICONS once upstream adds the real SVG.**
- `OBJECTIVE_STRATAGEMS` / `COMMON_STRATAGEMS` - Override department for specific stratagems

**Category Inference Rules (in order):**
1. **Dept Check:** If dept is 'Common' or 'Objectives', category matches dept
2. **Offensive:** Names starting with `Orbital` or `Eagle`
3. **Defense:** Prefixes `A/` (Sentry), `E/` (Emplacement), `MD-` (Mines), `FX-` (Shield Relay), plus `Tesla Tower` and `Rocket Sentry`
4. **Supply:** Everything else (weapons, backpacks, exosuits)

**Gotchas:**
- **Script Location:** `generate.js` writes `temp/` and `output/` next to the script (uses `__dirname`), not the current working directory. Can run from anywhere.
- **Destructive Output:** `npm run generate` deletes both `output/` and `temp/` directories. Do not store manual files there.
- **Non-Recursive Scanning:** SVG scanning only looks at top-level folders; nested subdirectories are ignored. If upstream reorganizes into subfolders, icons will be silently skipped.
- **Skipped Content:** SVG folder scanning skips `_Experimental Stratagems`, `.git`, and `node_modules` via `SKIP_FOLDERS`.
- **Missing sequences.json:** If missing or invalid, logs a warning and proceeds with empty sequences (useful for debugging empty-sequence outputs).
- **Viewer Path Logic:** `viewer.html` prefers `output/` if it exists; only falls back to current directory (release mode) when `output/stratagems.json` fails to load. When testing release packaging, remove/rename `output/` first.
- **Sequence Key Matching:** Keys in `sequences.json` must match the post-NAME_MAP name (the "HellPad name"), not the raw SVG filename. Missing sequences are logged at the end of generation.
- **Sequence Values:** Only uppercase `"W"`, `"A"`, `"S"`, `"D"` are supported. Lowercase or other values are dropped by the JSON formatting regex.
- **Category Order:** Duplicated in `generate.js` and `viewer.html` - update both if changed.
- **Upstream Dependency:** SVG repo URL is hard-coded to master branch; structure changes could break the build.
- **JSON Formatting:** Output JSON is post-processed so each `sequence` array is forced onto a single line (regex rewrite). Avoid reformatting the generated output.

**Viewer UX Behaviors:**
- Search is debounced (~150ms)
- `Escape` closes the modal
- `Escape` in the search box clears it
- Modal traps focus on the Close button (accessibility)

## Output Format

The output is a JSON **array** of stratagem objects:

```json
[
  {
    "name": "Reinforce",
    "sequence": ["W", "S", "D", "A", "W"],
    "category": "Common",
    "dept": "Common",
    "icon": "reinforce.png"
  },
  ...
]
```

## Adding New Stratagems

1. Add input sequence to `sequences.json` (key must match the final mapped name, values must be uppercase W/A/S/D)
2. If SVG filename differs from in-game name, add entry to `NAME_MAP` in `generate.js`
3. If it's a new department/warbond, add to `DEPT_MAP`
4. If it's a new objective or common stratagem, add to `OBJECTIVE_STRATAGEMS` or `COMMON_STRATAGEMS`
5. If no SVG exists, add to `SHARED_ICONS` to reuse another icon (note: can only be 'Objectives' or 'Common' dept)
6. Run `npm run generate` and check for missing sequence warnings
7. If upstream later adds the real SVG, remove from `SHARED_ICONS`

## Release Packaging

The viewer in release mode expects files at the zip root (no wrapper folder):
```
helldivers2-stratagems-vX.X.X.zip
├── viewer.html
├── stratagems.json
└── icons/
    └── *.png
```

**To create a release:**
```bash
# Generate optimized icons
npm run generate -- --optimize

# Create staging directory
rm -rf stratagem-icons
mkdir -p stratagem-icons/icons
cp output/stratagems.json stratagem-icons/
cp output/icons/*.png stratagem-icons/icons/
cp viewer.html stratagem-icons/

# Zip from inside staging dir (files at root, no wrapper folder)
cd stratagem-icons && zip -r ../helldivers2-stratagems-vX.X.X.zip . -x "*.DS_Store" -x "*/.*" && cd ..
```

**Note:** When testing the release layout locally, remove or rename `output/` first—otherwise the viewer will load from `output/` instead of the release files.
