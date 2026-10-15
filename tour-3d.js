/**
 * Block 1-38 Flat D/E — approximate interior preview.
 * Dimensions are a simplified reading of the floor plan, not a survey.
 *
 * Plan (X east, Z south), metres:
 *   NW kitchen (L counters) · open dining · two baths · master
 *   SW living bay with curved sofa · corridor · two smaller bedrooms
 */
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const WALL_H = 2.58;
const EXT = 0.18;
const INT = 0.12;
const FY = 0.04;

const shell = [
  [1.4, 0.0],
  [16.4, 0.0],
  [16.4, 9.05],
  [8.3, 9.05],
  [5.55, 9.55],
  [0.25, 7.4],
  [1.4, 5.05],
];

const PRESETS = {
  overview: {
    position: [8.2, 12.2, 16.0],
    target: [8.15, 0.15, 4.55],
  },
  living: {
    position: [5.45, 1.62, 5.05],
    target: [2.9, 0.7, 6.85],
  },
  kitchen: {
    position: [4.05, 1.58, 2.25],
    target: [2.35, 1.0, 1.2],
  },
  master: {
    position: [15.05, 1.58, 3.2],
    target: [14.65, 0.82, 1.75],
  },
  bed: {
    position: [9.35, 1.58, 8.05],
    target: [10.55, 0.72, 6.75],
  },
  bed3: {
    position: [15.5, 1.58, 8.05],
    target: [14.7, 0.72, 6.75],
  },
  bath: {
    position: [9.7, 1.58, 3.85],
    target: [9.4, 0.85, 1.45],
  },
};

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const coarse = window.matchMedia("(pointer: coarse)").matches;

const stage = document.getElementById("tour-stage");
const loadingEl = document.getElementById("tour-loading");
const tipEl = document.getElementById("tour-tip");

window.__tourBooted = true;

if (tipEl && coarse) {
  tipEl.textContent = "拖動旋轉 · 雙指縮放";
}

function fail(message) {
  if (!loadingEl) return;
  loadingEl.classList.remove("is-hidden");
  loadingEl.textContent = message;
}

function canvasTexture(draw, repeat) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  draw(ctx, canvas.width, canvas.height);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  if (repeat) tex.repeat.set(repeat[0], repeat[1]);
  tex.anisotropy = 8;
  return tex;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function main() {
  const probe = document.createElement("canvas");
  const gl = probe.getContext("webgl2") || probe.getContext("webgl");
  if (!gl) {
    fail("此瀏覽器未能啟動 3D 預覽。");
    return;
  }

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0xe6e0d6, 1);
  stage.insertBefore(renderer.domElement, stage.firstChild);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xe6e0d6);
  scene.environmentIntensity = 0.55;

  const house = new THREE.Group();
  scene.add(house);

  const camera = new THREE.PerspectiveCamera(48, 1, 0.08, 80);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = !reduceMotion;
  controls.dampingFactor = 0.08;
  controls.rotateSpeed = 0.72;
  controls.zoomSpeed = 0.85;
  controls.panSpeed = 0.7;
  controls.screenSpacePanning = true;
  controls.minDistance = 0.55;
  controls.maxDistance = 26;
  controls.minPolarAngle = 0.18;
  controls.maxPolarAngle = Math.PI / 2 - 0.06;
  controls.cursor.set(8.2, 0.8, 4.7);
  controls.maxTargetRadius = 12.5;

  try {
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
  } catch (err) {
    console.warn(err);
  }

  const woodTex = canvasTexture((ctx, w, h) => {
    ctx.fillStyle = "#d7b48a";
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 28; i += 1) {
      ctx.strokeStyle = `rgba(110, 72, 32, ${0.05 + (i % 4) * 0.03})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      const y = (i * 18) % h;
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(140, y + 6, 320, y - 4, w, y + 2);
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(92, 58, 24, 0.28)";
    ctx.lineWidth = 2;
    for (let x = 0; x <= w; x += 128) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
  });

  const stoneTex = canvasTexture((ctx, w, h) => {
    ctx.fillStyle = "#e4d9cc";
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 80; i += 1) {
      ctx.fillStyle = `rgba(255, 250, 242, ${0.04 + Math.random() * 0.08})`;
      ctx.beginPath();
      ctx.ellipse(
        Math.random() * w,
        Math.random() * h,
        20 + Math.random() * 50,
        12 + Math.random() * 30,
        Math.random(),
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    ctx.strokeStyle = "rgba(168, 152, 132, 0.55)";
    ctx.lineWidth = 3;
    ctx.strokeRect(1, 1, w - 2, h - 2);
    ctx.beginPath();
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w / 2, h);
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();
  });

  const rugTex = canvasTexture((ctx, w, h) => {
    ctx.fillStyle = "#cbb892";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#8b6914";
    ctx.lineWidth = 18;
    ctx.strokeRect(16, 16, w - 32, h - 32);
    ctx.strokeStyle = "rgba(61, 90, 76, 0.35)";
    ctx.lineWidth = 6;
    ctx.strokeRect(40, 40, w - 80, h - 80);
  });

  const mats = {
    wall: new THREE.MeshStandardMaterial({
      color: 0xf3efe6,
      roughness: 0.92,
      metalness: 0,
      envMapIntensity: 0.08,
    }),
    stone: new THREE.MeshStandardMaterial({
      map: stoneTex,
      color: 0xffffff,
      roughness: 0.46,
      metalness: 0.04,
      envMapIntensity: 0.4,
    }),
    woodFloor: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.68,
      metalness: 0,
      envMapIntensity: 0.12,
    }),
    tile: new THREE.MeshStandardMaterial({
      color: 0xddd6cc,
      roughness: 0.55,
      metalness: 0.03,
      envMapIntensity: 0.2,
    }),
    bathTile: new THREE.MeshStandardMaterial({
      color: 0xd5ddd8,
      roughness: 0.42,
      metalness: 0.04,
      envMapIntensity: 0.25,
    }),
    charcoal: new THREE.MeshStandardMaterial({
      color: 0x2c2a26,
      roughness: 0.58,
      metalness: 0.08,
      envMapIntensity: 0.2,
    }),
    brass: new THREE.MeshStandardMaterial({
      color: 0xc4a35a,
      roughness: 0.38,
      metalness: 0.72,
      envMapIntensity: 0.7,
    }),
    wood: new THREE.MeshStandardMaterial({
      color: 0xc6a36e,
      roughness: 0.52,
      metalness: 0.02,
      envMapIntensity: 0.15,
    }),
    woodDark: new THREE.MeshStandardMaterial({
      color: 0x8b6914,
      roughness: 0.48,
      metalness: 0.06,
    }),
    sofa: new THREE.MeshStandardMaterial({
      color: 0x247f7a,
      roughness: 0.88,
      metalness: 0,
      envMapIntensity: 0.06,
    }),
    sofaCushion: new THREE.MeshStandardMaterial({
      color: 0x2f9992,
      roughness: 0.9,
      metalness: 0,
    }),
    bedding: new THREE.MeshStandardMaterial({
      color: 0xf4efe4,
      roughness: 0.86,
      metalness: 0,
    }),
    pillow: new THREE.MeshStandardMaterial({
      color: 0xfffaf3,
      roughness: 0.9,
      metalness: 0,
    }),
    ceramic: new THREE.MeshStandardMaterial({
      color: 0xf7f5f2,
      roughness: 0.28,
      metalness: 0.02,
      envMapIntensity: 0.45,
    }),
    water: new THREE.MeshStandardMaterial({
      color: 0xb7d0d6,
      roughness: 0.18,
      metalness: 0.08,
      envMapIntensity: 0.5,
    }),
    glass: new THREE.MeshStandardMaterial({
      color: 0xd5e6ea,
      roughness: 0.06,
      metalness: 0.0,
      transparent: true,
      opacity: 0.38,
      envMapIntensity: 0.8,
      depthWrite: false,
    }),
    door: new THREE.MeshStandardMaterial({
      color: 0xa67c42,
      roughness: 0.5,
      metalness: 0.04,
    }),
    plant: new THREE.MeshStandardMaterial({
      color: 0x3d5a4c,
      roughness: 0.86,
      metalness: 0,
    }),
    counter: new THREE.MeshStandardMaterial({
      color: 0xe7dfd2,
      roughness: 0.4,
      metalness: 0.05,
      envMapIntensity: 0.35,
    }),
    screen: new THREE.MeshStandardMaterial({
      color: 0x1a1c20,
      roughness: 0.35,
      metalness: 0.2,
      emissive: 0x1a2438,
      emissiveIntensity: 0.25,
    }),
    ground: new THREE.MeshStandardMaterial({
      color: 0xd5cfc4,
      roughness: 1,
      metalness: 0,
    }),
    rug: new THREE.MeshStandardMaterial({
      map: rugTex,
      color: 0xffffff,
      roughness: 0.92,
      metalness: 0,
    }),
    art: new THREE.MeshStandardMaterial({
      color: 0xe7efe8,
      roughness: 0.8,
      metalness: 0,
    }),
  };

  function makeBox(w, h, d, material) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(Math.max(w, 0.012), Math.max(h, 0.012), Math.max(d, 0.012)),
      material
    );
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  const walkables = [];

  function addFloorShape() {
    const shape = new THREE.Shape();
    const pts = shell.slice().reverse();
    pts.forEach(([x, z], i) => {
      if (i === 0) shape.moveTo(x, -z);
      else shape.lineTo(x, -z);
    });
    const geo = new THREE.ShapeGeometry(shape);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    const uv = geo.attributes.uv;
    for (let i = 0; i < pos.count; i += 1) {
      uv.setXY(i, pos.getX(i) / 1.28, pos.getZ(i) / 1.28);
    }
    uv.needsUpdate = true;
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, mats.stone);
    mesh.position.y = 0.012;
    mesh.receiveShadow = true;
    mesh.castShadow = false;
    house.add(mesh);
    walkables.push(mesh);
  }

  function addSlab(x0, z0, x1, z1, material) {
    const pad = 0.08;
    const w = x1 - x0 - pad * 2;
    const d = z1 - z0 - pad * 2;
    if (w < 0.2 || d < 0.2) return;
    const map = material === mats.woodFloor ? woodTex.clone() : null;
    const mat = material.clone();
    if (map) {
      map.repeat.set(w / 1.35, d / 1.35);
      map.needsUpdate = true;
      mat.map = map;
    }
    const mesh = makeBox(w, 0.02, d, mat);
    mesh.castShadow = false;
    mesh.position.set((x0 + x1) / 2, 0.028, (z0 + z1) / 2);
    house.add(mesh);
    walkables.push(mesh);
  }

  function addWall(x1, z1, x2, z2, openings, thickness) {
    const dx = x2 - x1;
    const dz = z2 - z1;
    const length = Math.hypot(dx, dz);
    if (length < 0.05) return;
    const dirx = dx / length;
    const dirz = dz / length;
    const extend = thickness / 2;
    const sx = x1 - dirx * extend;
    const sz = z1 - dirz * extend;
    const total = length + thickness;
    const gaps = (openings || [])
      .map((o) => ({
        c: o.at + extend,
        w: o.width,
        sill: o.sill || 0,
        head: o.head == null ? WALL_H : o.head,
      }))
      .sort((a, b) => a.c - b.c);

    const spans = [];
    let cursor = 0;
    gaps.forEach((g) => {
      const a = Math.max(0.01, g.c - g.w / 2);
      const b = Math.min(total - 0.01, g.c + g.w / 2);
      if (a > cursor + 0.02) spans.push([cursor, a, 0, WALL_H]);
      if (g.sill > 0.03) spans.push([a, b, 0, g.sill]);
      if (WALL_H - g.head > 0.03) spans.push([a, b, g.head, WALL_H]);
      cursor = Math.max(cursor, b);
    });
    if (total - cursor > 0.02) spans.push([cursor, total, 0, WALL_H]);

    const rot = -Math.atan2(dirz, dirx);
    spans.forEach(([a, b, y0, y1]) => {
      const seg = b - a;
      const h = y1 - y0;
      const mesh = makeBox(seg, h, thickness, mats.wall);
      const mid = (a + b) / 2;
      mesh.position.set(sx + dirx * mid, y0 + h / 2, sz + dirz * mid);
      mesh.rotation.y = rot;
      house.add(mesh);
    });
  }

  function addWindow(x1, z1, x2, z2, at, width, sill, head) {
    const dx = x2 - x1;
    const dz = z2 - z1;
    const len = Math.hypot(dx, dz);
    const dirx = dx / len;
    const dirz = dz / len;
    const g = new THREE.Group();
    g.position.set(x1 + dirx * at, 0, z1 + dirz * at);
    g.rotation.y = -Math.atan2(dirz, dirx);
    const gh = head - sill;
    const glass = makeBox(width - 0.08, gh - 0.06, 0.02, mats.glass);
    glass.castShadow = false;
    glass.receiveShadow = false;
    glass.position.set(0, sill + gh / 2, 0);
    const top = makeBox(width + 0.06, 0.05, 0.07, mats.charcoal);
    top.position.set(0, head, 0);
    const bot = makeBox(width + 0.06, 0.05, 0.07, mats.charcoal);
    bot.position.set(0, sill, 0);
    const sideL = makeBox(0.05, gh, 0.07, mats.charcoal);
    sideL.position.set(-width / 2, sill + gh / 2, 0);
    const sideR = makeBox(0.05, gh, 0.07, mats.charcoal);
    sideR.position.set(width / 2, sill + gh / 2, 0);
    g.add(glass, top, bot, sideL, sideR);
    house.add(g);
  }

  function addDoor(x1, z1, x2, z2, at, width, swing) {
    const dx = x2 - x1;
    const dz = z2 - z1;
    const len = Math.hypot(dx, dz);
    const dirx = dx / len;
    const dirz = dz / len;
    const hinge = at - width / 2;
    const pivot = new THREE.Group();
    pivot.position.set(x1 + dirx * hinge, 0, z1 + dirz * hinge);
    pivot.rotation.y = -Math.atan2(dirz, dirx) + swing;
    const slab = makeBox(width - 0.08, 2.02, 0.045, mats.door);
    slab.position.set((width - 0.08) / 2, FY + 1.01, 0.03);
    const handle = makeBox(0.03, 0.12, 0.04, mats.brass);
    handle.position.set(width - 0.2, FY + 1.0, 0.06);
    pivot.add(slab, handle);
    house.add(pivot);
  }

  function buildShell() {
    const openings = {
      0: [
        { at: 7.95, width: 0.6, sill: 1.48, head: 2.12 },
        { at: 10.05, width: 0.6, sill: 1.48, head: 2.12 },
      ],
      1: [
        { at: 2.0, width: 1.55, sill: 0.88, head: 2.18 },
        { at: 7.15, width: 1.3, sill: 0.92, head: 2.15 },
      ],
      2: [
        { at: 1.95, width: 1.2, sill: 0.92, head: 2.15 },
        { at: 6.0, width: 1.2, sill: 0.92, head: 2.15 },
      ],
      3: [{ at: 1.4, width: 0.92, sill: 0, head: 2.08 }],
      4: [{ at: 2.85, width: 2.2, sill: 0.42, head: 2.22 }],
      6: [{ at: 3.45, width: 0.95, sill: 1.12, head: 2.16 }],
    };

    for (let i = 0; i < shell.length; i += 1) {
      const a = shell[i];
      const b = shell[(i + 1) % shell.length];
      const ops = openings[i] || [];
      addWall(a[0], a[1], b[0], b[1], ops, EXT);
      ops.forEach((o) => {
        if (o.sill > 0) addWindow(a[0], a[1], b[0], b[1], o.at, o.width, o.sill, o.head);
      });
    }

    const entry = [shell[3], shell[4]];
    addDoor(entry[0][0], entry[0][1], entry[1][0], entry[1][1], 1.4, 0.92, 0.7);

    const interior = [
      { a: [5.2, 0], b: [5.2, 3.05] },
      {
        a: [1.4, 3.05],
        b: [5.2, 3.05],
        openings: [{ at: 2.15, width: 0.92, head: 2.08 }],
        door: { at: 2.15, width: 0.92, swing: -1.05 },
      },
      { a: [8.3, 0], b: [8.3, 2.8] },
      { a: [10.4, 0], b: [10.4, 2.8] },
      { a: [12.5, 0], b: [12.5, 4.05] },
      {
        a: [8.3, 2.8],
        b: [12.5, 2.8],
        openings: [
          { at: 1.05, width: 0.74, head: 2.08 },
          { at: 3.15, width: 0.74, head: 2.08 },
        ],
        doors: [
          { at: 1.05, width: 0.74, swing: -1.1 },
          { at: 3.15, width: 0.74, swing: -1.1 },
        ],
      },
      {
        a: [12.5, 4.05],
        b: [16.4, 4.05],
        openings: [{ at: 0.9, width: 0.84, head: 2.08 }],
        door: { at: 0.9, width: 0.84, swing: -1.0 },
      },
      {
        a: [8.3, 5.15],
        b: [16.4, 5.15],
        openings: [
          { at: 0.95, width: 0.82, head: 2.08 },
          { at: 5.15, width: 0.82, head: 2.08 },
        ],
        doors: [
          { at: 0.95, width: 0.82, swing: 1.05 },
          { at: 5.15, width: 0.82, swing: 1.05 },
        ],
      },
      { a: [12.5, 5.15], b: [12.5, 9.05] },
      { a: [8.3, 5.15], b: [8.3, 9.05] },
    ];

    interior.forEach((wall) => {
      addWall(wall.a[0], wall.a[1], wall.b[0], wall.b[1], wall.openings || [], INT);
      const doors = wall.doors || (wall.door ? [wall.door] : []);
      doors.forEach((door) => {
        addDoor(wall.a[0], wall.a[1], wall.b[0], wall.b[1], door.at, door.width, door.swing);
      });
    });
  }

  function addBed(x, z, rotY, w, len) {
    const g = new THREE.Group();
    g.position.set(x, FY, z);
    g.rotation.y = rotY;
    const frame = makeBox(w + 0.06, 0.16, len + 0.04, mats.wood);
    frame.position.y = 0.08;
    const mattress = makeBox(w, 0.14, len - 0.02, mats.bedding);
    mattress.position.y = 0.2;
    const head = makeBox(w + 0.08, 0.56, 0.08, mats.charcoal);
    head.position.set(0, 0.4, -len / 2 + 0.02);
    const pillow = makeBox(w * 0.62, 0.07, 0.28, mats.pillow);
    pillow.position.set(0, 0.32, -len / 2 + 0.32);
    g.add(frame, mattress, head, pillow);
    house.add(g);
  }

  function addNightstand(x, z) {
    const g = new THREE.Group();
    const body = makeBox(0.42, 0.42, 0.38, mats.wood);
    body.position.y = FY + 0.21;
    const top = makeBox(0.46, 0.03, 0.42, mats.charcoal);
    top.position.y = FY + 0.43;
    g.add(body, top);
    g.position.set(x, 0, z);
    house.add(g);
  }

  function addWardrobe(x, z, rotY, len) {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.rotation.y = rotY;
    const body = makeBox(len, 2.05, 0.55, mats.wood);
    body.position.y = FY + 1.025;
    const seam = makeBox(0.015, 1.9, 0.02, mats.charcoal);
    seam.position.set(0, FY + 1.05, 0.27);
    const pullL = makeBox(0.08, 0.03, 0.03, mats.brass);
    pullL.position.set(-0.12, FY + 1.05, 0.29);
    const pullR = makeBox(0.08, 0.03, 0.03, mats.brass);
    pullR.position.set(0.12, FY + 1.05, 0.29);
    g.add(body, seam, pullL, pullR);
    house.add(g);
  }

  function addTable(x, z, w, d) {
    const top = makeBox(w, 0.05, d, mats.wood);
    top.position.set(x, FY + 0.74, z);
    house.add(top);
    const legGeo = new THREE.BoxGeometry(0.06, 0.7, 0.06);
    [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ].forEach(([sx, sz]) => {
      const leg = new THREE.Mesh(legGeo, mats.woodDark);
      leg.castShadow = true;
      leg.receiveShadow = true;
      leg.position.set(x + sx * (w / 2 - 0.12), FY + 0.35, z + sz * (d / 2 - 0.1));
      house.add(leg);
    });
  }

  function addChair(x, z, rotY) {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.rotation.y = rotY;
    const seat = makeBox(0.42, 0.05, 0.42, mats.wood);
    seat.position.set(0, FY + 0.46, 0);
    const back = makeBox(0.42, 0.4, 0.045, mats.charcoal);
    back.position.set(0, FY + 0.7, -0.19);
    const legGeo = new THREE.BoxGeometry(0.04, 0.44, 0.04);
    [
      [-0.16, -0.16],
      [0.16, -0.16],
      [-0.16, 0.16],
      [0.16, 0.16],
    ].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, mats.woodDark);
      leg.castShadow = true;
      leg.position.set(lx, FY + 0.22, lz);
      g.add(leg);
    });
    g.add(seat, back);
    house.add(g);
  }

  function addCurvedSofa(cx, cz) {
    const a0 = Math.PI * 0.52;
    const a1 = Math.PI * 1.38;
    const radius = 1.12;
    const n = 8;
    for (let i = 0; i < n; i += 1) {
      const t = i / (n - 1);
      const a = a0 + (a1 - a0) * t;
      const x = cx + Math.cos(a) * radius;
      const z = cz + Math.sin(a) * radius;
      const rot = -a - Math.PI / 2;
      const seat = makeBox(0.56, 0.18, 0.52, mats.sofa);
      seat.position.set(x, FY + 0.2, z);
      seat.rotation.y = rot;
      const cushion = makeBox(0.48, 0.07, 0.4, mats.sofaCushion);
      cushion.position.set(x, FY + 0.32, z);
      cushion.rotation.y = rot;
      const bx = cx + Math.cos(a) * (radius + 0.28);
      const bz = cz + Math.sin(a) * (radius + 0.28);
      const back = makeBox(0.56, 0.4, 0.12, mats.sofa);
      back.position.set(bx, FY + 0.46, bz);
      back.rotation.y = rot;
      house.add(seat, cushion, back);
      if (i === 0 || i === n - 1) {
        const arm = makeBox(0.14, 0.26, 0.46, mats.sofa);
        arm.position.set(x, FY + 0.36, z);
        arm.rotation.y = rot;
        house.add(arm);
      }
    }
    const legGeo = new THREE.CylinderGeometry(0.035, 0.04, 0.1, 6);
    for (let i = 0; i < 5; i += 1) {
      const a = a0 + ((a1 - a0) * i) / 4;
      const leg = new THREE.Mesh(legGeo, mats.woodDark);
      leg.castShadow = true;
      leg.position.set(
        cx + Math.cos(a) * (radius + 0.05),
        FY + 0.05,
        cz + Math.sin(a) * (radius + 0.05)
      );
      house.add(leg);
    }
  }

  function addFlushLight(x, z) {
    const disk = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.025, 12), mats.brass);
    disk.position.set(x, WALL_H - 0.02, z);
    const glow = new THREE.Mesh(
      new THREE.CircleGeometry(0.07, 10),
      new THREE.MeshBasicMaterial({ color: 0xfff4dc })
    );
    glow.rotation.x = Math.PI / 2;
    glow.position.set(x, WALL_H - 0.04, z);
    house.add(disk, glow);
  }

  function addPlant(x, z, scale) {
    const s = scale || 1;
    const pot = makeBox(0.28 * s, 0.22 * s, 0.28 * s, mats.charcoal);
    pot.position.set(x, FY + 0.11 * s, z);
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03 * s, 0.045 * s, 0.32 * s, 6),
      mats.woodDark
    );
    trunk.position.set(x, FY + 0.36 * s, z);
    trunk.castShadow = true;
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.22 * s, 8, 6), mats.plant);
    leaf.position.set(x, FY + 0.62 * s, z);
    leaf.castShadow = true;
    house.add(pot, trunk, leaf);
  }

  function addBathroom(x0, z0, x1, z1) {
    const midX = (x0 + x1) / 2;
    const tubW = Math.min(1.48, x1 - x0 - 0.42);
    const tub = makeBox(tubW, 0.46, 0.7, mats.ceramic);
    tub.position.set(midX, FY + 0.23, z0 + 0.52);
    const water = makeBox(tubW - 0.14, 0.035, 0.42, mats.water);
    water.castShadow = false;
    water.position.set(midX, FY + 0.42, z0 + 0.5);
    const vanity = makeBox(0.62, 0.72, 0.4, mats.charcoal);
    vanity.position.set(x0 + 0.46, FY + 0.36, z1 - 0.55);
    const basin = makeBox(0.42, 0.06, 0.28, mats.ceramic);
    basin.position.set(x0 + 0.46, FY + 0.75, z1 - 0.55);
    const toilet = makeBox(0.38, 0.4, 0.52, mats.ceramic);
    toilet.position.set(x1 - 0.42, FY + 0.2, z1 - 0.62);
    const tank = makeBox(0.36, 0.28, 0.16, mats.ceramic);
    tank.position.set(x1 - 0.42, FY + 0.48, z1 - 0.38);
    house.add(tub, water, vanity, basin, toilet, tank);
  }

  function furnish() {
    addFloorShape();
    addSlab(1.4, 0, 5.2, 3.05, mats.tile);
    addSlab(8.3, 0, 10.4, 2.8, mats.bathTile);
    addSlab(10.4, 0, 12.5, 2.8, mats.bathTile);
    addSlab(12.5, 0, 16.4, 4.05, mats.woodFloor);
    addSlab(8.3, 5.15, 12.5, 9.05, mats.woodFloor);
    addSlab(12.5, 5.15, 16.4, 9.05, mats.woodFloor);

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(48, 48), mats.ground);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(8.2, -0.02, 4.8);
    ground.receiveShadow = false;
    scene.add(ground);

    // Kitchen L: west leg under the window, north leg with the hob.
    const westBase = makeBox(0.62, 0.88, 2.15, mats.charcoal);
    westBase.position.set(1.82, FY + 0.44, 1.58);
    const westTop = makeBox(0.66, 0.04, 2.2, mats.counter);
    westTop.position.set(1.82, FY + 0.9, 1.58);
    const northBase = makeBox(2.45, 0.88, 0.62, mats.charcoal);
    northBase.position.set(3.28, FY + 0.44, 0.42);
    const northTop = makeBox(2.5, 0.04, 0.66, mats.counter);
    northTop.position.set(3.28, FY + 0.9, 0.42);
    const sink = makeBox(0.42, 0.05, 0.32, mats.charcoal);
    sink.position.set(1.82, FY + 0.93, 1.6);
    const faucet = makeBox(0.04, 0.16, 0.04, mats.brass);
    faucet.position.set(1.58, FY + 1.02, 1.6);
    const hob = makeBox(0.52, 0.02, 0.42, mats.screen);
    hob.position.set(3.7, FY + 0.93, 0.42);
    const uppers = makeBox(2.15, 0.55, 0.32, mats.wood);
    uppers.position.set(3.15, 1.78, 0.26);
    const splash = makeBox(2.3, 0.48, 0.02, mats.counter);
    splash.position.set(3.2, 1.2, 0.12);
    const fridge = makeBox(0.68, 1.78, 0.64, mats.charcoal);
    fridge.position.set(4.62, FY + 0.89, 1.45);
    const fridgeLine = makeBox(0.02, 0.7, 0.5, mats.brass);
    fridgeLine.position.set(4.28, FY + 1.05, 1.45);
    house.add(westBase, westTop, northBase, northTop, sink, faucet, hob, uppers, splash, fridge, fridgeLine);

    const artFrame = makeBox(0.04, 0.7, 0.92, mats.brass);
    artFrame.position.set(5.3, 1.5, 1.7);
    const art = makeBox(0.02, 0.52, 0.72, mats.art);
    art.position.set(5.34, 1.5, 1.7);
    house.add(artFrame, art);

    addBathroom(8.3, 0, 10.4, 2.8);
    addBathroom(10.4, 0, 12.5, 2.8);

    const tx = 6.85;
    const tz = 4.5;
    addTable(tx, tz, 1.5, 0.9);
    addChair(tx, tz - 0.78, 0);
    addChair(tx, tz + 0.78, Math.PI);
    addChair(tx + 1.05, tz, -Math.PI / 2);
    addChair(tx - 1.05, tz, Math.PI / 2);
    addPlant(tx, tz, 0.55);

    const cord = makeBox(0.015, 0.85, 0.015, mats.charcoal);
    cord.position.set(tx, 2.15, tz);
    const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.26, 0.16, 10), mats.brass);
    shade.position.set(tx, 1.68, tz);
    shade.castShadow = true;
    house.add(cord, shade);

    const rug = makeBox(3.15, 0.015, 2.35, mats.rug);
    rug.castShadow = false;
    rug.position.set(3.15, FY + 0.01, 6.85);
    house.add(rug);
    addCurvedSofa(2.72, 6.58);

    const tableTop = makeBox(0.72, 0.04, 0.72, mats.wood);
    tableTop.position.set(3.15, FY + 0.36, 6.7);
    const tleg = new THREE.BoxGeometry(0.04, 0.32, 0.04);
    [
      [-0.28, -0.28],
      [0.28, -0.28],
      [-0.28, 0.28],
      [0.28, 0.28],
    ].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(tleg, mats.brass);
      leg.castShadow = true;
      leg.position.set(3.15 + lx, FY + 0.16, 6.7 + lz);
      house.add(leg);
    });
    house.add(tableTop);

    const console = makeBox(0.4, 0.42, 1.7, mats.charcoal);
    console.position.set(7.95, FY + 0.21, 7.05);
    const screen = makeBox(0.04, 0.78, 1.32, mats.screen);
    screen.position.set(7.72, FY + 0.95, 7.05);
    const bezel = makeBox(0.02, 0.86, 1.4, mats.brass);
    bezel.position.set(7.74, FY + 0.95, 7.05);
    house.add(console, bezel, screen);

    addPlant(1.85, 7.45, 1.15);

    addBed(14.7, 1.85, 0, 1.6, 2.05);
    addNightstand(13.55, 1.05);
    addNightstand(15.85, 1.05);
    addWardrobe(12.9, 1.55, Math.PI / 2, 1.7);

    addBed(10.55, 6.75, 0, 1.4, 2.0);
    addWardrobe(12.14, 7.05, -Math.PI / 2, 1.5);

    addBed(14.7, 6.75, 0, 1.45, 2.0);
    addWardrobe(12.9, 7.05, Math.PI / 2, 1.5);

    [ [3.4, 6.2], [6.8, 4.5], [3.2, 1.5], [14.6, 2.0], [10.4, 7.1], [14.6, 7.1] ].forEach(
      ([x, z]) => addFlushLight(x, z)
    );
  }

  function addLights() {
    const hemi = new THREE.HemisphereLight(0xfff6ea, 0xc9bfb0, 1.35);
    scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xfff1dc, 2.6);
    sun.position.set(-2.5, 14, 12);
    sun.target.position.set(8, 0, 4.5);
    sun.castShadow = true;
    sun.shadow.mapSize.set(coarse ? 512 : 1024, coarse ? 512 : 1024);
    sun.shadow.camera.near = 2;
    sun.shadow.camera.far = 36;
    const ext = 12;
    sun.shadow.camera.left = -ext;
    sun.shadow.camera.right = ext;
    sun.shadow.camera.top = ext;
    sun.shadow.camera.bottom = -ext;
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.04;
    scene.add(sun);
    scene.add(sun.target);

    const fill = new THREE.DirectionalLight(0xf3efe6, 0.55);
    fill.position.set(18, 8, -2);
    scene.add(fill);

    const bulbs = [
      [3.4, 6.3, 18, 7.5],
      [6.85, 4.5, 14, 6],
      [3.1, 1.6, 12, 5],
      [14.6, 2.1, 14, 6],
      [10.4, 7.0, 12, 5.5],
      [14.6, 7.0, 12, 5.5],
      [10.3, 3.6, 10, 5],
    ];
    bulbs.forEach(([x, z, intensity, dist]) => {
      const light = new THREE.PointLight(0xfff0d4, intensity, dist, 2);
      light.position.set(x, 2.25, z);
      scene.add(light);
    });
  }

  const hotspots = [];

  function makeLabel(text) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 160;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 512, 160);
    ctx.fillStyle = "rgba(44, 42, 38, 0.9)";
    roundRect(ctx, 16, 28, 480, 104, 40);
    ctx.fill();
    ctx.fillStyle = "#c4a35a";
    ctx.fillRect(196, 112, 120, 4);
    ctx.fillStyle = "#f7f5f2";
    ctx.font = '600 64px "Noto Sans TC", "PingFang HK", "Microsoft JhengHei", sans-serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 256, 78);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: true })
    );
    sprite.scale.set(1.28, 0.4, 1);
    sprite.renderOrder = 2;
    return sprite;
  }

  function addLabels() {
    const items = [
      ["客廳", 4.55, 5.55, "living"],
      ["廚房", 3.35, 2.15, "kitchen"],
      ["主人房", 14.85, 3.05, "master"],
      ["睡房", 10.15, 8.15, "bed"],
      ["睡房", 15.15, 8.15, "bed3"],
      ["浴室", 9.35, 1.7, "bath"],
    ];
    items.forEach(([text, x, z, id]) => {
      const sprite = makeLabel(text);
      sprite.position.set(x, 1.55, z);
      sprite.userData.room = id;
      house.add(sprite);
      hotspots.push(sprite);
    });
  }

  addLights();
  buildShell();
  furnish();

  const buttons = Array.from(document.querySelectorAll("[data-room]"));

  function setActive(id) {
    buttons.forEach((btn) => {
      btn.setAttribute("aria-pressed", btn.dataset.room === id ? "true" : "false");
    });
  }

  let fly = null;

  function jumpTo(preset) {
    camera.position.set(preset.position[0], preset.position[1], preset.position[2]);
    controls.target.set(preset.target[0], preset.target[1], preset.target[2]);
    controls.update();
  }

  function selectRoom(id, animate) {
    const preset = PRESETS[id] || PRESETS.living;
    setActive(id);
    if (!animate || reduceMotion) {
      fly = null;
      jumpTo(preset);
    } else {
      fly = {
        fromP: camera.position.clone(),
        fromT: controls.target.clone(),
        toP: new THREE.Vector3(preset.position[0], preset.position[1], preset.position[2]),
        toT: new THREE.Vector3(preset.target[0], preset.target[1], preset.target[2]),
        t0: performance.now(),
        dur: 980,
      };
    }
    const url = new URL(window.location.href);
    url.hash = id;
    window.history.replaceState(null, "", url);
  }

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => selectRoom(btn.dataset.room, true));
  });

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  function setPointer(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  let downX = 0;
  let downY = 0;
  let dragged = false;

  renderer.domElement.addEventListener("pointerdown", (event) => {
    downX = event.clientX;
    downY = event.clientY;
    dragged = false;
    fly = null;
    renderer.domElement.classList.add("is-dragging");
  });

  renderer.domElement.addEventListener("pointermove", (event) => {
    if (event.buttons && Math.hypot(event.clientX - downX, event.clientY - downY) > 8) {
      dragged = true;
    }
  });

  window.addEventListener("pointerup", (event) => {
    renderer.domElement.classList.remove("is-dragging");
    if (event.target !== renderer.domElement || dragged) return;
    if (Math.hypot(event.clientX - downX, event.clientY - downY) > 8) return;
    setPointer(event);
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(hotspots, false)[0];
    if (hit && hit.object.userData.room) selectRoom(hit.object.userData.room, true);
  });

  if (!coarse) {
    renderer.domElement.addEventListener("dblclick", (event) => {
      setPointer(event);
      raycaster.setFromCamera(pointer, camera);
      if (raycaster.intersectObjects(hotspots, false)[0]) return;
      const floorHit = raycaster.intersectObjects(walkables, false)[0];
      if (!floorHit) return;
      const point = floorHit.point;
      const dir = camera.position.clone().setY(0).sub(new THREE.Vector3(point.x, 0, point.z));
      if (dir.lengthSq() < 0.25) dir.set(0, 0, 1);
      dir.normalize();
      const toP = new THREE.Vector3(point.x, 1.6, point.z).add(dir.multiplyScalar(1.65));
      fly = {
        fromP: camera.position.clone(),
        fromT: controls.target.clone(),
        toP,
        toT: new THREE.Vector3(point.x, 0.75, point.z),
        t0: performance.now(),
        dur: reduceMotion ? 0 : 800,
      };
      setActive("");
    });
  }

  const keys = new Set();
  const moveKeys = {
    w: true,
    a: true,
    s: true,
    d: true,
    arrowup: true,
    arrowdown: true,
    arrowleft: true,
    arrowright: true,
  };

  window.addEventListener("keydown", (event) => {
    const k = event.key.toLowerCase();
    if (!moveKeys[k]) return;
    const active = document.activeElement;
    if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA")) return;
    const inToolbar = active && active.closest && active.closest(".tour-hotspots");
    if (inToolbar && k.indexOf("arrow") === 0) return;
    event.preventDefault();
    keys.add(k);
    fly = null;
  });

  window.addEventListener("keyup", (event) => {
    keys.delete(event.key.toLowerCase());
  });
  window.addEventListener("blur", () => keys.clear());

  const forward = new THREE.Vector3();
  const right = new THREE.Vector3();
  const delta = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0);

  function moveWasd(dt) {
    if (fly || keys.size === 0) return;
    camera.getWorldDirection(forward);
    forward.y = 0;
    if (forward.lengthSq() < 1e-6) forward.set(0, 0, -1);
    forward.normalize();
    right.crossVectors(forward, up);
    delta.set(0, 0, 0);
    if (keys.has("w") || keys.has("arrowup")) delta.add(forward);
    if (keys.has("s") || keys.has("arrowdown")) delta.sub(forward);
    if (keys.has("d") || keys.has("arrowright")) delta.add(right);
    if (keys.has("a") || keys.has("arrowleft")) delta.sub(right);
    if (delta.lengthSq() === 0) return;
    const speed = (eventShift() ? 3.4 : 1.75) * dt;
    delta.normalize().multiplyScalar(speed);
    camera.position.add(delta);
    controls.target.add(delta);
  }

  function eventShift() {
    return keys.has("shift");
  }

  window.addEventListener("keydown", (event) => {
    if (event.key === "Shift") keys.add("shift");
  });
  window.addEventListener("keyup", (event) => {
    if (event.key === "Shift") keys.delete("shift");
  });

  function resize() {
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }

  const resizeObserver = new ResizeObserver(() => resize());
  resizeObserver.observe(stage);
  resize();

  const initial = (window.location.hash || "#living").replace("#", "");
  selectRoom(PRESETS[initial] ? initial : "living", false);

  const clock = new THREE.Clock();
  let running = true;

  document.addEventListener("visibilitychange", () => {
    running = !document.hidden;
    if (running) clock.getDelta();
  });

  function frame(now) {
    requestAnimationFrame(frame);
    if (!running) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    if (fly) {
      const u = fly.dur <= 0 ? 1 : Math.min(1, (now - fly.t0) / fly.dur);
      const e = u < 0.5 ? 2 * u * u : 1 - ((-2 * u + 2) ** 2) / 2;
      camera.position.lerpVectors(fly.fromP, fly.toP, e);
      controls.target.lerpVectors(fly.fromT, fly.toT, e);
      if (u >= 1) fly = null;
    } else {
      moveWasd(dt);
    }
    controls.update();
    renderer.render(scene, camera);
  }

  document.fonts.ready.then(() => {
    addLabels();
  });

  if (loadingEl) loadingEl.classList.add("is-hidden");
  requestAnimationFrame(frame);
}

try {
  main();
} catch (err) {
  console.error(err);
  fail("此瀏覽器未能啟動 3D 預覽。");
}
