"""Build a workflow-branded social image from the selected real outcome captures."""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[2]
MEDIA = ROOT / "showcase/products/media"
FONT = "/System/Library/Fonts/STHeiti Medium.ttc"
canvas = Image.new("RGB", (1200, 630), "#F2F5F7")
draw = ImageDraw.Draw(canvas)
draw.text((36, 26), "UI Design Agent Kit", font=ImageFont.truetype(FONT, 48), fill="#26343D")
draw.text((38, 92), "UI 设计智能体工作流 · 成果项目", font=ImageFont.truetype(FONT, 24), fill="#526875")
items = [
    (MEDIA / "inventory.webp", "库存运营台"),
    (MEDIA / "obsidian.webp", "曜石 X1"),
    (MEDIA / "blog.webp", "一舟札记"),
    (ROOT / "demo/brick-workshop/screenshots/desktop.webp", "积木小工坊"),
]
for index, (source, label) in enumerate(items):
    x = 36 + (index % 2) * 576
    y = 146 + (index // 2) * 228
    image = ImageOps.contain(Image.open(source).convert("RGB"), (552, 188), Image.Resampling.LANCZOS)
    draw.rectangle((x, y, x + 552, y + 188), fill="#E5EBEF")
    canvas.paste(image, (x + (552 - image.width) // 2, y + (188 - image.height) // 2))
    draw.text((x, y + 193), label, font=ImageFont.truetype(FONT, 18), fill="#26343D")
output = MEDIA / "workflow-cover.webp"
canvas.save(output, "WEBP", quality=88)
print(output)
