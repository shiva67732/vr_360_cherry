"""Convert the MIT Microsoft APNG to the local 36-frame Three.js atlas.

Run from the app directory with Python and Pillow. Decode every frame in order
so APNG disposal operations are applied before sampling alternate frames.
"""
from pathlib import Path
from PIL import Image

folder = Path(__file__).resolve().parent.parent / 'public' / 'doves'
with Image.open(folder / 'dove-animated.png') as animation:
    assert animation.n_frames == 72 and animation.size == (256, 256)
    atlas = Image.new('RGBA', (1536, 1536))
    for frame in range(animation.n_frames):
        animation.seek(frame)
        if frame % 2 == 0:
            index = frame // 2
            atlas.paste(animation.convert('RGBA').copy(), ((index % 6) * 256, (index // 6) * 256))
    atlas.save(folder / 'dove-atlas.webp', lossless=True)
