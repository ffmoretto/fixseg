# Logos das seguradoras parceiras

Coloque aqui os arquivos de logo das seguradoras com as quais a FIXSEG efetivamente
trabalha **e cujo uso da marca esteja autorizado**.

## Como adicionar

1. Salve o arquivo nesta pasta. Preferência por **SVG**; na falta dele, PNG com fundo
   transparente e pelo menos 300px de largura.
2. Registre a seguradora em `src/config/content.ts`, na lista `insurers`:

```ts
export const insurers: Insurer[] = [
  { name: 'Nome da Seguradora', logo: '/seguradoras/nome-da-seguradora.svg', url: 'https://…' },
];
```

O carrossel se ajusta automaticamente à quantidade. Com a lista vazia, a seção de
seguradoras simplesmente não aparece no site.

## Recomendações

- Use a versão monocromática branca do logo quando a seguradora disponibilizar: o fundo
  do site é escuro e o componente já aplica uma leve transparência que ganha opacidade
  total no hover.
- Nomeie os arquivos em minúsculas e sem acentos (`porto-seguro.svg`, `hdi.svg`).
- Não inclua nenhuma marca sem autorização de uso.
