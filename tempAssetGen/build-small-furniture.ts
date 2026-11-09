// ExecuteEditorCode body (Editor API). Builds the bedroom's small cupboard and small table by copying
// the AroundUser Cupboard and Desk (with their hanger, shelf and rack places), then hides the
// BedroomPlaces group (rail on the real wardrobe, real shelves, rack on the real table) in the bedroom.
// args: { cupboardPos: [x,y,z], cupboardRotY, tablePos: [x,y,z], tableRotY, dryRun }
// Positions are world cm (Room sits at the origin in the bedroom layout). Re-running replaces the copies.
const A: any = args;
const model = pluginSystem.findInterface(Editor.Model.IModel);
const scene = model.project.scene;
const out: string[] = [];
const byName: Record<string, any> = {};
const walk = (so: any) => { if (!(so.name in byName)) byName[so.name] = so; for (const c of so.children) walk(c); };
for (const r of scene.rootSceneObjects) walk(r);
const need = ['Furniture', 'Cupboard', 'Desk', 'BedroomPlaces', 'WardrobeRail'];
for (const n of need) if (!byName[n]) return 'missing ' + n;
const script = (so: any, name: string) => so.components.find((c: any) => c.scriptAsset && c.scriptAsset.name === name);
const v3 = (a: number[]) => new vec3(a[0], a[1], a[2]);
const setPose = (so: any, pos: vec3, rot: vec3) => {
  const t = so.localTransform;
  t.position = pos;
  t.rotation = rot;
  so.localTransform = t;
};
const furniture = byName['Furniture'];
const dropAsset = script(byName['WardrobeRail'], 'TidyTroopDropZone').scriptAsset;

// Remove copies from an earlier run.
for (const old of furniture.children.filter((c: any) => c.name === 'SmallCupboard' || c.name === 'SmallTable')) {
  out.push('removed old ' + old.name);
  if (!A.dryRun) old.destroy();
}

const clone = (src: any, name: string, kind: string, pos: vec3, rotY: number) => {
  const so = src.copy();
  if (!so.getParent() || so.getParent().name !== 'Furniture') so.setParent(furniture);
  so.name = name;
  so.enabled = true;
  setPose(so, pos, new vec3(0, rotY, 0));
  script(so, 'TidyTroopProp').kind = kind;
  const spot = script(so, 'TidyTroopLayoutSpot');
  spot.showInBedroom = true;
  spot.showAroundUser = false;
  return so;
};

if (!A.dryRun) {
  // Small cupboard: hangers on the 98 cm rail, 16 cm apart.
  const cup = clone(byName['Cupboard'], 'SmallCupboard', 'SmallCupboard', v3(A.cupboardPos), A.cupboardRotY);
  const xs = [-24, -8, 8, 24];
  const hangers = cup.children.filter((c: any) => c.name.indexOf('HangerSlot') === 0).sort((a: any, b: any) => a.name < b.name ? -1 : 1);
  hangers.forEach((h: any, i: number) => {
    const t = h.localTransform;
    setPose(h, new vec3(xs[i], 98, 0), t.rotation);
  });
  out.push('SmallCupboard hangers ' + hangers.map((h: any) => h.name).join(','));

  // Small table: bookshelf and plate rack side by side on the 60 cm top; a drop anywhere on the table counts.
  const table = clone(byName['Desk'], 'SmallTable', 'SmallTable', v3(A.tablePos), A.tableRotY);
  for (const ch of table.children) {
    let pos: vec3 | null = null;
    if (ch.name === 'Bookshelf') pos = new vec3(-19, 60, -6);
    if (ch.name === 'PlateRack') pos = new vec3(20, 60, -6);
    if (!pos) continue;
    setPose(ch, pos, ch.localTransform.rotation);
    let zone = script(ch, 'TidyTroopDropZone');
    if (!zone) {
      zone = ch.addComponent('ScriptComponent');
      zone.scriptAsset = dropAsset;
    }
    // Table box (x -38..38, y 0..80, z -22.5..22.5) in this child's local frame.
    zone.centerCm = new vec3(-pos.x, 40 - pos.y, -pos.z);
    zone.sizeCm = new vec3(86, 90, 55);
    out.push(ch.name + ' at ' + [pos.x, pos.y, pos.z].join(',') + ' with drop zone');
  }

  // One place per item kind in the bedroom: hide the places on the real furniture.
  script(byName['BedroomPlaces'], 'TidyTroopLayoutSpot').showInBedroom = false;
  out.push('BedroomPlaces hidden in the bedroom layout');
}

// Report what is now under Furniture.
for (const c of furniture.children) {
  const sp = script(c, 'TidyTroopLayoutSpot');
  const pr = script(c, 'TidyTroopProp');
  const p = c.localTransform.position, r = c.localTransform.rotation;
  out.push(c.name + ' kind=' + (pr ? pr.kind : '-') + ' bedroom=' + (sp ? sp.showInBedroom : '-') + ' around=' + (sp ? sp.showAroundUser : '-') +
    ' pos=' + [p.x, p.y, p.z].map((n: number) => Math.round(n * 10) / 10).join(',') + ' rotY=' + Math.round(r.y));
}
return out;
