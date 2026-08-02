// bin/lib/ui-kit.cjs
// Kit de UI para terminal — zero dependencias externas

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
  white: '\x1b[37m',
};

const symbols = {
  check: '✅',
  cross: '❌',
  warn: '⚠️',
  info: 'ℹ️',
  shield: '🛡️',
  rocket: '🚀',
  lock: '🔒',
  search: '🔍',
  blueprint: '📐',
  star: '⭐',
  arrow: '└─>',
  dot: '●',
};

function box(title, lines, width = 65) {
  const top = '┌' + '─'.repeat(width - 2) + '┐';
  const bottom = '└' + '─'.repeat(width - 2) + '┘';
  const titleLine = '│ ' + colors.bright + colors.cyan + title.padEnd(width - 4) + colors.reset + ' │';

  let content = lines.map(l => {
    const clean = l.replace(/\x1b\[\d+m/g, '');
    const pad = width - 4 - clean.length;
    return '│ ' + l + ' '.repeat(Math.max(0, pad)) + ' │';
  });

  return [top, titleLine, '│' + ' '.repeat(width - 2) + '│', ...content, '│' + ' '.repeat(width - 2) + '│', bottom].join('\n');
}

function progressBar(label, percent, width = 40) {
  const filled = Math.round((percent / 100) * width);
  const empty = width - filled;
  const bar = colors.green + '█'.repeat(filled) + colors.dim + '░'.repeat(empty) + colors.reset;
  return `${colors.dim}${label}${colors.reset} [${bar}] ${colors.bright}${percent}%${colors.reset}`;
}

function spinner(frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']) {
  let i = 0;
  return {
    next: () => frames[i++ % frames.length],
    frames,
  };
}

async function animatedProgress(label, durationMs = 2000, steps = 10) {
  const spin = spinner();
  const start = Date.now();

  return new Promise(resolve => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const percent = Math.min(100, Math.round((elapsed / durationMs) * 100));
      const frame = spin.next();
      process.stdout.write(`\r${colors.cyan}${frame}${colors.reset} ${progressBar(label, percent)}`);

      if (percent >= 100) {
        clearInterval(interval);
        process.stdout.write('\n');
        resolve();
      }
    }, durationMs / steps);
  });
}

function printHeader(title, subtitle = '') {
  const width = 65;
  console.log(`\n${colors.bright}${colors.cyan}${'═'.repeat(width)}${colors.reset}`);
  console.log(`${colors.bright}${colors.magenta} ${symbols.shield} ${title.toUpperCase()}${colors.reset}`);
  if (subtitle) console.log(`${colors.dim} ${subtitle}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}${'═'.repeat(width)}${colors.reset}\n`);
}

function printSuccess(msg) {
  console.log(` ${colors.green}${symbols.check} ${msg}${colors.reset}`);
}

function printWarning(msg) {
  console.log(` ${colors.yellow}${symbols.warn} ${msg}${colors.reset}`);
}

function printError(msg) {
  console.log(` ${colors.red}${symbols.cross} ${msg}${colors.reset}`);
}

function printInfo(msg) {
  console.log(` ${colors.cyan}${symbols.info} ${msg}${colors.reset}`);
}

function printStep(number, total, label) {
  console.log(`\n${colors.bright}${colors.yellow}🔍 Fase ${number}/${total}: ${label}${colors.reset}`);
}

function printSubStep(label, status = 'pending') {
  const icon = status === 'done' ? colors.green + '✓' : status === 'error' ? colors.red + '✗' : colors.dim + '○';
  console.log(`   ${colors.dim}${symbols.arrow}${colors.reset} ${label} ${icon}${colors.reset}`);
}

function clearLine() {
  process.stdout.write('\r' + ' '.repeat(80) + '\r');
}

module.exports = {
  colors, symbols, box, progressBar, spinner,
  animatedProgress, printHeader, printSuccess,
  printWarning, printError, printInfo, printStep,
  printSubStep, clearLine
};
