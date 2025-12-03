# Helldivers 2 Stratagem JSON Generator

Generates PNG icons and a unified JSON file containing all HELLDIVERS 2 stratagems with their input sequences.

## Download

Pre-generated files are available in [Releases](../../releases):
- `stratagems.json` - All stratagem data with input sequences
- `icons.zip` - PNG icons (126px)

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
    "dept": "Common",
    "icon": "reinforce.png"
  }
]
```

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

## Adding New Stratagems

1. Add the input sequence to `sequences.json`:
   ```json
   "New Stratagem Name": ["W", "A", "S", "D"]
   ```
2. If the SVG filename differs from the in-game name, add a mapping to `NAME_MAP` in `generate.js`
3. Run `npm run generate`

## Credits

- SVG icons by [nvigneux](https://github.com/nvigneux/Helldivers-2-Stratagems-icons-svg) - used with permission ("Feel free to use them in your own projects!")
- Input sequences manually compiled

## License

MIT
