import type { CampaignInput } from '@/lib/prompt-compiler';
import { HOUSE_PRODUCT_RULE, HOUSE_PRODUCT_RULE_SHORT } from '@/lib/house-rules';

export type OutputFormat = '1:1' | '9:16';

export type SocialPrompt = {
  id: 'feed' | 'highlights' | 'weekly' | 'reviews';
  title: string;
  purpose: string;
  importance: string;
  output: string;
  before: string;
  howToUse: string[];
  guardrail: string;
  prompt: string;
  note?: string;
};

export function compileCarouselPrompt() {
  return `Usando exclusivamente o CONTEXTO CAPTURADO — V004 e as imagens factuais já anexadas nesta conversa, escolha aleatoriamente EXATAMENTE CINCO produtos ou looks distintos e elegíveis da coleção.

Para cada uma das cinco imagens escolhidas, gere uma versão reenquadrada em proporção 4:5, com foco total no produto.

${HOUSE_PRODUCT_RULE}

QUANDO HOUVER UMA PESSOA NA IMAGEM
- Corte o enquadramento para excluir o rosto. O corte começa por volta do pescoço ou queixo, removendo tudo que estiver acima: rosto, boca, nariz e olhos.
- Isso é um recorte de composição, não uma remoção da pessoa.
- Mantenha corpo, pele visível, pose, mãos e pernas exatamente como estão abaixo da linha de corte.
- Não apague a pessoa, não a substitua por manequim e não deixe o produto flutuando sobre um corpo invisível.

QUANDO O PRODUTO ESTIVER SEM PESSOA
- Preserve integralmente o produto e apenas reenquadre a cena para valorizá-lo.
- Centralize e ajuste a escala de forma coerente entre os cinco cards.
- Não invente modelo, mãos, corpo, suporte, embalagem ou acessórios.

REGRA ABSOLUTA DE FIDELIDADE
- O produto não pode sofrer nenhuma alteração: mesma cor, mesmo material, mesmo tecido, mesma textura, mesma estampa, mesmo logotipo, mesmo formato, mesmos componentes e mesmo caimento do original.
- Não recrie, redesenhe, simplifique, recolora ou misture produtos e variantes.

PADRONIZAÇÃO DO CARROSSEL
- Fundo liso neutro, branco ou cinza-claro, igual nos cinco cards.
- Iluminação de estúdio uniforme e suave.
- Mesmo nível de nitidez, contraste, distância visual e acabamento em todas as saídas, como se fossem da mesma sessão de fotos.
- Sem textos, preços, ofertas, selos ou elementos comerciais.
- Não invente nem adicione elementos novos.
- Elementos que já existam na imagem original não devem ser removidos quando isso exigir reconstruir o corpo ou o produto.

SAÍDA
- Entregue cinco imagens finais SEPARADAS e INDEPENDENTES, todas em 4:5.
- Entregue uma imagem para cada produto escolhido, na ordem CARD 01, 02, 03, 04 e 05.
- Não entregue colagem, grade, carrossel montado ou uma única imagem contendo os cinco produtos.

Antes de entregar, confirme internamente:
1. Existem cinco arquivos separados em 4:5.
2. Quando havia pessoa, nada acima do pescoço ou queixo aparece no quadro.
3. Corpo, pele e pose abaixo da linha de corte permanecem intactos.
4. Cada produto está idêntico à sua fonte factual.
5. Fundo, luz, foco e acabamento são consistentes entre as cinco saídas.
6. Nenhum elemento novo foi adicionado.

Entregue agora somente os cinco cards, sem explicações adicionais.`;
}

const formatDimensions: Record<OutputFormat, string> = {
  '1:1': '1:1, preferencialmente 1080 × 1080 px',
  '9:16': '9:16, preferencialmente 1080 × 1920 px',
};

export function compileCreativeFormatPrompt(format: OutputFormat) {
  return `Usando exclusivamente os cinco criativos mestres 4:5 aprovados nesta conversa, crie uma adaptação de cada um para ${formatDimensions[format]}.

REGRA DE CORRESPONDÊNCIA
- Preserve a correspondência um a um: CRIATIVO 01 gera apenas a adaptação 01, e assim sucessivamente até o CRIATIVO 05.
- Entregue cinco imagens finais separadas e independentes, na ordem 01, 02, 03, 04 e 05.
- Não crie colagem, grade, carrossel ou arquivo único.

ADAPTAÇÃO
- Refaça a composição para o novo formato. Não faça apenas corte automático ou esticamento.
- Preserve integralmente produto, variante, marca, logo, idioma, oferta, título, textos e direção visual de cada mestre.
- Reorganize escala, respiro, posição dos elementos e hierarquia somente quando necessário para o novo formato.
- Não adicione, remova ou reescreva conteúdo comercial.
- Não misture elementos, produtos ou direções entre os cinco criativos.

${HOUSE_PRODUCT_RULE_SHORT}

Antes de gerar, confira internamente: cinco arquivos separados; proporção ${format}; correspondência correta; textos completos e legíveis; nenhum produto ou fato alterado.

Entregue somente as cinco adaptações, sem explicações adicionais.`;
}

export function compileCarouselFormatPrompt(format: OutputFormat) {
  return `Usando exclusivamente os cinco cards 4:5 do carrossel já aprovados nesta conversa, adapte cada card para ${formatDimensions[format]}.

- Preserve a correspondência um a um entre CARD 01, 02, 03, 04 e 05.
- Entregue cinco imagens separadas e independentes.
- Reenquadre cada imagem para o novo formato sem esticar, redesenhar ou alterar o produto.
- Preserve exatamente corpo, pose, pele visível, corte sem rosto, produto, cor, textura, estampa, logo, fundo neutro, luz e acabamento.
- Mantenha fundo, escala visual, foco e iluminação consistentes entre os cinco cards.
- Não adicione texto, oferta, acessórios, cenário ou elementos novos.
- Não gere colagem, grade ou arquivo único.

${HOUSE_PRODUCT_RULE_SHORT}

Antes de gerar, confirme internamente: cinco arquivos separados; proporção ${format}; nenhum rosto incluído quando havia pessoa; produtos intactos; padronização preservada.

Entregue somente as cinco adaptações, na ordem CARD 01 a CARD 05.`;
}

export const socialPrompts: SocialPrompt[] = [
  {
    id: 'feed',
    title: '9 posts de lifestyle',
    purpose: 'Cria a base visual do feed da loja para Instagram e Facebook.',
    importance: 'O visitante que chega por um anúncio quase sempre confere o perfil antes de comprar. Nove peças coerentes removem a sensação de loja fantasma e mostram, de imediato, produto, posicionamento e qualidade.',
    output: '9 imagens separadas em 1080 × 1350, sem textos ou elementos comerciais.',
    before: 'O contexto, os produtos, a logo e a identidade visual já devem estar confirmados nesta conversa.',
    howToUse: [
      'Gere e aprove as nove imagens uma por uma.',
      'Use o mesmo conjunto no Instagram e no Facebook.',
      'Confira variedade de modelos, poses, cenários e enquadramentos antes de publicar.',
    ],
    guardrail: 'Nove artes visualmente iguais deixam o feed sem ritmo. A identidade permanece; a composição precisa variar.',
    prompt: `Você é um diretor de arte especializado em e-commerce e Instagram.

Vou enviar o link da loja, prints dos produtos, logo e referências visuais. Analise o nicho, público, país, identidade visual, paleta de cores e estilo da marca.

Crie 9 posts individuais para o Instagram, seguindo:
- Formato: 1080 × 1350 px, proporção 4:5
- Qualidade fotográfica máxima, alta nitidez e sem áreas borradas
- Sem textos, preços, descontos, botões ou elementos comerciais
- Estética lifestyle natural, premium e aspiracional
- Produto inserido organicamente na rotina do público
- Fidelidade total à cor, formato, textura, estampa, embalagem e logo do produto

${HOUSE_PRODUCT_RULE}

Varie entre:
- Modelos diferentes
- Poses e enquadramentos
- Cenários internos e externos
- Produto em uso
- Close-up de detalhes
- Flat lay
- Momentos espontâneos
- Produto integrado ao ambiente
- Imagens conceituais alinhadas à marca

Os posts devem ser diferentes entre si, mas formar um grid visualmente harmônico. Evite aparência artificial de IA.

Entregue as 9 imagens separadamente, identificadas de "Post 1 de 9" até "Post 9 de 9".
Nunca entregue em colagem ou grid único.`,
  },
  {
    id: 'highlights',
    title: '9 stories para destaques',
    purpose: 'Monta os destaques Reviews, Nossa História e Informações.',
    importance: 'Os destaques organizam as respostas que o cliente procura antes da compra. Eles reduzem dúvidas, reforçam confiança e evitam que prazo, pagamento, troca ou atendimento pareçam improvisados.',
    output: '9 imagens 1080 × 1920 com copy embutida, texto exato e tradução.',
    before: 'Confira no site entrega, pagamento, trocas, garantia e atendimento antes de copiar.',
    howToUse: [
      'Crie três stories para cada destaque: Reviews, Nossa História e Informações.',
      'Compare toda informação operacional com o que a loja realmente pratica.',
      'Publique cada trio no destaque correto e confira a leitura em tela pequena.',
    ],
    guardrail: 'Prazo, política, garantia, avaliação e história da marca nunca podem ser aproximados ou inventados.',
    prompt: `Você é um diretor de arte especializado em branding e Instagram.

Vou enviar o link da loja, prints, produtos e logo. Analise o nicho, país, idioma, público e identidade visual da marca.

Crie 9 stories individuais, em 1080 × 1920 px, com qualidade máxima, textos legíveis e no idioma nativo da loja.

DESTAQUE 1 — REVIEWS
1. Capa chamando atenção para a satisfação dos clientes
2. Avaliação, depoimento ou benefício percebido
3. Reforço de confiança + CTA para realizar o pedido

DESTAQUE 2 — NOSSA HISTÓRIA
1. Quem somos e inspiração da marca
2. Propósito, missão e principais diferenciais
3. Convite para fazer parte da história + CTA

DESTAQUE 3 — INFORMAÇÕES
1. Como comprar, envio e prazo de entrega
2. Pagamentos, trocas, devoluções e garantia
3. Atendimento, canais de contato + CTA

Use apenas informações confirmadas no site. Não invente avaliações, prazos, políticas, garantias ou dados sobre a história da empresa.

${HOUSE_PRODUCT_RULE_SHORT}

Os três stories de cada destaque devem ter coerência visual, mas variar imagens, fundos, posição dos textos e composição.

Entregue os 9 stories separadamente e informe também a copy exata usada em cada imagem e sua tradução para português, quando necessário.`,
  },
  {
    id: 'weekly',
    title: '6 stories de bom dia e cupom',
    purpose: 'Cria a primeira parte da rotina semanal: conexão diária e oferta.',
    importance: 'Depois da montagem inicial, o perfil precisa continuar vivo. Bom dia cria presença e conexão; cupom mantém a oferta visível para quem chegou pelo anúncio.',
    output: '6 peças 1080 × 1920, três de bom dia e três de cupom.',
    before: 'Confirme o cupom ativo e a coleção da semana.',
    howToUse: [
      'Rode o prompt com a coleção e o cupom válidos da semana.',
      'Repita a geração até completar os sete stories de bom dia e os sete de cupom.',
      'Varie modelo, pose, enquadramento e composição; não republique a mesma arte.',
    ],
    guardrail: 'Cupom precisa estar ativo e conferido. A rotina semanal troca coleção e oferta sem trocar a identidade da marca.',
    prompt: `Com base na loja e na identidade visual já definida nesta conversa, crie 6 stories de Instagram, sendo 3 para cada tema.

DIRETRIZES GERAIS
- Formato: 1080x1920px, 9:16
- Texto aplicado diretamente na imagem
- Design premium, elegante e profissional
- Mesma paleta, tipografia e estilo visual da marca
- Copy curta, legível e bem hierarquizada
- Os 3 stories de cada tema devem formar uma sequência visual coerente
- Variar o modelo, as poses, os enquadramentos e o posicionamento dos elementos visuais e textuais em cada story, sem deixar todas as peças iguais
- Manter consistência visual entre as peças, mas com composições diferentes
- Não utilizar imagens de referência externas; basear toda a criação na identidade da loja já apresentada

${HOUSE_PRODUCT_RULE_SHORT}

TEMA 1 — BOM DIA
Objetivo: desejar bom dia, fortalecer a conexão com o público e direcionar para uma coleção da loja.
- Story 1: saudação de bom dia com imagem aspiracional e lifestyle da marca
- Story 2: convite para descobrir produtos ou novidades da coleção
- Story 3: CTA direto para acessar a coleção
Tom: acolhedor, sofisticado e leve.

TEMA 2 — CUPOM DE DESCONTO
Objetivo: apresentar uma oferta com modelo usando uma peça da loja e destacar o cupom.
- Story 1: abertura apresentando o benefício da oferta
- Story 2: cupom em destaque, com leitura clara
- Story 3: reforço do desconto e CTA para comprar
Tom: exclusivo, desejável e comercial.

Caso nenhum cupom tenha sido informado, use WELCOME10.

FORMATO DE ENTREGA
Para cada story, entregue:

[Tema X – Story Y]
Imagem: gerar em 1080x1920px com o texto embutido
Copy: informar exatamente o texto utilizado na imagem

REGRA FINAL
Garanta que todas as peças tenham acabamento de marca premium, estejam prontas para publicação no Instagram e que não fiquem repetitivas visualmente, variando modelo, pose, composição e distribuição dos elementos.`,
  },
  {
    id: 'reviews',
    title: '3 stories de review',
    purpose: 'Cria peças naturais, com aparência de conteúdo espontâneo de cliente.',
    importance: 'Review funciona como prova social e ajuda o perfil a parecer vivo e confiável. A peça deve ter aparência espontânea, não de anúncio produzido pela loja.',
    output: '3 imagens de review sem logo e sem aparência de anúncio.',
    before: 'Reviews reais sempre têm prioridade sobre peças geradas.',
    howToUse: [
      'Use a identidade e os produtos já definidos na mesma conversa.',
      'Repita com produtos e pessoas diferentes para completar a rotina semanal.',
      'Substitua a peça gerada sempre que existir foto, marcação ou avaliação real de cliente.',
    ],
    guardrail: 'Não invente nome de cliente, nota, número de vendas, prazo de entrega ou promessa de resultado.',
    prompt: `Me entregue 3 reviews de cliente de forma mais natural possível, como se algum cliente comprasse nossas roupas e marcasse a loja no Instagram.

Precisa parecer o mais realista possível, não coloque nossa logo, apenas como se o cliente tivesse tirado uma foto, e estivesse fazendo um review do produto marcando nossa loja.

${HOUSE_PRODUCT_RULE_SHORT}`,
    note: 'Não invente nota, número de vendas, nome de cliente real, prazo de entrega ou promessa de resultado.',
  },
];

export function compileAudioPrompt(campaign: CampaignInput) {
  return `Usando exclusivamente o CONTEXTO CAPTURADO e os fatos já verificados nesta conversa, escreva uma única narração publicitária para ser transformada em áudio no ElevenLabs.

REQUISITOS
- Duração máxima de 30 segundos em velocidade natural de locução.
- Comece imediatamente falando da oferta exata: “${campaign.offer}”.
- Logo depois, apresente o produto ou coleção “${campaign.exactTarget}”.
- A abertura deve ser agressiva, direta e capaz de interromper a atenção.
- Use o idioma e o mercado registrados no contexto.
- Mantenha frases curtas, ritmo comercial e leitura natural em voz alta.
- Termine com uma chamada para ação coerente com a loja.
- Não invente preço, benefício, urgência, escassez, garantia, avaliação, prazo ou condição comercial.
- Preserve exatamente o significado e as condições da oferta.

Entregue somente o texto final da narração, sem título, marcações de cena, explicações ou alternativas.`;
}

export function compileVideoPrompt() {
  return `Usando exclusivamente o CONTEXTO CAPTURADO, as fotos originais dos produtos anexadas nesta conversa e a narração já aprovada anteriormente, crie o roteiro visual para gerar três vídeos no Kling.

OBJETIVO
- Produzir três vídeos ultrarrealistas, com até 15 segundos cada e o máximo de takes coerentes possível.
- Os três vídeos serão usados na montagem de um criativo final de aproximadamente 25 a 30 segundos.
- Reutilize a narração já criada nesta conversa. Não escreva, adapte ou gere uma nova narração.

PARA CADA VÍDEO
- Entregue um único prompt completo, detalhado e otimizado para o melhor entendimento do Kling.
- Crie cenas cotidianas e factualmente coerentes com o uso real do produto.
- Varie enquadramentos, distância de câmera, movimentos, ambiente e ações entre os takes.
- Mantenha o produto como foco principal de todos os takes.

${HOUSE_PRODUCT_RULE}
- Inclua closes de detalhes, interação natural, produto em uso, preparação e manuseio somente quando essas ações fizerem sentido para o produto real.
- Use transições e movimentos de câmera cinematográficos, naturais e executáveis.

FIDELIDADE ABSOLUTA
- Preserve produto, formato, proporções, materiais, textura, estampa, componentes, embalagem, logotipo, cores e variantes exatamente como aparecem nas fotos originais.
- Só varie cores quando essas variações estiverem confirmadas nas fontes factuais desta conversa.
- Não invente novas cores, funções, acessórios, embalagem, cenários incompatíveis ou formas de uso inexistentes.
- Não altere o produto entre takes.
- Evite aparência artificial de IA, deformações, objetos fundidos, mãos incorretas e movimentos fisicamente impossíveis.

FORMATO DE ENTREGA
Entregue somente:

PROMPT KLING — VÍDEO 01
[prompt detalhado]

PROMPT KLING — VÍDEO 02
[prompt detalhado]

PROMPT KLING — VÍDEO 03
[prompt detalhado]

Não inclua narração, explicações ou conteúdo adicional.`;
}

export function compileFlyerPrompt({
  prize,
  coupon,
  discount,
}: {
  prize: string;
  coupon: string;
  discount: string;
}) {
  return `Com base em todas as informações, imagens, logotipo e identidade visual da loja já apresentados nesta conversa, crie 1 panfleto promocional vertical para ser enviado dentro da embalagem junto com o pedido do cliente.

INFORMAÇÕES DA CAMPANHA
- Prêmio do sorteio: ${prize}
- Cupom: ${coupon}
- Valor do desconto: ${discount}
- Idioma: use o idioma da loja registrado no CONTEXTO CAPTURADO

ETAPA 1 — ANÁLISE
Antes de criar, identifique no histórico desta conversa:
- paleta de cores da marca;
- logotipo da loja;
- tipografia e estilo visual;
- posicionamento da marca;
- perfil do público-alvo.

Use essas informações para garantir que o flyer fique totalmente alinhado às cores, ao logo e à identidade visual da loja.

ETAPA 2 — CRIAÇÃO
Crie 1 flyer promocional vertical, com aparência de material impresso premium, profissional e pronto para acompanhar o pedido na entrega.

${HOUSE_PRODUCT_RULE_SHORT}

O flyer deve comunicar que o cliente:
- está participando de um sorteio;
- poderá ganhar ${prize};
- recebeu o cupom ${coupon};
- poderá obter ${discount} na próxima compra.

ELEMENTOS OBRIGATÓRIOS
- Logo da loja em posição de destaque
- Paleta de cores e identidade visual da marca
- Foto realista, premium e bem visível do prêmio
- Nome do prêmio em grande destaque
- Cupom apresentado dentro de um bloco visual semelhante a um voucher
- Valor do desconto com leitura imediata
- CTA incentivando o uso do cupom na próxima compra
- Informações do sorteio claramente organizadas

TEXTOS OBRIGATÓRIOS E BEM VISÍVEIS
As mensagens abaixo devem aparecer obrigatoriamente no flyer, adaptadas ao idioma já utilizado pela loja:

“PEDIDO PREMIADO!
Você e outros 9 clientes estão participando de um sorteio!”

“Apenas compras confirmadas e mantidas são elegíveis para o sorteio.
Pedidos cancelados ou reembolsados são automaticamente removidos da lista.”

Essas duas mensagens devem ter excelente legibilidade e boa hierarquia. Não podem aparecer pequenas, escondidas, cortadas ou com pouco contraste.

REGRAS VISUAIS
- Não incluir produtos vendidos pela loja
- Não mostrar roupas, acessórios, calçados, cosméticos, joias ou qualquer item do catálogo
- Não utilizar modelos usando ou segurando produtos da loja
- A única imagem de produto permitida é a foto do prêmio do sorteio
- Se o prêmio for uma viagem, mostrar uma fotografia premium e reconhecível do destino
- A identidade da loja deve ser representada por meio do logo, cores, tipografia, texturas e elementos gráficos
- Não inventar datas, regras, condições ou benefícios
- Não copiar literalmente outros flyers
- Manter o layout sofisticado, equilibrado e sem excesso de informações

DIRETRIZES TÉCNICAS
- Formato vertical para impressão
- Preferencialmente A6 — 105 × 148 mm
- Resolução aproximada de 1240 × 1748 px
- Alta resolução e qualidade máxima
- Texto aplicado diretamente no design
- Margens de segurança para impressão
- Tipografia elegante e legível
- Hierarquia visual clara
- Acabamento de material promocional premium

ENTREGA
1. Flyer: gere a imagem final com todos os textos aplicados.
2. Copy: informe exatamente os textos utilizados na arte.
3. Conceito: descreva brevemente a direção visual escolhida.`;
}
