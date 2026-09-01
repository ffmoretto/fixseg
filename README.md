# FIXSEG — Corretora de Seguros

Site institucional e de conversão da FIXSEG. Next.js 15 (App Router) + TypeScript + Tailwind CSS + GSAP.

---

## Começando

```bash
npm install
cp .env.example .env.local     # opcional no início: o site roda sem nada preenchido
npm run dev                    # http://localhost:3000
```

Scripts disponíveis:

| Comando | O que faz |
| --- | --- |
| `npm run dev` | ambiente de desenvolvimento |
| `npm run build` | build de produção |
| `npm start` | roda o build de produção localmente |
| `npm run typecheck` | verifica os tipos sem gerar arquivos |
| `npm run lint` | ESLint |

---

## 1. O que você precisa preencher antes de publicar

Praticamente toda a configuração está em **um único arquivo**: `src/config/site.ts`.

### Dados institucionais — já preenchidos

```ts
legalName:     'FIXSEG Corretora de Seguros'          // títulos, Open Graph, Schema.org
corporateName: 'FIXSEG CORRETORA DE SEGUROS LTDA'     // razão social: rodapé e páginas legais
contact: {
  whatsapp: '5545999550676',                    // só dígitos, com 55 na frente
  phone:    '(45) 99955-0676',                  // NÃO é exibido — ver o aviso abaixo
  phoneRaw: '45999550676',                      // NÃO é exibido — ver o aviso abaixo
  email:    'contato@fixsegcorretora.com.br',
},
address: {
  street:   'Rua Rui Barbosa, 741 — Sala 02',
  district: 'Centro',
  city:     'Cascavel',
  state:    'PR',
  zip:      '85810-240',
  mapsUrl:  null,        // null = o site gera um link de BUSCA no Google Maps
},
cnpj:  '62.792.741/0001-00',
susep: '252173442',
```

Trocar o contato exige editar **só esse arquivo**: o número alimenta o botão flutuante, o
botão do cabeçalho, o hero, o FAQ, a tela de sucesso da cotação, os botões por produto, a
seção de contato e o rodapé — todos leem daqui, via `src/lib/whatsapp.ts`. As variáveis de
ambiente `NEXT_PUBLIC_WHATSAPP_NUMBER`, `NEXT_PUBLIC_PHONE` e `NEXT_PUBLIC_EMAIL`
continuam tendo prioridade, o que permite apontar uma publicação de teste para outro
número sem tocar no código.

### 📞 O número de telefone não é exibido em lugar nenhum

Por decisão da corretora, `(45) 99955-0676` **não aparece escrito em nenhuma tela do
site**. O contato por voz acontece pelo WhatsApp: o número existe apenas como *destino do
link* dos botões de WhatsApp — `href="https://wa.me/5545999550676?text=…"`. Foram
retirados o cartão de telefone da seção de cotação, a linha de telefone do rodapé e
qualquer link `tel:`.

O corte vale também para o que os robôs leem: `telephone` **não é emitido** no
Schema.org (`src/lib/seo.tsx`). Publicá-lo lá faria o Google exibir um botão de ligar na
ficha do negócio — ou seja, devolveria pela porta de trás o canal que foi retirado da
página. E `formatDetection: { telephone: false }` impede o iOS de transformar CNPJ, CEP e
registro SUSEP em links de ligação, o que acontecia por parecerem sequências de telefone.

Os campos `phone` e `phoneRaw` continuam preenchidos em `site.ts` de propósito: são o
registro do dado e o que a função `telUrl()` de `src/lib/whatsapp.ts` usaria. **Para voltar
a exibir o telefone** basta reintroduzir o bloco onde ele fizer falta e descomentar o
trecho documentado em `organizationSchema()` — o comentário no arquivo traz o snippet
pronto e a consequência de cada escolha.

O endereço ativa automaticamente o **SEO local**: as páginas passam a incluir "em
Cascavel" no Open Graph e nas descrições dos produtos, a palavra-chave "corretora de
seguros Cascavel" entra na lista, e o `PostalAddress` do Schema.org é emitido junto do
CNPJ (`taxID`) e do registro SUSEP (`identifier`).

### O rodapé é o único lugar com dados de contato

Endereço, e-mail, horário, CNPJ e SUSEP aparecem **uma vez só na página**, no rodapé. A
seção "Contato" ficou com o convite e o formulário; os cartões que repetiam os mesmos
dados foram removidos justamente para não haver duas versões da mesma informação para
manter em dia.

Duas funções em `site.ts` servem esse bloco estreito:

- `formattedAddress()` — tudo em uma linha, separado por "·". Serve para faixas largas.
- `addressLines()` — o endereço em **três linhas curtas** (logradouro / bairro · cidade-UF
  / CEP). É o que o rodapé usa, com `whitespace-nowrap` em cada linha. Numa string única,
  a coluna estreita quebrava em lugares ruins — "741 —" numa linha e "Sala 02" na outra,
  partindo o número da sala do endereço.

O e-mail tem 30 caracteres e antes usava `break-all`, que o partia no meio da palavra
("…com.b / r"). Agora a coluna de contato é mais larga (`lg:grid-cols-[1.2fr_.82fr_.82fr_1.3fr]`)
e o endereço sai em `whitespace-nowrap` com corpo de 15px: **uma linha inteira, sem
quebra**. Medido no navegador nos dois temas: o item do e-mail tem 40px de altura (uma
linha) e o do endereço 103px (as três linhas, nenhuma quebrada).

Se você trocar o e-mail por um mais longo, ou acrescentar complemento ao endereço, confira
esse bloco: `whitespace-nowrap` não quebra — ele transborda. O ajuste é subir o peso da
coluna no `grid-cols` do rodapé, ou quebrar o dado em mais uma linha em `addressLines()`.

### Ainda em branco

```ts
social: { instagram: null, facebook: null, linkedin: null, youtube: null, tiktok: null },
lgpd:   { dpoEmail: null, dpoName: null },   // sem encarregado nomeado, usa o e-mail principal
```

**Como o site se comporta com campos vazios:** cada elemento que depende de um dado
ausente simplesmente não é renderizado — nada de link quebrado, número inventado ou
"(00) 0000-0000" na tela. Os ícones de redes sociais, por exemplo, só aparecem quando a
URL correspondente for informada.

### ⚠️ Um dado que precisa de confirmação

`site.hours` traz **horário comercial genérico** ("Segunda a sexta, 08h00 às 18h00",
"Sábado sob agendamento"). Esse horário **não foi informado pela corretora** — está ali
como estrutura. Confirme ou corrija antes de publicar: é a única informação visível no
site que não veio de uma fonte. Para esconder o bloco por completo, deixe a lista vazia.

### Demais arquivos de configuração

| Arquivo | Conteúdo |
| --- | --- |
| `src/config/site.ts` | nome, contatos, endereço, CNPJ, SUSEP, redes sociais, textos dos CTAs |
| `src/config/navigation.ts` | menu do header, links do footer, links legais |
| `src/config/insurances.ts` | os 11 produtos: nome, descrição, coberturas, **campos do formulário de cotação** e palavras-chave de SEO |
| `src/config/content.ts` | diferenciais, etapas do "como funciona", textos institucionais, **indicadores numéricos**, **parceiros (seguradoras)**, **depoimentos diretos**, FAQ e blog |
| `src/config/curiosities.ts` | as **50 curiosidades sobre seguros** do carrossel: 5 por produto, cada uma com fonte e ano |
| `src/config/story.ts` | roteiro da narrativa animada em scroll (capítulos, textos, produtos relacionados) |

### Itens que ficaram intencionalmente vazios

Nada foi inventado sobre a corretora. Estes três blocos começam sem conteúdo e as
seções correspondentes **não aparecem** até serem preenchidas:

1. **Indicadores** (`content.ts` → `stats`): clientes atendidos, anos de experiência,
   seguros contratados, seguradoras parceiras. Troque `value: null` pelo número real e o
   card entra em cena com contagem animada.
2. **Parceiros da FIXSEG** (`content.ts` → `insurers`): uma entrada `{ name, logo? }`
   por seguradora. **O logo é opcional** — sem ele a companhia aparece como cartão
   tipográfico, com o nome na fonte da marca, e a imagem assume sozinha quando o arquivo
   for colocado em `public/seguradoras/` e apontado em `logo`. Com a lista vazia, a seção
   não é renderizada.
3. **O que falam de nós** (avaliações do Google): a seção é alimentada pelo perfil da
   corretora no Google Meu Negócio, via Places API — veja o passo a passo na §5. Sem as
   variáveis de ambiente configuradas, a seção não aparece. A lista `testimonials` do
   `content.ts` continua disponível para depoimentos recebidos fora do Google, com
   autorização de uso.

Também precisam de revisão antes de publicar:

- **Política de Privacidade** e **Termos de Uso** — os textos estão estruturados conforme a
  LGPD, o Marco Civil e o CDC, e já citam a razão social e o CNPJ corretos. Ainda assim
  são uma **base**: as duas páginas exibem um aviso de "pendente de revisão jurídica" que
  permanece de propósito até alguém apagar o bloco em
  `src/components/layout/LegalPage.tsx`. Dado preenchido não é revisão feita.
- **`about.paragraphs`** em `content.ts` — descrevem a proposta de atuação, não a
  história real da corretora. Substitua pelo texto institucional verdadeiro.

---

## 2. Identidade visual

A paleta vem **exclusivamente do arquivo da logo**: preto, azul elétrico, azul ciano e
branco. Nenhuma cor foi acrescentada.

| Cor | Valor | Uso |
| --- | --- | --- |
| azul elétrico | `#0B64FC` | `--brand` — botões, gradiente da marca |
| azul ciano | `#02B3F9` | `--brand-2` — realces, ícones, energia |
| transição | `#0591F4` | `--brand-mid` — meio do gradiente |
| preto | `#04060B` | fundo no tema escuro |
| branco | `#FFFFFF` | fundo no tema claro |

### Dois temas, um só conjunto de tokens

O site tem **tema claro e tema escuro**, e o visitante escolhe pelo botão no cabeçalho
(no menu mobile ele aparece como uma linha "Tema"). O padrão para quem chega pela
primeira vez é o **claro** — definido em `src/config/theme.ts` (`THEME_DEFAULT`), que é o
único lugar a mudar se você quiser inverter isso.

A regra que mantém os dois temas de pé: **nenhum componente escreve cor absoluta**. Tudo
passa por tokens semânticos declarados em `src/app/globals.css` e expostos como classes
no `tailwind.config.ts`:

| Token | Papel |
| --- | --- |
| `--page`, `--panel`, `--panel-2` | superfícies, do fundo ao cartão |
| `--fg`, `--fg-2`, `--fg-3`, `--fg-4` | texto, do mais forte ao mais discreto |
| `--line` + `--line-opacity` | traços e bordas (`border-hair`) |
| `--tint` | véu aplicado sobre superfícies |
| `--accent-ink` | azul seguro para **texto** no tema vigente |
| `--glow-*`, `--shadow-*` | brilhos e sombras, calibrados por tema |
| `--m-air` … `--m-ink`, `--m-void` | massa das ilustrações (ver §4) |

O que muda entre os temas é o **papel** de cada cor, não a paleta. Ao criar um componente,
use `bg-page`, `text-fg-3`, `border-hair`, `text-accent-ink` — nunca `text-white` ou
`bg-black`, que quebram um dos dois temas.

O tema é resolvido **antes da primeira pintura** por um script inline em
`src/app/layout.tsx`, que grava `data-theme` no `<html>`. É isso que evita o "flash"
branco ao carregar no escuro. A escolha fica em `localStorage`
(`fixseg:theme`) e pode ser forçada por URL para testes: `?tema=claro`,
`?tema=escuro`, `?tema=auto`.

### Nenhum símbolo de "site gerado por IA"

Havia uma **faísca de quatro pontas (✦)** antes do texto em todas as etiquetas de seção —
nove ocorrências na home, mais a abertura da faixa de versículos e os blocos sem imagem.
Foi removida a pedido do cliente: repetida daquele jeito, a estrelinha tinha virado
assinatura visual de página gerada por IA e dava ao site cara de modelo pronto.

A remoção foi até o fim, não só nos componentes: **o ícone `spark` saiu do registro** em
`src/components/icons/index.tsx`, para que ninguém volte a usá-lo sem perceber. O `star`
(estrela cheia, cinco pontas) continua — é o das notas de avaliação do Google, que é outra
coisa. Onde a faísca abria um bloco, entrou um fio curto no degradê da marca; nas etiquetas,
o destaque em cor no título já dá o peso visual.

### Tipografia

Sora nos títulos, Inter no texto — auto-hospedadas via Fontsource. Não há requisição ao
Google Fonts, o que ajuda na performance e evita transferência de dados de visitantes a
terceiros.

A escala é **um degrau acima** do padrão comum de sites institucionais: o corpo de texto
está em 17px (`1.0625rem`) com entrelinha 1.6, e os tamanhos de display estão em
`tailwind.config.ts` (`display-xl` a `display-xs`, todos com `clamp()`). Para ajustar a
escala inteira, mexa nesses dois pontos — não em cada componente.

### A logo

`src/components/brand/LogoLockup.tsx` reproduz a **geometria exata do arquivo original**
em um único SVG: marca, fio degradê e assinatura "Corretora de Seguros". Isso é
deliberado e importante — as três partes têm larguras quase idênticas no original, e
qualquer tentativa de recompô-las em CSS (três elementos numa caixa) faz o fio ficar mais
largo ou mais estreito que o nome, que foi exatamente o defeito corrigido.

`src/components/brand/Logo.tsx` é o que se usa nas páginas: `height` é a altura **total**
da peça, e a largura acompanha (proporção ≈ 2,58 × a altura). As letras usam
`currentColor`, então a marca inverte junto com o tema; o check e o fio mantêm os azuis
originais.

**No cabeçalho:** 68px no desktop (56px depois de rolar) e 56px no celular (46px rolado).
A barra acompanha — `h-[120px] md:` no topo, `h-[92px] md:` rolado, e 108/84 no celular.

Três coisas se aprendem ao mexer nesse tamanho, e vale registrá-las:

**1. Quem manda no tamanho mínimo é a assinatura, não o nome.** "CORRETORA DE SEGUROS" tem
8,5 unidades de altura num lockup de 101 — 8% da peça. A 58px de logo isso dava menos de
5px de altura de letra: a linha existia e não se lia.

**2. A assinatura foi ampliada glifo por glifo, não como bloco.** A linha da assinatura tem
praticamente a mesma largura do fio degradê acima dela (256,6 contra 257,8 unidades).
Escalar o bloco em 22% jogaria as letras 28 unidades para fora do fio de cada lado.
A solução está em `ASSINATURA_ESCALA` (`LogoLockup.tsx`): **cada letra cresce em torno do
seu próprio centro**, então a letra aumenta e a linha não se alarga — o que diminui é o
espacejamento, que no original é largo justamente para a assinatura alcançar a largura do
nome. Medido no navegador com `getBBox`: a linha vai de x 60,6…317,3 para 59,98…317,55, ou
0,35 unidade além da ponta do fio — 0,2px numa logo de 68px. **Para reverter, ponha 1
nessa constante**; todos os `transform` somem de uma vez.

**3. A logo é larga, e no celular isso é o limite.** A largura é 2,58 × a altura, então
68px de altura são 175px de largura. Num aparelho de 320px não sobrava espaço para o
seletor de tema e o botão do menu. Por isso `Logo` aceita **`heightSm`** — a altura abaixo
de 768px — e faz a troca em **CSS** (duas variáveis, `h-[var(--logo-h)]` e
`md:h-[var(--logo-h-md)]`), nunca em JavaScript: ler a largura da janela no render
divergiria entre servidor e navegador. A altura não pode voltar a ser `style.height`, senão
o estilo em linha vence a classe `md:` e a versão de desktop nunca se aplica.

**A rolagem por âncora não usa mais número fixo.** `AnchorScroll` **mede**
`[data-header-bar]` na hora do clique e desconta a altura real mais 14px de folga. Antes
era a constante `HEADER_OFFSET = 96` ("a barra rolada de 76px mais folga"), que envelheceu
duas vezes — a barra cresceu e passou a ter altura diferente no celular e no desktop. O
token `--header-h` em `globals.css` continua declarado para uso em CSS, mas **não** é o que
a rolagem lê: mexer só nele não move nada.

Regra prática: **não recomponha as partes da logo em CSS.** Use o componente.

---

## 3. Estrutura do projeto

```
src/
├── app/                          rotas (App Router)
│   ├── layout.tsx                fontes, metadata, JSON-LD, header/footer, providers
│   ├── page.tsx                  home (compõe as seções)
│   ├── globals.css               tokens, base, utilitários, prefers-reduced-motion
│   ├── cotacao/                  página dedicada de cotação
│   ├── seguros/                  índice + página por produto ([slug])
│   ├── politica-de-privacidade/
│   ├── termos-de-uso/
│   ├── diagnostico/              página interna de verificação das animações
│   ├── api/leads/route.ts        recebimento de leads (server-side)
│   ├── sitemap.ts · robots.ts · opengraph-image.tsx · not-found.tsx
│
├── components/
│   ├── brand/                    Logo (LogoLockup = geometria do arquivo original)
│   ├── icons/                    conjunto de ícones próprio (sem biblioteca externa)
│   ├── layout/                   Header, Footer, WhatsAppFloat, PageLoader,
│   │                             SmoothScroll, AnchorScroll, Analytics, LegalPage
│   ├── sections/                 Hero, Insurances, Differentials, HowItWorks,
│   │                             QuoteSection/QuoteForm, About, Partners,
│   │                             Testimonials, Faq, Blog, Contact
│   ├── story/                    narrativa animada em scroll
│   │   ├── StoryScroll.tsx       orquestrador da timeline
│   │   ├── sceneParts.tsx        kit de ilustração (massa, gradientes, peças)
│   │   └── scenes/               uma cena SVG por capítulo
│   └── ui/                       Button, Field, Reveal, SectionHeading, Accordion,
│                                 Counter, SuccessCheck, ThemeToggle
│
├── middleware.ts                 trava de senha da pré-visualização (opcional)
├── config/                       TODA informação editável (ver seção 1)
├── hooks/                        useReducedMotion, useIsMobile, useTheme
├── lib/                          gsap (registro central), seo, analytics, whatsapp, utils
└── services/                     leads, adaptadores de destino, fonte de conteúdo,
                                  avaliações do Google (googleReviews)
```

---

## 4. Animações

### Registro do GSAP

`src/lib/gsap.ts` é o **único** ponto de importação e registro de plugins. Nenhum
componente importa plugin diretamente. Registramos apenas o que é usado:
ScrollTrigger, ScrollSmoother, ScrollToPlugin, DrawSVG, SplitText, MotionPath, Observer,
Flip, CustomEase e o EasePack.

O snippet completo fornecido, com **todos** os plugins, está preservado em
`src/lib/gsap-all.ts` (com a equivalência ESM ↔ UMD documentada). Para habilitar o pacote
inteiro, troque os imports de `@/lib/gsap` por `@/lib/gsap-all`. O padrão é o registro
enxuto porque é ele que mantém o JavaScript enviado ao navegador pequeno.

A partir do GSAP 3.13 todos os plugins fazem parte do pacote público `gsap` no npm — não é
necessária conta do Club GreenSock.

Curvas de animação da marca criadas com `CustomEase`: `brand`, `brandIn`, `brandOut` e
`snap` (usada nas microinterações com leve overshoot).

### A narrativa em scroll

`src/components/story/StoryScroll.tsx` — seção fixada na tela com a timeline atrelada ao
scroll. Cada capítulo passa por três estados:

1. **Construção** — o contorno da cena é desenhado (DrawSVG) e, logo atrás, a massa das
   formas materializa: a família, a casa, o veículo, a carga, a empresa ganham corpo.
2. **Imprevisto** — um clarão, o tremor, e os elementos de risco entram na ordem definida
   por `data-risk-delay`. O ambiente escurece por um filtro na câmera, e a cor passa a vir
   do próprio acontecimento: o fogo em âmbar, a descarga em ciano.
3. **Proteção** — o escudo se forma, o check da FIXSEG é desenhado e a luz volta.

Os seis capítulos cobrem vida, residencial, auto/caminhão/frota, transportes de carga,
empresarial/RC/garantia/riscos diversos e o fecho. Textos e produtos relacionados de cada
capítulo ficam em `src/config/story.ts` — para trocar o roteiro, basta editar esse arquivo.

**Ritmo.** Cada capítulo consome 70% da altura da janela no desktop e 56% no celular
(`porCapitulo`, em `StoryScroll.tsx`). Era 108% e 78%: a narrativa inteira pedia quase
6.000px de rolagem e cansava antes do fim. A mesma quantidade de beats, menos estrada
entre eles. Para deixar mais lento ou mais rápido, é esse número.

**Os atores: o caso ACONTECE na tela.** Não basta o risco aparecer — o carro
precisa chegar rodando e ser jogado para trás, o volume precisa tombar, a chama
precisa nascer pequena e crescer. Para isso existe um passo no orquestrador
chamado *movimento dos atores*: cada cena declara o movimento em atributos e a
timeline executa, sem que uma precise conhecer a outra.

| Atributo | Papel |
| --- | --- |
| `data-move-when="build\|risk\|shield"` | em que beat acontece |
| `data-move-x` / `data-move-y` | deslocamento, em px do viewBox (560×400) |
| `data-move-rot` | rotação, em graus |
| `data-move-scale` | escala final |
| `data-move-dur` | duração, em unidades da timeline |
| `data-move-ease` | easing do GSAP |
| `data-move-origin` | origem da transformação |

Regra de leitura: em `build` o valor declarado é **de onde o elemento vem** (ele
entra e assenta); em `risk` e `shield` é **para onde ele vai**.

Duas armadilhas já resolvidas: `data-move-*` e `data-depth` **não podem estar no
mesmo elemento** (os dois animam `transform` e brigam — use um grupo externo
para o parallax e um interno para o ator); e, como o orquestrador só sabe levar
um ator *para* um valor, uma peça que precisa NASCER pequena usa o helper local
`Cresce` (ver `HomeScene.tsx`), que desenha no tamanho final e encolhe num grupo
interno estático.

**Câmera e parallax.** Dentro de cada cena existe uma camada `[data-scene-camera]` que
avança devagar sobre a ilustração enquanto o capítulo corre, e cada grupo do SVG leva um
`data-depth` (fundo perto de `0.15`, primeiro plano perto de `1`) que o orquestrador
desloca em velocidades diferentes. As duas coisas juntas são o que tira a sensação de
cartão parado. A câmera fica separada de `[data-scene]` porque a cena cuida da entrada e
da saída — no mesmo elemento, uma transformação sobrescreveria a outra.

**O enquadramento no celular.** O palco ocupa a janela inteira, mas o cabeçalho fica fixo
por cima e come os primeiros ~84px. Sem compensar isso, o conteúdo se centraliza na altura
total e o topo da cena desaparece atrás do menu — era exatamente o defeito relatado ("a
história sobe enquanto você desce a página"). O capítulo tem `pt-[82px] pb-[64px]` no
celular, a cena é governada pela ALTURA (`h-[26svh]`, não pela largura) para encolher
sozinha em telas baixas, e os três parágrafos ocupam a MESMA caixa, um de cada vez: a
timeline apaga o anterior antes de trazer o próximo. Empilhados, os três não cabiam — o
capítulo mais longo pedia 834px numa área útil de 745px. Um pensamento por vez também
deixa a leitura mais rápida.

Existe um teste para isso: `node /home/claude/story-fit.mjs <url>` mede, em 360×640,
390×844, 412×915 e 768×1024, quanto sobra ou falta de altura em cada capítulo. Todo valor
precisa continuar negativo (= cabe). Rode depois de mexer no texto de qualquer capítulo.

### O kit de ilustração das cenas

As cenas **não são desenhos de linha**: são ilustrações vetoriais com massa, volume,
profundidade em camadas, sombra de contato no chão e elementos com movimento próprio.
Tudo o que elas precisam está em `src/components/story/sceneParts.tsx`:

- **`MASS` / `INK`** — a escala de profundidade, do `air` (quase página) ao `ink` (recorte
  máximo), mais `void` (o vazio: pneu, vão de porta, buraco). `MASS` são os pesos
  numéricos; `INK` são as cores. **As cores de massa são opacas** (`color-mix` nos tokens
  `--m-*`): com formas translúcidas, dois volumes sobrepostos mostram um através do outro
  e a ilustração ganha aspecto de raio-X. `void` existe porque, no tema escuro, "densidade
  máxima" significa branco — sem ele um pneu virava um farol aceso.
- **Helpers de superfície** — `mass()`, `outline()`, `detail()`, `accent()`,
  `accentStroke()` e os gradientes `volume()`, `sideFace()`, `topFace()`, `glass()`,
  `brandFill()`, `heat()`.
- **A cor de alerta** — `--alert` / `--alert-2` (âmbar) é a **única exceção** à paleta da
  marca em todo o site, e só aparece nas peças de fogo e perigo das cenas: chama, brasa,
  faísca de calor, sirene. O motivo é concreto: chama em ciano não é lida como chama — nos
  testes as labaredas azuis pareciam folhagem, e o momento do imprevisto, que é o coração
  da narrativa, perdia força. A descarga elétrica continua ciano, que é a cor que o olho
  espera para eletricidade. Para remover o âmbar por completo, troque os dois valores no
  `globals.css` por `var(--brand-2)` — nada mais precisa mudar.
- **Peças prontas** — `Air` (atmosfera), `Ground` (chão em perspectiva), `Contact`
  (sombra que assenta a forma), `Fracture` (trinca), `Flame`, `Smoke`, `Rain`, `Wheel`,
  `Sparks` (faísca), `Bolt` (descarga elétrica), `LightCone` (farol, poste, luz de janela)
  e `ShieldSeal`. `Air` e `Ground` usam a máscara `-edge`, que dissolve a cena na página em
  vez de deixar a aresta de um "cartão colado".
- **`SceneDefs`** — gradientes e filtros da cena. Cada cena passa um `id` único, porque
  ids de SVG são globais no documento.

Atributos que o orquestrador lê:

| Atributo | Papel |
| --- | --- |
| `data-scene-draw` | contorno; é desenhado com DrawSVG (precisa ser *stroke*) |
| `data-scene-fill` | massa; materializa depois do contorno |
| `data-scene-live` | movimento próprio em CSS (chama, chuva, fumaça, roda) |
| `data-scene-risk` + `data-risk-delay` | o imprevisto, na ordem indicada |
| `data-scene-shield` / `data-shield-check` | a proteção e o check final |
| `data-depth="0.3"` | participa do parallax: 0.15 no fundo, 1 no primeiro plano |

Para adicionar um capítulo: crie a cena em `story/scenes/`, registre a chave em
`SceneKey` e no mapa `scenes` de `StoryScroll.tsx`, e acrescente a entrada em
`storyChapters`. Use o kit e os atributos acima — o orquestrador cuida do resto.

Três armadilhas já resolvidas, que vale conhecer antes de mexer nas cenas:

1. **Coordenada de trigonometria passa por `xy()`.** `Math.sin`/`Math.cos` podem divergir
   na última casa entre o Node e o navegador, e isso basta para o React descartar a
   árvore por *hydration mismatch*.
2. **Nunca cubra o assunto com forma opaca em `data-scene-risk`.** A primeira versão do
   capítulo 01 apagava a família inteira com um retângulo. Escurecer é véu translúcido.
3. **Nada de sobreposição com cor por cima da cena.** A penumbra do imprevisto já foi um
   retângulo com cor chapada e depois uma vinheta radial: as duas desenhavam uma caixa
   cinza visível em volta da ilustração, justamente o "cartão colado" que a máscara de
   borda das cenas existe para evitar. Hoje é um filtro (`brightness`/`contrast`) na
   camada de câmera — filtro não tem geometria, logo não tem borda.
4. **Em movimento reduzido, não se zera `transform` de peça de SVG.** Num SVG o atributo
   `transform` é mapeado para a propriedade CSS: `transform: none` arrancava cada grupo do
   seu lugar e jogava o selo de proteção no canto do quadro. O CSS e o JS do modo reduzido
   forçam apenas visibilidade nas peças internas.

### Preferência de movimento (e a página de diagnóstico)

A decisão de animar ou não é tomada por um script que roda **antes da primeira
pintura** (`src/app/layout.tsx`) e gravada no atributo `data-motion` do `<html>`:
`full` ou `reduced`. Ele considera, nesta ordem, a escolha explícita do visitante e a
configuração do sistema operacional.

Por que existe uma escolha explícita: Windows e macOS ligam "movimento reduzido"
sozinhos em economia de bateria e em perfis de desempenho. Nessas situações o site fica
inteiramente estático — correto em acessibilidade, mas indistinguível de um site
quebrado para quem não sabe da configuração. Então:

| Endereço | Efeito |
| --- | --- |
| `?motion=full` | força as animações completas neste navegador |
| `?motion=reduced` | força o modo reduzido (útil para testar) |
| `?motion=auto` | volta a seguir o sistema |

A escolha vale para todo o site e fica salva apenas naquele navegador.

**`/diagnostico`** é uma página interna (fora dos menus, com `noindex`) que mostra o que
o navegador está reportando: preferência em uso, se o sistema pede movimento reduzido,
largura da janela, se a rolagem suavizada assumiu, quantos gatilhos de scroll estão
registrados, a versão do GSAP e quais plugins carregaram. É o caminho mais rápido para
responder "por que as animações não funcionam nesta máquina?".

Nos componentes, use `prefersReducedMotion()` (leitura síncrona) dentro de efeitos, e o
hook `useReducedMotion()` apenas quando a decisão afetar o HTML renderizado. Ler de forma
síncrona é o que garante que cada animação seja construída **uma vez** com o valor
correto — antes, o valor chegava errado no primeiro render e a seção fixada era montada e
desmontada em seguida.

### Desempenho e acessibilidade das animações

- Somente `transform` e `opacity` são animados; nada que force recálculo de layout.
- `gsap.matchMedia` reduz a complexidade em telas pequenas (sem desenho de traço longo,
  sem tremor de cena, `scrub` mais curto).
- A rolagem suavizada (ScrollSmoother) fica **desligada** em telas de toque e com
  `prefers-reduced-motion`.
- Com `prefers-reduced-motion`, a narrativa deixa de ser fixada e vira uma lista vertical
  legível. A garantia de visibilidade é dada por CSS (`globals.css`), à prova de ordem de
  execução do JavaScript.
- O estado inicial das animações de entrada vem do CSS e só se aplica quando o JavaScript
  está ativo (classe `js-anim`): sem JS, nada fica invisível, e não há "flash" de conteúdo.

### Animação de entrada + conteúdo filtrado: a armadilha resolvida

Vale ler antes de criar qualquer grade com abas, porque o defeito é silencioso e some
com `prefers-reduced-motion` ligado — ou seja, não aparece em teste de acessibilidade.

Na seção "Encontre a proteção ideal para você" as abas **Todos / Para você e sua família /
Para sua empresa** trocam os cartões. Cada cartão entra com `[data-reveal-item]`, cujo
estado inicial no CSS é `opacity: 0`; quem devolve a opacidade é o ScrollTrigger de
entrada, que marca a classe `.is-in`.

O que acontecia: ao trocar de aba, o React remonta os cartões. Os novos elementos nascem
com o `opacity: 0` do CSS e **sem** `.is-in`, e o ScrollTrigger daquele lote já tinha
disparado — nenhum novo gatilho existia para eles. Resultado visível para o cliente:
"Seguro de Transportes, Frota, Empresarial, Responsabilidade Civil e Garantia desaparecem
ao clicar em *Para sua empresa*". Os cartões estavam ali, ocupando espaço, invisíveis.

A correção em `src/components/sections/Insurances.tsx` é reanimar o lote a cada mudança de
filtro, com `dependencies: [filter]` no `useGSAP`, e uma guarda para não atropelar a
entrada por scroll na primeira renderização:

```tsx
const jaFiltrou = useRef(false);

useGSAP(() => {
  if (reduced) return;
  const el = gridRef.current; if (!el) return;
  /* Primeira passagem = carga da página: quem anima é o ScrollTrigger de
     entrada. Só a partir da SEGUNDA (= o usuário trocou de aba) este efeito
     assume. Sem esta guarda, os cartões animavam duas vezes ao carregar. */
  if (!jaFiltrou.current) { jaFiltrou.current = true; return; }

  const itens = Array.from(el.querySelectorAll<HTMLElement>('[data-reveal-item]'));
  if (!itens.length) return;

  gsap.fromTo(itens, { opacity: 0, y: 18, scale: 0.98 }, {
    opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.035, ease: 'brand',
    clearProps: 'transform,opacity',
    /* `.is-in` é o que mantém o cartão visível DEPOIS que o GSAP limpa as
       propriedades inline. Sem isso, o `opacity: 0` do CSS volta a valer. */
    onStart: () => itens.forEach((n) => n.classList.add('is-in')),
  });
}, { dependencies: [filter] });
```

**Regra prática:** todo elemento com `[data-reveal-item]` que possa ser remontado por
estado do React precisa receber `.is-in` no momento em que entra — ou ficará invisível
para sempre. Conferido no navegador: `Todos` 12 cartões / 0 invisíveis, `Para você e sua
família` 7 / 0, `Para sua empresa` 11 / 0, e um ciclo de seis trocas seguidas sem falha.

### Navegação por âncoras

`src/components/layout/AnchorScroll.tsx`. A rolagem nativa por fragmento conflita com o
ScrollSmoother, então os cliques em links de âncora são interceptados **na fase de
captura** (antes do `<Link>` do Next.js) e a rolagem é feita pelo caminho correto, sempre
descontando a altura do header. Por isso `scroll-behavior: smooth` e
`scroll-padding-top` foram deliberadamente omitidos do CSS.

---

## 5. Leads, integrações e segurança

### O caminho de um lead

```
Formulário (cliente)  →  POST /api/leads (servidor)  →  adaptador de destino
```

O frontend **nunca** fala com CRM, Supabase ou API de cotação. Motivos: nenhuma
credencial aparece no navegador, a validação é refeita no servidor, o destino é trocável
por variável de ambiente e existe um ponto único para limitar requisições.

A rota `src/app/api/leads/route.ts` faz: limite de 5 envios por minuto por IP,
sanitização e truncamento de todos os campos, validação server-side, registro do
consentimento e — se a integração externa falhar — preserva o lead no log do servidor e
devolve uma resposta honesta ao usuário.

### Escolhendo o destino

`LEADS_ADAPTER` no `.env.local`:

| Valor | O que faz | O que precisa |
| --- | --- | --- |
| `log` (padrão) | registra o lead no log do servidor | nada |
| `webhook` | envia para Make, n8n, Zapier, CRM próprio | `LEADS_WEBHOOK_URL` |
| `supabase` | insere na tabela `leads` | `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` |
| `crm` | POST autenticado por bearer token | `CRM_API_URL` + `CRM_API_KEY` |

Se o adaptador escolhido não estiver configurado, o sistema avisa no log e cai para `log`
— **o lead nunca é perdido em silêncio.** Nenhuma integração é simulada: enquanto não
houver destino real, a mensagem ao usuário diz apenas que a solicitação foi recebida e
que um especialista entrará em contato.

O SQL sugerido da tabela `leads` (com RLS ativo) está comentado em
`src/services/adapters/index.ts`. O esquema de `posts` para o blog está em
`src/services/content.ts`.

### Avaliações do Google (seção "O que falam de nós")

A seção é alimentada pelas **avaliações reais** do perfil da corretora no Google Meu
Negócio, lidas pela **Places API (New)**. O caminho é o mesmo dos leads: a chave existe
só no servidor e o componente de cliente recebe os dados já normalizados.

```
Home (Server Component) → src/services/googleReviews.ts → Places API (New)
                                     ↓
                    <Testimonials avaliacoes={…} />  (cliente, anima)
```

Duas variáveis, ambas **sem** `NEXT_PUBLIC_` — a chave nunca chega ao navegador:

```
GOOGLE_PLACES_API_KEY=AIza…
GOOGLE_PLACE_ID=ChIJ…
```

**Como obter o Place ID.** Abra o [Place ID
Finder](https://developers.google.com/maps/documentation/places/web-service/place-id),
busque "FIXSEG Corretora de Seguros, Cascavel" e copie o identificador que começa com
`ChIJ`. Confirme que o resultado é o perfil da corretora, não um homônimo.

**Como obter a chave.** No [Google Cloud Console](https://console.cloud.google.com):

1. Crie (ou selecione) um projeto e ative o faturamento — a Places API exige cartão
   cadastrado, ainda que o uso deste site fique dentro da faixa gratuita mensal.
2. **APIs e serviços → Biblioteca** → ative **Places API (New)**.
3. **APIs e serviços → Credenciais → Criar credenciais → Chave de API**.
4. **Restrinja a chave** (esta etapa não é opcional):
   - *Restrições de API*: marque **Restringir chave** e selecione **apenas** a Places
     API (New). Uma chave sem restrição de API serve para qualquer serviço do Google e
     vira prejuízo se vazar.
   - *Restrições de aplicativo*: como a chamada sai do **servidor**, e não do navegador,
     não use restrição por referenciador HTTP. Se a hospedagem tiver IP de saída fixo,
     restrinja por **endereço IP**; na Vercel, que não tem IP fixo no plano padrão,
     deixe sem restrição de aplicativo e mantenha a restrição de API.
5. Preencha as duas variáveis no `.env.local` (ou no painel da hospedagem) e refaça o
   deploy.

**Cache.** O adaptador usa `next: { revalidate: 21600 }` — uma consulta a cada seis
horas, não uma por visita. Isso é requisito, não otimização: o Google cobra por chamada
e devolve no máximo **5 avaliações** por consulta (limite da API, não do site). A nota
média e o total de avaliações exibidos são os do perfil inteiro.

**Sem configuração.** Sem chave, sem Place ID, com cota estourada ou com a API fora do
ar, `fetchGoogleReviews()` devolve lista vazia, registra um aviso no log do servidor e a
seção **não é renderizada**. Nenhuma avaliação, nota ou foto é inventada, e a página
continua de pé.

**Depoimentos fora do Google.** A lista `testimonials` em `src/config/content.ts`
continua existindo para depoimentos que chegaram por outro canal e têm autorização de
uso por escrito. Se houver itens lá, eles entram no mesmo carrossel, identificados como
*"Depoimento enviado à FIXSEG"* — nunca como avaliação pública do Google.

**Structured data.** `aggregateRating` e os nós `Review` só são emitidos quando há
avaliação real vinda do Google (`reviewsSchema()` em `src/lib/seo.tsx`, um nó com o
mesmo `@id` da organização). Nota inventada em structured data é violação das
diretrizes do Google.

### Curiosidades sobre seguros (seção "Informação também é proteção")

Esta seção **não busca nada na internet**. O conteúdo é da corretora, está em
`src/config/curiosities.ts` e é renderizado por `src/components/sections/Curiosities.tsx`.

Ela substituiu uma integração com o feed de notícias do CQCS, que foi retirada. Vale
registrar por quê, para que ninguém a reintroduza sem pensar:

1. **cada cartão era um link de saída.** O visitante lia meia notícia e ia terminar de ler
   no site de outra empresa — que também vende seguro;
2. **o conteúdo dependia de um servidor de terceiro**, que pode mudar de estrutura, sair do
   ar ou recusar as requisições. E recusava: o portal respondia 403;
3. **a seleção era por filtro de palavras**, e filtro sempre deixa passar (ou barra) alguma
   coisa. Nenhum ajuste de lista resolve isso de vez.

Os arquivos `src/config/news.ts`, `src/services/news.ts` e
`scripts/verificar-noticias.mjs` foram **apagados**, junto das variáveis `NEWS_*` do
`.env.example` e da derivação de hosts de imagem do `next.config.mjs`. O histórico do git
guarda o adaptador, o parser de RSS e o filtro, se um dia fizerem falta.

#### O conteúdo

**50 curiosidades, 5 para cada um dos 10 produtos** que a corretora comercializa. Cada uma
tem:

| Campo | Papel |
| --- | --- |
| `slug` | o produto, casando com `src/config/insurances.ts` — é o que monta os filtros |
| `titulo` | a manchete, 4 a 9 palavras |
| `texto` | 2 a 4 frases: o fato e por que ele importa para quem tem o bem |
| `destaque` | `{ valor, rotulo }` — o número exibido grande. `null` quando o item não tem número |
| `fonte` | nome da fonte + ano. **Aparece no cartão** |

**A regra que governa esse arquivo: todo número é real, tem ano e tem fonte.** A pesquisa
foi feita item por item em fontes primárias brasileiras — CNseg, FenSeg, FenaPrevi, SUSEP,
NTC&Logística, CNT, Sinesp, Fórum Brasileiro de Segurança Pública, INPE, STJ e a própria
legislação (Código Civil, Código Penal, Lei 14.133/2021, Lei 14.599/2023, Lei 15.040/2024,
CPC, Lei das S.A.). **O endereço de cada fonte está no comentário acima do item**, para
conferência.

Quando o assunto é interessante mas não tem número confiável, o item entra **sem número** e
conta a regra, o prazo ou a cobertura — o cartão mostra "Você sabia?" no lugar do dado.
Isso é deliberado: estatística chutada em site de corretora é pior do que curiosidade
nenhuma.

**Dado envelhece.** Números de mercado (arrecadação, roubos no ano, % de bens segurados)
merecem revisão anual. O ano aparece na tela junto da fonte, então um dado velho fica
visível para o visitante — honesto, mas não bom.

#### O carrossel

- **Abas por produto**, mais "Todos os temas" (50 cartões). A aba mostra o nome do produto
  sem a palavra "Seguro" na frente, que a seção já dá o contexto.
- **Avanço automático** a cada 9 segundos (`curiosidadesConfig.intervalo`), que **para** no
  ponteiro, no foco de teclado e quando a aba do navegador sai de vista. Botões de anterior
  e próximo, pontos até 8 itens e contador (`01 / 50`) acima disso — trinta pontinhos numa
  linha não informam posição, viram textura.
- **Circular**: passar do último volta ao primeiro.
- **Nenhum link.** Verificado no navegador: `0` elementos `a[href]` dentro da seção.

**Por que um scroller nativo e não `transform`:** o carrossel é um contêiner com
`overflow-x` e `scroll-snap`, e avançar é chamar `scrollTo` no elemento. Não há cálculo de
translate, nem largura medida à mão, nem estado de posição para dessincronizar — e vêm de
graça o arrasto com o dedo, a inércia do sistema, a roda do mouse na horizontal e a rolagem
por teclado. A posição corrente é **lida de volta do scroll**, nunca assumida, porque o
visitante pode arrastar o cartão sem passar pelos botões.

**Acessibilidade:** `aria-roledescription="carrossel"` na região e "N de M" no rótulo de
cada cartão; setas do teclado navegam quando o carrossel tem foco; a pausa no ponteiro e no
foco cumpre a WCAG 2.2.2; com `prefers-reduced-motion` não há avanço automático nem rolagem
animada.

**Para desligar a seção:** `curiosidadesConfig.ativo = false`.

### Artigos próprios (a seção de conteúdo da FIXSEG)

`src/components/sections/Blog.tsx` continua existindo, agora **só** com os artigos da
corretora (`posts` em `src/config/content.ts`). Com a lista vazia — o estado de uma
publicação nova — a seção não é renderizada. Publicado o primeiro artigo, ela aparece
sozinha, com o título "Escrito pela FIXSEG", logo abaixo das curiosidades.

### Integrações preparadas, não ativadas

Supabase, CRM, API de cotação, consulta de CNPJ, Google Analytics, Google Tag Manager e
Meta Pixel: todas as variáveis existem em `.env.example` e a arquitetura está pronta.
**Nada é carregado enquanto a variável estiver vazia** — o site não faz uma única
requisição a terceiros por padrão.

Se a corretora optar por exigir consentimento prévio de cookies, o gancho está pronto:
basta condicionar a renderização de `src/components/layout/Analytics.tsx` ao aceite.

### LGPD

- Consentimento obrigatório e explícito em todos os formulários, com link para a Política
  de Privacidade e registro do aceite junto ao lead.
- Aceite de marketing separado e opcional.
- Nenhum dado sensível é solicitado pelo site.
- Cabeçalhos de segurança em `next.config.mjs` (HSTS, nosniff, X-Frame-Options,
  Referrer-Policy, Permissions-Policy).
- Chaves de serviço só existem server-side (sem prefixo `NEXT_PUBLIC_`).

---

## 6. Os logos dos parceiros e a faixa de versículos

### Como os logos foram padronizados

Os arquivos chegaram como impressões de página em PDF (cabeçalho e rodapé do
navegador em volta de uma imagem). `scripts/logos.py` faz o caminho inteiro e
pode ser rodado de novo quando chegarem novos parceiros:

1. **Reconstrução** — `pdfimages` extrai a imagem original de dentro do PDF, sem
   a moldura da página; quando o PDF traz duas imagens (RGB + máscara cinza), as
   duas são recombinadas para devolver a transparência. Quando o logo é vetor na
   página, o script renderiza a 600dpi e corta as faixas de cabeçalho e rodapé.
2. **Recorte** — cada logo é aparado até a tinta, em duas passadas (alfa e
   branco), porque parte dos arquivos vem com fundo branco chapado.
3. **Normalização óptica** — o que padroniza o tamanho não é a altura nem a
   largura: é a **média geométrica** (raiz de largura × altura). Igualar só a
   altura faz um logotipo horizontal e largo (Bradesco, 6,2:1) parecer gigante
   ao lado de uma marca quadrada (HDI, 1:1); igualar só a largura inverte o
   problema. Com a média geométrica as duas ocupam a mesma "quantidade de tinta"
   no olho. Depois disso, limites de largura e altura garantem que nada estoure a
   caixa, e a ampliação é limitada a 1,45× — acima disso o logo fica visivelmente
   macio, e é melhor aceitá-lo um pouco menor.

Todos saem na MESMA tela de 280×88 (o dobro da caixa de exibição), o que
dispensa ajuste por logo no componente: um único `object-contain` entrega todos
no mesmo tamanho óptico.

### Os logos não são links

Cada logo já foi um `<a target="_blank">` para o site da seguradora. **Saiu**: a faixa
existe para mostrar com quem a corretora trabalha, e o caminho de saída menos desejado num
site de corretora é justamente o que leva a quem também vende seguro. O campo `url`
continua em `content.ts` → `insurers` como registro do dado; nada no site o usa.

### As duas versões de cada marca

Os arquivos das seguradoras são tinta escura sobre transparente — é assim que
cada companhia distribui a própria marca. Sobre fundo escuro eles
desapareceriam, e recolorir marca de terceiro não é uma opção. A saída são
**duas versões por companhia**, geradas pelo mesmo script:

| Tema | Arquivo | Cartão |
| --- | --- | --- |
| claro | `nome.png` | placa branca (`--logo-plate`), marca na cor original |
| escuro | `nome-escuro.png` | vidro escuro, marca em **reversa monocromática branca** |

A reversa é o tratamento que os próprios manuais de marca preveem para fundo
escuro. Ela é montada em dois passos, e a ordem importa: primeiro o branco vira
transparente — o que resolve os arquivos com fundo branco chapado e, de quebra,
transforma o branco INTERNO da marca em furo, então o "Z" da Zurich e as barras
da Allianz continuam aparecendo, agora como o fundo da página passando por
dentro; depois o que sobrou é pintado de branco preservando o alfa
(`-colorize`), o que evita halo cinza nas bordas antisserrilhadas. A cor da
marca se perde no tema escuro: é o preço conhecido de uma reversa.

**Uma exceção**: a AXA fica em cor nos dois temas (`modo = 'cor'` no script). O
logo dela é um quadrado azul-marinho com letras brancas, que já nasce para fundo
escuro; virá-lo em silhueta branca produziria um quadrado branco sem as letras.

As duas versões ficam no DOM e a troca é por CSS (`dark:`), nunca por estado do
React — o tema é resolvido antes da primeira pintura, e decidir isso em
JavaScript causaria divergência de hidratação. A versão escondida não é baixada
(`display:none` + `loading="lazy"`), e a visível é a única com `alt` ativo na
árvore de acessibilidade.

### A faixa de versículos

`src/config/verses.ts` e `src/components/layout/VerseBand.tsx` — uma faixa fina
acima do rodapé, em todas as páginas, com um versículo por vez.

- **Nunca repete.** Sorteio simples repete: com 18 versículos a repetição ao
  longo de uma visita é certa. A faixa usa o modelo do **saco** — embaralha a
  lista inteira (Fisher-Yates) e percorre do começo ao fim; só quando o último
  sai é que um novo embaralhamento acontece, e nesse novo garante-se que o
  primeiro não seja igual ao último exibido, para não repetir na emenda.
  A implementação é deliberadamente mínima: *saco vazio → embaralha com
  garantia; senão, tira o da frente*. Uma versão anterior tinha um ramo a mais
  ("se sorteou o que já está na tela, pega o seguinte") que consumia uma rodada
  em silêncio — medido, entregava 17 de 18 antes de reembaralhar. Com a garantia
  no embaralhamento aquele caso não pode ocorrer, e o ramo saiu.
- O saco fica no `localStorage`, então quem volta continua de onde parou. Se o
  navegador bloquear o armazenamento, o componente sorteia na memória.
- **Hidratação**: o sorteio não pode acontecer no render (`Math.random()` divide
  servidor e cliente). O HTML do servidor traz sempre o índice 0 e o
  embaralhamento começa depois da montagem. Pela mesma razão, o botão "ver outro
  versículo" é **sempre** renderizado: condicioná-lo a `prefersReducedMotion()`
  no JSX quebrava a hidratação (React #418), porque no servidor a preferência
  ainda é desconhecida. *(O botão foi depois removido a pedido do cliente; a
  armadilha fica registrada porque vale para qualquer elemento condicionado a uma
  preferência do navegador.)*
- **Sem título, sem botão, sem chamada** — só a passagem e a referência. A
  rotação é automática e faz parte do site; o visitante não tem nada a operar.
- **O crédito da tradução saiu da tela.** A linha "Almeida, domínio público"
  aparecia sob a referência e foi retirada a pedido do cliente: sob a faixa
  ficam agora apenas a passagem e o livro/capítulo/versículo. A informação
  **continua registrada** no comentário de `src/config/verses.ts` e no
  `verseBand.traducao`, que é onde ela importa — é ali que se decide trocar de
  tradução, e é a decisão que exige licença. Para exibir de novo, basta imprimir
  `verseBand.traducao` ao lado da referência em `VerseBand.tsx`.
- **Acessibilidade**: `aria-live="off"` (texto que troca sozinho não deve
  interromper leitor de tela a cada 14s) e a rotação para no hover e no foco, que
  é o mecanismo de pausa que a WCAG 2.2.2 pede para conteúdo em movimento
  automático. Com `prefers-reduced-motion`, a faixa mostra um versículo e não
  troca mais.
- **Tradução**: João Ferreira de Almeida, edição em **domínio público**. Escolha
  deliberada: ARA, ARC, NVI e NAA são obras protegidas e exigiriam licença da
  editora para publicação em site. Trocar de tradução exige obter autorização
  antes.
- Para desligar a faixa inteira: `verseBand.ativo = false`.

---

## 7. A calculadora de bônus

`/calculadora-bonus` — a ferramenta de atração da página. O visitante informa a
apólice que está vencendo e recebe a classe estimada da renovação.

**A regra**, isolada e testável em `src/config/bonus.ts`:

```
novaClasse = classeAtual + 1 − faixaDeAtraso − penalidadeDeSinistros
```

- `faixaDeAtraso`: blocos de 30 dias corridos entre o vencimento da apólice
  anterior e a data da renovação. Até 30 dias → 0; 31–60 → 1; 61–90 → 2; e
  assim por diante, até acima de 330 dias → 11 (zera o bônus).
- `penalidadeDeSinistros`: 0 sem sinistro; `sinistros + 1` quando houve.
- Resultado limitado ao intervalo 0–10.
- A apólice precisa ter vigorado **335 dias** para dar direito ao avanço de
  classe, e **60 dias** para o bônus se transferir.

A escala 0–10 é o padrão FENASEG usado pelo mercado brasileiro de seguro auto.
`scripts/verificar-bonus.mjs` confere a implementação contra oito casos
conhecidos (renovação em dia, atraso em cada faixa, combinação de sinistro com
atraso); rode com `node scripts/verificar-bonus.mjs` depois de qualquer mexida
na regra.

**O que a calculadora NÃO faz, de propósito:** não promete desconto e não
apresenta o resultado como definitivo. As regras variam de uma seguradora para
outra, algumas avaliam também o histórico do condutor e do veículo, e a classe
que vale é a que a seguradora emissora atribuir na apólice. A tela diz isso com
todas as letras, e a tabela de faixas de desconto por classe está marcada como
"faixas típicas de mercado, variam por seguradora".

**Privacidade:** o cálculo acontece inteiramente no navegador. Nenhuma data e
nenhum dado digitado ali sai do dispositivo — nada é enviado para a FIXSEG nem
para lugar nenhum. A tela informa isso ao usuário.

**Atalho:** o botão "Bônus" no cabeçalho, ao lado de "Calcule seu seguro",
ocupa o lugar do antigo botão redondo de WhatsApp (o botão flutuante de
WhatsApp da página continua onde estava, e o WhatsApp segue no menu mobile e no
rodapé). A calculadora também aparece no menu mobile e no rodapé.

---

## 8. SEO

- Metadata, Open Graph e Twitter Card em `src/lib/seo.tsx`, herdados por todas as páginas.
- Imagem de Open Graph gerada no servidor (`app/opengraph-image.tsx`) — sem arquivo
  estático para manter atualizado.
- `sitemap.xml` e `robots.txt` gerados a partir da configuração; os produtos entram
  automaticamente.
- JSON-LD: `InsuranceAgency` (com SEO local quando o endereço estiver preenchido),
  `ItemList` de serviços, `FAQPage`, `Service` por produto e `BreadcrumbList`. Campos
  ainda não configurados são omitidos — dado falso em structured data prejudica o
  ranqueamento.
- URLs amigáveis por produto: `/seguros/seguro-de-transportes`, geradas estaticamente.
- Um único `<h1>` por página e hierarquia de headings consistente.

Para o SEO local funcionar, preencha `address.city` e `address.state` em `site.ts`.

---

## 9. Publicação

O passo a passo completo — Vercel, túnel a partir do seu computador, Cloudflare Pages e
servidor próprio — está em **[DEPLOY.md](./DEPLOY.md)**.

### Pré-visualização privada

O projeto vem com uma trava de senha própria em `src/middleware.ts`, que **não depende de
recurso pago de nenhuma plataforma**. Defina duas variáveis de ambiente:

```
PREVIEW_USER=fixseg
PREVIEW_PASSWORD=uma-senha-que-so-voce-sabe
```

Com elas, o site inteiro (páginas, imagens e a rota de leads) passa a exigir usuário e
senha, e responde `X-Robots-Tag: noindex, nofollow` — então a versão de homologação não é
indexada pelo Google e não compete com o site definitivo.

Para ir ao ar de verdade, **apague `PREVIEW_PASSWORD`** e refaça o deploy. Sem essa
variável, a trava não existe e o site funciona normalmente.

### Resumo do deploy na Vercel

1. Suba o projeto para um repositório Git privado.
2. Na Vercel, **Add New → Project** → selecione o repositório. O framework é detectado
   automaticamente; não altere os comandos de build.
3. Em **Environment Variables**, informe ao menos `NEXT_PUBLIC_SITE_URL` (domínio final,
   usado em sitemap, canonical e Open Graph) e, se quiser homologar em privado,
   `PREVIEW_USER` e `PREVIEW_PASSWORD`.
4. Adicione o domínio em **Settings → Domains**.
5. Deploy.

> O plano gratuito (Hobby) da Vercel é restrito a uso pessoal e não comercial pelas
> diretrizes de uso justo da plataforma. Para hospedar o site de uma corretora em
> definitivo, o plano indicado é o Pro. As alternativas sem essa restrição estão em
> [DEPLOY.md](./DEPLOY.md).

---

## 10. Verificações já realizadas

O projeto foi testado com navegador automatizado antes da entrega:

- **Build e tipos:** `next build` e `tsc --noEmit` sem erros ou avisos.
- **Responsividade:** 320, 390, 412, 768, 1024, 1280, 1440 e 1920px — nenhum
  transbordamento horizontal em nenhuma largura.
- **Rotas:** home, `/seguros`, os 11 produtos, `/cotacao`, páginas legais, `sitemap.xml`,
  `robots.txt` e a página 404 — todas respondendo corretamente. Nenhuma âncora do menu
  aponta para um destino inexistente.
- **Fluxo de cotação:** pré-seleção por URL (`/cotacao?seguro=seguro-auto`), validação de
  campos obrigatórios com mensagem visível, bloqueio sem consentimento LGPD, revisão e
  tela de sucesso animada.
- **Formulário de contato:** validação e confirmação animada.
- **Navegação por âncoras:** desktop e mobile param exatamente na altura correta, com o
  título da seção visível e as animações de entrada disparando.
- **Menu mobile:** abre, navega e fecha corretamente.
- **`prefers-reduced-motion`:** nenhum elemento fica invisível; a narrativa vira lista, as
  peças com movimento próprio param sem desaparecer e as ilustrações continuam íntegras.
- **A narrativa no celular:** medida em 360×640, 390×844, 412×915 e 768×1024 — os seis
  capítulos cabem na área útil com folga em todas elas (`story-fit.mjs`).
- **Calculadora de bônus:** os oito casos conhecidos da regra FENASEG conferidos por
  script, mais o preenchimento do formulário no navegador e a leitura do resultado.
- **Carrossel de curiosidades:** as 11 abas conferidas uma a uma no navegador (5 cartões
  cada, produto correto no primeiro cartão, pontos na aba de produto e contador `01 / 50`
  em "Todos"), avanço e retorno pelos botões, navegação pelas setas do teclado, avanço
  automático medido em 11s, **pausa confirmada com o ponteiro sobre o carrossel** e retomada
  ao sair. **`0` links dentro da seção** — nenhum caminho de saída do site. Nos dois temas,
  a 1440px e a 390px, sem erro de console e sem transbordamento horizontal.
- **Seção de contato:** os dados de contato aparecem em UM só lugar da página (o rodapé).
  A seção de contato ficou com o convite e o formulário, centrados.
- **Ausência do telefone:** varredura no HTML entregue de `/`, `/cotacao`, `/seguros`,
  `/calculadora-bonus` e `/politica-de-privacidade` — o número formatado não aparece em
  nenhuma delas, e **toda** ocorrência dos dígitos está dentro de um
  `href="https://wa.me/…"` (7 na home, 3 em cada outra página). A verificação de
  "ocorrências fora de contexto wa.me" voltou vazia. `telephone` não sai no JSON-LD.
- **Abas de filtro dos seguros:** contagem de cartões e de cartões invisíveis em cada aba
  (`Todos` 12/0, `Para você e sua família` 7/0, `Para sua empresa` 11/0) e um ciclo de
  seis trocas seguidas (empresa → pessoa → empresa → todos → pessoa → todos), todas sem
  nenhum cartão invisível.
- **Rodapé, linha por linha:** medido nos dois temas — item do e-mail com 40px (uma linha)
  e do endereço com 103px (três linhas, nenhuma quebrada no meio de uma palavra); nenhum
  erro de console.
- **Cabeçalho ampliado:** logo de 68px no topo e 56px rolado no desktop, 56/46 no celular,
  capturada nos dois temas e nos dois estados de rolagem em 1440px, 360px e 320px. A
  assinatura "Corretora de Seguros" está legível em todos, a barra mede 120/92px no desktop
  e 108/84px no celular, e **não há transbordamento horizontal nem a 320px** (medido:
  `scrollWidth === innerWidth` nas seis combinações).
- **Rolagem por âncora depois da mudança de altura:** os cinco destinos do menu conferidos
  em desktop e celular — a seção para 14px abaixo da barra e o título fica visível em
  todos, com o deslocamento medido da barra real (92px no desktop, 84px no celular).
- **As fotos das notícias:** contra um portal de teste que serve feed **sem imagem nenhuma**
  e páginas com `og:image` — os três cartões saíram ilustrados com a foto da sua própria
  matéria (200 e `naturalWidth` 1200 em cada), nos dois temas, sem erro de console e sem
  falha de rede; o item sobre corretor continuou barrado pelo filtro.
- **Carrossel de parceiros:** os 14 logos carregam (verificado por `naturalWidth`), saem
  no mesmo tamanho óptico e leem nos dois temas.
- **Faixa de versículos:** 41 trocas seguidas conferidas no navegador — 18 versículos
  distintos, nenhuma repetição em sequência e nenhum ciclo com repetido.
- **Desempenho:** tempo de quadro medido com a CPU 4× mais lenta, no celular, durante a
  rolagem da narrativa e do resto da página (`perf2.mjs`), antes e depois de cada
  alteração de animação.
- **Os dois temas:** claro e escuro capturados em todas as seções da home e nas seis cenas
  da narrativa, a 1440px e a 390px. Fundo, contraste de texto, brilhos e a massa das
  ilustrações conferidos em cada um; nenhum transbordamento horizontal e nenhum aviso de
  console em nenhum dos dois.
- **Console:** nenhum erro de JavaScript em nenhuma página ou viewport.
- **Hidratação (modo de desenvolvimento):** as 10 rotas — incluindo
  `/calculadora-bonus` — foram carregadas em desktop e mobile sem um único aviso de
  *hydration mismatch*. Duas armadilhas foram tratadas na
  origem: coordenadas vindas de `Math.sin`/`Math.cos` são arredondadas com o helper `xy()`
  de `story/sceneParts.tsx` (as duas implementações podem divergir na 14ª casa decimal), e
  o `<html>` usa `suppressHydrationWarning` porque a classe `js-anim` é adicionada por
  script antes da hidratação. **Ao criar novas cenas, use sempre `xy()` em coordenada que
  venha de trigonometria.**
- **Acessibilidade:** um `<h1>` por página, foco visível por teclado, link "pular para o
  conteúdo", `aria-expanded`/`aria-controls` no menu e no acordeão, erros de formulário
  anunciados por `role="alert"`, alvos de toque confortáveis e zoom nunca bloqueado.

---

## 11. Próximos passos sugeridos

1. **Fairfax**: o arquivo enviado é a versão clara da marca (texto branco, para fundo
   escuro) e fica invisível sobre a placa branca do carrossel. Peça a versão escura sobre
   fundo claro e descomente a linha em `content.ts` → `insurers`.
   **Seguros Unimed, Swiss Re e Yelum** foram citados no envio, mas os arquivos não
   chegaram — mande que eu processo do mesmo jeito.
   **Cinco logos vieram em resolução baixa** (Sancor 166×43, Bradesco 330×53, Porto
   250×58, Allianz 250×63, Mapfre 250×69). Funcionam, mas ficam levemente macios em tela
   retina; se a seguradora tiver SVG ou PNG maior no manual de marca, vale trocar.
2. **Ligar as avaliações do Google** (`GOOGLE_PLACES_API_KEY` + `GOOGLE_PLACE_ID`) para a
   seção "O que falam de nós" existir. Passo a passo na seção 5.
3. **Confirmar o horário de atendimento** (`site.hours`) — é o único dado visível que não
   veio da corretora.
   Vale conferir junto se a **ausência do telefone** na tela é a decisão definitiva: hoje
   o único caminho de voz é o WhatsApp, e a ficha do negócio no Google fica sem o campo de
   telefone (§1 traz o que descomentar para reverter).
4. Revisar a Política de Privacidade e os Termos de Uso juridicamente e remover o aviso
   de pendência em `LegalPage.tsx`.
5. Informar as redes sociais (`site.social`) e, se houver, o link do perfil no Google
   Business em `address.mapsUrl`.
6. Informar os indicadores reais (clientes, anos, apólices, seguradoras).
7. Definir o destino dos leads (`LEADS_ADAPTER`) — o WhatsApp e o e-mail já funcionam.
8. Substituir `about.paragraphs` pelo texto institucional verdadeiro.
9. **Revisar as curiosidades uma vez por ano.** São 50 itens com fonte e ano visíveis
   (`src/config/curiosities.ts`); os números de mercado envelhecem e o ano na tela mostra
   isso. O endereço de cada fonte está no comentário acima do item.
10. Publicar os primeiros conteúdos do blog — artigo próprio tem precedência sobre as
    notícias de terceiro na mesma seção.
