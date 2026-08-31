#!/usr/bin/env python3
"""
Prepara os logos das seguradoras parceiras para o carrossel do site.

Três etapas, e cada uma existe por um motivo:

1. RECONSTRUÇÃO — os PDFs enviados são impressões de página com cabeçalho e
   rodapé do navegador. `pdfimages` tira a imagem original de dentro do PDF, sem
   a moldura da página. Quando o PDF traz duas imagens (RGB + máscara cinza),
   as duas são recombinadas para devolver a transparência.
2. RECORTE — cada logo é aparado até a tinta. É o que permite alinhar peças de
   proporções muito diferentes.
3. NORMALIZAÇÃO ÓPTICA — o que padroniza o tamanho não é a altura nem a largura:
   é a MÉDIA GEOMÉTRICA (raiz de largura × altura). Igualar só a altura faz um
   logotipo horizontal e largo (Bradesco, 6,2:1) parecer gigante ao lado de uma
   marca quadrada (HDI, 1:1); igualar só a largura inverte o problema. Com a
   média geométrica, as duas ocupam a mesma "quantidade de tinta" no olho.
   Depois disso, limites de largura e altura garantem que nada estoure a caixa.
"""
import subprocess, os, math, json, sys

FONTE = '/home/claude/logos-out'
IMGS = os.path.join(FONTE, 'img')
DESTINO = '/home/claude/fixseg/public/seguradoras'

# Tela final: o dobro da caixa de exibição no site (140x44 CSS) => 2x de DPR.
TELA_W, TELA_H = 280, 88
# Alvo da média geométrica, em pixels da tela final.
ALVO_GM = 150
# Teto de ampliação: acima disso o logo fica visivelmente macio, e é melhor
# aceitá-lo um pouco menor do que borrado.
MAX_AMPLIACAO = 1.45

# nome do arquivo de origem -> (rótulo, arquivo de saída, site)
PARCEIROS = [
    ('d9c7221b-250pxAllianz.svg',                  'Allianz',           'allianz',       'https://www.allianz.com.br'),
    ('da3ed6af-logoavla',                          'AVLA',              'avla',          'https://www.avla.com.br'),
    ('3ba324ae-logoaxargb',                        'AXA',               'axa',           'https://www.axa.com.br'),
    ('b758b95b-250pxLogotipo_da_Azul_Seguros.svg', 'Azul Seguros',      'azul-seguros',  'https://www.azulseguros.com.br'),
    ('77dbd2a7-330pxLogotipo_do_Bradesco_Seguros.svg', 'Bradesco Seguros', 'bradesco-seguros', 'https://www.bradescoseguros.com.br'),
    ('65d7d4d6-herologo',                          'Fairfax',           'fairfax',       'https://www.fairfax.com.br'),
    ('57015938-250pxHDI_Seguros_Brasil__Logo_2020','HDI Seguros',       'hdi-seguros',   'https://www.hdiseguros.com.br'),
    ('70f82f11-250pxLogo_Mapfre_2026.svg',         'Mapfre',            'mapfre',        'https://www.mapfre.com.br'),
    ('6a145ecd-MetLifeLogo2018',                   'MetLife',           'metlife',       'https://www.metlife.com.br'),
    ('df6744f2-250pxPorto_2022.svg',               'Porto',             'porto',         'https://www.portoseguro.com.br'),
    ('21137f58-Pottencial',                        'Pottencial',        'pottencial',    'https://www.pottencial.com.br'),
    ('1192c799-sancor',                            'Sancor Seguros',    'sancor-seguros','https://www.sancorseguros.com.br'),
    ('234f4daf-330pxLogotipo_da_SulAm_rica.svg',   'SulAmérica',        'sulamerica',    'https://www.sulamerica.com.br'),
    ('d4fc6dc0-logo',                              'Tokio Marine',      'tokio-marine',  'https://www.tokiomarine.com.br'),
    ('04c35898-250pxZurich_Insurance_Group_logo.svg','Zurich',          'zurich',        'https://www.zurich.com.br'),
]


def roda(*args):
    r = subprocess.run(args, capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError(' '.join(args) + '\n' + r.stderr[:400])
    return r.stdout.strip()


def dimensoes(caminho):
    w, h = roda('identify', '-format', '%w %h', caminho).split()
    return int(w), int(h)


def reconstruir(base, saida):
    """Devolve o logo com transparência, a partir do que houver no PDF."""
    rgb = os.path.join(IMGS, f'{base}-001-000.png')
    mask = os.path.join(IMGS, f'{base}-001-001.png')

    if os.path.exists(rgb) and os.path.exists(mask):
        # duas imagens: a segunda é a máscara de opacidade
        roda('convert', rgb, mask, '-alpha', 'off',
             '-compose', 'CopyOpacity', '-composite', saida)
        return 'imagem embutida + máscara'

    if os.path.exists(rgb):
        roda('convert', rgb, '-alpha', 'off', saida)
        return 'imagem embutida'

    # sem imagem embutida: o logo é vetor na página. Renderiza em alta
    # resolução e corta as faixas de cabeçalho e rodapé do navegador.
    pdf = os.path.join(FONTE, f'{base}.pdf')
    tmp = '/tmp/pg.png'
    roda('pdftocairo', '-png', '-r', '600', '-transp', '-singlefile', pdf, '/tmp/pg')
    w, h = dimensoes(tmp)
    corte = int(h * 0.14)
    roda('convert', tmp, '-crop', f'{w}x{h - 2 * corte}+0+{corte}', '+repage', saida)
    return 'vetor renderizado a 600dpi'


def preparar(base, rotulo, arquivo):
    bruto = f'/tmp/{arquivo}-bruto.png'
    origem = reconstruir(base, bruto)

    # 1. apara a tinta. Duas passadas: alfa e depois branco, porque parte dos
    #    arquivos vem com fundo branco chapado em vez de transparente.
    aparado = f'/tmp/{arquivo}-aparado.png'
    roda('convert', bruto, '-trim', '+repage',
         '-bordercolor', 'white', '-border', '1', '-fuzz', '2%',
         '-trim', '+repage', aparado)

    w, h = dimensoes(aparado)
    gm = math.sqrt(w * h)
    escala = ALVO_GM / gm
    escala = min(escala, MAX_AMPLIACAO)
    # respeita a caixa: nada pode estourar a tela
    escala = min(escala, (TELA_W - 8) / w, (TELA_H - 8) / h)

    lw, lh = max(1, round(w * escala)), max(1, round(h * escala))

    final = os.path.join(DESTINO, f'{arquivo}.png')
    roda('convert', aparado,
         '-filter', 'Lanczos', '-resize', f'{lw}x{lh}!',
         '-background', 'none', '-gravity', 'center',
         '-extent', f'{TELA_W}x{TELA_H}',
         '-strip', final)

    fw, fh = dimensoes(final)
    return {
        'rotulo': rotulo, 'arquivo': f'{arquivo}.png', 'origem': origem,
        'tinta_origem': f'{w}x{h}', 'tinta_final': f'{lw}x{lh}',
        'escala': round(escala, 2), 'tela': f'{fw}x{fh}',
        'bytes': os.path.getsize(final),
    }


os.makedirs(DESTINO, exist_ok=True)
relatorio = []
for base, rotulo, arquivo, site in PARCEIROS:
    try:
        r = preparar(base, rotulo, arquivo)
        r['site'] = site
        relatorio.append(r)
        print(f"{rotulo:18} {r['origem']:32} tinta {r['tinta_origem']:>9} -> {r['tinta_final']:>8}  x{r['escala']:<5} {r['bytes']//1024}kB")
    except Exception as e:
        print(f"{rotulo:18} FALHOU: {e}")

json.dump(relatorio, open('/tmp/logos.json', 'w'), ensure_ascii=False, indent=1)
print('\ntotal:', len(relatorio), 'logos em', DESTINO)
