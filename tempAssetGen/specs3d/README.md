# AI 3D item models (SPECS text-to-3D)

Generated 2026-11-06 from Lens Studio **5.23.2** (signed in) in its temporary default project, never in `lens.esproj`. Driven by Kiro through the Lens Studio MCP `ExecuteEditorCode` tool and the build-mesh skill's `text-to-3d-request.ts`. Quality: output `compact`, preview and reconstruction `balanced`. Each is about 2,000 triangles, 1 mesh, 1 material, 2 textures.

| File (`out/`) | For item | Prompt file | Job id |
|---|---|---|---|
| TT_ShirtBlue.glb | Item01_Shirt | body-TT_ShirtBlue.json | ea10eaaf-2fcc-4820-a1f7-2d5e903e0769 |
| TT_JeansBlue.glb | Item02_Pants | body-TT_JeansBlue.json | 85d72d40-14a6-4153-9a96-5570751b9208 |
| TT_BookCoral.glb | Item03_Book | body-TT_BookCoral.json | 9fc792c5-34f6-4fb9-a03c-e7f096af8859 |
| TT_BookMint.glb | Item04_Book | body-TT_BookMint.json | b5d58a90-66a5-40b0-8b09-28bad480fd3f |
| TT_ShirtYellow.glb | Item05_Shirt | body-TT_ShirtYellow.json | e7dc21bd-b333-4c64-8149-4fadccb7a822 |
| TT_PantsLavender.glb | Item06_Pants | body-TT_PantsLavender.json | d597eacd-e8e1-4b02-a073-09cbdffe6f06 |
| TT_PlateBlue.glb | Item07_Plate | body-TT_PlateBlue.json | 44177385-dc67-4798-a4ca-7276aada7ae4 |
| TT_BookYellow.glb | Item08_Book | body-TT_BookYellow.json | 68ee2c9e-cb34-44b2-bf74-53dbc3105414 |
| TT_PlateRose.glb | Item09_Plate | body-TT_PlateRose.json | d7870136-0c23-4520-913e-ae6d2d85079f |
| TT_PlateMint.glb | Item10_Plate_BehindYou | body-TT_PlateMint.json | 666f805d-497c-48f9-ad1e-9bf326a05211 |

Batch 2 reuses batch 1's seeds, so the matching items share a shape and only change colour.

Tools here (Python and Node are not installed on this machine):
- `make-eec-script.ps1`: PowerShell port of the skill's `make-eec-script.py`. Run it with `powershell -NoProfile -ExecutionPolicy Bypass -File`, entries separated by `|`.
- `download.ps1`: PowerShell port of `download-glb.js`. It does a plain GET of the signed `asset_url` and rejects anything without the `glTF` magic.

Next step: import into `lens.esproj` in **5.24.1** and put each model in its item visual's `ModelSlot` child. `TidyTroopProp` then skips the code-built mesh.
