import { readFileSync } from 'fs';
import { watch } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { spawn } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3456;
const mdPath = resolve(__dirname, 'ink-tutorial.md');
const htmlPath = resolve(__dirname, 'index.html');

// ── Build once on start ────────────────────────────────────────
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

// ── Create HTTP server ─────────────────────────────────────────
const server = createServer((req, res) => {
  if (req.url === '/') {
    try {
      const html = readFileSync(htmlPath, 'utf-8');
      // Inject live-reload script
      const injected = html.replace('</body>', `
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
</body>`);
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache',
      });
      res.end(injected);
    } catch (err) {
      res.writeHead(500);
      res.end(`Build error: ${err.message}\nRun \`npm run build\` first.`);
    }
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

// ── WebSocket for live reload ──────────────────────────────────
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ server });
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

// ── Start ──────────────────────────────────────────────────────
async function start() {
  await build();

  server.listen(PORT, () => {
    console.log(`\n🚀 Live at http://localhost:${PORT}`);
    console.log('   Watching ink-tutorial.md for changes...\n');
  });

  // Watch the markdown file
  let debounceTimer;
  watch(mdPath, async (eventType) => {
    if (eventType === 'change') {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(async () => {
        try {
          await build();
          reloadClients();
        } catch {
          // Build errors are already printed
        }
      }, 300);
    }
  });
}

start();
