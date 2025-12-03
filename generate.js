#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import AdmZip from 'adm-zip';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_ZIP_URL = 'https://github.com/nvigneux/Helldivers-2-Stratagems-icons-svg/archive/refs/heads/master.zip';
const DEFAULT_ICON_SIZE = 126;

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  let size = DEFAULT_ICON_SIZE;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--size' || args[i] === '-s') {
      size = parseInt(args[i + 1], 10);
      if (isNaN(size) || size < 16 || size > 1024) {
        console.error('Invalid size. Must be between 16 and 1024.');
        process.exit(1);
      }
      i++;
    } else if (args[i] === '--help' || args[i] === '-h') {
      console.log(`
Usage: node generate.js [options]

Options:
  -s, --size <px>   Icon size in pixels (default: ${DEFAULT_ICON_SIZE})
  -h, --help        Show this help message

Example:
  node generate.js --size 64
`);
      process.exit(0);
    }
  }

  return { size };
}

const { size: ICON_SIZE } = parseArgs();

// Folders to skip (not actual stratagems)
const SKIP_FOLDERS = [
  '_Experimental Stratagems',
  '.git',
  'node_modules'
];

// Map SVG folder names to department names (keep warbond names as-is)
const DEPT_MAP = {
  'General Stratagems': 'Common',
  'Patriotic Administration Center': 'Patriotic Administration Center',
  'Orbital Cannons': 'Orbital Cannons',
  'Hangar': 'Hangar',
  'Bridge': 'Bridge',
  'Engineering Bay': 'Engineering Bay',
  'Robotics Workshop': 'Robotics Workshop',
  // Warbond folders keep their names
  'Chemical Agents': 'Chemical Agents',
  'Urban Legends': 'Urban Legends',
  'Servants of Freedom': 'Servants of Freedom',
  'Borderline Justice': 'Borderline Justice',
  'Masters of Ceremony': 'Masters of Ceremony',
  'Force of Law': 'Force of Law',
  'Control Group': 'Control Group',
  'Dust Devils': 'Dust Devils',
  'Python Commandos': 'Python Commandos'
};

// Map SVG filename (without extension) -> HellPad stratagem name
// Only add entries where names don't match
const NAME_MAP = {
  // General Stratagems (Common/Objectives)
  'Orbital Illumination Flare': 'Illumination Flare',
  'Seismic Probe': 'SE-45 Seismic Probe',

  // Patriotic Administration Center
  'Machine Gun': 'MG-43 Machine Gun',
  'Anti-Materiel Rifle': 'APW-1 Anti-Materiel Rifle',
  'Stalwart': 'M-105 Stalwart',
  'Expendable Anti-Tank': 'EAT-17 Expendable Anti-Tank',
  'Recoilless Rifle': 'GR-8 Recoilless Rifle',
  'Flamethrower': 'FLAM-40 Flamethrower',
  'Autocannon': 'AC-8 Autocannon',
  'Heavy Machine Gun': 'MG-206 Heavy Machine Gun',
  'Airburst Rocket Launcher': 'RL-77 Airburst Rocket Launcher',
  'Commando': 'MLS-4X Commando',
  'Railgun': 'RS-422 Railgun',
  'Spear': 'FAF-14 Spear',
  'Speargun': 'S-11 Speargun',

  // Engineering Bay
  'Anti-Personnel Minefield': 'MD-6 Anti-Personnel Minefield',
  'Supply Pack': 'B-1 Supply Pack',
  'Grenade Launcher': 'GL-21 Grenade Launcher',
  'Laser Cannon': 'LAS-98 Laser Cannon',
  'Incendiary Mines': 'MD-I4 Incendiary Mines',
  'Ballistic Shield Backpack': 'SH-20 Ballistic Shield Backpack',
  'Arc Thrower': 'ARC-3 Arc Thrower',
  'Anti-Tank Mines': 'MD-17 Anti-Tank Mines',
  'Quasar Cannon': 'LAS-99 Quasar Cannon',
  'Shield Generator Pack': 'SH-32 Shield Generator Pack',
  'Gas Mine': 'MD-8 Gas Mines',
  'Guard Dog Rover': 'AX/LAS-5 Guard Dog Rover',

  // Bridge
  'HMG Emplacement': 'E/MG-101 HMG Emplacement',
  'Shield Generator Relay': 'FX-12 Shield Generator Relay',
  'Tesla Tower': 'A/ARC-3 Tesla Tower',
  'Grenadier Battlement': 'E/GL-21 Grenadier Battlement',

  // Robotics Workshop
  'Machine Gun Sentry': 'A/MG-43 Machine Gun Sentry',
  'Gatling Sentry': 'A/G-16 Gatling Sentry',
  'Mortar Sentry': 'A/M-12 Mortar Sentry',
  'Autocannon Sentry': 'A/AC-8 Autocannon Sentry',
  'EMS Mortar Sentry': 'A/M-23 EMS Mortar Sentry',
  'Rocket Sentry': 'AX/MLS-4X Rocket Sentry',
  'Guard Dog': 'AX/AR-23 Guard Dog',
  'Patriot Exosuit': 'EXO-45 Patriot Exosuit',
  'Emancipator Exosuit': 'EXO-49 Emancipator Exosuit',

  // Warbonds
  'Sterilizer': 'TX-41 Sterilizer',
  'Directional Shield': 'SH-51 Directional Shield',
  'Anti-Tank Emplacement': 'E/AT-12 Anti-Tank Emplacement',
  'Flame Sentry': 'A/FLAM-40 Flame Sentry',
  'Hellbomb Portable': 'B-100 Portable Hellbomb',
  'Hover Pack': 'LIFT-860 Hover Pack',
  'One True Flag': 'CQC-1 One True Flag',
  'Guard Dog K-9': 'AX/ARC-3 Guard Dog K-9',
  'Laser Sentry': 'A/LAS-98 Laser Sentry',
  'Warp Pack': 'LIFT-182 Warp Pack',
  'Epoch': 'PLAS-45 Epoch',
  'Solo Silo': 'MS-11 Solo Silo',
  'Expendable Napalm': 'EAT-700 Expendable Napalm',
  'Guard Dog Breath': 'AX/TX-13 Guard Dog Dog Breath',
  'Maxigun': 'M-1000 Maxigun',
  'Guard Dog Hot Dog': 'AX/FLAM-75 Guard Dog Hot Dog',
  'Defoliation Tool': 'CQC-9 Defoliation Tool',

  // Hangar
  'Fast Recon Vehicle': 'M-102 Fast Recon Vehicle',
  'Eagle 110MM Rocket Pods': 'Eagle 110mm Rocket Pods',
  'Eagle 500KG Bomb': 'Eagle 500kg Bomb',

  // Orbital Cannons (case normalization)
  'Orbital 120MM HE Barrage': 'Orbital 120mm HE Barrage',
  'Orbital 380MM HE Barrage': 'Orbital 380mm HE Barrage'
};

// Stratagems that share icons with others (name -> icon source name)
const SHARED_ICONS = {
  'SSSD Delivery': 'Upload Data'
};

// Objective stratagems (from General Stratagems folder but dept should be Objectives)
const OBJECTIVE_STRATAGEMS = [
  'SSSD Delivery',
  'Prospecting Drill',
  'Super Earth Flag',
  'Hellbomb',
  'Upload Data',
  'SE-45 Seismic Probe',
  'Illumination Flare',
  'SEAF Artillery',
  'Dark Fluid Vessel',
  'Tectonic Drill',
  'Hive Breaker Drill'
];

// Common stratagems (from General Stratagems or Hangar)
const COMMON_STRATAGEMS = [
  'Reinforce',
  'SOS Beacon',
  'Resupply',
  'Eagle Rearm'
];

function toKebabCase(str) {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special chars except spaces and hyphens
    .replace(/\s+/g, '-')     // Replace spaces with hyphens
    .replace(/-+/g, '-')      // Collapse multiple hyphens
    .replace(/^-|-$/g, '');   // Trim hyphens from ends
}

function checkRsvgConvert() {
  try {
    execSync('rsvg-convert --version', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

async function downloadZip(url, destPath) {
  console.log(`Downloading ${url}...`);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to download: ${response.status}`);
  const buffer = await response.arrayBuffer();
  fs.writeFileSync(destPath, Buffer.from(buffer));
  console.log(`Downloaded to ${destPath}`);
}

function extractZip(zipPath, destDir) {
  console.log(`Extracting ${zipPath}...`);
  const zip = new AdmZip(zipPath);
  zip.extractAllTo(destDir, true);
  console.log(`Extracted to ${destDir}`);
}

function convertSvgToPng(svgPath, pngPath, size) {
  try {
    execSync(`rsvg-convert -w ${size} -h ${size} "${svgPath}" -o "${pngPath}"`, {
      stdio: 'pipe'
    });
    return true;
  } catch (error) {
    console.error(`Failed to convert ${svgPath}: ${error.message}`);
    return false;
  }
}

function loadSequences() {
  const sequencesPath = path.join(__dirname, 'sequences.json');
  if (!fs.existsSync(sequencesPath)) {
    console.warn('Warning: sequences.json not found. Stratagems will have empty sequences.');
    return {};
  }
  try {
    return JSON.parse(fs.readFileSync(sequencesPath, 'utf8'));
  } catch (err) {
    console.warn(`Warning: Failed to parse sequences.json: ${err.message}`);
    return {};
  }
}

async function main() {
  // Check for rsvg-convert
  if (!checkRsvgConvert()) {
    console.error('Error: rsvg-convert is not installed.');
    console.error('Install it with: brew install librsvg (macOS) or apt install librsvg2-bin (Linux)');
    process.exit(1);
  }

  const workDir = __dirname;
  const tempDir = path.join(workDir, 'temp');
  const outputDir = path.join(workDir, 'output');
  const iconsDir = path.join(outputDir, 'icons');
  const zipPath = path.join(tempDir, 'svgs.zip');

  // Clean up and create directories
  if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true });
  if (fs.existsSync(outputDir)) fs.rmSync(outputDir, { recursive: true });
  fs.mkdirSync(tempDir, { recursive: true });
  fs.mkdirSync(iconsDir, { recursive: true });

  // Download and extract
  await downloadZip(REPO_ZIP_URL, zipPath);
  extractZip(zipPath, tempDir);

  // Find extracted folder (ignore __MACOSX and hidden folders)
  const extractedFolders = fs.readdirSync(tempDir).filter(f =>
    fs.statSync(path.join(tempDir, f)).isDirectory() &&
    !f.startsWith('.') &&
    !f.startsWith('__')
  );
  if (extractedFolders.length === 0) {
    throw new Error('No extracted folder found');
  }
  const svgRootDir = path.join(tempDir, extractedFolders[0]);
  console.log(`SVG root: ${svgRootDir}`);

  // Load sequences from local sequences.json
  const sequences = loadSequences();
  console.log(`Loaded ${Object.keys(sequences).length} sequences from sequences.json`);

  // Scan for SVGs
  const stratagems = [];
  const folders = fs.readdirSync(svgRootDir).filter(f => {
    const fullPath = path.join(svgRootDir, f);
    return fs.statSync(fullPath).isDirectory() && !SKIP_FOLDERS.includes(f);
  });

  console.log(`\nProcessing ${folders.length} folders...`);

  for (const folder of folders) {
    const folderPath = path.join(svgRootDir, folder);
    const svgFiles = fs.readdirSync(folderPath).filter(f => f.endsWith('.svg'));

    console.log(`\n[${folder}] - ${svgFiles.length} SVGs`);

    for (const svgFile of svgFiles) {
      const svgPath = path.join(folderPath, svgFile);
      const baseName = path.basename(svgFile, '.svg');

      // Map SVG name to HellPad name
      const hellpadName = NAME_MAP[baseName] || baseName;

      // Determine department
      let dept = DEPT_MAP[folder] || folder;
      if (OBJECTIVE_STRATAGEMS.includes(hellpadName)) {
        dept = 'Objectives';
      } else if (COMMON_STRATAGEMS.includes(hellpadName)) {
        dept = 'Common';
      }

      // Generate kebab-case filename
      const iconFileName = toKebabCase(hellpadName) + '.png';
      const pngPath = path.join(iconsDir, iconFileName);

      // Convert SVG to PNG
      const success = convertSvgToPng(svgPath, pngPath, ICON_SIZE);
      if (!success) continue;

      // Get sequence from sequences.json
      const sequence = sequences[hellpadName] || [];

      stratagems.push({
        name: hellpadName,
        sequence: sequence,
        dept: dept,
        icon: iconFileName
      });

      console.log(`  ${baseName} -> ${iconFileName} (${dept})`);
    }
  }

  // Add stratagems that share icons with others
  for (const [name, sourceName] of Object.entries(SHARED_ICONS)) {
    const sourceStratagem = stratagems.find(s => s.name === sourceName);
    if (sourceStratagem) {
      let dept = 'Objectives';
      if (OBJECTIVE_STRATAGEMS.includes(name)) dept = 'Objectives';
      else if (COMMON_STRATAGEMS.includes(name)) dept = 'Common';

      stratagems.push({
        name: name,
        sequence: sequences[name] || [],
        dept: dept,
        icon: sourceStratagem.icon  // Use same icon as source
      });
      console.log(`  ${name} -> ${sourceStratagem.icon} (shared from ${sourceName})`);
    } else {
      console.warn(`  WARNING: Source icon "${sourceName}" not found for "${name}"`);
    }
  }

  // Sort by department, then by name
  stratagems.sort((a, b) => {
    if (a.dept !== b.dept) return a.dept.localeCompare(b.dept);
    return a.name.localeCompare(b.name);
  });

  // Write JSON with sequences on single lines
  const jsonPath = path.join(outputDir, 'stratagems.json');
  const jsonContent = JSON.stringify(stratagems, null, 2)
    .replace(/"sequence": \[\n\s+([^\]]+)\]/g, (match, inner) => {
      const items = inner.match(/"[WASD]"/g);
      return `"sequence": [${items ? items.join(', ') : ''}]`;
    });
  fs.writeFileSync(jsonPath, jsonContent);

  console.log(`\n========================================`);
  console.log(`Generated ${stratagems.length} stratagem icons`);
  console.log(`Output: ${outputDir}`);
  console.log(`  - icons/     (${stratagems.length} PNGs @ ${ICON_SIZE}px)`);
  console.log(`  - stratagems.json`);

  // Check for missing sequences
  const missingSequences = stratagems.filter(s => s.sequence.length === 0);
  if (missingSequences.length > 0) {
    console.log(`\nWARNING: ${missingSequences.length} stratagems missing sequences:`);
    for (const s of missingSequences) {
      console.log(`  - ${s.name}`);
    }
  }

  // Clean up temp
  fs.rmSync(tempDir, { recursive: true });
  console.log('\nCleaned up temp files.');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
