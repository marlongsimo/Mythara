#!/usr/bin/env bash
# Produktionsumgebung einrichten (Ubuntu/Debian, auch in einem frischen Cloud-Container). Idempotent.
# Blender (Kommandozeile, ohne Fenster) + numpy für Blenders Python (glTF-Import) + Pillow für Packen/Prüfen.
set -e
if ! command -v blender >/dev/null; then apt-get update -qq && DEBIAN_FRONTEND=noninteractive apt-get install -y -qq --no-install-recommends blender; fi
BPY=$(blender -b --python-expr "import sys; print('PY=' + sys.executable)" 2>/dev/null | sed -n 's/^PY=//p')
if ! "$BPY" -c "import numpy" 2>/dev/null; then DEBIAN_FRONTEND=noninteractive apt-get install -y -qq python3-numpy; fi
python3 -c "import PIL" 2>/dev/null || pip install -q pillow
blender --version | head -1; "$BPY" -c "import numpy; print('numpy', numpy.__version__)"; python3 -c "import PIL; print('Pillow', PIL.__version__)"
