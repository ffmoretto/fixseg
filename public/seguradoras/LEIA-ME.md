# Logos das seguradoras parceiras

Os arquivos desta pasta são gerados por `scripts/logos.py` e **não devem ser
editados à mão**. Todos saem na mesma tela de **280×88 px**, com a mesma média
geométrica de tinta — é isso que faz marcas de proporções muito diferentes
(Bradesco 6,2:1 e HDI 1:1) parecerem do mesmo tamanho no carrossel.

## Para acrescentar um parceiro

1. Coloque o arquivo de origem (PDF, PNG ou SVG) numa pasta de trabalho.
2. Acrescente a entrada na lista `PARCEIROS` de `scripts/logos.py`.
3. Rode `python3 scripts/logos.py`.
4. Acrescente a entrada em `src/config/content.ts` → `insurers`.

Se preferir preparar o arquivo por fora, o que o componente espera é: PNG ou SVG
com **fundo transparente**, tinta aparada até a borda, e a peça centrada numa
tela de 280×88.

## Uso de marca

Só entram aqui logos de companhias com as quais a corretora efetivamente
trabalha, e cujo uso da marca esteja autorizado. Nenhum logo é recolorido,
distorcido ou recortado — o cartão do carrossel tem placa branca justamente
para que cada marca apareça na cor original em qualquer tema.

## Pendências conhecidas

- **Fairfax**: o arquivo recebido é a versão clara (texto branco), feita para
  fundo escuro, e fica invisível sobre a placa branca. Falta a versão escura.
- **Resolução baixa**: Sancor (166×43), Bradesco (330×53), Porto (250×58),
  Allianz (250×63) e Mapfre (250×69). Funcionam, mas ficam levemente macios em
  tela retina. Se a seguradora tiver SVG no manual de marca, vale trocar.
