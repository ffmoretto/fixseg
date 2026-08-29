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
  phone:    '(45) 99955-0676',                  // como aparece na tela
  phoneRaw: '45999550676',                      // usado no link tel:
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

Como o mesmo número atende WhatsApp e ligação, os dois canais aparecem na seção de
contato com ações diferentes: o cartão do WhatsApp abre a conversa com a mensagem
pré-preenchida, o cartão de telefone disca. O número em si aparece uma vez em cada
região da página, não duas.

O endereço ativa automaticamente o **SEO local**: as páginas passam a incluir "em
Cascavel" no Open Graph e nas descrições dos produtos, a palavra-chave "corretora de
seguros Cascavel" entra na lista, e o `PostalAddress` do Schema.org é emitido junto do
CNPJ (`taxID`) e do registro SUSEP (`identifier`).

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
| `src/config/content.ts` | diferenciais, etapas do "como funciona", textos institucionais, **indicadores numéricos**, **seguradoras parceiras**, **depoimentos**, FAQ e blog |
| `src/config/story.ts` | roteiro da narrativa animada em scroll (capítulos, textos, produtos relacionados) |

### Itens que ficaram intencionalmente vazios

Nada foi inventado sobre a corretora. Estes três blocos começam sem conteúdo e as
seções correspondentes **não aparecem** até serem preenchidas:

1. **Indicadores** (`content.ts` → `stats`): clientes atendidos, anos de experiência,
   seguros contratados, seguradoras parceiras. Troque `value: null` pelo número real e o
   card entra em cena com contagem animada.
2. **Seguradoras parceiras** (`content.ts` → `insurers`): adicione os logos autorizados em
   `public/seguradoras/` e uma entrada `{ name, logo, url? }` por seguradora.
3. **Depoimentos** (`content.ts` → `testimonials`): apenas depoimentos reais e com
   autorização de uso. Com a lista vazia, o carrossel não é renderizado.

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
originais. No cabeçalho ela tem 48px e reduz para 40px quando a página rola.

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
│   │                             QuoteSection/QuoteForm, About, Insurers,
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
└── services/                     leads, adaptadores de destino, fonte de conteúdo
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
2. **Imprevisto** — os elementos de risco entram com impacto e a cena perde a cor da marca.
3. **Proteção** — o escudo se forma, o check da FIXSEG é desenhado e a cor volta.

Os seis capítulos cobrem vida, residencial, auto/caminhão/frota, transportes de carga,
empresarial/RC/garantia/riscos diversos e o fecho. Textos e produtos relacionados de cada
capítulo ficam em `src/config/story.ts` — para trocar o roteiro, basta editar esse arquivo.

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
- **Peças prontas** — `Air` (atmosfera), `Ground` (chão em perspectiva), `Contact`
  (sombra que assenta a forma), `Fracture` (trinca), `Flame`, `Smoke`, `Rain`, `Wheel` e
  `ShieldSeal`. `Air` e `Ground` usam a máscara `-edge`, que dissolve a cena na página em
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

Para adicionar um capítulo: crie a cena em `story/scenes/`, registre a chave em
`SceneKey` e no mapa `scenes` de `StoryScroll.tsx`, e acrescente a entrada em
`storyChapters`. Use o kit e os atributos acima — o orquestrador cuida do resto.

Três armadilhas já resolvidas, que vale conhecer antes de mexer nas cenas:

1. **Coordenada de trigonometria passa por `xy()`.** `Math.sin`/`Math.cos` podem divergir
   na última casa entre o Node e o navegador, e isso basta para o React descartar a
   árvore por *hydration mismatch*.
2. **Nunca cubra o assunto com forma opaca em `data-scene-risk`.** A primeira versão do
   capítulo 01 apagava a família inteira com um retângulo. Escurecer é véu translúcido.
3. **Em movimento reduzido, não se zera `transform` de peça de SVG.** Num SVG o atributo
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

## 6. SEO

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

## 7. Publicação

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

## 8. Verificações já realizadas

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
- **Os dois temas:** claro e escuro capturados em todas as seções da home e nas seis cenas
  da narrativa, a 1440px e a 390px. Fundo, contraste de texto, brilhos e a massa das
  ilustrações conferidos em cada um; nenhum transbordamento horizontal e nenhum aviso de
  console em nenhum dos dois.
- **Console:** nenhum erro de JavaScript em nenhuma página ou viewport.
- **Hidratação (modo de desenvolvimento):** as 9 rotas foram carregadas em desktop e
  mobile sem um único aviso de *hydration mismatch*. Duas armadilhas foram tratadas na
  origem: coordenadas vindas de `Math.sin`/`Math.cos` são arredondadas com o helper `xy()`
  de `story/sceneParts.tsx` (as duas implementações podem divergir na 14ª casa decimal), e
  o `<html>` usa `suppressHydrationWarning` porque a classe `js-anim` é adicionada por
  script antes da hidratação. **Ao criar novas cenas, use sempre `xy()` em coordenada que
  venha de trigonometria.**
- **Acessibilidade:** um `<h1>` por página, foco visível por teclado, link "pular para o
  conteúdo", `aria-expanded`/`aria-controls` no menu e no acordeão, erros de formulário
  anunciados por `role="alert"`, alvos de toque confortáveis e zoom nunca bloqueado.

---

## 9. Próximos passos sugeridos

1. **Confirmar o horário de atendimento** (`site.hours`) — é o único dado visível que não
   veio da corretora.
2. Revisar a Política de Privacidade e os Termos de Uso juridicamente e remover o aviso
   de pendência em `LegalPage.tsx`.
3. Informar as redes sociais (`site.social`) e, se houver, o link do perfil no Google
   Business em `address.mapsUrl`.
4. Adicionar os logos das seguradoras parceiras autorizadas.
5. Coletar e cadastrar os primeiros depoimentos com autorização.
6. Informar os indicadores reais (clientes, anos, apólices, seguradoras).
7. Definir o destino dos leads (`LEADS_ADAPTER`) — o WhatsApp e o e-mail já funcionam.
8. Substituir `about.paragraphs` pelo texto institucional verdadeiro.
9. Publicar os primeiros conteúdos do blog.
