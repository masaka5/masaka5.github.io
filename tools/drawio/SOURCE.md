# draw.io

Upstream: https://github.com/jgraph/drawio

Pinned commit: c72c9a98b7a6ce392556ed04c05e0ff19f43f5c3

Version: 32.6.10

License: Apache-2.0. See vendor/LICENSE.txt and component license files.

The unmodified upstream prebuilt engine and runtime assets are served locally.
Local integration files: index.html, editor.html, editor-bridge.js, drawio.js,
drawio.css. The adapter restricts menus to local editing, translates native
palette seed labels, and uses IndexedDB plus bounded XML import/export.
No external iframe, account, cloud storage, telemetry, or export backend.

Reproduce runtime staging from the pinned sparse upstream checkout:
`python _scratch/stage-drawio-runtime.py`

Build omits server files, cloud integration bundle, viewer bundles, source maps,
development editor sources and unused locale bundles. All original shapes,
stencils, MathJax runtime and templates remain local.
