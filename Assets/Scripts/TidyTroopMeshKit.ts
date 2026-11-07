/**
 * TidyTroopMeshKit — tiny vertex-colored MeshBuilder toolkit (code-authored mesh backend).
 * Owns: CCW-wound primitives (box, ellipsoid, frustum, flat ring, octahedron, extruded and
 *       soft-edged XY outlines, strips, discs, lathe) with a transform stack so parts can be
 *       rotated/offset before they are baked, and optional baked light (setShading) because the
 *       vertex-colour material is unlit.
 * Must not: create materials or touch scene state other than the SceneObject passed to build().
 * Winding: every triangle is CCW seen from outside (verified with the cross-product rule).
 */

export type RGBA = [number, number, number, number]

export function rgb(r: number, g: number, b: number): RGBA {
  return [r, g, b, 1]
}

export function fromVec3(c: vec3): RGBA {
  return [c.x, c.y, c.z, 1]
}

/** Colour times f (f < 1 darkens). Alpha unchanged. */
export function shadeRGBA(c: RGBA, f: number): RGBA {
  return [Math.min(1, c[0] * f), Math.min(1, c[1] * f), Math.min(1, c[2] * f), c[3]]
}

/** Blend a -> b by t (0 = a, 1 = b). */
export function mixRGBA(a: RGBA, b: RGBA, t: number): RGBA {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t, a[3] + (b[3] - a[3]) * t]
}

/** Mirror an XY outline across x = 0, keeping it counter-clockwise (for prismXY). */
export function mirrorX(pts: number[][]): number[][] {
  return pts.map((p) => [-p[0], p[1]]).reverse()
}

interface Xf {
  pos: vec3
  rot: quat
}

export class MeshKit {
  private verts: number[] = []
  private indices: number[] = []
  private count = 0
  private stack: Xf[] = [{pos: vec3.zero(), rot: quat.quatIdentity()}]
  private shadeOn = false
  private light: vec3 = new vec3(0, 0, 1)
  private ambient = 1
  private diffuse = 0

  get vertexCount(): number {
    return this.count
  }

  /**
   * Bake a simple light into the vertex colours of everything added after this call.
   * The vertex-colour material is unlit, so without it every face of a part is one flat colour.
   * `lightDir` is in this mesh's own space; brightness = ambient + diffuse * max(0, n . light), capped at 1.
   * Keep ambient high: the Specs display is additive, so dark faces turn see-through.
   */
  setShading(lightDir: vec3, ambient: number = 0.68, diffuse: number = 0.4): void {
    this.shadeOn = true
    this.light = lightDir.normalize()
    this.ambient = ambient
    this.diffuse = diffuse
  }

  /** Push a local transform (degrees for the euler helper below). */
  push(pos: vec3, rot?: quat): void {
    const top = this.stack[this.stack.length - 1]
    const r = rot ? rot : quat.quatIdentity()
    this.stack.push({pos: top.pos.add(top.rot.multiplyVec3(pos)), rot: top.rot.multiply(r)})
  }

  pop(): void {
    if (this.stack.length > 1) this.stack.pop()
  }

  private v(x: number, y: number, z: number, nx: number, ny: number, nz: number, c: RGBA): number {
    const top = this.stack[this.stack.length - 1]
    const p = top.pos.add(top.rot.multiplyVec3(new vec3(x, y, z)))
    const n = top.rot.multiplyVec3(new vec3(nx, ny, nz))
    let f = 1
    if (this.shadeOn) {
      const len = n.length || 1
      f = Math.min(1, this.ambient + this.diffuse * Math.max(0, n.dot(this.light) / len))
    }
    this.verts.push(p.x, p.y, p.z, n.x, n.y, n.z, c[0] * f, c[1] * f, c[2] * f, c[3])
    return this.count++
  }

  private tri(a: number, b: number, c: number): void {
    this.indices.push(a, b, c)
  }

  /** Axis-aligned box centred at (cx,cy,cz) with full sizes w,h,d. */
  box(cx: number, cy: number, cz: number, w: number, h: number, d: number, c: RGBA): void {
    const x0 = cx - w / 2, x1 = cx + w / 2
    const y0 = cy - h / 2, y1 = cy + h / 2
    const z0 = cz - d / 2, z1 = cz + d / 2
    const face = (p: number[][], n: number[]) => {
      const a = this.v(p[0][0], p[0][1], p[0][2], n[0], n[1], n[2], c)
      const b = this.v(p[1][0], p[1][1], p[1][2], n[0], n[1], n[2], c)
      const e = this.v(p[2][0], p[2][1], p[2][2], n[0], n[1], n[2], c)
      const f = this.v(p[3][0], p[3][1], p[3][2], n[0], n[1], n[2], c)
      this.tri(a, b, e)
      this.tri(a, e, f)
    }
    face([[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]], [1, 0, 0])
    face([[x0, y0, z1], [x0, y1, z1], [x0, y1, z0], [x0, y0, z0]], [-1, 0, 0])
    face([[x0, y1, z0], [x0, y1, z1], [x1, y1, z1], [x1, y1, z0]], [0, 1, 0])
    face([[x0, y0, z1], [x0, y0, z0], [x1, y0, z0], [x1, y0, z1]], [0, -1, 0])
    face([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], [0, 0, 1])
    face([[x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0]], [0, 0, -1])
  }

  /** Ellipsoid centred at (cx,cy,cz) with radii rx,ry,rz. */
  ellipsoid(cx: number, cy: number, cz: number, rx: number, ry: number, rz: number, c: RGBA, seg = 14, rings = 9): void {
    const grid: number[][] = []
    for (let i = 0; i <= rings; i++) {
      const th = (i / rings) * Math.PI
      const row: number[] = []
      for (let j = 0; j <= seg; j++) {
        const ph = (j / seg) * Math.PI * 2
        const ux = Math.sin(th) * Math.cos(ph)
        const uy = Math.cos(th)
        const uz = Math.sin(th) * Math.sin(ph)
        // normal of an ellipsoid ~ (ux/rx, uy/ry, uz/rz) normalized
        let nx = ux / rx, ny = uy / ry, nz = uz / rz
        const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1
        nx /= len; ny /= len; nz /= len
        row.push(this.v(cx + ux * rx, cy + uy * ry, cz + uz * rz, nx, ny, nz, c))
      }
      grid.push(row)
    }
    for (let i = 0; i < rings; i++) {
      for (let j = 0; j < seg; j++) {
        const a = grid[i][j], b = grid[i + 1][j], cc = grid[i + 1][j + 1], d = grid[i][j + 1]
        this.tri(a, cc, b)
        this.tri(a, d, cc)
      }
    }
  }

  sphere(cx: number, cy: number, cz: number, r: number, c: RGBA, seg = 12, rings = 8): void {
    this.ellipsoid(cx, cy, cz, r, r, r, c, seg, rings)
  }

  /** Capped frustum along +Y from y0 (radius rBottom) to y0+height (radius rTop). */
  frustumY(cx: number, y0: number, cz: number, rBottom: number, rTop: number, height: number, c: RGBA, seg = 16): void {
    const y1 = y0 + height
    const slope = (rBottom - rTop) / Math.max(height, 0.0001)
    const bottom: number[] = [], top: number[] = []
    for (let j = 0; j <= seg; j++) {
      const ph = (j / seg) * Math.PI * 2
      const cs = Math.cos(ph), sn = Math.sin(ph)
      const l = Math.sqrt(1 + slope * slope)
      bottom.push(this.v(cx + rBottom * cs, y0, cz + rBottom * sn, cs / l, slope / l, sn / l, c))
      top.push(this.v(cx + rTop * cs, y1, cz + rTop * sn, cs / l, slope / l, sn / l, c))
    }
    for (let j = 0; j < seg; j++) {
      this.tri(bottom[j], top[j], top[j + 1])
      this.tri(bottom[j], top[j + 1], bottom[j + 1])
    }
    const ct = this.v(cx, y1, cz, 0, 1, 0, c)
    const cb = this.v(cx, y0, cz, 0, -1, 0, c)
    const tRing: number[] = [], bRing: number[] = []
    for (let j = 0; j <= seg; j++) {
      const ph = (j / seg) * Math.PI * 2
      tRing.push(this.v(cx + rTop * Math.cos(ph), y1, cz + rTop * Math.sin(ph), 0, 1, 0, c))
      bRing.push(this.v(cx + rBottom * Math.cos(ph), y0, cz + rBottom * Math.sin(ph), 0, -1, 0, c))
    }
    for (let j = 0; j < seg; j++) {
      this.tri(ct, tRing[j + 1], tRing[j])
      this.tri(cb, bRing[j], bRing[j + 1])
    }
  }

  cylinderY(cx: number, y0: number, cz: number, r: number, height: number, c: RGBA, seg = 16): void {
    this.frustumY(cx, y0, cz, r, r, height, c, seg)
  }

  /** Flat ring in the local XZ plane (normal +Y), visible from both sides. */
  ringXZ(cx: number, cy: number, cz: number, rInner: number, rOuter: number, c: RGBA, seg = 32): void {
    for (const side of [1, -1]) {
      const inner: number[] = [], outer: number[] = []
      for (let j = 0; j <= seg; j++) {
        const ph = (j / seg) * Math.PI * 2
        const cs = Math.cos(ph), sn = Math.sin(ph)
        inner.push(this.v(cx + rInner * cs, cy, cz + rInner * sn, 0, side, 0, c))
        outer.push(this.v(cx + rOuter * cs, cy, cz + rOuter * sn, 0, side, 0, c))
      }
      for (let j = 0; j < seg; j++) {
        if (side > 0) {
          this.tri(inner[j], outer[j + 1], outer[j])
          this.tri(inner[j], inner[j + 1], outer[j + 1])
        } else {
          this.tri(inner[j], outer[j], outer[j + 1])
          this.tri(inner[j], outer[j + 1], inner[j + 1])
        }
      }
    }
  }

  /**
   * Convex outline in the local XY plane, extruded from z0 to z1 (z1 > z0).
   * `pts` are [x, y] pairs in counter-clockwise order seen from +Z (use mirrorX for the other side).
   * Front fan faces +Z, back fan -Z, each side quad faces outwards (right of the CCW edge).
   */
  prismXY(pts: number[][], z0: number, z1: number, c: RGBA): void {
    const n = pts.length
    if (n < 3) return
    const front = pts.map((p) => this.v(p[0], p[1], z1, 0, 0, 1, c))
    for (let i = 1; i < n - 1; i++) this.tri(front[0], front[i], front[i + 1])
    const back = pts.map((p) => this.v(p[0], p[1], z0, 0, 0, -1, c))
    for (let i = 1; i < n - 1; i++) this.tri(back[0], back[i + 1], back[i])
    for (let i = 0; i < n; i++) {
      const p = pts[i], q = pts[(i + 1) % n]
      const dx = q[0] - p[0], dy = q[1] - p[1]
      const len = Math.sqrt(dx * dx + dy * dy) || 1
      const nx = dy / len, ny = -dx / len
      const a = this.v(p[0], p[1], z0, nx, ny, 0, c)
      const b = this.v(q[0], q[1], z0, nx, ny, 0, c)
      const cc = this.v(q[0], q[1], z1, nx, ny, 0, c)
      const d = this.v(p[0], p[1], z1, nx, ny, 0, c)
      this.tri(a, b, cc)
      this.tri(a, cc, d)
    }
  }

  /**
   * prismXY with a soft front edge: the front face is the outline inset by `bevel` cm, joined to the
   * outline by a 45-degree band. With setShading this reads as fabric with volume instead of a cut-out.
   * Same outline rules as prismXY (convex, CCW from +Z); keep `bevel` below the outline's inner radius.
   */
  bevelPrismXY(pts: number[][], z0: number, z1: number, bevel: number, c: RGBA): void {
    const n = pts.length
    if (n < 3) return
    const depth = Math.min(bevel, (z1 - z0) * 0.6)
    const zb = z1 - depth
    // Miter-offset every vertex towards the inside (left of each CCW edge).
    const inset: number[][] = []
    for (let i = 0; i < n; i++) {
      const p0 = pts[(i - 1 + n) % n], p = pts[i], p1 = pts[(i + 1) % n]
      const e1x = p[0] - p0[0], e1y = p[1] - p0[1]
      const e2x = p1[0] - p[0], e2y = p1[1] - p[1]
      const l1 = Math.sqrt(e1x * e1x + e1y * e1y) || 1
      const l2 = Math.sqrt(e2x * e2x + e2y * e2y) || 1
      const n1x = -e1y / l1, n1y = e1x / l1
      const n2x = -e2y / l2, n2y = e2x / l2
      const m = Math.max(0.25, 1 + n1x * n2x + n1y * n2y)
      inset.push([p[0] + (bevel * (n1x + n2x)) / m, p[1] + (bevel * (n1y + n2y)) / m])
    }
    const front = inset.map((q) => this.v(q[0], q[1], z1, 0, 0, 1, c))
    for (let i = 1; i < n - 1; i++) this.tri(front[0], front[i], front[i + 1])
    const back = pts.map((q) => this.v(q[0], q[1], z0, 0, 0, -1, c))
    for (let i = 1; i < n - 1; i++) this.tri(back[0], back[i + 1], back[i])
    const s = Math.SQRT1_2
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n
      const p = pts[i], q = pts[j]
      const dx = q[0] - p[0], dy = q[1] - p[1]
      const len = Math.sqrt(dx * dx + dy * dy) || 1
      const nx = dy / len, ny = -dx / len
      // Side wall z0..zb (outward = right of the CCW edge).
      const a = this.v(p[0], p[1], z0, nx, ny, 0, c)
      const b = this.v(q[0], q[1], z0, nx, ny, 0, c)
      const cc = this.v(q[0], q[1], zb, nx, ny, 0, c)
      const d = this.v(p[0], p[1], zb, nx, ny, 0, c)
      this.tri(a, b, cc)
      this.tri(a, cc, d)
      // Bevel band from the outline at zb up and in to the inset outline at z1.
      const e = this.v(p[0], p[1], zb, nx * s, ny * s, s, c)
      const f = this.v(q[0], q[1], zb, nx * s, ny * s, s, c)
      const g = this.v(inset[j][0], inset[j][1], z1, nx * s, ny * s, s, c)
      const h = this.v(inset[i][0], inset[i][1], z1, nx * s, ny * s, s, c)
      this.tri(e, f, g)
      this.tri(e, g, h)
    }
  }

  /** Flat regular polygon disc (buttons, rivets) facing +Z at (cx, cy), extruded z0..z1. */
  discXY(cx: number, cy: number, r: number, z0: number, z1: number, c: RGBA, seg: number = 10): void {
    const pts: number[][] = []
    for (let i = 0; i < seg; i++) {
      const a = (i / seg) * Math.PI * 2
      pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)])
    }
    this.prismXY(pts, z0, z1, c)
  }

  /** A thin straight band from (x0, y0) to (x1, y1), `w` wide, extruded z0..z1 (stitches, seams, creases). */
  stripXY(x0: number, y0: number, x1: number, y1: number, w: number, z0: number, z1: number, c: RGBA): void {
    const dx = x1 - x0, dy = y1 - y0
    const len = Math.sqrt(dx * dx + dy * dy) || 1
    const px = (-dy / len) * (w / 2), py = (dx / len) * (w / 2)
    this.prismXY([[x0 - px, y0 - py], [x1 - px, y1 - py], [x1 + px, y1 + py], [x0 + px, y0 + py]], z0, z1, c)
  }

  /** stripXY along a polyline of [x, y] points. */
  polyStripXY(pts: number[][], w: number, z0: number, z1: number, c: RGBA): void {
    for (let i = 0; i < pts.length - 1; i++) {
      this.stripXY(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], w, z0, z1, c)
    }
  }

  /**
   * Surface of revolution around local +Y. `profile` is [r, y] pairs walked clockwise in the (r, y) plane
   * (outwards along the top, down the outer edge, inwards along the bottom) so every face points outwards.
   * Each profile segment gets its own vertex rings (crisp profile edges) and colours[i] (last one repeats).
   */
  latheY(profile: number[][], colours: RGBA[], seg: number = 32): void {
    for (let i = 0; i < profile.length - 1; i++) {
      const r0 = profile[i][0], y0 = profile[i][1]
      const r1 = profile[i + 1][0], y1 = profile[i + 1][1]
      const dr = r1 - r0, dy = y1 - y0
      const len = Math.sqrt(dr * dr + dy * dy) || 1
      const nr = -dy / len, ny = dr / len
      const c = colours[Math.min(i, colours.length - 1)]
      const a: number[] = [], b: number[] = []
      for (let j = 0; j <= seg; j++) {
        const ph = (j / seg) * Math.PI * 2
        const cs = Math.cos(ph), sn = Math.sin(ph)
        a.push(this.v(r0 * cs, y0, r0 * sn, nr * cs, ny, nr * sn, c))
        b.push(this.v(r1 * cs, y1, r1 * sn, nr * cs, ny, nr * sn, c))
      }
      for (let j = 0; j < seg; j++) {
        this.tri(a[j], a[j + 1], b[j])
        this.tri(a[j + 1], b[j + 1], b[j])
      }
    }
  }

  /** Octahedron (sparkle / badge gem). */
  octahedron(cx: number, cy: number, cz: number, r: number, c: RGBA): void {
    for (const sx of [1, -1]) {
      for (const sy of [1, -1]) {
        for (const sz of [1, -1]) {
          const n = new vec3(sx, sy, sz).normalize()
          const a = this.v(cx + sx * r, cy, cz, n.x, n.y, n.z, c)
          const b = this.v(cx, cy + sy * r, cz, n.x, n.y, n.z, c)
          const d = this.v(cx, cy, cz + sz * r, n.x, n.y, n.z, c)
          if (sx * sy * sz > 0) this.tri(a, b, d)
          else this.tri(a, d, b)
        }
      }
    }
  }

  /** Bake into a RenderMeshVisual on `so` (creates one if missing). */
  build(so: SceneObject, material: Material): RenderMeshVisual {
    const builder = new MeshBuilder([
      {name: "position", components: 3},
      {name: "normal", components: 3, normalized: true},
      {name: "color", components: 4},
    ])
    builder.topology = MeshTopology.Triangles
    builder.indexType = MeshIndexType.UInt16
    builder.appendVerticesInterleaved(this.verts)
    builder.appendIndices(this.indices)
    builder.updateMesh()
    let rmv = so.getComponent("Component.RenderMeshVisual") as RenderMeshVisual
    if (!rmv) rmv = so.createComponent("Component.RenderMeshVisual") as RenderMeshVisual
    rmv.mesh = builder.getMesh()
    rmv.mainMaterial = material
    return rmv
  }
}

export function eulerDeg(x: number, y: number, z: number): quat {
  return quat.fromEulerAngles(x * MathUtils.DegToRad, y * MathUtils.DegToRad, z * MathUtils.DegToRad)
}

export function axisDeg(deg: number, axis: vec3): quat {
  return quat.angleAxis(deg * MathUtils.DegToRad, axis)
}
