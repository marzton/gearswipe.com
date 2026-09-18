/**
 * Static GearSwipe landing page, served directly by the Worker at "/".
 *
 * This is deliberately an inline string rather than an asset or an app-router
 * route: it depends on nothing else in the bundle -- not the vinext handler,
 * not the ASSETS binding, not D1 -- so it renders even when the Next.js app
 * fails to boot. That is what keeps the homepage off Cloudflare error 1101
 * while the app-router build is still being brought up.
 *
 * Once app/page.tsx renders reliably in production, delete this module and
 * remove the "/" short-circuit in worker/index.ts.
 */
export const LANDING_PAGE_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>GearSwipe — Quality survives the swipe.</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  :root{
    --paper:#F2F0EA;
    --ink:#111111; --gray:#8B8D8F;
    --orange:#FF5A1F;
    --line:rgba(17,17,17,.14);
    --wash:rgba(17,17,17,.045);
    --display:'Oswald',system-ui,sans-serif;
    --body:'IBM Plex Sans',system-ui,sans-serif;
    --mono:'IBM Plex Mono',ui-monospace,monospace;
  }
  *,*::before,*::after{box-sizing:border-box}
  body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--body)}
  h1,h2,h3{margin:0;text-wrap:balance}
  p{margin:0}
  a{color:var(--ink);text-decoration:none}
  a:hover{color:var(--orange)}
  .nav-link{color:var(--ink);text-decoration:none}
  .nav-link:hover{color:var(--orange)}
  .card-link{color:var(--ink);text-decoration:none}
  .card-link:hover .card-title{color:var(--orange)}
  .card-link:hover .photo{filter:saturate(1.15)}
  .btn-primary{background:var(--ink);color:var(--paper);border:1px solid var(--ink);cursor:pointer}
  .btn-primary:hover{background:var(--orange);border-color:var(--orange);color:var(--ink)}
  .btn-secondary{background:transparent;color:var(--ink);border:1px solid var(--ink);cursor:pointer}
  .btn-secondary:hover{border-color:var(--orange);color:var(--orange)}
  .row-link{color:var(--ink);text-decoration:none;display:block}
  .row-link:hover{background:var(--wash)}
  .row-link:hover .row-num{color:var(--orange)}
</style>
</head>
<body>

<div style="background:var(--paper)">

<!-- HEADER -->
<header style="display:flex;align-items:center;justify-content:space-between;padding:26px 48px;border-bottom:1px solid var(--line)">
  <div style="font-family:var(--display);font-weight:700;font-size:22px;letter-spacing:-.01em;text-transform:uppercase;color:var(--ink)">GearSwipe</div>
  <nav style="display:flex;align-items:center;gap:34px;font-family:var(--mono);font-size:11px;letter-spacing:.1em;text-transform:uppercase">
    <a class="nav-link" href="#field-tests">Field Tests</a>
    <a class="nav-link" href="#compare">Compare</a>
    <a class="nav-link" href="/blog">Blog</a>
    <a class="nav-link" href="/shop">Shop</a>
  </nav>
</header>

<!-- HERO -->
<section style="padding:88px 48px 0">
  <div style="max-width:1240px;margin:0 auto">
    <h1 style="font-family:var(--display);font-weight:700;font-size:92px;line-height:.95;letter-spacing:-.01em;text-transform:uppercase;color:var(--ink);max-width:920px;margin:0 0 30px">Quality survives the swipe.</h1>
    <p style="font-family:var(--body);font-size:19px;line-height:1.65;color:var(--ink);max-width:540px;margin:0 0 38px">We find products worth owning, test what marketing doesn't, and revisit them after the hype is gone.</p>
    <div style="display:flex;gap:14px;margin-bottom:64px">
      <button class="btn-primary" style="font-family:var(--mono);font-size:12px;font-weight:600;letter-spacing:.09em;text-transform:uppercase;padding:16px 24px">Explore field tests</button>
      <button class="btn-secondary" style="font-family:var(--mono);font-size:12px;font-weight:600;letter-spacing:.09em;text-transform:uppercase;padding:16px 24px">How we test</button>
    </div>

    <div class="photo" style="position:relative;height:560px;background:repeating-linear-gradient(135deg, rgba(17,17,17,.05) 0px, rgba(17,17,17,.05) 1px, transparent 1px, transparent 13px), linear-gradient(165deg, #DAD5C8 0%, #B6B0A0 55%, #96917F 100%);border:1px solid var(--line)">
      <span style="position:absolute;top:16px;left:16px;background:var(--paper);color:var(--orange);font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;padding:5px 9px">Fig. 01</span>
      <span style="position:absolute;bottom:16px;left:16px;background:var(--paper);color:var(--ink);font-family:var(--mono);font-size:10px;letter-spacing:.06em;text-transform:uppercase;padding:5px 9px">Construction detail — Black Voyage Zephyr 60L</span>
    </div>
  </div>
</section>

<div style="height:1px;background:var(--line);margin-top:88px"></div>

<!-- CURRENT FIELD TEST -->
<section style="padding:72px 48px">
  <div style="max-width:1240px;margin:0 auto;display:grid;grid-template-columns:minmax(0,1.55fr) minmax(300px,.65fr);gap:64px;align-items:start">
    <div>
      <p style="font-family:var(--mono);font-size:11px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--orange);margin:0 0 16px">Current field test — Europe / 2026</p>
      <h2 style="font-family:var(--display);font-weight:700;font-size:44px;line-height:1.05;letter-spacing:-.005em;text-transform:uppercase;color:var(--ink);max-width:640px;margin:0 0 22px">One bag. Four cities. Which vacuum backpack actually holds up?</h2>
      <p style="font-family:var(--body);font-size:16px;line-height:1.65;color:var(--ink);max-width:56ch;margin:0 0 24px">Three bags, one route, real conditions — the ones marketing photography never shows you.</p>
      <div style="display:flex;flex-wrap:wrap;gap:8px 22px;font-family:var(--mono);font-size:12px;color:var(--ink);margin-bottom:20px">
        <span>Black Voyage</span><span style="color:var(--gray)">·</span>
        <span>AirVault</span><span style="color:var(--gray)">·</span>
        <span>Commodity Amazon alternative</span>
      </div>
      <p style="font-family:var(--mono);font-size:12px;letter-spacing:.04em;color:var(--gray);text-transform:uppercase;margin:0 0 30px">Barcelona &rarr; Ibiza &rarr; Paris &rarr; Dublin</p>
      <button class="btn-primary" style="font-family:var(--mono);font-size:12px;font-weight:600;letter-spacing:.09em;text-transform:uppercase;padding:15px 22px">Follow the test</button>
    </div>

    <div style="border:1px solid var(--ink);background:var(--paper)">
      <div style="padding:16px 20px;border-bottom:1px solid var(--line)">
        <p style="font-family:var(--mono);font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--gray);margin:0">Field test</p>
        <p style="font-family:var(--display);font-weight:600;font-size:18px;letter-spacing:.01em;text-transform:uppercase;color:var(--ink);margin:2px 0 0">GS-0018</p>
      </div>
      <div style="display:grid;gap:1px;background:var(--line)">
        <div style="background:var(--paper);display:flex;align-items:center;justify-content:space-between;padding:13px 20px">
          <span style="font-family:var(--mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--gray)">Status</span>
          <span style="display:inline-flex;align-items:center;gap:7px;font-family:var(--mono);font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--orange)"><span style="width:7px;height:7px;background:var(--orange);border-radius:50%;display:inline-block"></span>In progress</span>
        </div>
        <div style="background:var(--paper);display:flex;align-items:center;justify-content:space-between;padding:13px 20px">
          <span style="font-family:var(--mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--gray)">Route</span>
          <span style="font-family:var(--mono);font-size:12px;color:var(--ink)">BCN &middot; IBZ &middot; PAR &middot; DUB</span>
        </div>
        <div style="background:var(--paper);display:flex;align-items:center;justify-content:space-between;padding:13px 20px">
          <span style="font-family:var(--mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--gray)">Day</span>
          <span style="font-family:var(--mono);font-size:12px;color:var(--ink)">6 / 14</span>
        </div>
        <div style="background:var(--paper);display:flex;align-items:center;justify-content:space-between;padding:13px 20px">
          <span style="font-family:var(--mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--gray)">Contenders</span>
          <span style="font-family:var(--mono);font-size:12px;color:var(--ink)">3</span>
        </div>
        <div style="background:var(--paper);display:flex;align-items:center;justify-content:space-between;padding:13px 20px">
          <span style="font-family:var(--mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--gray)">Failures logged</span>
          <span style="font-family:var(--mono);font-size:12px;color:var(--ink)">0</span>
        </div>
      </div>
    </div>
  </div>
</section>

<div style="height:1px;background:var(--line)"></div>

<!-- SHORTLIST -->
<section style="padding:64px 48px">
  <div style="max-width:1240px;margin:0 auto">
    <p style="font-family:var(--mono);font-size:11px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--gray);margin:0 0 22px">The shortlist</p>
    <div style="border-top:1px solid var(--line)">
      <a class="row-link" href="#black-voyage" style="display:flex;align-items:center;gap:24px;padding:20px 4px;border-bottom:1px solid var(--line)">
        <span class="row-num" style="font-family:var(--mono);font-size:13px;color:var(--orange);width:28px;flex:none">01</span>
        <span style="font-family:var(--display);font-weight:600;font-size:22px;text-transform:uppercase;letter-spacing:-.005em;color:var(--ink);flex:1">Black Voyage</span>
        <span style="font-family:var(--mono);font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--gray)">Field test</span>
      </a>
      <a class="row-link" href="#airvault" style="display:flex;align-items:center;gap:24px;padding:20px 4px;border-bottom:1px solid var(--line)">
        <span class="row-num" style="font-family:var(--mono);font-size:13px;color:var(--orange);width:28px;flex:none">02</span>
        <span style="font-family:var(--display);font-weight:600;font-size:22px;text-transform:uppercase;letter-spacing:-.005em;color:var(--ink);flex:1">AirVault</span>
        <span style="font-family:var(--mono);font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--gray)">Comparison</span>
      </a>
      <a class="row-link" href="#value-pick" style="display:flex;align-items:center;gap:24px;padding:20px 4px;border-bottom:1px solid var(--line)">
        <span class="row-num" style="font-family:var(--mono);font-size:13px;color:var(--orange);width:28px;flex:none">03</span>
        <span style="font-family:var(--display);font-weight:600;font-size:22px;text-transform:uppercase;letter-spacing:-.005em;color:var(--gray);flex:1">[ Value pick — TBD ]</span>
        <span style="font-family:var(--mono);font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--gray)">Value pick</span>
      </a>
      <a class="row-link" href="#long-term" style="display:flex;align-items:center;gap:24px;padding:20px 4px;border-bottom:1px solid var(--line)">
        <span class="row-num" style="font-family:var(--mono);font-size:13px;color:var(--orange);width:28px;flex:none">04</span>
        <span style="font-family:var(--display);font-weight:600;font-size:22px;text-transform:uppercase;letter-spacing:-.005em;color:var(--gray);flex:1">[ Long term — TBD ]</span>
        <span style="font-family:var(--mono);font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--gray)">Long term</span>
      </a>
    </div>
  </div>
</section>

<div style="height:1px;background:var(--line)"></div>

<!-- WORTH OWNING -->
<section style="padding:72px 48px">
  <div style="max-width:1240px;margin:0 auto">
    <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:24px;flex-wrap:wrap;margin-bottom:36px">
      <p style="font-family:var(--mono);font-size:11px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--gray);margin:0">Worth owning</p>
      <p style="font-family:var(--body);font-size:14px;line-height:1.5;color:var(--gray);max-width:30ch;margin:0;text-align:right">Not sponsored placement.<br>Products we would actually buy.</p>
    </div>

    <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px">
      <a class="card-link" href="#carry" style="display:block">
        <div class="photo" style="position:relative;height:200px;background:repeating-linear-gradient(135deg, rgba(17,17,17,.05) 0px, rgba(17,17,17,.05) 1px, transparent 1px, transparent 13px), linear-gradient(165deg, #E1DCCC 0%, #C3BCA8 100%);border:1px solid var(--line);margin-bottom:14px">
          <span style="position:absolute;top:10px;left:10px;background:var(--paper);color:var(--orange);font-family:var(--mono);font-size:9px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;padding:4px 7px">Fig. 02</span>
        </div>
        <p class="card-title" style="font-family:var(--display);font-weight:600;font-size:16px;text-transform:uppercase;letter-spacing:.02em;color:var(--ink);margin:0 0 6px">Carry</p>
        <p style="font-family:var(--body);font-size:13px;line-height:1.5;color:var(--gray);margin:0">Backpacks, luggage, briefcases, wallets.</p>
      </a>
      <a class="card-link" href="#wear" style="display:block">
        <div class="photo" style="position:relative;height:200px;background:repeating-linear-gradient(135deg, rgba(17,17,17,.05) 0px, rgba(17,17,17,.05) 1px, transparent 1px, transparent 13px), linear-gradient(165deg, #D8D2C2 0%, #B0A996 100%);border:1px solid var(--line);margin-bottom:14px">
          <span style="position:absolute;top:10px;left:10px;background:var(--paper);color:var(--orange);font-family:var(--mono);font-size:9px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;padding:4px 7px">Fig. 03</span>
        </div>
        <p class="card-title" style="font-family:var(--display);font-weight:600;font-size:16px;text-transform:uppercase;letter-spacing:.02em;color:var(--ink);margin:0 0 6px">Wear</p>
        <p style="font-family:var(--body);font-size:13px;line-height:1.5;color:var(--gray);margin:0">Outerwear, shoes, technical clothing.</p>
      </a>
      <a class="card-link" href="#tools" style="display:block">
        <div class="photo" style="position:relative;height:200px;background:repeating-linear-gradient(135deg, rgba(17,17,17,.05) 0px, rgba(17,17,17,.05) 1px, transparent 1px, transparent 13px), linear-gradient(165deg, #CFC9B8 0%, #A29B87 100%);border:1px solid var(--line);margin-bottom:14px">
          <span style="position:absolute;top:10px;left:10px;background:var(--paper);color:var(--orange);font-family:var(--mono);font-size:9px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;padding:4px 7px">Fig. 04</span>
        </div>
        <p class="card-title" style="font-family:var(--display);font-weight:600;font-size:16px;text-transform:uppercase;letter-spacing:.02em;color:var(--ink);margin:0 0 6px">Tools</p>
        <p style="font-family:var(--body);font-size:13px;line-height:1.5;color:var(--gray);margin:0">Hand tools, EDC, workshop gear.</p>
      </a>
      <a class="card-link" href="#home" style="display:block">
        <div class="photo" style="position:relative;height:200px;background:repeating-linear-gradient(135deg, rgba(17,17,17,.05) 0px, rgba(17,17,17,.05) 1px, transparent 1px, transparent 13px), linear-gradient(165deg, #E4DFD1 0%, #C8C1AC 100%);border:1px solid var(--line);margin-bottom:14px">
          <span style="position:absolute;top:10px;left:10px;background:var(--paper);color:var(--orange);font-family:var(--mono);font-size:9px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;padding:4px 7px">Fig. 05</span>
        </div>
        <p class="card-title" style="font-family:var(--display);font-weight:600;font-size:16px;text-transform:uppercase;letter-spacing:.02em;color:var(--ink);margin:0 0 6px">Home</p>
        <p style="font-family:var(--body);font-size:13px;line-height:1.5;color:var(--gray);margin:0">Cookware, cutlery, furniture, appliances.</p>
      </a>
      <a class="card-link" href="#tech" style="display:block">
        <div class="photo" style="position:relative;height:200px;background:repeating-linear-gradient(135deg, rgba(17,17,17,.05) 0px, rgba(17,17,17,.05) 1px, transparent 1px, transparent 13px), linear-gradient(165deg, #D2CCBC 0%, #A8A18C 100%);border:1px solid var(--line);margin-bottom:14px">
          <span style="position:absolute;top:10px;left:10px;background:var(--paper);color:var(--orange);font-family:var(--mono);font-size:9px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;padding:4px 7px">Fig. 06</span>
        </div>
        <p class="card-title" style="font-family:var(--display);font-weight:600;font-size:16px;text-transform:uppercase;letter-spacing:.02em;color:var(--ink);margin:0 0 6px">Tech</p>
        <p style="font-family:var(--body);font-size:13px;line-height:1.5;color:var(--gray);margin:0">Hardware and accessories where build quality matters.</p>
      </a>
      <a class="card-link" href="#travel" style="display:block">
        <div class="photo" style="position:relative;height:200px;background:repeating-linear-gradient(135deg, rgba(17,17,17,.05) 0px, rgba(17,17,17,.05) 1px, transparent 1px, transparent 13px), linear-gradient(165deg, #DDD7C9 0%, #B9B29D 100%);border:1px solid var(--line);margin-bottom:14px">
          <span style="position:absolute;top:10px;left:10px;background:var(--paper);color:var(--orange);font-family:var(--mono);font-size:9px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;padding:4px 7px">Fig. 07</span>
        </div>
        <p class="card-title" style="font-family:var(--display);font-weight:600;font-size:16px;text-transform:uppercase;letter-spacing:.02em;color:var(--ink);margin:0 0 6px">Travel</p>
        <p style="font-family:var(--body);font-size:13px;line-height:1.5;color:var(--gray);margin:0">Adapters, chargers, packing systems, rain gear.</p>
      </a>
    </div>
  </div>
</section>

<div style="height:1px;background:var(--line)"></div>

<!-- BUILT DIFFERENT -->
<section style="padding:72px 48px;background:var(--wash)">
  <div style="max-width:1240px;margin:0 auto;display:grid;grid-template-columns:minmax(0,1fr) minmax(260px,.5fr);gap:48px;align-items:end">
    <div>
      <p style="font-family:var(--mono);font-size:11px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--orange);margin:0 0 16px">Under the surface</p>
      <h2 style="font-family:var(--display);font-weight:700;font-size:40px;line-height:1.08;text-transform:uppercase;letter-spacing:-.005em;color:var(--ink);max-width:680px;margin:0 0 20px">Why a $200 bag costs $200 — and when it shouldn't.</h2>
      <p style="font-family:var(--body);font-size:15px;line-height:1.65;color:var(--ink);max-width:60ch;margin:0 0 26px">YKK vs. generic zippers. Cordura vs. ballistic nylon. Full-grain vs. corrected leather. The manufacturing decisions that actually determine whether something lasts.</p>
      <p style="font-family:var(--mono);font-size:11px;letter-spacing:.04em;text-transform:uppercase;color:var(--gray);margin:0">
        Materials <span style="color:var(--line)">/</span> Stitching <span style="color:var(--line)">/</span> Hardware <span style="color:var(--line)">/</span> Warranty <span style="color:var(--line)">/</span> Manufacturing
      </p>
    </div>
    <div style="justify-self:end">
      <button class="btn-primary" style="font-family:var(--mono);font-size:12px;font-weight:600;letter-spacing:.09em;text-transform:uppercase;padding:15px 24px">Read</button>
    </div>
  </div>
</section>

<div style="height:1px;background:var(--line)"></div>

<!-- STILL HERE -->
<section style="padding:72px 48px">
  <div style="max-width:1240px;margin:0 auto;display:grid;grid-template-columns:minmax(0,.85fr) minmax(0,1.15fr);gap:56px;align-items:center">
    <div class="photo" style="position:relative;height:420px;background:repeating-linear-gradient(135deg, rgba(17,17,17,.05) 0px, rgba(17,17,17,.05) 1px, transparent 1px, transparent 13px), linear-gradient(165deg, #C7C0AC 0%, #8F8873 60%, #6E6858 100%);border:1px solid var(--line)">
      <span style="position:absolute;top:16px;left:16px;background:var(--paper);color:var(--orange);font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;padding:5px 9px">Fig. 08</span>
      <span style="position:absolute;bottom:16px;left:16px;background:var(--paper);color:var(--ink);font-family:var(--mono);font-size:10px;letter-spacing:.06em;text-transform:uppercase;padding:5px 9px">Worn edge detail — 1987 leather briefcase</span>
    </div>
    <div>
      <p style="font-family:var(--mono);font-size:11px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--gray);margin:0 0 16px">Still here</p>
      <p style="font-family:var(--body);font-size:16px;line-height:1.65;color:var(--ink);max-width:44ch;margin:0 0 18px">Objects our families bought decades ago that haven't needed replacing.</p>
      <h2 style="font-family:var(--display);font-weight:700;font-size:40px;line-height:1.08;text-transform:uppercase;letter-spacing:-.005em;color:var(--ink);max-width:520px;margin:0 0 28px">The briefcase that outlived its owner.</h2>
      <button class="btn-secondary" style="font-family:var(--mono);font-size:12px;font-weight:600;letter-spacing:.09em;text-transform:uppercase;padding:15px 22px">Read the story</button>
    </div>
  </div>
</section>

<div style="height:1px;background:var(--line)"></div>

<!-- THE GEARSWIPE STANDARD -->
<section style="padding:72px 48px">
  <div style="max-width:1240px;margin:0 auto">
    <p style="font-family:var(--mono);font-size:11px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--orange);margin:0 0 16px">Methodology</p>
    <h2 style="font-family:var(--display);font-weight:700;font-size:40px;text-transform:uppercase;letter-spacing:-.005em;color:var(--ink);max-width:680px;margin:0 0 40px">We don't score products after opening the box.</h2>

    <div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1px;background:var(--line);border:1px solid var(--line);margin-bottom:32px">
      <div style="background:var(--paper);padding:22px 20px"><span style="font-family:var(--mono);font-size:13px;color:var(--orange);display:block;margin-bottom:8px">01</span><span style="font-family:var(--display);font-weight:600;font-size:16px;text-transform:uppercase;color:var(--ink)">Research</span></div>
      <div style="background:var(--paper);padding:22px 20px"><span style="font-family:var(--mono);font-size:13px;color:var(--orange);display:block;margin-bottom:8px">02</span><span style="font-family:var(--display);font-weight:600;font-size:16px;text-transform:uppercase;color:var(--ink)">Buy / Source</span></div>
      <div style="background:var(--paper);padding:22px 20px"><span style="font-family:var(--mono);font-size:13px;color:var(--orange);display:block;margin-bottom:8px">03</span><span style="font-family:var(--display);font-weight:600;font-size:16px;text-transform:uppercase;color:var(--ink)">Inspect</span></div>
      <div style="background:var(--paper);padding:22px 20px"><span style="font-family:var(--mono);font-size:13px;color:var(--orange);display:block;margin-bottom:8px">04</span><span style="font-family:var(--display);font-weight:600;font-size:16px;text-transform:uppercase;color:var(--ink)">Use</span></div>
      <div style="background:var(--paper);padding:22px 20px"><span style="font-family:var(--mono);font-size:13px;color:var(--orange);display:block;margin-bottom:8px">05</span><span style="font-family:var(--display);font-weight:600;font-size:16px;text-transform:uppercase;color:var(--ink)">Abuse</span></div>
      <div style="background:var(--paper);padding:22px 20px"><span style="font-family:var(--mono);font-size:13px;color:var(--orange);display:block;margin-bottom:8px">06</span><span style="font-family:var(--display);font-weight:600;font-size:16px;text-transform:uppercase;color:var(--ink)">Contact the company</span></div>
      <div style="background:var(--paper);padding:22px 20px"><span style="font-family:var(--mono);font-size:13px;color:var(--orange);display:block;margin-bottom:8px">07</span><span style="font-family:var(--display);font-weight:600;font-size:16px;text-transform:uppercase;color:var(--ink)">Revisit</span></div>
      <div style="background:var(--wash);padding:22px 20px;display:flex;align-items:center">
        <a class="nav-link" href="#review-policy" style="font-family:var(--mono);font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase">Our review policy &rarr;</a>
      </div>
    </div>
  </div>
</section>

<div style="height:1px;background:var(--line)"></div>

<!-- FOOTER -->
<footer style="padding:56px 48px 40px">
  <div style="max-width:1240px;margin:0 auto">
    <div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(280px,.5fr);gap:48px;align-items:start;padding-bottom:36px;border-bottom:1px solid var(--line)">
      <div>
        <p style="font-family:var(--display);font-weight:700;font-size:20px;text-transform:uppercase;letter-spacing:-.01em;color:var(--ink);margin:0 0 12px">GearSwipe</p>
        <p style="font-family:var(--body);font-size:14px;line-height:1.6;color:var(--gray);max-width:42ch;margin:0">Find it. Test it. Keep what lasts.</p>
      </div>
      <div>
        <p style="font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--gray);margin:0 0 12px">Get the next field test</p>
        <div style="display:flex;border:1px solid var(--ink)">
          <input type="email" placeholder="you@email.com" style="flex:1;min-width:0;border:0;background:transparent;padding:13px 14px;font-family:var(--mono);font-size:12px;color:var(--ink);outline:none">
          <button class="btn-primary" style="border:0;font-family:var(--mono);font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;padding:13px 18px">Subscribe</button>
        </div>
      </div>
    </div>
    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;padding-top:24px">
      <div style="display:flex;gap:26px;font-family:var(--mono);font-size:11px;letter-spacing:.06em;text-transform:uppercase">
        <a class="nav-link" href="#field-tests">Field Tests</a>
        <a class="nav-link" href="#compare">Compare</a>
        <a class="nav-link" href="#worth-owning">Worth Owning</a>
        <a class="nav-link" href="#still-here">Heritage</a>
        <a class="nav-link" href="#under-the-surface">Under the Surface</a>
      </div>
      <p style="font-family:var(--mono);font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:var(--gray);margin:0">&copy; GearSwipe — Quality survives the swipe.</p>
    </div>
  </div>
</footer>

</div>
</body>
</html>
`;
