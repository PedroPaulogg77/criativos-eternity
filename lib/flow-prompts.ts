import { masterFormatForCampaign, type CampaignInput, type MasterFormat } from '@/lib/prompt-compiler';
import { HOUSE_DESIGN_RULE, HOUSE_PRODUCT_RULE, HOUSE_PRODUCT_RULE_SHORT, peopleRule } from '@/lib/house-rules';
import type { Reference } from '@/lib/mvp-data';

export type OutputFormat = '1:1' | '9:16';

export type SocialPiece = { label: string; prompt: string };
export type SocialBatch = {
  id: string;
  title: string;
  output: string;
  prompt: string;
  pieces: SocialPiece[];
};

export type SocialPrompt = {
  id: 'feed' | 'highlights' | 'weekly' | 'reviews';
  title: string;
  purpose: string;
  importance: string;
  output: string;
  before: string;
  howToUse: string[];
  guardrail: string;
  /* O feed tolera nove imagens; stories usam sempre lotes pequenos e confiáveis. */
  pieces: SocialPiece[];
  batches: SocialBatch[];
  note?: string;
};

const CAROUSEL_PERSON_BLOCK = `QUANDO HOUVER UMA PESSOA NA IMAGEM
- Corte o enquadramento para excluir o rosto. O corte começa por volta do pescoço ou queixo, removendo tudo que estiver acima: rosto, boca, nariz e olhos.
- Isso é um recorte de composição, não uma remoção da pessoa.
- Mantenha corpo, pele visível, pose, mãos e pernas exatamente como estão abaixo da linha de corte.
- Não apague a pessoa, não a substitua por manequim e não deixe o produto flutuando sobre um corpo invisível.`;

function carouselNoPersonBlock(scaleRule: string) {
  return `QUANDO O PRODUTO ESTIVER SEM PESSOA
- Preserve integralmente o produto e apenas reenquadre a cena para valorizá-lo.
- ${scaleRule}
- Não invente modelo, mãos, corpo, suporte, embalagem ou acessórios.`;
}

const CAROUSEL_FIDELITY_BLOCK = `REGRA ABSOLUTA DE FIDELIDADE
- O produto não pode sofrer nenhuma alteração: mesma cor, mesmo material, mesmo tecido, mesma textura, mesma estampa, mesmo logotipo, mesmo formato, mesmos componentes e mesmo caimento do original.
- Não recrie, redesenhe, simplifique, recolora ou misture produtos e variantes.`;

const CAROUSEL_STANDARD_BLOCK = `PADRONIZAÇÃO DO CARROSSEL
- Fundo liso neutro, branco ou cinza-claro, igual nos cinco cards.
- Iluminação de estúdio uniforme e suave.
- Mesmo nível de nitidez, contraste, distância visual e acabamento em todas as saídas, como se fossem da mesma sessão de fotos.
- Sem textos, preços, ofertas, selos ou elementos comerciais.
- Não invente nem adicione elementos novos.
- Elementos que já existam na imagem original não devem ser removidos quando isso exigir reconstruir o corpo ou o produto.`;

export function compileCarouselPrompt(campaign?: CampaignInput) {
  const format = campaign ? masterFormatForCampaign(campaign) : '4:5';
  return `Usando exclusivamente o CONTEXTO CAPTURADO — V004 e as imagens factuais já anexadas nesta conversa, use os primeiros até CINCO produtos ou looks prioritários da coleção, em ordem: P01, P02, P03, P04 e P05. Essa quantidade é o alvo do carrossel, não uma cota a cumprir: se a coleção confirmada tiver menos itens, use os que existem e entregue menos cards. É proibido inventar produto, categoria ou cor para fechar os cinco.

Para cada um desses produtos, gere uma versão reenquadrada em proporção ${format}, com foco total no produto.

${HOUSE_PRODUCT_RULE}

${CAROUSEL_PERSON_BLOCK}

${carouselNoPersonBlock('Centralize e ajuste a escala de forma coerente entre os cinco cards.')}

${CAROUSEL_FIDELITY_BLOCK}

${CAROUSEL_STANDARD_BLOCK}

SAÍDA
- Entregue as imagens finais SEPARADAS e INDEPENDENTES, todas em ${format}, uma para cada produto escolhido, na ordem CARD 01, 02, 03, 04 e 05.
- Se a coleção tiver menos de cinco itens confirmados, entregue um card por item confirmado e pare aí.
- Não entregue colagem, grade, carrossel montado ou uma única imagem contendo os cinco produtos.

Antes de entregar, confirme internamente:
1. Existe um arquivo separado em ${format} para cada produto confirmado, e nenhum produto foi inventado para completar cinco.
2. Quando havia pessoa, nada acima do pescoço ou queixo aparece no quadro.
3. Corpo, pele e pose abaixo da linha de corte permanecem intactos.
4. Cada produto está idêntico à sua fonte factual.
5. Fundo, luz, foco e acabamento são consistentes entre as cinco saídas.
6. Nenhum elemento novo foi adicionado.

Entregue agora somente os cinco cards, sem explicações adicionais.`;
}

/*
 * Um card por mensagem. O ChatGPT falha quando precisa devolver cinco imagens de uma vez,
 * então cada card carrega a receita inteira e não depende das mensagens anteriores.
 */
export function compileCarouselCardPrompt(index: number, campaign?: CampaignInput) {
  const card = String(index + 1).padStart(2, '0');
  const format = campaign ? masterFormatForCampaign(campaign) : '4:5';
  const productId = `P${String(index + 1).padStart(2, '0')}`;
  const escolha = index === 0
    ? `Use o produto prioritário ${productId}. Ele define o padrão visual que os outros cards vão seguir.`
    : `Use o produto prioritário ${productId}, sem trocar por outro item da vitrine. O CARD ${card} precisa parecer da mesma sessão de fotos dos cards já entregues.`;

  return `Usando exclusivamente o CONTEXTO CAPTURADO — V004 e as imagens factuais já anexadas nesta conversa, gere agora SOMENTE o CARD ${card} de cinco do carrossel, em proporção ${format} e com foco total no produto.

${escolha}

${HOUSE_PRODUCT_RULE}

${CAROUSEL_PERSON_BLOCK}

${carouselNoPersonBlock(index === 0 ? 'Centralize o produto e defina uma escala que possa ser repetida nos outros quatro cards.' : 'Centralize o produto e use a mesma escala visual dos cards já entregues.')}

${CAROUSEL_FIDELITY_BLOCK}

${CAROUSEL_STANDARD_BLOCK}

SAÍDA
- Entregue exatamente UMA imagem final em ${format}, correspondente ao CARD ${card}.
- Não gere os outros cards nesta resposta.
- Não entregue colagem, grade, carrossel montado, miniaturas ou uma imagem com mais de um produto.

Antes de entregar, confirme internamente:
1. Existe um único arquivo em ${format}.
2. Quando havia pessoa, nada acima do pescoço ou queixo aparece no quadro.
3. Corpo, pele e pose abaixo da linha de corte permanecem intactos.
4. O produto está idêntico à sua fonte factual.
5. Fundo, luz, foco e acabamento seguem o padrão dos cards anteriores.
6. Nenhum elemento novo foi adicionado.

Entregue agora somente o CARD ${card}, sem explicações adicionais.`;
}

const formatDimensions: Record<OutputFormat, string> = {
  '1:1': '1:1, preferencialmente 1080 × 1080 px',
  '9:16': '9:16, preferencialmente 1080 × 1920 px',
};

/*
 * A adaptação recompõe a cena, e era aí que a cabeça sumia: o mestre carrega a regra de
 * presença humana, a adaptação não carregava nenhuma. Agora ela vai junto, e quando a
 * direção é conhecida a regra exata daquela peça vem colada.
 */
const FORMAT_PEOPLE_BLOCK = `PESSOA NO NOVO FORMATO
- O enquadramento da pessoa é o mesmo do mestre: o que aparecia continua aparecendo e o que estava fora continua fora.
- Nunca corte cabeça, topo da cabeça ou parte do rosto pela borda do quadro. Se o mestre mostra o rosto, ele aparece inteiro aqui.
- Se o mestre corta abaixo do pescoço, mantenha exatamente esse corte: não revele o rosto e não corte mais alto.
- Se a pessoa não couber inteira no novo formato, afaste a câmera e recomponha a cena. O espaço que sobra no formato mais alto vai para cenário, respiro e texto, nunca para aumentar o corte na pessoa.
- Se o mestre corta no pescoço, esse corte fica na borda superior do quadro: nunca deixe fundo vazio acima de um corpo sem cabeça. A altura extra é ganha para baixo.
- Mãos, dedos e membros continuam anatomicamente corretos.`;

export function compileCreativeFormatPrompt(format: OutputFormat, references: Reference[] = [], sourceFormat: MasterFormat = '4:5') {
  return `Usando exclusivamente os cinco criativos mestres ${sourceFormat} aprovados nesta conversa, crie uma adaptação de cada um para ${formatDimensions[format]}.

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

${FORMAT_PEOPLE_BLOCK}
${references.map((reference, index) => {
  const regra = peopleRule(reference);
  return regra ? `\nCRIATIVO ${String(index + 1).padStart(2, '0')} — ${reference.name}\n${regra}` : '';
}).join('')}

${HOUSE_PRODUCT_RULE_SHORT}

Antes de gerar, confira internamente: cinco arquivos separados; proporção ${format}; correspondência correta; textos completos e legíveis; nenhum produto ou fato alterado; nenhuma cabeça, rosto ou topo de cabeça cortado pela borda.

Entregue somente as cinco adaptações, sem explicações adicionais.`;
}

export function compileCarouselFormatPrompt(format: OutputFormat, sourceFormat: MasterFormat = '4:5') {
  return `Usando exclusivamente os cinco cards ${sourceFormat} do carrossel já aprovados nesta conversa, adapte cada card para ${formatDimensions[format]}.

- Preserve a correspondência um a um entre CARD 01, 02, 03, 04 e 05.
- Entregue cinco imagens separadas e independentes.
- Reenquadre cada imagem para o novo formato sem esticar, redesenhar ou alterar o produto.
- Preserve exatamente corpo, pose, pele visível, corte sem rosto, produto, cor, textura, estampa, logo, fundo neutro, luz e acabamento.
- O corte da pessoa é o mesmo do card aprovado: não revele rosto e não corte mais alto.
- Mantenha fundo, escala visual, foco e iluminação consistentes entre os cinco cards.

SEM CABEÇA NO QUADRO ALTO
- O card aprovado corta a pessoa no pescoço ou no queixo. Esse corte continua igual e fica exatamente na BORDA SUPERIOR do novo quadro.
- Nunca deixe fundo vazio acima do corte. Um tronco sem cabeça flutuando no meio do quadro é entrega inválida, mesmo que o resto esteja correto.
- A altura que sobra no formato mais alto é ganha para baixo: mais corpo, mais superfície, mais cenário abaixo, ou enquadramento mais fechado no produto. Nunca para cima.
- Não invente cabeça, cabelo, pescoço inteiro, rosto nem sombra de rosto para preencher o topo.
- Não adicione texto, oferta, acessórios, cenário ou elementos novos.
- Não gere colagem, grade ou arquivo único.

${HOUSE_PRODUCT_RULE_SHORT}

Antes de gerar, confirme internamente: cinco arquivos separados; proporção ${format}; nenhum rosto incluído quando havia pessoa; nenhum tronco sem cabeça com fundo vazio acima; produtos intactos; padronização preservada.

Entregue somente as cinco adaptações, na ordem CARD 01 a CARD 05.`;
}

/* Um único comando serve para qualquer peça isolada: o aluno só troca o número no texto. */
export function compileCreativeFormatSinglePrompt(format: OutputFormat, sourceFormat: MasterFormat = '4:5') {
  return `Usando exclusivamente o CRIATIVO [NÚMERO] — o mestre ${sourceFormat} já aprovado nesta conversa —, crie agora SOMENTE a adaptação desse criativo para ${formatDimensions[format]}.

ADAPTAÇÃO
- Refaça a composição para o novo formato. Não faça apenas corte automático ou esticamento.
- Preserve integralmente produto, variante, marca, logo, idioma, oferta, título, textos e direção visual do CRIATIVO [NÚMERO].
- Reorganize escala, respiro, posição dos elementos e hierarquia somente quando necessário para o novo formato.
- Não adicione, remova ou reescreva conteúdo comercial.
- Não use elementos, produtos ou direções dos outros quatro criativos.
- Não entregue colagem, grade, miniaturas nem um arquivo com mais de uma peça.

${FORMAT_PEOPLE_BLOCK}

${HOUSE_PRODUCT_RULE_SHORT}

Antes de gerar, confira internamente: um único arquivo; proporção ${format}; corresponde ao CRIATIVO [NÚMERO]; textos completos e legíveis; nenhum produto ou fato alterado; nenhuma cabeça, rosto ou topo de cabeça cortado pela borda.

Entregue somente essa adaptação, sem explicações adicionais e sem gerar os outros criativos.`;
}

export function compileCarouselFormatSinglePrompt(format: OutputFormat, sourceFormat: MasterFormat = '4:5') {
  return `Usando exclusivamente o CARD [NÚMERO] do carrossel ${sourceFormat} já aprovado nesta conversa, adapte agora SOMENTE esse card para ${formatDimensions[format]}.

- Reenquadre a imagem para o novo formato sem esticar, redesenhar ou alterar o produto.
- Preserve exatamente corpo, pose, pele visível, corte sem rosto, produto, cor, textura, estampa, logo, fundo neutro, luz e acabamento.
- O corte da pessoa é o mesmo do card aprovado: não revele rosto e não corte mais alto.
- Mantenha o mesmo padrão visual dos outros cards do carrossel.

SEM CABEÇA NO QUADRO ALTO
- O card aprovado corta a pessoa no pescoço ou no queixo. Esse corte continua igual e fica exatamente na BORDA SUPERIOR do novo quadro.
- Nunca deixe fundo vazio acima do corte. Um tronco sem cabeça flutuando no meio do quadro é entrega inválida, mesmo que o resto esteja correto.
- A altura que sobra no formato mais alto é ganha para baixo: mais corpo, mais superfície, mais cenário abaixo, ou enquadramento mais fechado no produto. Nunca para cima.
- Não invente cabeça, cabelo, pescoço inteiro, rosto nem sombra de rosto para preencher o topo.
- Não adicione texto, oferta, acessórios, cenário ou elementos novos.
- Não gere os outros cards, colagem, grade ou arquivo único.

${HOUSE_PRODUCT_RULE_SHORT}

Antes de gerar, confirme internamente: um único arquivo; proporção ${format}; corresponde ao CARD [NÚMERO]; nenhum rosto incluído quando havia pessoa; nenhum tronco sem cabeça com fundo vazio acima; produto intacto; padronização preservada.

Entregue somente a adaptação desse card, sem explicações adicionais.`;
}

/*
 * Nove posts, nove stories, seis stories e três reviews eram quatro pedidos em bloco.
 * O ChatGPT não devolve esse tanto de imagem numa resposta, então cada peça vira uma
 * mensagem com o papel dela escrito. O bloco continua disponível como alternativa.
 */
const FEED_SCENES = [
  'Produto em uso por um modelo, em cena interna e cotidiana.',
  'Rotina do público SEM nenhum produto no quadro: a mesa, o trajeto, o ambiente, o momento que define quem compra da loja.',
  'Close de detalhe do produto: textura, acabamento ou componente que o diferencia.',
  'Cena de estilo de vida com pessoa e SEM produto: o mundo da marca, não a peça à venda.',
  'Outro produto ou variante em uso, ao ar livre, aparecendo de passagem e não no centro do quadro.',
  'Textura, material ou paleta da marca em close, SEM produto identificável.',
  'Flat lay com um produto ainda não usado nos posts anteriores, entre objetos do dia a dia do público.',
  'Ambiente da marca em enquadramento aberto, SEM produto: luz, cor e lugar que a loja evoca.',
  'Outro produto ou variante em uso por outro modelo, em enquadramento fechado e diferente do Post 1.',
];

/*
 * O feed segue o esqueleto dos criativos — amarração ao contexto, travas factuais, presença
 * humana declarada, saída contada e autoconferência —, sem a regra da casa. O papel é outro:
 * aqui a peça não vende, ela mostra que a loja existe e é real.
 */
const FEED_PURPOSE = `Estas peças não são anúncio. Elas existem para quem chegou pelo anúncio e foi conferir o perfil antes de comprar: a loja precisa parecer viva, coerente e real. Nenhuma delas leva oferta, preço ou chamada para ação.`;

const SOCIAL_PRODUCT = `PRODUTO NAS PEÇAS
- Nem toda peça mostra produto. Este é o perfil da loja, não uma campanha: ambiente, textura, rotina e universo da marca sustentam o feed tanto quanto as peças com produto.
- Quando a peça mostrar produto, use um produto ou uma variante diferente das peças anteriores desta conversa. Só repita quando as fontes factuais tiverem menos itens do que peças.
- Nas peças com produto, ele aparece como parte da cena, não como vitrine: sem pedestal, sem fundo de estúdio, sem recorte, sem holofote e sem ocupar o centro em todas elas.
- O produto mostrado é sempre um dos que constam nas fontes factuais, com a mesma cor, material, textura, estampa, componentes e logo. Nunca invente variante, cor ou versão que não esteja confirmada.`;

const FEED_CONTENT_LOCKS = `CONTEÚDO OBRIGATÓRIO
- Use a marca, o idioma e o mercado exatamente como registrados no CONTEXTO CAPTURADO.
- Não invente preço, oferta, benefício, avaliação, garantia, cupom, prazo, selo, embalagem, acessório ou condição comercial.
- Sem texto de qualquer tipo na imagem: nada de headline, preço, desconto, selo, botão, legenda ou marca-d'água.
- Se a estética conflitar com a fidelidade ao produto, a fidelidade vence.`;

const FEED_FORMAT = `FORMATO
- 1080 × 1350 px, proporção 4:5.
- Qualidade fotográfica, alta nitidez, sem áreas borradas e sem aparência artificial de IA.
- Estética lifestyle natural, premium e aspiracional: fotografia de gente e de ambiente, não de catálogo.`;

const FEED_PEOPLE = `PRESENÇA HUMANA
- As pessoas representam o público-alvo registrado no contexto: mesmo gênero, faixa etária compatível e biotipo coerente com o uso do produto. Não troque o gênero do público.
- Rosto visível e expressão natural, em momento real de uso. Nada de pose de catálogo, e não repita olhar direto para a câmera em todas as peças.
- Mãos, dedos e membros anatomicamente corretos.
- Nas cenas sem pessoa, não invente mãos, corpo, manequim ou sombra humana.`;

export function compileFeedPrompt() {
  return `Usando exclusivamente o CONTEXTO CAPTURADO e as fontes factuais já verificadas anteriormente nesta conversa, crie 9 posts de feed para o Instagram e o Facebook da loja.

${FEED_PURPOSE}

${FEED_CONTENT_LOCKS}

${SOCIAL_PRODUCT}

${FEED_FORMAT}

${FEED_PEOPLE}

AS NOVE CENAS
Cada post tem uma cena própria. Não repita enquadramento, cenário nem modelo entre eles.
${FEED_SCENES.map((scene, index) => `${String(index + 1).padStart(2, '0')}. ${scene}`).join('\n')}

COERÊNCIA DO GRID
- As nove peças precisam parecer da mesma marca: mesma paleta, mesma temperatura de luz e mesmo tratamento de imagem.
- Variedade na composição, unidade na identidade. Um grid de nove fotos iguais não serve.

SAÍDA
- Entregue 9 imagens separadas e independentes, identificadas de "Post 1 de 9" até "Post 9 de 9".
- Não entregue colagem, grade, mosaico, contact sheet, carrossel montado ou arquivo único.

Antes de entregar, confirme internamente:
1. São nove arquivos separados em 4:5.
2. Nenhuma peça tem texto, preço, selo ou marca-d'água.
3. Cada produto está idêntico à sua fonte factual.
4. As nove cenas são diferentes entre si e coerentes como grid.
5. Mãos, dedos e membros estão anatomicamente corretos.

Entregue agora somente os nove posts, sem explicações adicionais.`;
}

function compileFeedPostPrompt(index: number) {
  const post = index + 1;
  return `Usando exclusivamente o CONTEXTO CAPTURADO e as fontes factuais já verificadas anteriormente nesta conversa, gere agora SOMENTE o Post ${post} de 9 do feed.

${FEED_PURPOSE}

CENA DESTE POST
- ${FEED_SCENES[index]}

${FEED_CONTENT_LOCKS}

${SOCIAL_PRODUCT}

${FEED_FORMAT}

${FEED_PEOPLE}

COERÊNCIA COM O RESTO DO FEED
- Esta peça entra num grid de nove. Mantenha a paleta, a temperatura de luz e o tratamento das peças já geradas nesta conversa.
- Mude a composição: outro enquadramento, outro cenário e, quando houver pessoa, outro modelo.

SAÍDA
- Entregue exatamente UMA imagem em 4:5, correspondente ao Post ${post} de 9.
- Não gere os outros posts nesta resposta. Não entregue colagem, grade, mosaico ou miniaturas.

Antes de entregar, confirme internamente:
1. É um único arquivo em 4:5.
2. A peça não tem texto, preço, selo ou marca-d'água.
3. O produto está idêntico à sua fonte factual.
4. A cena é a pedida acima e não repete as anteriores.
5. Mãos, dedos e membros estão anatomicamente corretos.

Entregue agora somente o Post ${post}, sem explicações adicionais.`;
}

/*
 * Destaques. Três grupos com três regimes de fato diferentes dentro do mesmo bloco:
 * no de reviews o depoimento é composição da peça, como nas direções de depoimento do banco;
 * no de história vale só o que a loja declara; no de informações não existe composição nenhuma,
 * porque prazo, pagamento e garantia errados viram problema com cliente de verdade.
 */
const HIGHLIGHT_PIECES = [
  ['REVIEWS', 'Capa chamando atenção para a satisfação dos clientes.'],
  ['REVIEWS', 'Avaliação, depoimento ou benefício percebido.'],
  ['REVIEWS', 'Reforço de confiança com CTA para realizar o pedido.'],
  ['NOSSA HISTÓRIA', 'Quem somos e a inspiração da marca.'],
  ['NOSSA HISTÓRIA', 'Propósito, missão e principais diferenciais.'],
  ['NOSSA HISTÓRIA', 'Convite para fazer parte da história, com CTA.'],
  ['INFORMAÇÕES', 'Como comprar, envio e prazo de entrega.'],
  ['INFORMAÇÕES', 'Pagamentos, trocas, devoluções e garantia.'],
  ['INFORMAÇÕES', 'Atendimento, canais de contato e CTA.'],
] as const;

const HIGHLIGHT_FACTS = `O QUE PODE SER ESCRITO EM CADA DESTAQUE
- REVIEWS: o depoimento é texto publicitário da composição e deve ser escrito como a peça pedir, sempre limitado aos fatos confirmados sobre o produto. Se as fontes desta conversa trouxerem avaliação real da loja, ela tem prioridade e entra como está. Em qualquer caso, não escreva nota, número de estrelas, quantidade de vendas, nome de cliente real, prazo de entrega nem promessa de resultado.
- NOSSA HISTÓRIA: use apenas o que a loja declara nas fontes desta conversa. Não invente ano de fundação, cidade, tamanho da equipe, número de clientes, prêmio ou parceria. Se a marca não contar sua história em lugar nenhum, fale do produto e de quem ele serve, sem atribuir fatos à empresa.
- INFORMAÇÕES: aqui não existe composição. Prazo, forma de pagamento, política de troca, devolução, garantia e canal de atendimento saem literalmente das fontes desta conversa. Se algum desses dados não estiver confirmado, escreva a peça sem ele em vez de aproximar.`;

const HIGHLIGHT_FORMAT = `FORMATO
- 1080 × 1920 px, qualidade máxima, textos legíveis em tela de celular.
- Preserve produto, cor, textura, estampa, componentes e logo exatamente como nas fontes factuais.`;

const STORY_LANGUAGE_LOCK = `IDIOMA OBRIGATÓRIO
- Todo texto DENTRO da imagem — manchete, apoio, CTA, informação operacional e marcação — deve ser escrito exclusivamente no idioma registrado no CONTEXTO CAPTURADO.
- Use a ortografia, os acentos e a redação natural desse idioma e mercado. Não traduza, não explique e não misture idiomas.
- Português só pode aparecer se o idioma registrado no CONTEXTO CAPTURADO for português. Se a loja estiver em outro idioma, nenhuma palavra em português entra na imagem.`;

/* Story é tela de celular, não uma página de apresentação. Uma ideia por vez evita a
 * prancha poluída que o modelo costuma produzir ao tentar explicar tudo de uma vez. */
const STORY_MINIMAL_DESIGN = `DIREÇÃO VISUAL — STORY DE LOJA REAL, LIMPO E MINIMALISTA
- Cada story comunica UMA única ideia: uma pergunta, uma resposta, uma prova, uma condição ou uma chamada. Não tente explicar o destaque inteiro em uma imagem.
- Construa a peça como um perfil de loja real e bem cuidado: uma fotografia ou um fundo calmo, uma área de texto e bastante respiro. A imagem não parece flyer, apresentação corporativa nem template genérico.
- Use somente uma manchete curta. Acrescente no máximo uma linha de apoio OU uma chamada curta quando ela realmente for necessária.
- A mensagem principal é o único elemento dominante. A marca entra de modo discreto e só uma vez, quando estiver confirmada; logo, produto e texto não disputam o mesmo olhar.
- Tipografia simples e editorial, coerente com a loja: poucos níveis, alinhamento único e contraste alto. Texto fica em área calma, nunca sobre fotografia carregada.
- Escolha uma cor de acento no máximo, retirada da identidade visual ou do próprio produto. O restante da peça é neutro, sóbrio e consistente com o conjunto.
- Não use lista, parágrafo longo, tabela, grade, mosaico, cards empilhados, selos, ícones decorativos, botões falsos, setas, stickers, balões, emojis, molduras, sombras pesadas ou vários fundos concorrendo entre si.
- Se um fato operacional precisar de mais explicação, deixe o detalhe para o próximo story do trio; não encha esta peça.`;

const SOCIAL_PEOPLE = `PRESENÇA HUMANA
- Quando houver pessoa, ela representa o público-alvo registrado no contexto: mesmo gênero, faixa etária compatível e biotipo coerente com o uso do produto.
- Expressão natural, em situação real de uso. Mãos, dedos e membros anatomicamente corretos.
- Não use foto de pessoa como se fosse cliente identificado: nada de nome, @ ou legenda atribuindo a fala a alguém real.`;

const storyContract = (first: number) => {
  const last = first + 2;
  return `CONTRATO DE ENTREGA — LEIA ANTES DE QUALQUER COISA
Esta resposta precisa terminar com EXATAMENTE TRÊS arquivos de imagem anexados. Nem dois, nem quatro, nem um arquivo contendo três peças.
- Cada arquivo contém UM ÚNICO story, inteiro, ocupando o quadro todo em 1080 × 1920.
- É proibido entregar qualquer imagem que contenha mais de um story: nada de colagem, grade, mosaico, contact sheet, prancha de apresentação, mockup de celular, montagem lado a lado ou miniatura de outra peça dentro da imagem.
- Faça três chamadas separadas da ferramenta de geração de imagem, uma por story, na ordem Story ${first}, Story ${first + 1} e Story ${last}.
- Se o sistema só permitir gerar uma imagem por vez, gere uma por vez, em sequência, até completar as três. Preferir uma de cada vez é correto; juntar peças num arquivo para caber em menos gerações é errado.
- Não substitua nenhuma imagem por descrição em texto e não peça confirmação entre elas.
- Não escreva copy, explicação, tradução ou lista depois das imagens: o texto necessário já está dentro de cada story.
- Antes de enviar a resposta, conte os arquivos anexados. Se não forem três arquivos, cada um com um story só, gere os que faltam antes de responder.`;
};

const HIGHLIGHT_GROUPS = [
  { title: 'Reviews · 3 stories', destaque: 'REVIEWS', first: 1 },
  { title: 'Nossa história · 3 stories', destaque: 'NOSSA HISTÓRIA', first: 4 },
  { title: 'Informações · 3 stories', destaque: 'INFORMAÇÕES', first: 7 },
] as const;

function compileHighlightBatchPrompt(groupIndex: number) {
  const group = HIGHLIGHT_GROUPS[groupIndex];
  const stories = HIGHLIGHT_PIECES.slice(groupIndex * 3, groupIndex * 3 + 3);
  const regime = HIGHLIGHT_FACTS.split('\n').find((line) => line.startsWith(`- ${group.destaque}:`)) ?? '';

  return `Usando exclusivamente o CONTEXTO CAPTURADO e as fontes factuais já verificadas anteriormente nesta conversa, crie TRÊS stories para o destaque ${group.destaque} do perfil da loja.

Este trio responde uma dúvida específica de quem visita o perfil antes de comprar. Cada story cuida de uma parte da mensagem; clareza e leitura rápida vencem quantidade de informação.

${HIGHLIGHT_FORMAT}

${STORY_LANGUAGE_LOCK}

${STORY_MINIMAL_DESIGN}

${SOCIAL_PRODUCT}

O QUE PODE SER ESCRITO
${regime}

OS TRÊS STORIES, UM POR ARQUIVO
${stories.map(([, papel], index) => `Story ${group.first + index} — ${papel}`).join('\n')}

${HOUSE_DESIGN_RULE}

${SOCIAL_PEOPLE}

COERÊNCIA DO TRIO
- Os três stories parecem partes da mesma sequência: mesma paleta, família de letra e tratamento.
- Mude a fotografia ou o fundo de um story para outro, mas preserve o respiro e a simplicidade. Não faça uma única arte dividida em três.

${storyContract(group.first)}

Antes de entregar, confirme internamente:
1. São três arquivos separados em 1080 × 1920, um story em cada.
2. Cada story fala de uma única ideia e tem leitura limpa em tela de celular.
3. Nenhum dado de prazo, pagamento, troca, garantia ou atendimento foi aproximado.
4. Nenhuma peça traz nota, número de vendas ou nome de cliente.
5. Os três stories parecem do mesmo conjunto sem repetir a mesma composição.

Entregue agora somente as três imagens.`;
}

function compileHighlightStoryPrompt(index: number) {
  const [destaque, papel] = HIGHLIGHT_PIECES[index];
  const posicao = (index % 3) + 1;
  const grupo = Math.floor(index / 3) + 1;
  const regime = HIGHLIGHT_FACTS.split('\n').find((linha) => linha.startsWith(`- ${destaque}:`)) ?? '';

  return `Usando exclusivamente o CONTEXTO CAPTURADO e as fontes factuais já verificadas anteriormente nesta conversa, gere agora SOMENTE o story ${posicao} de 3 do DESTAQUE ${grupo} — ${destaque}.

PAPEL DESTE STORY
- ${papel}

O QUE PODE SER ESCRITO
${regime}

${HIGHLIGHT_FORMAT}

${STORY_LANGUAGE_LOCK}

${STORY_MINIMAL_DESIGN}

${SOCIAL_PRODUCT}

${HOUSE_DESIGN_RULE}

${SOCIAL_PEOPLE}

COERÊNCIA
- Esta peça faz parte de um conjunto de três do mesmo destaque: mantenha a paleta, a família de letra e o tratamento das que já foram geradas nesta conversa, e mude imagem, fundo, posição do texto e composição.

SAÍDA
- Entregue exatamente UMA imagem em 1080 × 1920, com todo texto necessário dentro do próprio story.
- Não gere os outros stories nesta resposta. Não entregue colagem, grade ou arquivo único.

Antes de entregar, confirme internamente:
1. É um único arquivo em 1080 × 1920.
2. Nenhum dado operacional foi aproximado.
3. A peça não traz nota, número de vendas nem nome de cliente.
4. O texto cabe no quadro e tem contraste para leitura no celular.

Entregue agora somente este story, sem explicações adicionais.`;
}

/*
 * Rotina semanal. O cupom é o único número que a peça pode mostrar, e só o confirmado:
 * o próprio playbook declara WELCOME10 como padrão quando não houver outro.
 */
const WEEKLY_PIECES = [
  ['1', 'BOM DIA', 'desejar bom dia, fortalecer a conexão com o público e direcionar para uma coleção da loja', 'Saudação de bom dia com imagem aspiracional e lifestyle da marca, sem produto no quadro.', 'acolhedor, sofisticado e leve'],
  ['1', 'BOM DIA', 'desejar bom dia, fortalecer a conexão com o público e direcionar para uma coleção da loja', 'Convite para descobrir produtos ou novidades da coleção.', 'acolhedor, sofisticado e leve'],
  ['1', 'BOM DIA', 'desejar bom dia, fortalecer a conexão com o público e direcionar para uma coleção da loja', 'CTA direto para acessar a coleção.', 'acolhedor, sofisticado e leve'],
  ['2', 'CUPOM DE DESCONTO', 'apresentar uma oferta com modelo usando uma peça da loja e destacar o cupom', 'Abertura apresentando o benefício da oferta.', 'exclusivo, desejável e comercial'],
  ['2', 'CUPOM DE DESCONTO', 'apresentar uma oferta com modelo usando uma peça da loja e destacar o cupom', 'Cupom em destaque, com leitura clara.', 'exclusivo, desejável e comercial'],
  ['2', 'CUPOM DE DESCONTO', 'apresentar uma oferta com modelo usando uma peça da loja e destacar o cupom', 'Reforço do desconto e CTA para comprar.', 'exclusivo, desejável e comercial'],
] as const;

const WEEKLY_FACTS = `O QUE PODE SER ESCRITO
- Use o cupom exatamente como confirmado nesta conversa. Se nenhum cupom tiver sido informado, use WELCOME10.
- Não invente percentual, valor, validade, condição, frete grátis, brinde nem qualquer regra que não esteja confirmada.
- Não invente preço, avaliação, prazo de entrega, garantia ou número de clientes.
- Produto, cor, textura, estampa, componentes e logo ficam idênticos às fontes factuais desta conversa.`;

const WEEKLY_GUIDELINES = `DIRETRIZES
- Formato: 1080x1920px, 9:16
- Texto aplicado diretamente na imagem
- Não utilizar imagens de referência externas; basear toda a criação na identidade da loja já apresentada`;

const WEEKLY_GROUPS = [
  { title: 'Bom dia · 3 stories', first: 1, theme: 'BOM DIA' },
  { title: 'Cupom · 3 stories', first: 4, theme: 'CUPOM DE DESCONTO' },
] as const;

function compileWeeklyBatchPrompt(groupIndex: number) {
  const group = WEEKLY_GROUPS[groupIndex];
  const stories = WEEKLY_PIECES.slice(groupIndex * 3, groupIndex * 3 + 3);
  const [, , objective, , tone] = stories[0];

  return `Usando exclusivamente o CONTEXTO CAPTURADO e a identidade visual já definida nesta conversa, crie TRÊS stories de Instagram para o tema ${group.theme}.

Estas peças mantêm o perfil vivo sem transformar cada tela em anúncio carregado. O trio tem ritmo e unidade, mas cada story resolve apenas uma pequena parte da mensagem.

OBJETIVO DO TEMA
- ${objective.charAt(0).toUpperCase()}${objective.slice(1)}.
- Tom: ${tone}.

${WEEKLY_GUIDELINES}

${STORY_LANGUAGE_LOCK}

${STORY_MINIMAL_DESIGN}

${WEEKLY_FACTS}

${SOCIAL_PRODUCT}

OS TRÊS STORIES, UM POR ARQUIVO
${stories.map(([, , , papel], index) => `Story ${group.first + index} — ${papel}`).join('\n')}

${HOUSE_DESIGN_RULE}

${SOCIAL_PEOPLE}

COERÊNCIA DO TRIO
- Os três stories formam uma sequência visual coerente: mesma paleta, tipografia e tratamento.
- Varie modelo, pose, enquadramento ou fundo entre as peças, sem repetir a mesma composição e sem abandonar o respiro.

${storyContract(group.first)}

Antes de entregar, confirme internamente:
1. São três arquivos de imagem separados em 1080 × 1920, um story em cada.
2. Cada story comunica uma única ideia com leitura limpa em tela de celular.
3. O cupom escrito é o confirmado, sem condição inventada.
4. As três peças não se repetem visualmente nem ficam carregadas de elementos.

Entregue agora somente as três imagens.`;
}

function compileWeeklyStoryPrompt(index: number) {
  const [tema, nome, objetivo, papel, tom] = WEEKLY_PIECES[index];
  const posicao = (index % 3) + 1;
  return `Usando exclusivamente o CONTEXTO CAPTURADO e a identidade visual já definida nesta conversa, crie agora SOMENTE o story ${posicao} de 3 do TEMA ${tema} — ${nome}.

OBJETIVO DO TEMA
- ${objetivo.charAt(0).toUpperCase()}${objetivo.slice(1)}.

PAPEL DESTE STORY
- ${papel}
- Tom: ${tom}.

${WEEKLY_GUIDELINES}

${STORY_LANGUAGE_LOCK}

${STORY_MINIMAL_DESIGN}

${WEEKLY_FACTS}

${SOCIAL_PRODUCT}

${HOUSE_DESIGN_RULE}

${SOCIAL_PEOPLE}

COERÊNCIA
- Esta peça faz parte de uma sequência de três: mantenha a coerência visual com as outras já geradas nesta conversa e varie modelo, pose, enquadramento e posição dos elementos.

FORMATO DE ENTREGA
- Entregue exatamente UMA imagem em 1080x1920px, com o texto embutido.

Antes de entregar, confirme internamente:
1. É um único arquivo em 1080x1920.
2. O cupom escrito é o confirmado, sem condição inventada.
3. O texto cabe no quadro e tem contraste para leitura no celular.

Entregue exatamente UMA imagem. Não gere os outros stories nesta resposta. Não entregue colagem, grade ou arquivo único.`;
}

/*
 * Review. A peça é um depoimento simulado por definição — o que não pode é passar por
 * cliente identificado nem carregar número. E precisa parecer foto de celular, não anúncio.
 */
const REVIEW_LOOK = `COMO A PEÇA PRECISA PARECER
- Foto tirada pelo próprio cliente com celular: luz do ambiente, enquadramento imperfeito, nada de iluminação de estúdio, fundo tratado ou simetria perfeita.
- Sem a nossa logo, sem moldura, sem selo, sem acabamento de anúncio.
- Se aparecer a marcação da loja, ela imita a marcação do Instagram: discreta, como num story de cliente.`;

const REVIEW_FACTS = `O QUE PODE SER ESCRITO
- O depoimento é texto da composição e deve soar como alguém falando do produto que comprou, limitado aos fatos confirmados nesta conversa.
- Não escreva nota, estrelas, número de vendas, nome de cliente, prazo de entrega nem promessa de resultado.
- O produto aparece com a mesma cor, textura, estampa, componentes e logo das fontes factuais.`;

export function compileReviewsPrompt() {
  return `Usando exclusivamente o CONTEXTO CAPTURADO e as fontes factuais já verificadas anteriormente nesta conversa, me entregue 3 reviews de cliente, da forma mais natural possível, como se clientes tivessem comprado e marcado a loja no Instagram.

${REVIEW_LOOK}

${REVIEW_FACTS}

${STORY_LANGUAGE_LOCK}

VARIEDADE
- Três pessoas diferentes, coerentes com o público-alvo registrado no contexto: mesmo gênero, faixa etária compatível e biotipo coerente com o uso do produto.
- Um produto ou variante diferente em cada uma das três peças, além de ambientes e enquadramentos diferentes. Se as fontes factuais trouxerem menos itens do que peças, repita o mesmo produto e varie a pessoa, o ambiente e o enquadramento — nunca invente cor, versão ou produto para dar variedade.
- Mãos, dedos e membros anatomicamente corretos.

SAÍDA
- Entregue 3 imagens separadas e independentes.
- Não entregue colagem, grade ou arquivo único.

Antes de entregar, confirme internamente:
1. São três arquivos separados.
2. Nenhuma peça tem logo, moldura, selo ou cara de anúncio.
3. Nenhuma peça traz nota, número de vendas ou nome de cliente.
4. As três parecem ter sido tiradas por pessoas diferentes.

Entregue agora somente os três reviews, sem explicações adicionais.`;
}

function compileReviewPrompt(index: number) {
  const review = index + 1;
  return `Usando exclusivamente o CONTEXTO CAPTURADO e as fontes factuais já verificadas anteriormente nesta conversa, me entregue SOMENTE o review ${review} de 3, da forma mais natural possível, como se um cliente tivesse comprado e marcado a loja no Instagram.

${REVIEW_LOOK}

${REVIEW_FACTS}

${STORY_LANGUAGE_LOCK}

VARIEDADE
- A pessoa é coerente com o público-alvo registrado no contexto: mesmo gênero, faixa etária compatível e biotipo coerente com o uso do produto.
- Use um produto, uma pessoa e um ambiente diferentes dos reviews já gerados nesta conversa. Se a loja tiver um produto só, repita o produto e mude a pessoa e o ambiente; não invente variante para diferenciar.
- Mãos, dedos e membros anatomicamente corretos.

SAÍDA
- Entregue exatamente UMA imagem, correspondente ao review ${review} de 3.
- Não gere os outros reviews nesta resposta. Não entregue colagem, grade ou arquivo único.

Antes de entregar, confirme internamente:
1. É um único arquivo.
2. A peça não tem logo, moldura, selo ou cara de anúncio.
3. A peça não traz nota, número de vendas nem nome de cliente.

Entregue agora somente este review, sem explicações adicionais.`;
}

const feedPieces: SocialPiece[] = FEED_SCENES.map((_, index) => ({
  label: `Post ${index + 1} de 9`,
  prompt: compileFeedPostPrompt(index),
}));

const highlightPieces: SocialPiece[] = HIGHLIGHT_PIECES.map(([destaque], index) => ({
  label: `${destaque} · story ${(index % 3) + 1} de 3`,
  prompt: compileHighlightStoryPrompt(index),
}));

const weeklyPieces: SocialPiece[] = WEEKLY_PIECES.map(([, nome], index) => ({
  label: `${nome} · story ${(index % 3) + 1} de 3`,
  prompt: compileWeeklyStoryPrompt(index),
}));

const reviewPieces: SocialPiece[] = [0, 1, 2].map((index) => ({
  label: `Review ${index + 1} de 3`,
  prompt: compileReviewPrompt(index),
}));

const highlightBatches: SocialBatch[] = HIGHLIGHT_GROUPS.map((group, index) => ({
  id: `highlights-${index + 1}`,
  title: group.title,
  output: '3 stories separados em 1080 × 1920, com texto aplicado na imagem.',
  prompt: compileHighlightBatchPrompt(index),
  pieces: highlightPieces.slice(index * 3, index * 3 + 3),
}));

const weeklyBatches: SocialBatch[] = WEEKLY_GROUPS.map((group, index) => ({
  id: `weekly-${index + 1}`,
  title: group.title,
  output: '3 stories separados em 1080 × 1920, com texto aplicado na imagem.',
  prompt: compileWeeklyBatchPrompt(index),
  pieces: weeklyPieces.slice(index * 3, index * 3 + 3),
}));

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
    pieces: feedPieces,
    batches: [{
      id: 'feed',
      title: 'Gerar 9 posts',
      output: '9 imagens separadas em 1080 × 1350, sem textos ou elementos comerciais.',
      prompt: compileFeedPrompt(),
      pieces: feedPieces,
    }],
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
    pieces: highlightPieces,
    batches: highlightBatches,
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
    pieces: weeklyPieces,
    batches: weeklyBatches,
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
    pieces: reviewPieces,
    batches: [{
      id: 'reviews',
      title: 'Gerar 3 reviews',
      output: '3 imagens de review sem logo e sem aparência de anúncio.',
      prompt: compileReviewsPrompt(),
      pieces: reviewPieces,
    }],
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
