# Helldivers 2 Stratagem JSON Generator

Generates PNG icons and a unified JSON file containing all HELLDIVERS 2 stratagems with their input sequences.

## Download

Pre-generated files are available in [Releases](../../releases):
- `helldivers2-stratagems-vX.X.X.zip` containing:
  - `stratagems.json` - All stratagem data with input sequences
  - `icons/` - 126px PNG icons (zopfli-optimized)
  - `viewer.html` - Browser-based icon viewer

## Data Sources

- **SVG Icons**: Downloaded from [nvigneux/Helldivers-2-Stratagems-icons-svg](https://github.com/nvigneux/Helldivers-2-Stratagems-icons-svg)
- **Input Sequences**: Manually maintained in `sequences.json`

## Output

```
output/
├── icons/              # PNG icons (kebab-case filenames)
│   ├── reinforce.png
│   ├── eagle-500kg-bomb.png
│   └── ...
└── stratagems.json     # Combined data: name, sequence, department, icon
```

### stratagems.json format

```json
[
  {
    "name": "Reinforce",
    "sequence": ["W", "S", "D", "A", "W"],
    "category": "Common",
    "dept": "Common",
    "icon": "reinforce.png"
  }
]
```

**Categories** (sorted in this order):
- `Common` - Reinforce, Resupply, SOS Beacon, SSSD Delivery
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

## Credits

- SVG icons by [nvigneux](https://github.com/nvigneux/Helldivers-2-Stratagems-icons-svg) - used with permission ("Feel free to use them in your own projects!")
- Input sequences manually compiled

## License

MIT
