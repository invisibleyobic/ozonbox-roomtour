import base64, re, pathlib

root = pathlib.Path(__file__).parent
html = (root / 'products.html').read_text(encoding='utf-8')
css = (root / 'css/catalog.css').read_text(encoding='utf-8')
data = (root / 'js/data.js').read_text(encoding='utf-8')
app = (root / 'js/catalog.js').read_text(encoding='utf-8')

# body content only
body = html.split('<body>', 1)[1].split('</body>', 1)[0]

# strip local asset/script/style links
body = re.sub(r'<link[^>]*catalog\.css[^>]*>', '', body)
body = re.sub(r'<script src="js/[^"]*"></script>', '', body)

# inline product images as data URIs
def to_data_uri(path):
    p = root / 'assets/small' / pathlib.Path(path).name
    if not p.exists():
        p = root / path
    return 'data:image/jpeg;base64,' + base64.b64encode(p.read_bytes()).decode()

imgs = {}
for m in re.finditer(r"assets/products/([\w\-]+\.jpg)", data):
    name = m.group(1)
    if name not in imgs:
        imgs[name] = to_data_uri(name)

for name, uri in imgs.items():
    data = data.replace(f'assets/products/{name}', uri)

out = f"""<meta charset="UTF-8">
<title>Каталог OzoneBox</title>
<style>
{css}
</style>
{body}
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/Flip.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/CustomEase.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/Draggable.min.js"></script>
<script>
{data}
</script>
<script>
{app}
</script>
"""

target = root / 'preview.html'
target.write_text(out, encoding='utf-8')
print(f'built {target.name}: {len(out)/1024:.0f} KB, {len(imgs)} images inlined')
