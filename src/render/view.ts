import * as THREE from 'three';
import { hexToNumber, sky } from '../content/palettes';
import { FX_LAYER, Outline } from './outline';
import { syncCelSun } from './toon';

/**
 * The three.js side of the game: renderer, scene, lights and the camera.
 * The camera isn't fitted to anything: the game places it every frame, and
 * the view only sizes the renderer and the camera's aspect.
 */
export class View {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(24, 1, 0.5, 200);
  readonly sun: THREE.DirectionalLight;
  /** The cel look's ink lines; null draws the scene plainly. */
  readonly outline: Outline | null;

  constructor(
    readonly canvas: HTMLCanvasElement,
    options: { fov?: number; outline?: boolean } = {},
  ) {
    if (options.fov) this.camera.fov = options.fov;
    // Light effects (glows, spills, dust) live on their own layer: see FX_LAYER.
    this.camera.layers.enable(FX_LAYER);
    this.outline = options.outline === false ? null : new Outline();
    // When Outline is active, it already renders to a 4x MSAA target (`this.color`) and blits a 2D quad,
    // so only enable backbuffer MSAA when rendering directly without Outline.
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: this.outline === null });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    // Crisp shadow edges, to match the cel terminator.
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.scene.background = skyGradient();
    // A haze that melts the far ground into the horizon.
    this.scene.fog = new THREE.Fog(hexToNumber(sky.horizon), 25, 70);

    // Holiday Hall uses each bay's local PointLight (`dioramaLight`) rather than an overhead sun;
    // keep `this.sun` disabled by default so it never allocates or renders a 2048x2048 shadow map.
    const sun = new THREE.DirectionalLight(hexToNumber(sky.sun), 0);
    this.sun = sun;
    sun.position.set(-10, 13, 3);
    sun.target.position.set(0, 0, 0);
    sun.castShadow = false;
    sun.visible = false;
    this.scene.add(sun, sun.target);
    syncCelSun(sun);

    new ResizeObserver(() => this.fit()).observe(canvas);
  }

  render(overrideScene?: THREE.Scene): void {
    const target = overrideScene ?? this.scene;
    if (this.outline) this.outline.render(this.renderer, target, this.camera);
    else this.renderer.render(target, this.camera);
  }

  private fit(): void {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    if (w === 0 || h === 0) return;
    this.renderer.setSize(w, h, false);
    const ratio = this.renderer.getPixelRatio();
    this.outline?.setSize(Math.floor(w * ratio), Math.floor(h * ratio), ratio);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }
}

/** The sky behind everything: deep blue overhead, pale at the horizon. */
function skyGradient(): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const g = ctx.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, sky.top);
    g.addColorStop(1, sky.horizon);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 1, 256);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
