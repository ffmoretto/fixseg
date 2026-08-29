# Logos das seguradoras parceiras

Esta pasta alimenta a seção **"Parceiros da FIXSEG"** — o carrossel contínuo de
companhias na home.

## O logo é opcional

A companhia entra no carrossel **só com o nome**. Enquanto o arquivo do logo não
chega, ela aparece como **cartão tipográfico**: o nome composto na fonte da marca,
com o mesmo peso visual de um logo. Quando o arquivo for adicionado e o campo
`logo` for preenchido, a imagem assume sozinha — nenhuma outra alteração é
necessária.

## Como adicionar uma companhia

Registre em `src/config/content.ts`, na lista `insurers`:

```ts
export const insurers: Insurer[] = [
  { name: 'Nome da Seguradora' },                                   // sem logo ainda
  { name: 'Outra Seguradora', url: 'https://…' },                   // sem logo, com site
  { name: 'Com Logo', logo: '/seguradoras/com-logo.svg', url: 'https://…' },
];
```

Para incluir o logo, salve o arquivo **nesta pasta** e aponte o caminho em `logo`.

O carrossel se ajusta à quantidade: a partir de 8 companhias ele passa a usar
**duas faixas em direções opostas**. Com a lista vazia, a seção não aparece no site.

## Recomendações

- Preferência por **SVG**; na falta dele, PNG com fundo transparente e pelo menos
  300px de largura.
- Prefira a versão monocromática do logo quando a seguradora disponibilizar: o
  componente aplica uma leve transparência que ganha opacidade total no hover, e
  o mesmo arquivo precisa funcionar no tema claro e no escuro.
- Nomeie os arquivos em minúsculas e sem acentos (`porto-seguro.svg`, `hdi.svg`).
- **Não inclua nenhuma marca sem autorização de uso.** Sem autorização, deixe o
  campo `logo` vazio: o cartão tipográfico resolve, e o nome da companhia não
  depende de licença de marca figurativa.
