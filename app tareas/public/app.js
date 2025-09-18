/* HTML + CSS Live Lab — Turbo Runtime con Inspector + Validador (Agosto 2025) */

(function boot(){ document.readyState==="loading"?document.addEventListener("DOMContentLoaded",init,{once:true}):init(); })();

function init(){
  "use strict";
  const $  = (s,c=document)=>c.querySelector(s);
  const $$ = (s,c=document)=>Array.from(c.querySelectorAll(s));

  // ---------- Elements
  const els = {
    htmlEditor: $("#htmlEditor"),
    cssEditor:  $("#cssEditor"),
    preview:    $("#preview"),
    runBtn:     $("#runBtn"),
    resetBtn:   $("#resetBtn"),
    themeBtn:   $("#themeBtn"),
    autoRun:    $("#autoRun"),
    conceptList:$("#conceptList"),
    challengeText: $("#challengeText"),
    showSolutionBtn: $("#showSolutionBtn"),
    randomizeBtn: $("#randomizeBtn"),
    inspectorBtn: $("#inspectorBtn"),
    validatorBtn: $("#validatorBtn"),
    validatorPanel: $("#validatorPanel")
  };

  // Guard estricto
  for(const k of ["htmlEditor","cssEditor","preview","conceptList","inspectorBtn","validatorBtn","validatorPanel"]){
    if(!els[k]) return alert("Faltan elementos base. Revisa index.html");
  }
  els.challengeText?.setAttribute("aria-live","polite");

  // ---------- Dataset: lee pequeño desde index.html y suma PACKS gigantes
  let fromHTML = {};
  try { fromHTML = JSON.parse($("#concepts-data")?.textContent || "{}"); } catch {}

  // ---------- PACK 1 (base + comunes)
  const extraConcepts = {
    "forms": { title:"Formularios",
      html:`<h2>Contacto</h2>
<form>
  <label>Nombre <input type="text" placeholder="Tu nombre"></label><br>
  <label>Email <input type="email" placeholder="tucorreo@dominio.com" required></label><br>
  <label>Mensaje<br><textarea rows="4" placeholder="Escribe algo..."></textarea></label><br>
  <button type="submit">Enviar</button>
</form>`,
      css:`label{display:block;margin:.5rem 0}
input,textarea{width:100%;padding:.5rem;border:1px solid #ccc;border-radius:8px}
button{padding:.5rem .8rem;border-radius:8px;border:1px solid #888}`,
      challenge:"Valida el email con pattern simple.",
      solution:`<input type="email" required pattern="[^\\s@]+@[^\\s@]+\\.[^\\s@]+">`
    },
    "tables": { title:"Tablas",
      html:`<table>
  <caption>Ventas mensuales</caption>
  <thead><tr><th>Mes</th><th>Total</th></tr></thead>
  <tbody><tr><td>Enero</td><td>$12,000</td></tr><tr><td>Febrero</td><td>$9,500</td></tr></tbody>
</table>`,
      css:`table{border-collapse:collapse;width:100%}
th,td{border:1px solid #ddd;padding:.6rem}
thead{background:#f5f5f5;font-weight:700} caption{margin-bottom:.5rem}`,
      challenge:"Zebra + sticky header.",
      solution:`tbody tr:nth-child(odd){background:#fafafa}
thead th{position:sticky;top:0;background:#eee}`
    },
    "semantic": { title:"HTML Semántico",
      html:`<header><h1>Mi Blog</h1></header>
<nav><a href="#">Inicio</a> · <a href="#">Artículos</a> · <a href="#">Contacto</a></nav>
<main>
  <article>
    <h2>Primer Post</h2>
    <p>Contenido del artículo...</p>
  </article>
</main>
<footer>&copy; 2025</footer>`,
      css:`header,nav,main,footer{padding:.5rem;border:1px solid #ddd;border-radius:8px;margin:.4rem 0}`,
      challenge:"Agrega <aside> con enlaces relacionados y una <section>."
    },
    "colors-units": { title:"Colores & Unidades",
      html:`<div class="swatch">Color demo</div><p>Prueba rem, em, %, vw/vh.</p>`,
      css:`:root{--brand:hsl(200 80% 50%)}
.swatch{background:var(--brand);color:#fff;padding:1rem;font-size:clamp(1rem,2.5vw,1.5rem)}`,
      challenge:"Cambia a HSL y usa clamp() para padding.",
      solution:`.swatch{padding:clamp(.75rem,2vw,2rem)}`
    },
    "typography": { title:"Tipografía",
      html:`<h1>Título</h1><p>Texto con <em>énfasis</em> y <strong>fuerza</strong>.</p>`,
      css:`h1{letter-spacing:.02em} p{max-width:60ch;text-wrap:pretty}`,
      challenge:"Ajusta interlineado y ancho máximo.",
      solution:`p{line-height:1.8;max-width:65ch}`
    },
    "positioning": {
      title: "Positioning",
      html: `<div class="wrap"><div class="badge">NEW</div>Tarjeta con badge</div>`,
      css: `.wrap{position:relative;padding:1rem;border:1px solid #ccc;border-radius:10px}
.badge{position:absolute;top:-10px;right:-10px;background:#0ea5e9;color:#00202b;padding:.25rem .5rem;border-radius:999px}`,
      challenge: "Prueba sticky en la badge.",
      solution: `.badge{position:sticky;top:0}`
    },
    "transitions": {
      title: "Transiciones",
      html: `<button class="cta">Hover yo</button>`,
      css: `.cta{padding:.8rem 1rem;border-radius:12px;border:1px solid #222;transition:transform .15s ease, box-shadow .2s ease}
.cta:hover{transform:translateY(-2px) scale(1.02);box-shadow:0 10px 20px rgba(0,0,0,.12)}`,
      challenge: "Agrega rotate y focus-visible.",
      solution: `.cta:hover{transform:translateY(-2px) scale(1.02) rotate(-1deg)} .cta:focus-visible{outline:3px solid #0ea5e9}`
    },
    "animations": {
      title: "Animaciones",
      html: `<div class="loader"></div>`,
      css: `.loader{width:48px;height:48px;border-radius:50%;
background:conic-gradient(#0ea5e9,#0284c7,#22c55e,#0ea5e9);
mask:radial-gradient(circle at center, transparent 45%, #000 46%);
animation:spin 1s linear infinite}
@keyframes spin{50%{transform:rotate(180deg) scale(1.05)} to{transform:rotate(360deg)}}`,
      challenge: "Añade 'breathe' (scale) en 50% (ya aplicado)."
    },
    "pseudo": {
      title: "Pseudo: clases/elementos",
      html: `<a href="#" class="btnx">Botón</a><p class="note">Nota</p>`,
      css: `.btnx{display:inline-block;padding:.5rem .8rem;border:1px solid #999;border-radius:10px}
.btnx:hover{background:#f5f5f5}
.note::before{content:"💡 "}`,
      challenge: "Usa :not(), :nth-child(), ::after con icono."
    },
    "css-variables": {
      title: "Variables, calc(), clamp()",
      html: `<div class="card">Resize la ventana y mira el padding.</div>`,
      css: `:root{--space:clamp(12px,2vw,24px);--radius:12px}
.card{padding:var(--space);border-radius:var(--radius);border:1px solid #ddd}`,
      challenge: "Usa calc() para font-size dependiente del espacio.",
      solution: `.card{font-size:calc(12px + var(--space)/6)}`
    },
    "responsive-images": {
      title: "Imágenes Responsivas",
      html: `<img
  src="https://picsum.photos/640/360"
  srcset="https://picsum.photos/480/270 480w, https://picsum.photos/640/360 640w, https://picsum.photos/960/540 960w"
  sizes="(max-width:600px) 480px, 640px"
  alt="Demo responsive image">`,
      css: `img{max-width:100%;border-radius:12px;display:block}`,
      challenge: "Añade aspect-ratio y object-fit.",
      solution: `img{aspect-ratio:16/9;object-fit:cover}`
    },
    "backgrounds": {
      title: "Backgrounds & Gradients",
      html: `<div class="hero"><h2>Gradiente</h2></div>`,
      css: `.hero{padding:2rem;border-radius:12px;color:#fff;background:linear-gradient(135deg,#0ea5e9,#22c55e)}`,
      challenge: "Cambia a radial + overlay ::after.",
      solution: `.hero{position:relative}.hero::after{content:"";position:absolute;inset:0;background:rgba(0,0,0,.15);border-radius:12px}`
    },
    "zindex": {
      title: "z-index & stacking",
      html: `<div class="stack"><div class="a">A</div><div class="b">B</div></div>`,
      css: `.stack{position:relative;height:120px}
.a,.b{position:absolute;inset:10px;border-radius:10px;display:grid;place-items:center;color:#fff;font-weight:800}
.a{background:#0ea5e9;z-index:1;transform:translate(10px,10px)}
.b{background:#22c55e;z-index:2}`,
      challenge: "Intercambia stacking sin cambiar el DOM.",
      solution: `.a{z-index:3} .b{z-index:1}`
    },
    "flexbox-advanced": {
      title: "Flexbox Avanzado",
      html: `<div class="row"><div class="card">A</div><div class="card">B</div><div class="card">C</div></div>`,
      css: `.row{display:flex;gap:12px}.card{flex:1;padding:16px;background:#f2f2f2;text-align:center;border-radius:8px}`,
      challenge: "Usa order y align-self para reacomodar solo la B.",
      solution: `.row .card:nth-child(2){order:-1;align-self:stretch}`
    },
    "grid-areas": {
      title: "CSS Grid Areas",
      html: `<div class="grid">
  <header>Header</header><nav>Nav</nav><main>Main</main><aside>Aside</aside><footer>Footer</footer>
</div>`,
      css: `.grid{display:grid;gap:10px;
grid-template:
  "header header" auto
  "nav    main" 1fr
  "aside  main" 1fr
  "footer footer" auto / 200px 1fr}
.grid>*{background:#e9f5ff;padding:10px;border-radius:8px;text-align:center}
header{grid-area:header}nav{grid-area:nav}main{grid-area:main}aside{grid-area:aside}footer{grid-area:footer}`,
      challenge: "3 cols en desktop y 1 en mobile."
    },
    "media-queries": {
      title: "Media Queries",
      html: `<p>Redimensiona la ventana. Cambia el color según el ancho.</p>`,
      css: `p{padding:1rem;border-radius:8px;background:#f5f5f5}
@media (max-width:600px){p{color:#0ea5e9}}
@media (min-width:901px){p{color:#22c55e}}`,
      challenge: "Breakpoint intermedio púrpura.",
      solution: `@media (min-width:601px) and (max-width:900px){p{color:rebeccapurple}}`
    },
    "aspect-ratio": {
      title: "Aspect Ratio",
      html: `<div class="frame"><img src="https://picsum.photos/800" alt="demo"></div>`,
      css: `.frame{aspect-ratio:16/9;overflow:hidden;border-radius:12px}
.frame img{width:100%;height:100%;object-fit:cover}`,
      challenge: "Cambia a 1:1 y redondea más.",
      solution: `.frame{aspect-ratio:1/1;border-radius:20px}`
    }
  };

  // ---------- PACK 2 (ultra, un montón de temas)
  const ultraConcepts = {
    "holy-grail": {
      title: "Layout Holy Grail",
      html: `<header>Header</header>
<div class="wrap">
  <nav>Nav</nav>
  <main>Main</main>
  <aside>Aside</aside>
</div>
<footer>Footer</footer>`,
      css: `body{margin:0}header,footer,nav,main,aside{padding:10px;border-radius:8px;background:#f5f7fb}
.wrap{display:grid;gap:10px;grid-template:"nav main aside" 1fr / 200px 1fr 200px}
@media(max-width:800px){.wrap{grid-template:"nav"auto "main"auto "aside"auto/1fr}}`,
      challenge: "Haz sticky el nav en desktop."
    },
    "navbar-responsive": {
      title: "Navbar Responsive (CSS)",
      html: `<header class="nav">
  <input id="menu" type="checkbox" hidden>
  <div class="brand">Brand</div>
  <label for="menu" class="burger" aria-label="Abrir menú">☰</label>
  <nav class="links">
    <a href="#">Inicio</a><a href="#">Docs</a><a href="#">Blog</a><a href="#">Contacto</a>
  </nav>
</header>`,
      css: `.nav{display:flex;align-items:center;gap:12px;padding:10px;border:1px solid #ddd;border-radius:12px}
.links{margin-left:auto;display:flex;gap:10px}.burger{display:none;cursor:pointer}
@media(max-width:700px){.burger{display:block;margin-left:auto}.links{display:none}#menu:checked~.links{display:flex;flex-direction:column;gap:8px;width:100%}}`,
      challenge: "Añade :focus-visible y cierre con :has()."
    },
    "hero-pattern": {
      title: "Hero con patrón (CSS)",
      html: `<section class="hero"><h1>Aprende HTML + CSS</h1><p>Diseño fluido y moderno.</p></section>`,
      css: `.hero{padding:2.2rem;border-radius:16px;color:#0b1220;background:
radial-gradient(circle at 20% 10%, rgba(14,165,233,.25), transparent 40%),
radial-gradient(circle at 80% 30%, rgba(34,197,94,.25), transparent 40%),
conic-gradient(from 180deg at 50% 50%, #eef5ff, #f8fbff) }`,
      challenge: "Agrega overlay con ::after."
    },
    "cards-gallery": {
      title: "Galería de Cards",
      html: `<div class="cards">
  <article><h3>Card 1</h3><p>Contenido</p></article>
  <article><h3>Card 2</h3><p>Contenido</p></article>
  <article><h3>Card 3</h3><p>Contenido</p></article>
  <article><h3>Card 4</h3><p>Contenido</p></article>
</div>`,
      css: `.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}
.cards article{padding:12px;border:1px solid #ddd;border-radius:12px;background:#fff}`,
      challenge: "Hover con translate y shadow."
    },
    "accordion-css": {
      title: "Accordión (solo CSS)",
      html: `<div class="acc">
  <details open><summary>Sección 1</summary><p>Contenido 1</p></details>
  <details><summary>Sección 2</summary><p>Contenido 2</p></details>
</div>`,
      css: `.acc details{border:1px solid #ddd;border-radius:12px;margin:.4rem 0;overflow:hidden}
.acc summary{cursor:pointer;padding:.6rem .8rem;font-weight:700}
.acc p{padding:.6rem .8rem;border-top:1px solid #eee}`,
      challenge: "Cierra uno cuando abres otro con :has()."
    },
    "breadcrumbs": {
      title: "Breadcrumbs",
      html: `<nav aria-label="Breadcrumb" class="bc">
  <a href="/">Home</a> / <a href="/blog">Blog</a> / <span aria-current="page">Post</span>
</nav>`,
      css: `.bc{color:#6b7280} .bc a{color:#0ea5e9;text-decoration:none}`,
      challenge: "Reemplaza '/' por ::before con un icono."
    },
    "pagination": {
      title: "Paginación",
      html: `<nav class="pg" role="navigation" aria-label="Pagination">
  <a href="#" aria-label="Prev">«</a>
  <a href="#" class="is-active">1</a>
  <a href="#">2</a>
  <a href="#">3</a>
  <a href="#" aria-label="Next">»</a>
</nav>`,
      css: `.pg{display:flex;gap:6px}
.pg a{padding:.4rem .6rem;border:1px solid #ddd;border-radius:8px;text-decoration:none}
.pg .is-active{background:#0ea5e9;color:#012;border-color:#0ea5e9}`,
      challenge: "Usa :focus-visible y aria-current."
    },
    "table-responsive": {
      title: "Tabla Responsive (wrap)",
      html: `<div class="tbl-wrap">
<table>
  <thead><tr><th>Producto</th><th>SKU</th><th>Precio</th><th>Stock</th></tr></thead>
  <tbody>
    <tr><td>Camisa</td><td>AB-123</td><td>$399</td><td>20</td></tr>
    <tr><td>Jeans</td><td>CD-456</td><td>$799</td><td>8</td></tr>
  </tbody>
</table>
</div>`,
      css: `.tbl-wrap{overflow:auto;border:1px solid #eee;border-radius:12px}
table{border-collapse:collapse;min-width:520px;width:100%}
th,td{border:1px solid #eee;padding:.6rem;text-align:left}
thead{background:#f9fafb}`,
      challenge: "Agrega sombras en scroll usando mask."
    },
    "forms-advanced": {
      title: "Form: validación nativa",
      html: `<form novalidate>
  <label>Correo <input type="email" required placeholder="tu@correo.com"></label>
  <label>Contraseña <input type="password" required minlength="6"></label>
  <button>Enviar</button>
</form>`,
      css: `input:user-invalid{outline:2px solid #f87171}
input:user-valid{outline:2px solid #22c55e} label{display:block;margin:.5rem 0}`,
      challenge: "Muestra mensaje con :has(input:user-invalid)."
    },
    "grid-masonry": {
      title: "Masonry (columns)",
      html: `<div class="masonry">
  <div class="box">1<br>lorem ipsum</div>
  <div class="box">2</div>
  <div class="box">3<br>más<br>alto</div>
  <div class="box">4</div>
</div>`,
      css: `.masonry{columns:2 220px;column-gap:12px}
.masonry .box{display:inline-block;width:100%;margin:0 0 12px 0;padding:12px;background:#e9f5ff;border-radius:12px}`,
      challenge: "Ajusta columnas según el ancho."
    },
    "grid-auto-dense": {
      title: "Grid auto-flow: dense",
      html: `<div class="g">
  <div class="a">A</div><div class="b">B</div><div class="c">C</div><div class="d">D</div>
</div>`,
      css: `.g{display:grid;gap:10px;grid-template-columns:repeat(4,1fr);grid-auto-flow:dense}
.a{grid-column:span 2}.c{grid-column:span 3}
.g>*{background:#f1f5ff;border-radius:10px;padding:10px;text-align:center}`,
      challenge: "Haz que .d ocupe 2 filas."
    },
    "shapes-css": {
      title: "CSS Shapes",
      html: `<img class="float" src="https://picsum.photos/200" alt=""><p>
  Texto que rodea una imagen circular usando shape-outside. Duplica el texto para ver mejor el flujo.
</p>`,
      css: `.float{float:left;width:160px;height:160px;shape-outside:circle(50%);clip-path:circle(50%);margin:6px 12px 6px 0;object-fit:cover;border-radius:50%}`,
      challenge: "Cambia a polygon para forma de gota."
    },
    "triangle-css": {
      title: "Triángulos con CSS",
      html: `<div class="tri"></div>`,
      css: `.tri{width:0;height:0;border-left:40px solid transparent;border-right:40px solid transparent;border-bottom:60px solid #0ea5e9}`,
      challenge: "Crea una flecha con ::after."
    },
    "conic-gradient": {
      title: "Conic gradients",
      html: `<div class="pie"></div>`,
      css: `.pie{width:160px;height:160px;border-radius:50%;
background:conic-gradient(#0ea5e9 0 40%,#22c55e 0 70%,#f59e0b 0 100%)}`,
      challenge: "Anima la tarta con rotate."
    },
    "blend-modes": {
      title: "Blend Modes",
      html: `<div class="blend"><img src="https://picsum.photos/id/1025/600/360" alt=""><div class="overlay">Texto</div></div>`,
      css: `.blend{position:relative}
.blend img{display:block;max-width:100%}
.overlay{position:absolute;inset:0;display:grid;place-items:center;font-size:2rem;color:#fff;mix-blend-mode:overlay}`,
      challenge: "Prueba screen, multiply, difference."
    },
    "filters-advanced": {
      title: "drop-shadow & backdrop",
      html: `<div class="glass">Glassmorphism</div>`,
      css: `.glass{padding:1rem 1.4rem;border-radius:14px;background:rgba(255,255,255,.18);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.35);filter:drop-shadow(0 10px 18px rgba(0,0,0,.15))}`,
      challenge: "Ajusta blur y sombra al hover."
    },
    "transform-3d": {
      title: "3D: perspective",
      html: `<div class="stage"><div class="card3d">Flip</div></div>`,
      css: `.stage{perspective:800px}
.card3d{width:160px;height:100px;display:grid;place-items:center;background:#0ea5e9;color:#012;border-radius:12px;transform:rotateY(0);transition:transform .4s}
.card3d:hover{transform:rotateY(20deg)}`,
      challenge: "Agrega backface-visibility con dos caras."
    },
    "parallax-simple": {
      title: "Parallax simple (CSS)",
      html: `<div class="parallax"><div class="layer">Capa</div></div>`,
      css: `.parallax{height:200px;overflow:auto;perspective:1px}
.layer{height:300px;transform:translateZ(-0.5px) scale(1.5);background:linear-gradient(120deg,#0ea5e9,#22c55e);display:grid;place-items:center;color:#012}`,
      challenge: "Añade texto fijo por encima."
    },
    "print-page-breaks": {
      title: "Cortes de página (print)",
      html: `<article>
  <h1>Reporte</h1><p>Sección 1…</p><hr>
  <h2 class="break">Nueva página</h2><p>Sección 2…</p>
</article>`,
      css: `@media print{ .break{ break-before: page } }`,
      challenge: "Oculta colores en impresión."
    },
    "aria-landmarks": {
      title: "ARIA Landmarks",
      html: `<header role="banner">Header</header>
<nav role="navigation">Nav</nav>
<main role="main">Main</main>
<footer role="contentinfo">Footer</footer>`,
      css: `header,nav,main,footer{padding:8px;border:1px solid #ddd;border-radius:12px;margin:.3rem 0}`,
      challenge: "Agrega aria-label y verifica con devtools."
    },
    "tooltip-aria": {
      title: "Tooltip accesible",
      html: `<button id="btn" aria-describedby="tt">Pasa el mouse</button>
<span id="tt" role="tooltip" hidden>Tooltip accesible</span>
<script>
btn.addEventListener('mouseenter',()=>tt.hidden=false);
btn.addEventListener('mouseleave',()=>tt.hidden=true);
btn.addEventListener('focus',()=>tt.hidden=false);
btn.addEventListener('blur',()=>tt.hidden=true);
</script>`,
      css: `#tt{position:absolute;background:#111;color:#fff;padding:.35rem .5rem;border-radius:8px}`,
      challenge: "Posiciona el tooltip arriba centrado."
    },
    "toast-css": {
      title: "Toast (CSS+HTML)",
      html: `<div class="toast">Guardado ✅</div>`,
      css: `.toast{position:fixed;inset:auto 16px 16px auto;background:#0ea5e9;color:#012;padding:.6rem .9rem;border-radius:12px;box-shadow:0 10px 20px rgba(0,0,0,.12)}`,
      challenge: "Anima entrada/salida con @keyframes."
    },
    "sticky-footer": {
      title: "Sticky Footer",
      html: `<div class="page">
  <main>Contenido…</main>
  <footer>Footer</footer>
</div>`,
      css: `.page{min-height:60vh;display:grid;grid-template-rows:1fr auto}
footer{padding:10px;border:1px solid #ddd;border-radius:12px}`,
      challenge: "Extiende a 100vh sin romper scroll."
    },
    "centering-techniques": {
      title: "Centrado perfecto",
      html: `<div class="center"><div class="box">🎯</div></div>`,
      css: `.center{min-height:220px;display:grid;place-items:center;border:1px dashed #bbb;border-radius:12px}
.box{width:80px;height:80px;background:#e9f5ff;border-radius:12px;display:grid;place-items:center}`,
      challenge: "Replica con flex y con transform."
    },
    "object-fit": {
      title: "object-fit & position",
      html: `<div class="ph"><img src="https://picsum.photos/800" alt=""></div>`,
      css: `.ph{width:100%;max-width:420px;aspect-ratio:4/3;overflow:hidden;border-radius:12px}
.ph img{width:100%;height:100%;object-fit:cover;object-position:center}`,
      challenge: "Mueve el foco a top left con object-position."
    },
    "selection-caret": {
      title: "::selection & caret-color",
      html: `<p>Selecciona este texto y escribe en el input.</p><input placeholder="Escribe">`,
      css: `::selection{background:#0ea5e9;color:#012} input{caret-color:#22c55e}`,
      challenge: "Cambiar selección solo en <p>."
    },
    "accent-color": {
      title: "accent-color",
      html: `<label><input type="checkbox" checked> Opción</label><input type="range">`,
      css: `:root{--brand:#0ea5e9} input[type=checkbox],input[type=range]{accent-color:var(--brand)}`,
      challenge: "Crea tema alterno cambiando --brand."
    },
    "counters": {
      title: "Contadores CSS",
      html: `<ol class="steps"><li>Uno</li><li>Dos</li><li>Tres</li></ol>`,
      css: `.steps{counter-reset:step}.steps li{counter-increment:step}
.steps li::before{content:counter(step) ". ";font-weight:700}`,
      challenge: "Usa ::marker y personaliza números."
    },
    "counter-style": {
      title: "@counter-style",
      html: `<ul class="bullets"><li>A</li><li>B</li><li>C</li></ul>`,
      css: `@counter-style flecha { system: cyclic; symbols: "➜"; suffix: "  " }
.bullets{list-style:flecha}`,
      challenge: "Define tu estilo con emojis."
    },
    "layers": {
      title: "Cascade Layers (@layer)",
      html: `<p class="msg">Mensaje</p>`,
      css: `@layer base,theme;
@layer base{.msg{color:#111}}
@layer theme{.msg{color:#0ea5e9}}`,
      challenge: "Invierte orden para que gane base."
    },
    "is-where": {
      title: ":is() / :where()",
      html: `<ul class="menu"><li><a href="#">Home</a></li><li><a href="#">Docs</a></li></ul>`,
      css: `.menu :is(a,button){text-decoration:none} .menu :where(a){color:#0ea5e9}`,
      challenge: "Hover con :is() en links y botones."
    }
  };

  // ---------- Merge
  let concepts = { ...extraConcepts, ...ultraConcepts, ...fromHTML };
  if(!Object.keys(concepts).length){
    concepts = { "hello": { title:"Hola Mundo", html:`<h1>¡Hola!</h1>`, css:`h1{color:#0ea5e9}`, challenge:"Edita el color." } };
  }
  const conceptKeys = Object.keys(concepts);
  const DEFAULT_KEY = conceptKeys[0];

  // ---------- State
  const STORAGE_KEY = "htmlcss_live_lab_state_turbo_1";
  let state = {
    currentKey: DEFAULT_KEY,
    autoRun: true,
    theme: null,      // 'light'|'dark'
    inspector: false, // Box model
    validator: true,  // Hints
    edits: {}         // { key: { html, css } }
  };
  loadState();
  if(!concepts[state.currentKey]) state.currentKey = DEFAULT_KEY;

  // ---------- Tema
  (function initTheme(){
    const prefersLight = window.matchMedia?.("(prefers-color-scheme: light)")?.matches;
    const theme = state.theme || (prefersLight ? "light" : "dark");
    document.documentElement.setAttribute("data-theme", theme);
    state.theme = theme; saveState();
  })();
  els.themeBtn.addEventListener("click", ()=>{
    const next = state.theme==="dark"?"light":"dark";
    document.documentElement.setAttribute("data-theme", next);
    state.theme = next; saveState();
  });

  // ---------- UI inicial
  renderConceptButtons();
  hookEvents();
  loadConcept(state.currentKey, { render:true });
  runAndRenderValidation();

  // ============================================================
  //                        FUNCTIONS
  // ============================================================
  function renderConceptButtons(){
    els.conceptList.innerHTML = "";
    for(const key of Object.keys(concepts)){
      const btn = document.createElement("button");
      btn.className = "concept";
      if(key===state.currentKey) btn.classList.add("is-active");
      btn.dataset.key = key;
      btn.type = "button";
      btn.textContent = concepts[key].title || key;
      btn.addEventListener("click", ()=> loadConcept(key,{render:true}));
      els.conceptList.appendChild(btn);
    }
  }

  function setActiveConceptButton(key){
    $$(".concept-list .concept").forEach(b=>{
      b.classList.toggle("is-active", b.dataset.key===key);
    });
  }

  function hookEvents(){
    // Botones topbar
    els.runBtn.addEventListener("click", ()=>{ renderNow(); saveEdits(); runAndRenderValidation(); });
    els.resetBtn.addEventListener("click", resetCurrent);
    els.inspectorBtn.addEventListener("click", ()=>{
      state.inspector=!state.inspector; updateInspectorBtnUI(); renderNow(); saveState();
    });
    els.validatorBtn.addEventListener("click", ()=>{
      state.validator=!state.validator; updateValidatorBtnUI(); renderNow(); runAndRenderValidation(); saveState();
    });

    // Auto-run
    els.autoRun.checked = !!state.autoRun;
    els.autoRun.addEventListener("change", ()=>{ state.autoRun=!!els.autoRun.checked; saveState(); });

    // Inputs
    const renderDebounced   = debounce(renderNow, 180);
    const validateDebounced = debounce(runAndRenderValidation, 220);
    const onInput = ()=>{
      if(state.autoRun) renderDebounced();
      saveEdits();
      validateDebounced();
    };
    els.htmlEditor.addEventListener("input", onInput);
    els.cssEditor.addEventListener("input", onInput);

    // Reto
    els.showSolutionBtn.addEventListener("click", showSolution);
    els.randomizeBtn.addEventListener("click", ()=>{
      const pool = conceptKeys.filter(k=>k!==state.currentKey);
      const next = pool[Math.floor(Math.random()*pool.length)] || state.currentKey;
      loadConcept(next,{render:true});
    });

    updateInspectorBtnUI();
    updateValidatorBtnUI();
  }

  function updateInspectorBtnUI(){
    els.inspectorBtn.classList.toggle("primary", !!state.inspector);
    els.inspectorBtn.classList.toggle("ghost", !state.inspector);
    els.inspectorBtn.textContent = state.inspector ? "Inspector: ON" : "Inspector";
    els.inspectorBtn.setAttribute("aria-pressed", String(!!state.inspector));
  }
  function updateValidatorBtnUI(){
    els.validatorBtn.classList.toggle("primary", !!state.validator);
    els.validatorBtn.classList.toggle("ghost", !state.validator);
    els.validatorBtn.textContent = state.validator ? "Validador: ON" : "Validador";
    els.validatorBtn.setAttribute("aria-pressed", String(!!state.validator));
    els.validatorPanel.style.display = state.validator ? "block" : "none";
  }

  function getCurrentValues(){ return { html: els.htmlEditor.value, css: els.cssEditor.value }; }

  function loadConcept(key, {render=true}={}){
    if(!concepts[key]) return;
    state.currentKey = key;
    setActiveConceptButton(key);
    const def = concepts[key];
    const saved = state.edits[key];
    els.htmlEditor.value = saved?.html ?? (def.html || "");
    els.cssEditor.value  = saved?.css  ?? (def.css  || "");
    if(els.challengeText) els.challengeText.textContent = def.challenge || "Experimenta con el código.";
    if(render) renderNow();
    saveState();
  }

  function resetCurrent(){
    const key = state.currentKey;
    const def = concepts[key]; if(!def) return;
    els.htmlEditor.value = def.html || "";
    els.cssEditor.value  = def.css  || "";
    delete state.edits[key];
    renderNow(); saveState(); runAndRenderValidation();
  }

  function showSolution(){
    const key = state.currentKey; const def = concepts[key]; if(!def) return;
    const solHTML = def.solutionHtml || null, solCSS = def.solutionCss || null;
    if(solHTML || solCSS){
      if(solHTML) els.htmlEditor.value = [def.html||"", solHTML].filter(Boolean).join("\n");
      if(solCSS)  els.cssEditor.value  = [def.css||"",  solCSS ].filter(Boolean).join("\n");
    } else if(def.solution){
      const hasHTML = /</.test(def.solution);
      const hasCSS  = /{[^}]*}/s.test(def.solution);
      if(hasHTML) els.htmlEditor.value = [def.html||"", def.solution].filter(Boolean).join("\n");
      if(hasCSS)  els.cssEditor.value  = [def.css||"",  def.solution].filter(Boolean).join("\n");
      if(!hasHTML && !hasCSS) els.htmlEditor.value = [def.html||"", def.solution].filter(Boolean).join("\n");
    }
    saveEdits(); renderNow(); runAndRenderValidation();
  }

// ===== Reemplazar desde aquí =====
function makeDoc(html, css, { inspector=false, highlightIssues=false } = {}) {
  // Endurecemos <img>: forzamos https, añadimos atributos útiles y un onerror inline
  const safeHTML = (html || "").replace(/<img\b([^>]*?)>/gi, (full, attrs) => {
    let a = attrs || "";
    if (!/\bloading\s*=/.test(a)) a += ' loading="lazy"';
    if (!/\bdecoding\s*=/.test(a)) a += ' decoding="async"';
    if (!/\breferrerpolicy\s*=/.test(a)) a += ' referrerpolicy="no-referrer"';
    // Fallback inline por si el error ocurre antes de que cargue nuestro script
    if (!/\bonerror\s*=/.test(a)) {
      const placeholder = 'https://placehold.co/800x450/png?text=Imagen+no+disponible';
      a += ` onerror="this.onerror=null;this.src='${placeholder}'"`;
    }
    a = a.replace(/\bsrc\s*=\s*["']http:\/\//i, 'src="https://'); // no mixed content
    return `<img ${a}>`;
  });

  const inspCSS = inspector ? `
._insp-box{position:fixed;pointer-events:none;z-index:2147483646}
._insp-margin{background:rgba(255,145,0,.25)}
._insp-border{background:rgba(255,255,0,.30)}
._insp-padding{background:rgba(76,175,80,.28)}
._insp-content{background:rgba(33,150,243,.25)}
._insp-tip{position:fixed;z-index:2147483647;background:rgba(0,0,0,.85);color:#fff;padding:6px 8px;border-radius:6px;font:12px/1.2 system-ui,sans-serif;pointer-events:none;white-space:pre;transform:translate(8px,8px)}
` : "";

  const inspJS = inspector ? `
(function(){
  try{
    var m=document.createElement('div'),b=document.createElement('div'),p=document.createElement('div'),c=document.createElement('div'),t=document.createElement('div');
    m.className='_insp-box _insp-margin'; b.className='_insp-box _insp-border'; p.className='_insp-box _insp-padding'; c.className='_insp-box _insp-content'; t.className='_insp-tip';
    document.body.append(m,b,p,c,t);
    var cur=null,raf=0; function num(v){v=parseFloat(v);return isNaN(v)?0:v}
    function setBox(el,box){el.style.left=box.x+'px';el.style.top=box.y+'px';el.style.width=Math.max(0,box.width)+'px';el.style.height=Math.max(0,box.height)+'px'}
    function desc(el,rect,M,B,P){var tag=el.tagName.toLowerCase(),id=el.id?('#'+el.id):'',cl=(el.className&&typeof el.className==='string')?('.'+el.className.trim().split(/\\s+/).join('.')):'';var w=Math.round(rect.width),h=Math.round(rect.height);return tag+id+cl+'\\n'+w+'×'+h+' (content)\\nmargin: '+M.top+' '+M.right+' '+M.bottom+' '+M.left+'\\nborder: '+B.top+' '+B.right+' '+B.bottom+' '+B.left+'\\npadding: '+P.top+' '+P.right+' '+P.bottom+' '+P.left}
    function upd(el,mx,my){var cs=getComputedStyle(el),r=el.getBoundingClientRect(),M={top:num(cs.marginTop),right:num(cs.marginRight),bottom:num(cs.marginBottom),left:num(cs.marginLeft)},B={top:num(cs.borderTopWidth),right:num(cs.borderRightWidth),bottom:num(cs.borderBottomWidth),left:num(cs.borderLeftWidth)},P={top:num(cs.paddingTop),right:num(cs.paddingRight),bottom:num(cs.paddingBottom),left:num(cs.paddingLeft)},BB={x:r.left,y:r.top,width:r.width,height:r.height},MB={x:r.left-M.left,y:r.top-M.top,width:r.width+M.left+M.right,height:r.height+M.top+M.bottom},PB={x:r.left+B.left,y:r.top+B.top,width:r.width-B.left-B.right,height:r.height-B.top-B.bottom},CB={x:PB.x+P.left,y:PB.y+P.top,width:PB.width-P.left-P.right,height:PB.height-P.top-P-bottom};setBox(m,MB);setBox(b,BB);setBox(p,PB);setBox(c,CB);t.textContent=desc(el,CB,M,B,P);t.style.left=Math.min(innerWidth-200,(mx||r.left)+12)+'px';t.style.top=Math.min(innerHeight-120,(my||r.top)+12)+'px'}
    function move(e){if(raf)cancelAnimationFrame(raf);var mx=e.clientX,my=e.clientY;raf=requestAnimationFrame(function(){var el=document.elementFromPoint(mx,my);if(!el||el===document.documentElement||el===document.body)return;upd(el,mx,my)})}
    document.addEventListener('mousemove',move,{passive:true});
  }catch(e){}
})();` : "";

  const highJS = highlightIssues ? `
(function(){
  try{
    function mark(el,color){ el.style.outline='2px dashed '+color; el.style.outlineOffset='2px'; el.setAttribute('data-validated',''); }
    document.querySelectorAll('a[target="_blank"]:not([rel~="noopener"])').forEach(a=>mark(a,'#f97316'));
    document.querySelectorAll('img:not([alt])').forEach(img=>mark(img,'#ef4444'));
    document.querySelectorAll('li').forEach(li=>{var p=li.parentElement&&li.parentElement.tagName; if(p!=='UL'&&p!=='OL'&&p!=='MENU'){ mark(li,'#eab308'); }});
    document.querySelectorAll('a button, button a').forEach(el=>mark(el,'#e11d48'));
    var seen={}; document.querySelectorAll('[id]').forEach(n=>{var id=n.id; if(!id)return; seen[id]=(seen[id]||0)+1; if(seen[id]>1) mark(n,'#8b5cf6');});
  }catch(e){}
})();` : "";

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="referrer" content="no-referrer" />
<link rel="preconnect" href="https://picsum.photos" crossorigin>
<link rel="preconnect" href="https://placehold.co" crossorigin>
<style>
  *,*::before,*::after{box-sizing:border-box}
  body{margin:16px;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Arial;line-height:1.6}
  img{max-width:100%;height:auto;display:block}
  figure{margin:0}
  ${inspCSS}
</style>
<style>${css || ""}</style>
</head>
<body>
${safeHTML || ""}
<script>
// Fallback robusto de imágenes (cubre errores tempranos y silenciosos)
(function(){
  var PH = 'https://placehold.co/800x450/png?text=Imagen+no+disponible';
  function fallback(img){
    if(!img || img.__fb) return;
    img.__fb = true;
    img.src = PH;
    if(!img.alt) img.alt = 'Imagen de relleno';
  }
  // 1) Capturamos errores desde ya (fase de captura) — para cargas futuras
  document.addEventListener('error', function(e){
    var el = e.target;
    if (el && el.tagName === 'IMG') fallback(el);
  }, true);

  // 2) Al estar listo el DOM: reparamos fallos que ocurrieron ANTES de (1)
  window.addEventListener('DOMContentLoaded', function(){
    var imgs = document.querySelectorAll('img');
    imgs.forEach(function(img){
      // a) Si ya terminó y falló (naturalWidth==0), reemplazamos INMEDIATO
      if (img.complete && img.naturalWidth === 0) { fallback(img); return; }
      // b) Si aún no carga, aseguramos fallback cuando dispare error
      img.addEventListener('error', function(){ fallback(img); }, { once:true });
      // c) Revisión tardía (por si el servidor corta conexión sin lanzar 'error')
      setTimeout(function(){
        if (!img.__fb && img.complete && img.naturalWidth === 0) fallback(img);
      }, 2500);
    });
  });
})();
${highJS}
${inspJS}
</script>
</body>
</html>`;
}
// ===== Hasta aquí =====


  function renderNow(){
    const {html,css} = getCurrentValues();
    els.preview.srcdoc = makeDoc(html, css, { inspector: state.inspector, highlightIssues: state.validator });
  }

  function debounce(fn, ms){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a),ms); }; }

  function saveEdits(){ const v=getCurrentValues(); state.edits[state.currentKey]=v; saveState(); }
  function saveState(){ try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }catch{} }
  function loadState(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY); if(!raw) return;
      const parsed = JSON.parse(raw);
      if(parsed && typeof parsed==="object"){ state = { ...state, ...parsed, edits: parsed.edits || {} }; }
    }catch{}
  }

  // ---------- Validador (HTML + CSS básico)
  function runAndRenderValidation(){
    if(!state.validator) return;
    const {html, css} = getCurrentValues();
    const issues = [];

    // HTML checks
    try{
      const doc = new DOMParser().parseFromString(`<!doctype html><html><body>${html}</body></html>`, "text/html");
      // img sin alt
      doc.querySelectorAll("img:not([alt])").forEach(()=>issues.push({t:"error",w:"HTML",m:"<img> sin alt",h:"Agrega alt descriptivo o alt=\"\" si es decorativa"}));
      // ids duplicados
      const ids={}; doc.querySelectorAll("[id]").forEach(n=>{ const id=n.id; ids[id]=(ids[id]||0)+1; });
      Object.keys(ids).forEach(id=>{ if(ids[id]>1) issues.push({t:"error",w:"HTML",m:`id duplicado: ${id}`,h:"Cada id debe ser único"}); });
      // li fuera de listas
      doc.querySelectorAll("li").forEach(li=>{
        const p = li.parentElement?.tagName || "";
        if(!["UL","OL","MENU"].includes(p)) issues.push({t:"error",w:"HTML",m:"<li> fuera de <ul>/<ol>/<menu>",h:"Mete los li dentro de una lista"});
      });
      // target _blank sin rel
      doc.querySelectorAll('a[target="_blank"]:not([rel~="noopener"])').forEach(()=>{
        issues.push({t:"warn",w:"HTML",m:'<a target="_blank"> sin rel="noopener".',h:'Agrega rel="noopener noreferrer"'});
      });
      // interactivos anidados
      if(doc.querySelector("a button, button a")){
        issues.push({t:"error",w:"HTML",m:"Elemento interactivo anidado (<a>↔<button>)",h:"Evita anidar controles interactivos"});
      }
      // heading order
      const hs = Array.from(doc.querySelectorAll("h1,h2,h3,h4,h5,h6")).map(h=>+h.tagName[1]);
      if(hs.length){
        if(hs.filter(h=>h===1).length>1) issues.push({t:"warn",w:"HTML",m:"Múltiples <h1>",h:"Usa un solo h1 por página/sección"});
        for(let i=1;i<hs.length;i++){
          if(hs[i]-hs[i-1]>1){ issues.push({t:"warn",w:"HTML",m:`Salto h${hs[i-1]} → h${hs[i]}`,h:"Evita saltarte niveles"}); break; }
        }
      }
      // label sin control
      doc.querySelectorAll("label").forEach(l=>{
        if(!l.querySelector("input,select,textarea") && !l.hasAttribute("for")){
          issues.push({t:"warn",w:"HTML",m:"<label> sin control",h:"Usa for= o anida el control"});
        }
      });
    }catch{
      issues.push({t:"error",w:"HTML",m:"Parser no pudo leer tu HTML",h:"Revisa etiquetas sin cerrar"});
    }

    // CSS checks básicos
    const open=(css.match(/{/g)||[]).length, close=(css.match(/}/g)||[]).length;
    if(open!==close) issues.push({t:"error",w:"CSS",m:"Llaves { } desbalanceadas",h:"Cuenta { y }"});
    if(/\!important/.test(css)) issues.push({t:"info",w:"CSS",m:"Uso de !important",h:"Evítalo si puedes"});
    ["backgroud","marign","paddin","widht","heigth"].forEach(s=>{
      if(new RegExp(`\\b${s}\\b`).test(css)) issues.push({t:"error",w:"CSS",m:`¿Typo en "${s}"?`,h:"Revisa la propiedad"});
    });

    // Pintar panel
    const panel = els.validatorPanel;
    if(!issues.length){
      panel.innerHTML = `<strong>Validador:</strong> ✅ sin problemas visibles (reglas básicas).`;
      return;
    }
    const rows = issues.slice(0,120).map(i=>{
      const dot = i.t==="error"?"🔴":i.t==="warn"?"🟠":"🔵";
      return `<li style="margin:.25rem 0"><span>${dot}</span> <strong>${i.w}</strong> — ${escapeHTML(i.m)} <em style="color:#9aa4b2">· ${escapeHTML(i.h||"")}</em></li>`;
    }).join("");
    const score = issues.some(i=>i.t==="error") ? "❌" : "⚠️";
    panel.innerHTML = `<strong>Validador:</strong> ${score} ${issues.length} hallazgos<ul style="padding-left:1rem;margin:.4rem 0">${rows}</ul>`;
  }

  function escapeHTML(s){ return String(s).replace(/[&<>"]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }

  // ---------- Render
  function renderNow(){
    const {html,css} = getCurrentValues();
    els.preview.srcdoc = makeDoc(html, css, { inspector: state.inspector, highlightIssues: state.validator });
  }

  // ---------- Utils
  function debounce(fn,ms){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a),ms); }; }

}
