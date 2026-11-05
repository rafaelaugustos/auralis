"""Package the glass emblem into iOS, Android and launch assets."""
import json
import subprocess
from pathlib import Path

root = Path(__file__).resolve().parent.parent
source = root / 'resources/branding/auralis-mark-source.png'
master = root / 'resources/auralis-icon.png'
def run(*args):
    subprocess.run([str(arg) for arg in args], check=True)

background = root / 'resources/branding/icon-background.png'
run('rsvg-convert', '-w', 1024, '-h', 1024, '-o', background, root / 'resources/branding/icon-background.svg')
run('magick', background, '(', source, '-resize', '1120x1120', ')', '-gravity', 'center', '-compose', 'over', '-composite', '-alpha', 'off', f'PNG24:{master}')
run('magick', source, '-resize', '768x768', root / 'src/assets/auralis-mark.png')
catalog = root / 'App_Resources/iOS/Assets.xcassets'
icons = catalog / 'AppIcon.appiconset'
icons.mkdir(parents=True, exist_ok=True)
info = {'author': 'xcode', 'version': 1}
(catalog / 'Contents.json').write_text(json.dumps({'info': info}, indent=2) + '\n')
images = []
for idiom, points, scales in [('iphone', 20, [2, 3]), ('iphone', 29, [2, 3]), ('iphone', 40, [2, 3]), ('iphone', 60, [2, 3]), ('ipad', 20, [1, 2]), ('ipad', 29, [1, 2]), ('ipad', 40, [1, 2]), ('ipad', 76, [1, 2]), ('ipad', 83.5, [2]), ('ios-marketing', 1024, [1])]:
    for scale in scales:
        pixels = int(points * scale)
        filename = f'icon-{pixels}.png'
        subprocess.run(['magick', str(master), '-resize', f'{pixels}x{pixels}', '-alpha', 'off', f'PNG24:{icons / filename}'], check=True)
        images.append({'idiom': idiom, 'size': f'{points}x{points}', 'scale': f'{scale}x', 'filename': filename})
(icons / 'Contents.json').write_text(json.dumps({'images': images, 'info': info}, indent=2) + '\n')
launch = catalog / 'LaunchMark.imageset'
launch.mkdir(parents=True, exist_ok=True)
run('magick', source, '-resize', '840x840', launch / 'mark.png')
(launch / 'Contents.json').write_text(json.dumps({'images': [{'idiom': 'universal', 'filename': 'mark.png', 'scale': '3x'}], 'info': info}, indent=2) + '\n')
res = root / 'App_Resources/Android/src/main/res'
for density, pixels in [('mdpi', 48), ('hdpi', 72), ('xhdpi', 96), ('xxhdpi', 144), ('xxxhdpi', 192)]:
    folder = res / f'mipmap-{density}'
    folder.mkdir(parents=True, exist_ok=True)
    subprocess.run(['magick', str(master), '-resize', f'{pixels}x{pixels}', '-alpha', 'off', f'PNG24:{folder / "ic_launcher.png"}'], check=True)
    # Keep all foreground artwork inside Android's adaptive-icon safe zone.
    canvas = round(pixels * 108 / 48)
    run('magick', '-size', f'{canvas}x{canvas}', 'xc:none', '(', source, '-resize', f'{round(canvas * .76)}x{round(canvas * .76)}', ')', '-gravity', 'center', '-composite', folder / 'ic_foreground.png')
    run('magick', folder / 'ic_foreground.png', '-channel', 'RGB', '-evaluate', 'set', '100%', '+channel', folder / 'ic_monochrome.png')
adaptive = res / 'mipmap-anydpi-v26'
adaptive.mkdir(parents=True, exist_ok=True)
(adaptive / 'ic_launcher.xml').write_text('''<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
  <background android:drawable="@color/icon_background"/>
  <foreground android:drawable="@mipmap/ic_foreground"/>
  <monochrome android:drawable="@mipmap/ic_monochrome"/>
</adaptive-icon>
''')
print('Generated Auralis icons for iOS and Android.')
