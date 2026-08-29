# Como publicar uma pré-visualização privada

O site é uma aplicação Next.js com renderização no servidor (há uma rota de API para os
leads), então ele precisa de uma hospedagem que rode Node.js — não dá para simplesmente
subir os arquivos por FTP.

Este guia cobre quatro caminhos, do mais rápido ao mais definitivo.

---

## A trava de senha (funciona em qualquer opção)

Antes de escolher a hospedagem: o projeto já vem com uma trava de senha própria
(`src/middleware.ts`). Ela protege o site inteiro — páginas, imagens e a rota de leads —
e **não depende de recurso pago de nenhuma plataforma**.

Para ativar, defina duas variáveis de ambiente:

```
PREVIEW_USER=fixseg
PREVIEW_PASSWORD=uma-senha-que-so-voce-sabe
```

O que acontece com a trava ativa:

- qualquer acesso pede usuário e senha na janela do próprio navegador;
- o site responde `X-Robots-Tag: noindex, nofollow`, então **o Google não indexa** a
  versão de homologação e ela não compete com o site definitivo;
- a senha é pedida uma única vez por sessão do navegador.

Para publicar de verdade: **apague a variável `PREVIEW_PASSWORD`** e faça um novo deploy.
Sem ela, a trava simplesmente não existe.

> Use uma senha só para isso. Autenticação HTTP básica trafega a credencial em cada
> requisição — protegida pelo HTTPS, mas não é lugar para uma senha que você reutiliza.

---

## Opção 1 — Vercel (mais rápido: ~5 minutos)

É a plataforma dos criadores do Next.js; o deploy é praticamente automático.

1. Crie um repositório **privado** no GitHub e suba o projeto:

   ```bash
   git init
   git add .
   git commit -m "Site FIXSEG"
   git branch -M main
   git remote add origin git@github.com:SEU-USUARIO/fixseg-site.git
   git push -u origin main
   ```

2. Em [vercel.com](https://vercel.com) → **Add New → Project** → selecione o repositório.
   O framework é detectado sozinho; não altere os comandos de build.

3. Ainda na tela de importação, em **Environment Variables**, adicione:

   | Nome | Valor |
   | --- | --- |
   | `PREVIEW_USER` | `fixseg` |
   | `PREVIEW_PASSWORD` | a senha da pré-visualização |
   | `NEXT_PUBLIC_SITE_URL` | a URL que a Vercel gerar (pode ajustar depois) |

4. **Deploy.** Em cerca de dois minutos você recebe um endereço como
   `fixseg-site.vercel.app`, já pedindo a senha.

**Atenção ao plano.** O plano gratuito (Hobby) da Vercel é restrito a uso pessoal e não
comercial — está nas diretrizes de uso justo da própria plataforma. Site de corretora é
uso comercial, então para hospedar em definitivo o plano indicado é o **Pro** (US$ 20 por
mês por assento). Para uma homologação curta o risco prático é baixo, mas é bom você
saber disso desde já e não ser surpreendida depois.

A Vercel também oferece proteção nativa: **Vercel Authentication** (disponível no Hobby,
mas libera apenas quem tem conta Vercel com acesso ao projeto — ou seja, na prática só
você) e **Password Protection** (add-on pago do plano Pro). A trava do próprio projeto
resolve o mesmo problema sem custo e funciona igual em qualquer host.

---

## Opção 2 — Túnel a partir do seu computador (imediato, para mostrar agora)

Serve para abrir o site na sua máquina e gerar um endereço temporário na internet — útil
para mostrar a alguém em uma reunião, sem publicar nada.

```bash
npm install
npm run build
npm start                      # sobe em http://localhost:3000
```

Em outro terminal, com o Cloudflare Tunnel (instale `cloudflared`):

```bash
cloudflared tunnel --url http://localhost:3000
```

Ele devolve um endereço `https://algo-aleatorio.trycloudflare.com` que funciona enquanto
o comando estiver rodando. Combine com a trava de senha criando um arquivo `.env.local`:

```
PREVIEW_USER=fixseg
PREVIEW_PASSWORD=uma-senha
```

Vantagens: zero custo, zero cadastro, nada fica no ar depois. Limitação: só funciona com
seu computador ligado e o terminal aberto.

---

## Opção 3 — Cloudflare Pages (gratuito e permite uso comercial)

O plano gratuito da Cloudflare não restringe uso comercial, e o Cloudflare Access
(Zero Trust) permite liberar o acesso por e-mail para até 50 pessoas sem custo — a pessoa
recebe um código no e-mail em vez de digitar senha.

O caminho exige um adaptador, porque o Cloudflare roda em outro ambiente de execução:

```bash
npm install --save-dev @opennextjs/cloudflare wrangler
npx opennextjs-cloudflare build
npx wrangler deploy
```

É a opção com melhor custo-benefício a longo prazo, mas a configuração inicial é mais
trabalhosa que a da Vercel. Se você não tem familiaridade com linha de comando, comece
pela Opção 1 e migre depois se quiser.

---

## Opção 4 — Servidor próprio (VPS), com controle total

Para quem prefere não depender de plataforma. Uma VPS básica (Hetzner, DigitalOcean,
Contabo) de 1 vCPU e 2 GB dá conta com folga, por algo entre US$ 4 e 6 por mês.

No servidor, com Node.js 20+ instalado:

```bash
git clone SEU-REPOSITORIO fixseg && cd fixseg
npm ci
cp .env.example .env.local     # preencha PREVIEW_PASSWORD e o restante
npm run build

# mantém o processo no ar e reinicia sozinho
npm install -g pm2
pm2 start "npm start" --name fixseg
pm2 save && pm2 startup
```

Depois coloque um nginx na frente para o HTTPS (com `certbot` para o certificado
gratuito) apontando para `http://127.0.0.1:3000`. A trava de senha da aplicação continua
valendo; se preferir, o nginx também faz autenticação básica.

---

## Qual escolher

| Situação | Opção |
| --- | --- |
| Quero ver e revisar hoje, sozinha | **2** (túnel) ou só `npm run dev` |
| Quero mandar um link para sócios ou clientes revisarem | **1** (Vercel) |
| Vou hospedar definitivo, quero gratuito e sem restrição comercial | **3** (Cloudflare) |
| Quero controle total e previsibilidade de custo | **4** (VPS) |

---

## Antes de tirar a trava e ir ao ar

1. Preencher `src/config/site.ts` com os dados reais da corretora.
2. Definir `NEXT_PUBLIC_SITE_URL` com o domínio definitivo (o sitemap, as URLs canônicas
   e o compartilhamento em redes sociais dependem disso).
3. Revisar juridicamente a Política de Privacidade e os Termos de Uso.
4. Definir `LEADS_ADAPTER` para que os leads cheguem a algum lugar — enquanto estiver em
   `log`, eles só ficam registrado no servidor.
5. Apontar o domínio e conferir se o certificado HTTPS está ativo.
6. Remover `PREVIEW_PASSWORD` e refazer o deploy.
