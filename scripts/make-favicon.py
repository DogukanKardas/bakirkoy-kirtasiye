from PIL import Image
from pathlib import Path

src = Path(
    r"C:\Users\Dogu\.cursor\projects\c-Users-Dogu-Desktop-bakirkoy\assets\bakirkoy-favicon-bear.jpg"
)
img = Image.open(src).convert("RGBA")

# İçeriğe sıkı kırp (krem zemini tut — tarayıcı sekmesinde okunaklı kalsın)
# Kenarların çok açık kısımlarını biraz kırpmak için alpha maskesi
gray = img.convert("L")
# koyu/renkli pikselleri içerik say
mask = gray.point(lambda p: 255 if p < 245 else 0)
bbox = mask.getbbox()
if not bbox:
    bbox = img.getbbox()
cropped = img.crop(bbox)

cw, ch = cropped.size
side = int(max(cw, ch) * 1.14)
# Site paper rengi — şeffaf değil, favicon'da ayı kaybolmasın
paper = (245, 240, 230, 255)
canvas = Image.new("RGBA", (side, side), paper)
ox = (side - cw) // 2
oy = (side - ch) // 2
canvas.paste(cropped, (ox, oy), cropped)

out_dir = Path(r"c:\Users\Dogu\Desktop\bakirkoy\public\brand")
app_dir = Path(r"c:\Users\Dogu\Desktop\bakirkoy\src\app")
out_dir.mkdir(parents=True, exist_ok=True)

master = canvas.resize((512, 512), Image.Resampling.LANCZOS)
master.save(out_dir / "favicon.png", optimize=True)
master.save(out_dir / "favicon-bear.png", optimize=True)
master.save(app_dir / "icon.png", optimize=True)

apple = canvas.resize((180, 180), Image.Resampling.LANCZOS)
apple.save(app_dir / "apple-icon.png", optimize=True)

small = canvas.resize((32, 32), Image.Resampling.LANCZOS)
small.save(out_dir / "favicon-32.png", optimize=True)

print("ok", master.size, "bbox", bbox)
