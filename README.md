# Helldivers 2 Stratagem JSON Generator

Generates PNG icons and a unified JSON file containing all HELLDIVERS 2 stratagems with their input sequences, display names, and text-to-speech pronunciations.

**Currently includes 96 stratagems** from all warbonds and the base game.

## Download

Pre-generated files are available in [Releases](../../releases):
- `helldivers2-stratagems-vX.X.X.zip` containing:
  - `stratagems.json` - All stratagem data with input sequences
  - `icons/` - 126px PNG icons (zopfli-optimized)
  - `viewer.html` - Browser-based icon viewer

## Data Sources

- **SVG Icons**: Downloaded from [nvigneux/Helldivers-2-Stratagems-icons-svg](https://github.com/nvigneux/Helldivers-2-Stratagems-icons-svg)
- **Input Sequences**: Manually maintained in `sequences.json`
- **Display Names & TTS**: Manually maintained in `aliases.json`

## Output

```
output/
├── icons/              # PNG icons (kebab-case filenames)
│   ├── reinforce.png
│   ├── eagle-500kg-bomb.png
│   └── ...
└── stratagems.json     # Combined data
```

### stratagems.json format

```json
[
  {
    "name": "Eagle 500kg Bomb",
    "short": "500kg Bomb",
    "sequence": ["W", "D", "S", "S", "S"],
    "category": "Offensive",
    "dept": "Hangar",
    "icon": "eagle-500kg-bomb.png",
    "speak": "five hundred kilo bomb"
  }
]
```

**Fields:**
- `name` - Full in-game stratagem name
- `short` - Shortened display name (strips model prefixes like "Eagle", "AC-8", etc.)
- `sequence` - D-pad input sequence (W=Up, A=Left, S=Down, D=Right)
- `category` - In-game category for sorting/grouping
- `dept` - Ship department or warbond source
- `icon` - PNG filename
- `speak` *(optional)* - Text-to-speech friendly pronunciation for acronyms/numbers

**Categories** (sorted in this order):
- `Common` - Reinforce, Resupply, SOS Beacon, Eagle Rearm
- `Objectives` - Mission objectives (SEAF Artillery, Hellbomb, etc.)
- `Offensive` - Orbital/Eagle strikes (red icons in-game)
- `Supply` - Weapons, backpacks, guard dogs, exosuits (blue icons)
- `Defense` - Sentries, mines, emplacements (green icons)

## Requirements

- Node.js 18+
- `rsvg-convert` (install via `brew install librsvg` on macOS)
- `zopflipng` (optional, for PNG optimization: `brew install zopfli`)

## Usage

```bash
npm install

# Generate 126px icons (default)
npm run generate

# Generate custom size
node generate.js --size 64

# Optimize PNGs (requires zopflipng)
node generate.js --optimize
```

## Viewer

A browser-based viewer (`viewer.html`) is included to browse all stratagems with search, filtering, and grouping options.

**Note:** The viewer auto-detects paths and works in both contexts:
- **From source:** Run `npm run generate` first (creates `output/` folder)
- **From release:** Just unzip and run - viewer finds files automatically

Since browsers block local file access (CORS), you need to run a simple HTTP server:

**macOS / Linux:**
```bash
python3 -m http.server 8000
# Open http://localhost:8000/viewer.html
```

**Windows (PowerShell):**
```powershell
python -m http.server 8000
# Open http://localhost:8000/viewer.html
```

**Windows (if Python not installed):**
```powershell
# Using Node.js (npx comes with Node)
npx serve .
# Open the URL shown in terminal
```

### Viewer Features

- Search stratagems by name
- Group by Category, Department, or Alphabetical
- Adjustable icon sizes (48px, 64px, 96px, 126px)
- Click any icon for enlarged view with input sequence
- Keyboard accessible (Tab, Enter, Escape)

## Included Warbonds

- Base Game (Hangar, Orbital Cannons, Engineering Bay, etc.)
- Chemical Agents
- Urban Legends
- Servants of Freedom
- Borderline Justice
- Masters of Ceremony
- Force of Law
- Control Group
- Dust Devils
- Python Commandos
- Redacted Regiment

## Adding New Stratagems

When new stratagems are added to the game:

1. Add the input sequence to `sequences.json` (use the in-game name as the key)
2. If the SVG filename differs from the in-game name, add a mapping in `generate.js` (`NAME_MAP`)
3. If the name has a model prefix (e.g., "AC-8 Autocannon"), add an entry to `aliases.json` with the `short` name
4. If the name has acronyms or numbers that TTS struggles with, add a `speak` field to `aliases.json`
5. Run `npm run generate` to verify - missing sequences will be listed at the end

See `CLAUDE.md` for detailed technical documentation.

## Credits

- SVG icons by [nvigneux](https://github.com/nvigneux/Helldivers-2-Stratagems-icons-svg) - used with permission ("Feel free to use them in your own projects!")
- Input sequences manually compiled

## License

MIT
