import { readFileSync } from 'fs';
import { watch } from 'fs';
import { resolve, dirname, join, extname } from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { spawn } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3456;
const knowledgeDir = resolve(__dirname, 'knowledges');
const distDir = resolve(__dirname, 'dist');

// ── Build ─────────────────────────────────────────────────────────
function build() {
  console.log('🔨 Building...');
  return new Promise((resolveBuild, rejectBuild) => {
    const proc = spawn('node', ['build.js'], {
      cwd: __dirname,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let output = '';
    proc.stdout.on('data', (d) => { output += d.toString(); });
    proc.stderr.on('data', (d) => { output += d.toString(); });
    proc.on('close', (code) => {
      if (code === 0) {
        console.log(output.trim());
        resolveBuild();
      } else {
        console.error('Build failed:\n', output);
        rejectBuild(new Error(`Build exited with code ${code}`));
      }
    });
  });
}

// ── Live-reload script injected into served HTML ──────────────────
const LIVERELOAD_SCRIPT = `
  <script>
    (function() {
      var ws = new WebSocket('ws://' + location.host + '/__livereload');
      ws.onmessage = function(msg) {
        if (msg.data === 'reload') {
          console.log('🔄 File changed — reloading...');
          location.reload();
        }
      };
      ws.onclose = function() {
        console.log('Live reload disconnected — reloading in 2s...');
        setTimeout(function() { location.reload(); }, 2000);
      };
    })();
  </script>
`;

// ── Create HTTP server ────────────────────────────────────────────
const server = createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  let filePath;

  if (url.pathname === '/') {
    filePath = join(distDir, 'index.html');
  } else if (url.pathname.startsWith('/knowledge/')) {
    const slug = url.pathname.replace('/knowledge/', '').replace(/\/$/, '');
    filePath = join(distDir, 'knowledge', `${slug}.html`);
  } else {
    // Try serving directly from dist/ (future static assets)
    filePath = join(distDir, url.pathname);
  }

  try {
    const content = readFileSync(filePath, 'utf-8');
    const injected = content.replace('</body>', `${LIVERELOAD_SCRIPT}</body>`);
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache',
    });
    res.end(injected);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
});

// ── WebSocket for live reload ─────────────────────────────────────
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ server, path: '/__livereload' });
const clients = new Set();
wss.on('connection', (ws) => {
  clients.add(ws);
  ws.on('close', () => clients.delete(ws));
});

function reloadClients() {
  for (const ws of clients) {
    try { ws.send('reload'); } catch {}
  }
}

// ── Start ─────────────────────────────────────────────────────────
async function start() {
  await build();

  server.listen(PORT, () => {
    console.log(`\n🚀 Live at http://localhost:${PORT}`);
    console.log('   Watching knowledges/ for changes...\n');
  });

  // Watch knowledges/ directory recursively
  let debounceTimer;
  watch(knowledgeDir, { recursive: true }, async (eventType, filename) => {
    if (!filename || !filename.endsWith('.md')) return;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      try {
        await build();
        reloadClients();
      } catch {
        // Build errors already printed
      }
    }, 300);
  });
}

start();
