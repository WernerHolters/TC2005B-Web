<!doctype html>
<html lang="es" data-theme="dark">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>HTML + CSS Live Lab (Turbo)</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <header class="topbar">
    <h1 class="brand">HTML + CSS Live Lab</h1>
    <div class="actions">
      <button id="runBtn" class="btn primary" type="button">Run</button>
      <button id="resetBtn" class="btn" type="button">Reset</button>
      <button id="themeBtn" class="btn" type="button">Tema</button>
      <button id="inspectorBtn" class="btn ghost" type="button" aria-pressed="false">Inspector</button>
      <button id="validatorBtn" class="btn ghost" type="button" aria-pressed="true">Validador</button>
      <label class="auto">
        <input id="autoRun" type="checkbox" checked />
        Auto-run
      </label>
    </div>
  </header>

  <main class="layout">
    <aside class="sidebar">
      <h2>Conceptos</h2>
      <div id="conceptList" class="concept-list"></div>
    </aside>

    <section class="workspace">
      <div class="editors">
        <div class="editor">
          <label for="htmlEditor">HTML</label>
          <textarea id="htmlEditor" spellcheck="false" placeholder="Escribe tu HTML aquí..."></textarea>
        </div>
        <div class="editor">
          <label for="cssEditor">CSS</label>
          <textarea id="cssEditor" spellcheck="false" placeholder="Escribe tu CSS aquí..."></textarea>
        </div>
      </div>

      <div id="validatorPanel" class="validator-panel" aria-live="polite"></div>

      <div class="challenge">
        <strong>Reto:</strong>
        <span id="challengeText">Elige un concepto y juega.</span>
        <div class="challenge-actions">
          <button id="showSolutionBtn" class="btn" type="button">Ver ejemplo</button>
          <button id="randomizeBtn" class="btn ghost" type="button">Otro reto</button>
        </div>
      </div>

      <div class="preview-wrap">
        <iframe id="preview" title="Vista previa" sandbox="allow-scripts allow-same-origin"></iframe>
      </div>
    </section>
  </main>

  <!-- Dataset base (pequeño). El app.js suma un PACK GIGANTE. -->
  <script type="application/json" id="concepts-data">
  {
    "headings-paragraphs": {
      "title": "Títulos & Párrafos",
      "html": "<h1>Bienvenid@</h1><p>Párrafo con <strong>negritas</strong> y <em>énfasis</em>.</p>",
      "css": "body{font-family:system-ui,sans-serif;line-height:1.6} h1{font-size:2rem}",
      "challenge": "Agrega un h2 y un párrafo extra."
    },
    "images": {
      "title": "Imágenes",
      "html": "<figure><img src=\\"https://picsum.photos/640/360\\" alt=\\"Paisaje aleatorio\\"><figcaption>Imagen de ejemplo</figcaption></figure>",
      "css": "img{max-width:100%;border-radius:12px;display:block} figure{margin:0;display:grid;gap:.5rem}",
      "challenge": "Añade srcset y sizes."
    },
    "flexbox": {
      "title": "Flexbox",
      "html": "<div class=\\"row\\"><div class=\\"card\\">1</div><div class=\\"card\\">2</div><div class=\\"card\\">3</div></div>",
      "css": ".row{display:flex;gap:12px}.card{flex:1;padding:16px;background:#f2f2f2;border-radius:8px;text-align:center}",
      "challenge": "Centra vertical y permite wrap."
    }
  }
  </script>

  <script src="app.js" defer></script>
</body>
</html>
