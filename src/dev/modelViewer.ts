/**
 * Dev page for the game's 3D assets. Interactive: pick one and see it drawn
 * as in the game (cel shading and line art):
 * - the mascots (procedural low-poly models, `game/mascots.ts`), spinning on a tile;
 * - Holiday Hall, whole (an overview that turns) or bay by bay, from the
 *   game's own camera spot for that bay (drag to look left and right);
 * - every prop in the hall (each item and centrepiece), taken out of the
 *   built hall to spin on its own.
 * The hall is built twice, in made-up states (kept in memory, never the
 * player's save): at the start (every item on its table, every centrepiece
 * locked) and restored (every item home on its pedestal, every centrepiece
 * done), so every model shows whatever the real save says.
 * Spin on or off, or drag to turn by hand.
 * Render modes produce fixed images for the headless preview script, so
 * Claude can look at a model and iterate (TECHNICAL.md §6).
 */
// First, so the game's saved progress is kept in memory before the game's state loads.
import './sandboxStorage';
import * as THREE from 'three';
import { cel, common, hexToNumber, sky } from '../content/palettes';
import { celUniforms, syncCelSun, toonMaterial } from '../render/toon';
import { Outline } from '../render/outline';
import {
  BAY_ORDER,
  type BayId,
  type BuiltDiorama,
  bayToWorld,
  buildHolidayHallDiorama,
  getBayAngle,
  getBayLightMood,
} from '../game/diorama';
import { MASCOT_IDS, type MascotId, buildMascotMesh } from '../game/mascots';
import { FINALE_PROTO, ROOM_SPECS, gameState } from '../game/state';

const ALL_MODEL_IDS: readonly string[] = MASCOT_IDS.map((id) => `mascots/${id}`);

const params = new URLSearchParams(location.search);

const renderMode = params.get('render'); // 'turntable' | 'sheet' | null
const $ = <T extends HTMLElement>(sel: string): T => {
  const el = document.querySelector<T>(sel);
  if (!el) throw new Error(`models.html is missing ${sel}`);
  return el;
};
const canvas = $<HTMLCanvasElement>('#view');
const list = $<HTMLDivElement>('#list');
const info = $<HTMLDivElement>('#info');
const controls = $<HTMLDivElement>('#controls');
const stage = $<HTMLDivElement>('#stage');

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(renderMode ? 1 : Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;

const scene = new THREE.Scene();
scene.background = new THREE.Color(hexToNumber(common.backdrop));
// A gentle sun, nearer the hall's lamps (the game turns its sun off). The cel shader
// (render/toon.ts) scales lit surfaces by the light's strength, so the old full-strength sun (3)
// blew lit colours out: lit red turned peach.
const sun = new THREE.DirectionalLight(hexToNumber(sky.sun), 1);
sun.position.set(-10, 13, 3);
sun.castShadow = true;
scene.add(sun);
syncCelSun(sun);

const camera = new THREE.PerspectiveCamera(24, 1, 0.05, 100);

/** A 1 × 1 field tile, to show scale against the game grid. */
function tile(x: number): THREE.Mesh {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(1, 0.1, 1),
    toonMaterial({ color: hexToNumber(common.ground) }),
  );
  mesh.position.set(x, -0.05, 0);
  mesh.receiveShadow = true;
  return mesh;
}

function modelMesh(id: string): THREE.Object3D {
  return buildMascotMesh(id.slice('mascots/'.length) as MascotId);
}

function aim(target: THREE.Vector3, yawDeg: number, pitchDeg: number, dist: number): void {
  const yaw = THREE.MathUtils.degToRad(yawDeg);
  const pitch = THREE.MathUtils.degToRad(pitchDeg);
  camera.position.set(
    target.x + Math.sin(yaw) * Math.cos(pitch) * dist,
    target.y + Math.sin(pitch) * dist,
    target.z + Math.cos(yaw) * Math.cos(pitch) * dist,
  );
  camera.lookAt(target);
}

if (renderMode === 'turntable') renderTurntable(params.get('model') ?? ALL_MODEL_IDS[0] ?? '');
else if (renderMode === 'closeup') renderCloseup(params.get('model') ?? ALL_MODEL_IDS[0] ?? '');
else if (renderMode === 'sheet') renderSheet(params.get('group') ?? '');
else interactive();

/** Front, ¾ and side views in one image. */
function renderTurntable(id: string): void {
  document.body.classList.add('render');
  const w = 960;
  const h = 360;
  renderer.setSize(w, h);
  const outline = new Outline({});
  outline.setSize(w / 3, h, 1);
  const mesh = modelMesh(id);
  scene.add(mesh, tile(0));
  const box = new THREE.Box3().setFromObject(mesh);
  const size = box.getSize(new THREE.Vector3());
  const target = new THREE.Vector3(0, size.y / 2, 0);
  const dist = Math.max(size.x, size.y, size.z, 1) * 3.6;
  camera.aspect = w / 3 / h;
  camera.updateProjectionMatrix();
  renderer.setScissorTest(true);
  [0, 35, 90].forEach((yaw, i) => {
    renderer.setViewport((i * w) / 3, 0, w / 3, h);
    renderer.setScissor((i * w) / 3, 0, w / 3, h);
    aim(target, yaw, yaw === 0 ? 8 : 25, dist);
    outline.render(renderer, scene, camera);
  });
  markReady();
}

/** Four big, tightly framed views (front, ¾ front, side, ¾ back) for detail work. */
function renderCloseup(id: string): void {
  document.body.classList.add('render');
  const cell = 600;
  renderer.setSize(cell * 2, cell * 2);
  const outline = new Outline({});
  outline.setSize(cell, cell, 1);
  const mesh = modelMesh(id);
  scene.add(mesh, tile(0));
  const size = new THREE.Box3().setFromObject(mesh).getSize(new THREE.Vector3());
  const target = new THREE.Vector3(0, size.y / 2, 0);
  const dist = Math.max(size.x, size.y, size.z, 0.5) * 2.7;
  camera.aspect = 1;
  camera.updateProjectionMatrix();
  renderer.setScissorTest(true);
  const views: [number, number][] = [
    [0, 8],
    [35, 20],
    [90, 10],
    [150, 25],
  ];
  views.forEach(([yaw, pitch], i) => {
    const x = (i % 2) * cell;
    const y = (1 - Math.floor(i / 2)) * cell;
    renderer.setViewport(x, y, cell, cell);
    renderer.setScissor(x, y, cell, cell);
    aim(target, yaw, pitch, dist);
    outline.render(renderer, scene, camera);
  });
  markReady();
}

/** Every model in a folder, side by side on tiles, from the game's camera angle. */
function renderSheet(group: string): void {
  document.body.classList.add('render');
  const ids = ALL_MODEL_IDS.filter((id) => group === '' || id.startsWith(`${group}/`));
  const w = Math.max(480, ids.length * 240);
  const h = 360;
  renderer.setSize(w, h);
  const outline = new Outline({});
  outline.setSize(w, h, 1);
  ids.forEach((id, i) => {
    const x = (i - (ids.length - 1) / 2) * 1.6;
    const mesh = modelMesh(id);
    mesh.position.x = x;
    scene.add(mesh, tile(x));
  });
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  // The game's camera pitch, so the sheet shows models as they'll look in play.
  aim(new THREE.Vector3(0, 0.5, 0), 0, 32, Math.max(6, ids.length * 1.9));
  outline.render(renderer, scene, camera);
  markReady();
}

function interactive(): void {
  const outline = new Outline({});
  let current: THREE.Object3D | null = null;
  /** The shown model's size: the camera frames it, whatever its size and the screen's shape. */
  let size = new THREE.Vector3(1, 1, 1);
  let spin = true;
  let yaw = 35;
  let dragX: number | null = null;
  /** What's shown: a single thing spinning, the whole hall turning, or one bay from the game's camera. */
  let mode: { kind: 'single' } | { kind: 'hall' } | { kind: 'bay'; bay: BayId } = {
    kind: 'single',
  };

  const spinButton = document.createElement('button');
  spinButton.textContent = 'Spin';
  spinButton.classList.add('on');
  spinButton.addEventListener('click', () => {
    spin = !spin;
    spinButton.classList.toggle('on', spin);
  });
  controls.append(spinButton);

  // Drag to turn it by hand.
  canvas.addEventListener('pointerdown', (e) => {
    dragX = e.clientX;
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (dragX === null) return;
    yaw -= (e.clientX - dragX) * 0.5;
    dragX = e.clientX;
  });
  canvas.addEventListener('pointerup', () => (dragX = null));
  canvas.style.touchAction = 'none';

  /**
   * Holiday Hall, built as the game builds it (clicks do nothing here), in two
   * made-up states: at the start (warm-ups done, so every stray item waits on
   * its table and every centrepiece is locked), and restored (every item home
   * on its pedestal, every centrepiece and the finale done).
   */
  type Variant = 'start' | 'restored';
  const build = (variant: Variant): BuiltDiorama => {
    gameState.resetAll();
    for (const room of ROOM_SPECS) {
      gameState.setRunSolved(room.warmup.id, true);
      if (variant === 'start') continue;
      for (const stray of room.strays) {
        gameState.setRunSolved(stray.proto.id, true);
        gameState.setItemPlaced(stray.id, true);
      }
      gameState.setRunSolved(room.centerpiece.proto.id, true);
    }
    if (variant === 'restored') gameState.setRunSolved(FINALE_PROTO.id, true);
    return buildHolidayHallDiorama({
      onSelectBay: () => undefined,
      onOpenProto: () => undefined,
      onOpenDesk: () => undefined,
      onShowStory: () => undefined,
      onPlaceItem: () => undefined,
    });
  };
  const halls: Record<Variant, BuiltDiorama> = {
    start: build('start'),
    restored: build('restored'),
  };
  let hall: BuiltDiorama | null = null;

  const put = (thing: THREE.Object3D, key: string, text: string): void => {
    if (current) scene.remove(current);
    scene.add(thing);
    current = thing;
    info.textContent = text;
    list.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.key === key));
    // Hotspot ids have colons of their own ("finale:tuesday"): split at the first only.
    const at = key.indexOf(':');
    const kind = key.slice(0, at);
    const id = key.slice(at + 1);
    history.replaceState(null, '', `?${new URLSearchParams({ [kind]: id })}`);
  };

  const showModel = (id: string): void => {
    mode = { kind: 'single' };
    const group = new THREE.Group();
    const mesh = modelMesh(id);
    group.add(mesh);
    group.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(mesh);
    size = box.getSize(new THREE.Vector3());
    group.add(tile(0));
    let tris = 0;
    mesh.traverse((c) => {
      if (c instanceof THREE.Mesh && c.geometry) {
        tris += c.geometry.index
          ? c.geometry.index.count / 3
          : (c.geometry.attributes['position']?.count ?? 0) / 3;
      }
    });
    put(
      group,
      `model:${id}`,
      `${id}: ${size.x.toFixed(2)} × ${size.y.toFixed(2)} × ${size.z.toFixed(2)} units · ${Math.round(tris)} tris`,
    );
  };

  const showHall = (variant: Variant, bay: BayId | 'all'): void => {
    const built = halls[variant];
    hall = built;
    mode = bay === 'all' ? { kind: 'hall' } : { kind: 'bay', bay };
    yaw = 0;
    put(
      built.root,
      `bay:${variant}/${bay}`,
      bay === 'all'
        ? `Holiday Hall (${variant}): the whole rotunda (${built.hotspots.length} hotspots)`
        : `Holiday Hall (${variant}), ${bay} bay, from the game's camera spot (drag to look around)`,
    );
  };

  /** A prop taken out of the built hall: a copy, centred on the origin. */
  const showProp = (variant: Variant, id: string): void => {
    const spot = halls[variant].hotspots.find((h) => h.id === id);
    if (!spot?.meshGroup) return;
    mode = { kind: 'single' };
    const copy = spot.meshGroup.clone(true);
    copy.position.set(0, 0, 0);
    copy.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(copy);
    const centre = box.getCenter(new THREE.Vector3());
    copy.position.set(-centre.x, -box.min.y, -centre.z);
    size = box.getSize(new THREE.Vector3());
    const group = new THREE.Group();
    group.add(copy);
    put(
      group,
      `prop:${variant}/${id}`,
      `${spot.label}${spot.sublabel ? ` (${spot.sublabel})` : ''} · ${spot.bay} bay · ` +
        `${size.x.toFixed(2)} × ${size.y.toFixed(2)} × ${size.z.toFixed(2)} units · ${variant}`,
    );
  };

  // The list: the mascots, the hall and its bays, then every prop in the hall.
  const heading = (text: string): void => {
    const label = document.createElement('span');
    label.textContent = text;
    label.style.cssText = 'width:100%;font-size:0.75rem;opacity:0.7;margin-top:0.3rem';
    list.append(label);
  };
  const entry = (text: string, key: string, onClick: () => void): void => {
    const button = document.createElement('button');
    button.textContent = text;
    button.dataset.key = key;
    button.addEventListener('click', onClick);
    list.append(button);
  };
  heading('Mascots');
  for (const id of MASCOT_IDS.map((m) => `mascots/${m}`))
    entry(id, `model:${id}`, () => showModel(id));
  // At the start: every stray item on its table, the centrepieces locked (empty pedestals left out).
  // Restored: the items home on their pedestals, and the centrepieces done.
  const centrepieces = new Set(ROOM_SPECS.map((r) => `proto:${r.centerpiece.proto.id}`));
  for (const variant of ['start', 'restored'] as const) {
    heading(`Holiday Hall (${variant})`);
    entry('whole hall', `bay:${variant}/all`, () => showHall(variant, 'all'));
    for (const bay of BAY_ORDER) entry(bay, `bay:${variant}/${bay}`, () => showHall(variant, bay));
  }
  heading('Props (start)');
  for (const spot of halls.start.hotspots)
    if (spot.meshGroup && !spot.id.startsWith('pedestal:'))
      // The label already starts with its icon; the bay tells an item stranded from one at home.
      entry(`${spot.label} · ${spot.bay}`, `prop:start/${spot.id}`, () =>
        showProp('start', spot.id),
      );
  heading('Props (restored)');
  for (const spot of halls.restored.hotspots)
    if (spot.meshGroup && (spot.id.startsWith('pedestal:') || centrepieces.has(spot.id)))
      entry(`${spot.label} · ${spot.bay}`, `prop:restored/${spot.id}`, () =>
        showProp('restored', spot.id),
      );

  // The canvas fills its own area (beside or below the list), whatever the window's shape.
  let sized = '';
  const resize = (): void => {
    const w = Math.max(160, stage.clientWidth);
    const h = Math.max(160, stage.clientHeight);
    sized = `${w}x${h}`;
    renderer.setSize(w, h);
    const ratio = renderer.getPixelRatio();
    outline.setSize(Math.floor(w * ratio), Math.floor(h * ratio), ratio);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(stage);
  resize();
  // Links: ?model=id, ?bay=start/halloween, ?prop=restored/pedestal:broom.
  const asked = params.get('bay') ?? params.get('prop') ?? params.get('model');
  const [variant, rest = ''] = (asked ?? '').split(/\/(.*)/s) as [string, string?];
  const which: Variant = variant === 'restored' ? 'restored' : 'start';
  if (params.get('bay')) showHall(which, rest === 'all' ? 'all' : (rest as BayId));
  else if (params.get('prop')) showProp(which, rest);
  else {
    const first = asked ?? ALL_MODEL_IDS[0];
    if (first) showModel(first);
  }

  let last = performance.now();
  renderer.setAnimationLoop((now) => {
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    // Follow the canvas's area every frame too (resize events can be missed while a page is hidden).
    if (`${Math.max(160, stage.clientWidth)}x${Math.max(160, stage.clientHeight)}` !== sized)
      resize();
    if (mode.kind === 'bay' || mode.kind === 'hall') {
      const bayId = mode.kind === 'bay' ? mode.bay : 'hall';
      const mood = getBayLightMood(bayId);
      celUniforms.celLitTint.value.setRGB(mood.litTint[0], mood.litTint[1], mood.litTint[2]);
      celUniforms.celShadeTint.value.setRGB(
        mood.shadeTint[0],
        mood.shadeTint[1],
        mood.shadeTint[2],
      );
      celUniforms.celShadeGamma.value = mood.shadeGamma;
      sun.visible = false;
      sun.castShadow = false;
    } else {
      celUniforms.celLitTint.value.set(cel.litTint);
      celUniforms.celShadeTint.value.set(cel.shadeTint);
      celUniforms.celShadeGamma.value = cel.shadeGamma;
      sun.visible = true;
      sun.castShadow = true;
    }
    if (mode.kind === 'bay') {
      // The game's camera spot for the bay (main.ts), with a drag to look left and right.
      camera.fov = 40;
      camera.updateProjectionMatrix();
      const angle = getBayAngle(mode.bay) + THREE.MathUtils.degToRad(yaw * 0.3);
      const at = bayToWorld(angle, 0, 1.92, 5.15);
      camera.position.copy(at);
      camera.lookAt(bayToWorld(angle, 0, 1.38, 0.75));
      hall?.animate(now / 1000, mode.bay);
    } else if (mode.kind === 'hall') {
      // The whole rotunda from above, turning.
      camera.fov = 40;
      camera.updateProjectionMatrix();
      if (spin && dragX === null) yaw = (yaw + dt * 12) % 360;
      aim(new THREE.Vector3(0, 0.8, 0), yaw, 52, 17);
      hall?.animate(now / 1000, 'hall');
    } else {
      if (camera.fov !== 24) {
        camera.fov = 24;
        camera.updateProjectionMatrix();
      }
      if (spin && dragX === null) yaw = (yaw + dt * 25) % 360;
      // Far enough back to fit the model's height, and its width on a narrow screen (and a tile).
      const across = Math.max(size.x, size.z, 1);
      const dist = Math.max(size.y, across / camera.aspect, 1) * 3.6;
      aim(new THREE.Vector3(0, size.y / 2, 0), yaw, 22, dist);
    }
    outline.render(renderer, scene, camera);
  });
}

function markReady(): void {
  Object.assign(window, { __ready: true });
}
