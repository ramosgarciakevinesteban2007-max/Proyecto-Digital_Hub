import glob, os

# Mojibake: UTF-8 bytes de latin-1 leidos como latin-1 y luego mostrados como UTF-8
# Ej: 'ñ' en latin-1 = 0xF1, en UTF-8 = 0xC3 0xB1
# Si el archivo latin-1 se lee como UTF-8, 0xC3 = 'Ã' y 0xB1 = '±' => 'Ã±'
fixes = [
    # Minusculas con tilde
    ('Ã±', 'ñ'),
    ('Ã¡', 'á'),
    ('Ã©', 'é'),
    ('Ã³', 'ó'),
    ('Ãº', 'ú'),
    ('Ã­', 'í'),
    # Mayusculas con tilde
    ('Ã'', 'Ñ'),
    ('Ã\x81', 'Á'),
    ('Ã\x89', 'É'),
    ('Ã\x93', 'Ó'),
    ('Ã\x9a', 'Ú'),
    ('Ã\x8d', 'Í'),
    # Signos de puntuacion
    ('Â¿', '¿'),
    ('Â¡', '¡'),
    ('Â·', '·'),
    # Doble encoding (ÃÂ¡ = á doble encoded)
    ('ÃÂ¡', 'á'),
    ('ÃÂ³', 'ó'),
    ('ÃÂº', 'ú'),
    ('ÃÂ©', 'é'),
    ('ÃÂ­', 'í'),
    ('ÃÂ±', 'ñ'),
    # Otros
    ('Ã¼', 'ü'),
    ('â', '←'),
    ('â', '→'),
]

files = (
    glob.glob('frontend_react/src/**/*.jsx', recursive=True) +
    glob.glob('frontend_react/src/**/*.js', recursive=True) +
    glob.glob('frontend_react/src/**/*.css', recursive=True)
)

total = 0
for filepath in files:
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            text = f.read()
    except Exception as e:
        print(f'SKIP (read error): {filepath}: {e}')
        continue

    new_text = text
    for bad, good in fixes:
        new_text = new_text.replace(bad, good)

    if new_text != text:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_text)
        total += 1
        print(f'Fixed: {filepath}')

print(f'\nTotal fixed: {total}')
