import type { Reference } from '@/lib/mvp-data';

export type CampaignInput = {
  mode: 'single' | 'collection';
  exactTarget: string;
  sourceUrl: string;
  linkAccess: 'public' | 'protected';
  offer: string;
};

type TestedDirection = {
  title: string;
  single: string;
  collection: string;
};

const itemLabel = (index: number) => String(index + 1).padStart(2, '0');

/*
 * Texto canônico reconstruído dos EXP-008 e EXP-009.
 * A interface pode mudar; estas receitas validadas não devem ser resumidas.
 */
const testedDirections: Record<string, TestedDirection> = {
  'REF-0001': {
    title: 'SPLIT PREMIUM ESCURO',
    single: `- Composição assimétrica: título e oferta à esquerda; produto grande à direita.
- Fundo de estúdio escuro com gradiente suave e luz concentrada atrás do produto.
- Produto em perspectiva publicitária de três quartos, apoiado sobre base mineral escura, com sombra de contato realista.
- A oferta é o principal elemento textual. Título curto e secundário. Logo da loja/anunciante pequena no alto.
- Sensação premium, contraste alto e acabamento fotorrealista.`,
    collection: `- Composição assimétrica: marca, título e oferta em um painel à esquerda; coleção à direita.
- Organize os quatro produtos em uma composição editorial escalonada, com um produto principal e três apoios claramente distintos.
- Fundo de estúdio escuro com gradiente suave, luz concentrada, base mineral e sombras de contato realistas.
- A oferta é o principal elemento textual; o título da coleção é secundário.
- Nenhum produto pode ficar escondido atrás de outro ou parecer uma variante inventada.`,
  },
  'REF-0003': {
    title: 'CENÁRIO TÁTIL E QUENTE',
    single: `- Fundo e superfície tátil em tom quente, natural e suave, com iluminação difusa.
- Mostre o mesmo SKU em duas vistas factualmente coerentes: uma vista principal aberta em três quartos e uma segunda vista lateral, traseira ou dobrada somente se ela puder ser confirmada pelas fontes.
- As duas aparições devem representar exatamente o mesmo produto e a mesma variante, sem diferenças de mecanismo, cor ou componentes.
- Headline curta na parte superior e oferta dentro de selo circular de alto contraste no canto inferior.
- Se uma segunda vista não for confirmável, use um close real de um detalhe confirmado em vez de inventar outro ângulo.`,
    collection: `- Fundo e superfície tátil em tom quente, natural e sofisticado, com iluminação difusa.
- Distribua os quatro produtos em diagonais suaves sobre a superfície, cada um em sua própria área visual e com ângulo coerente.
- Headline curta no topo e a oferta completa dentro de um selo circular de alto contraste no canto inferior.
- Não use duas vistas do mesmo produto: neste modo coleção, cada aparição deve ser um produto distinto e elegível.
- Preserve a identidade de cada produto ou marca sem misturar logos, componentes ou características.`,
  },
  'REF-0004': {
    title: 'STILL LIFE MINIMALISTA CLARO',
    single: `- Fundo branco a cinza muito claro, amplo espaço negativo superior e superfície contínua.
- Uma única unidade do produto centralizada em ângulo de três quartos sobre dois ou três plintos geométricos neutros, grafite e preto.
- Plintos não são embalagens e não podem ter marcas ou textos.
- Luz de estúdio ampla e suave, reflexos controlados e sombra de contato limpa.
- Logo pequena, título curto e oferta com baixa densidade de texto. Aparência sofisticada e minimalista.`,
    collection: `- Fundo branco a cinza muito claro, espaço negativo superior e superfície contínua.
- Apresente os quatro produtos sobre plintos geométricos neutros de alturas diferentes, formando uma vitrine de coleção premium.
- Os plintos não são embalagens e não podem conter marcas ou textos.
- Use luz ampla e suave, reflexos controlados e sombras limpas.
- Mantenha baixa densidade de texto: marca da loja/anunciante, título da coleção e oferta completa.
- Nenhuma embalagem pode ser inventada; use apenas ativos que já tenham sido confirmados.`,
  },
  'REF-0005': {
    title: 'PRODUTO E CARTÃO FÍSICO DE OFERTA',
    single: `- Cena lifestyle de mesa escura, quente e premium, com profundidade de campo suave.
- Uma mão segura o produto de forma anatomicamente natural e sem ocultar seus detalhes essenciais.
- Outra mão segura um cartão promocional físico em perspectiva, contendo a marca anunciante e a oferta completa claramente legível.
- Não invente embalagem. Não duplique o produto. Dedos, pega, escala, perspectiva e sombra devem ser naturais.
- Produto e cartão compartilham o protagonismo; nenhum texto comercial adicional é permitido.`,
    collection: `- Cena de mesa escura, quente e premium, com profundidade de campo suave.
- Uma mão segura naturalmente um dos produtos como protagonista. Outra mão segura um cartão promocional físico com a marca da loja/anunciante e a oferta completa.
- Os outros três produtos aparecem apoiados e separados sobre a mesa, suficientemente visíveis para comunicar coleção.
- Não invente caixas ou acessórios. Não permita dedos deformados, objetos fundidos ou produtos ocultos.
- Produto principal, variedade da coleção e cartão/oferta compartilham a hierarquia.`,
  },
  'REF-0008': {
    title: 'ANÚNCIO NATIVO RETRÔ',
    single: `- Estética deliberadamente informal de anúncio nativo retrô, inspirada em uma janela genérica de editor gráfico antigo sobre fundo colorido de computador dos anos 2000.
- Não copie nome, logo, ícones, botões ou interface proprietária de nenhum sistema operacional ou programa real.
- Dentro da janela genérica, mostre uma única unidade do produto grande e reconhecível sobre fundo claro.
- Use uma headline curta com aparência manuscrita vermelha e a oferta completa em destaque na parte inferior.
- Mantenha a imperfeição controlada e divertida, mas preserve legibilidade, produto, marca e qualidade comercial.`,
    collection: `- Estética informal de anúncio nativo retrô, dentro de uma janela genérica de editor gráfico antigo sobre fundo digital colorido dos anos 2000.
- Não copie nome, logo, ícones, botões ou interface proprietária de nenhum sistema operacional ou programa real.
- Dentro da janela, organize os quatro produtos distintos em composição dinâmica, sem duplicação e sem sobreposição que esconda detalhes.
- Use uma headline manuscrita vermelha curta relacionada à coleção e destaque a oferta completa na parte inferior.
- Mantenha a imperfeição divertida e controlada, com texto legível e identidade da loja/anunciante preservada.`,
  },
};

function compileSingleContextPrompt(campaign: CampaignInput) {
  const protectedSource = campaign.linkAccess === 'protected'
    ? `\n\nO LINK ESTÁ PROTEGIDO OU INDISPONÍVEL. Use como fontes factuais principais as fotos reais e nítidas do produto e os prints completos da página de vendas anexados nesta conversa. As imagens anexadas são fontes factuais; não são referências criativas. Não peça senha. Se os anexos não estiverem visíveis, peça somente que eu os anexe antes de continuar.`
    : '';

  return `Vamos criar um criativo de PRODUTO ÚNICO.
ALVO EXATO: ${campaign.exactTarget}
LINK DO PRODUTO: ${campaign.sourceUrl}
ACESSO AO LINK: ${campaign.linkAccess === 'protected' ? 'PROTEGIDO OU INDISPONÍVEL' : 'PÚBLICO'}
OFERTA: ${campaign.offer}${protectedSource}

Antes de gerar qualquer imagem, analise o site e construa o contexto factual desta criação.

Extraia do site, da página e das imagens:
- nome da loja e da marca;
- idioma utilizado pela loja;
- produto correto, nome comercial e categoria;
- variante principal;
- formato, cores, materiais, componentes, estampas, rótulos e detalhes reconhecíveis;
- benefícios explicitamente publicados;
- logo, cores e identidade visual da loja.

Crie internamente um título publicitário curto. Eu não fornecerei o título exato.

Regras permanentes:
- esta campanha anuncia somente o produto do link, não a coleção da loja;
- não alterar nenhuma característica real do produto;
- não misturar variantes;
- não inventar benefícios, preços, descontos, cupons, urgência, avaliações, garantias ou selos;
- preservar exatamente o valor e as condições da oferta;
- não gerar a imagem ainda.

Responda somente:

CONTEXTO CAPTURADO

Marca:
Idioma:
Produto e categoria:
Variante visual:
Características que serão preservadas:
Benefícios factuais:
Oferta recebida:
Redação localizada da oferta:
Logo e cores observadas:
Título publicitário proposto:
Fatos que não puderam ser confirmados:
PRONTO PARA GERAR:`;
}

function compileCollectionContextPrompt(campaign: CampaignInput) {
  const sourceRule = campaign.linkAccess === 'protected'
    ? 'As imagens anexadas nesta conversa são fontes factuais da loja, da coleção e dos produtos. Elas não são referências criativas.'
    : 'O link informado é a fonte factual principal. Imagens eventualmente anexadas nesta conversa são fontes factuais da loja, da coleção e dos produtos; elas não são referências criativas.';

  return `Vamos preparar o contexto factual de uma campanha publicitária de COLEÇÃO.

ALVO EXATO: ${campaign.exactTarget}
LINK: ${campaign.sourceUrl}
ACESSO AO LINK: ${campaign.linkAccess === 'protected' ? 'PROTEGIDO OU INDISPONÍVEL; USE OS PRINTS E IMAGENS ANEXADOS COMO FONTES FACTUAIS' : 'PÚBLICO'}
OFERTA: ${campaign.offer}

${sourceRule}

Antes de gerar qualquer imagem, construa o contexto factual obedecendo a estas regras:

1. Analise somente a coleção declarada em ALVO EXATO. Ignore produtos, marcas ou coleções fora desse recorte, mesmo que apareçam na mesma loja ou nos prints.
2. Se o link estiver protegido ou indisponível, use os prints e as imagens anexadas como fonte principal. Não peça senha.
3. Separe a marca da loja/anunciante da marca dos produtos quando forem diferentes.
4. Preserve exatamente a oferta recebida, apenas localizando a redação para o idioma da loja quando necessário.
5. Não invente produtos, variantes, cores, materiais, logos, benefícios, preços, cupons, urgência, avaliações, garantias ou condições comerciais.
6. Identifique todos os produtos ou looks visualmente confirmáveis que pertençam à coleção. Atribua IDs P01, P02, P03 e assim por diante; cada ID deve descrever apenas um produto ou look real.
7. A seleção e a ordem dos produtos são LIVRES dentro dos itens elegíveis. A imagem futura deverá escolher quatro produtos ou looks distintos que melhor representem a coleção. Só trate IDs específicos como obrigatórios se esta mensagem os declarar explicitamente.
8. Se não existirem quatro itens confirmáveis, peça somente a menor fonte adicional necessária. Não gere a imagem ainda.

Responda somente neste formato:

CONTEXTO CAPTURADO — V004
Tipo da campanha: COLEÇÃO
Alvo exato:
Escopo incluído:
Escopo excluído:
Marca da loja/anunciante:
Marca do produto ou da coleção:
Idioma:
Oferta recebida:
Redação localizada da oferta:
Identidade visual observada:
Produtos/looks elegíveis:
- P01:
- P02:
- P03:
[continue se necessário]
Regra de seleção visual: escolher livremente quatro produtos ou looks distintos entre os elegíveis.
Título publicitário proposto:
Fonte principal usada: link / prints / ambos
Fatos que não puderam ser confirmados:
PRONTO PARA GERAR: SIM ou NÃO`;
}

export function compileContextPrompt(campaign: CampaignInput) {
  return campaign.mode === 'collection'
    ? compileCollectionContextPrompt(campaign)
    : compileSingleContextPrompt(campaign);
}

function compileDirections(campaign: CampaignInput, selected: Reference[]) {
  return selected
    .map((reference, index) => {
      const tested = testedDirections[reference.id];
      const title = tested?.title ?? reference.name.toUpperCase();
      const recipe = tested?.[campaign.mode] ?? `- ${reference.recipe}`;
      return `CRIATIVO ${itemLabel(index)} — ${title}\n${recipe}`;
    })
    .join('\n\n');
}

export function compileReferencePrompt(campaign: CampaignInput, reference: Reference) {
  const tested = testedDirections[reference.id];
  const title = tested?.title ?? reference.name.toUpperCase();
  const recipe = tested?.[campaign.mode] ?? `- ${reference.recipe}`;
  const contentRule = campaign.mode === 'collection'
    ? `- Anuncie somente a coleção “${campaign.exactTarget}”.
- Mostre simultaneamente quatro produtos ou looks distintos e elegíveis do CONTEXTO CAPTURADO — V004.
- Preserve a separação visual entre os quatro itens; não sugira um kit obrigatório e não misture marcas, logos, cores ou componentes.`
    : `- Anuncie somente o produto “${campaign.exactTarget}” e a variante factual registrada no CONTEXTO CAPTURADO.
- Mostre o mesmo produto sem redesenhar, recolorir, misturar variantes ou inventar componentes.`;

  return `Usando exclusivamente o CONTEXTO CAPTURADO e as fontes factuais já verificadas anteriormente nesta conversa, gere agora SOMENTE UM criativo publicitário mestre em proporção 4:5.

CONTEÚDO OBRIGATÓRIO
${contentRule}
- Use a loja/anunciante, a marca do produto e o idioma exatamente como registrados no contexto.
- Preserve exatamente a oferta recebida: “${campaign.offer}”.
- Não invente preço, benefício, avaliação, garantia, cupom, urgência, selo, embalagem, acessório ou condição comercial.
- Se houver conflito entre estética e fidelidade, preserve a fidelidade.

DIREÇÃO VISUAL — ${title}
${recipe}

SAÍDA
- Entregue uma única imagem final e independente em 4:5.
- Não gere alternativas, colagem, grade, carrossel ou explicações em texto.
- Não gere nem altere nenhum outro criativo desta conversa.

Entregue agora somente a imagem final desta direção.`;
}

function compileSingleMasterPrompt(campaign: CampaignInput, selected: Reference[]) {
  return `Usando exclusivamente o CONTEXTO CAPTURADO e verificado anteriormente nesta conversa, execute agora um lote de criação com EXATAMENTE CINCO criativos publicitários mestres.

REGRA DE SAÍDA DO LOTE
- Gere cinco imagens finais SEPARADAS e INDEPENDENTES, todas em proporção 4:5.
- Execute as cinco gerações dentro desta única resposta, na ordem CRIATIVO 01, 02, 03, 04 e 05.
- Não crie colagem, grade, carrossel, contact sheet ou uma única imagem contendo cinco opções.
- Não interrompa depois da primeira imagem e não peça confirmação entre elas.
- Identifique cada arquivo fora da imagem com seu número e nome de direção visual.
- Cada imagem deve funcionar sozinha como anúncio e apresentar o mesmo produto, marca, idioma e oferta do contexto. Somente a direção visual muda.

REGRAS FACTUAIS COMUNS AOS CINCO CRIATIVOS
- Preserve exatamente o produto-alvo “${campaign.exactTarget}”: silhueta, mecanismo, proporções, variante, materiais, articulações, apoios, encaixes e demais detalhes reconhecíveis das fontes factuais.
- Não redesenhe, simplifique, recolora, misture variantes ou transforme o produto em outro produto.
- Use a loja/anunciante e preserve a marca do produto exatamente como registradas no CONTEXTO CAPTURADO.
- Preserve exatamente a oferta recebida: ${campaign.offer}.
- Use o idioma definido no contexto e um título curto factual derivado do nome ou da categoria do produto.
- Não invente preço, benefício, avaliação, garantia, cupom, urgência, selo, embalagem ou acessório.
- Objetos de apoio só podem aparecer quando forem necessários para demonstrar uma função factual e não podem ocultar nem substituir o produto.
- Se houver conflito entre estética e fidelidade, preserve a fidelidade.

${compileDirections(campaign, selected)}

CHECAGEM FINAL DO LOTE
Antes de gerar, confirme internamente:
1. Serão cinco arquivos de imagem separados, não uma colagem.
2. Todos estarão em 4:5.
3. O mesmo produto factual e a mesma oferta aparecerão corretamente nos cinco.
4. Cada imagem corresponderá somente à sua direção visual numerada.
5. Nenhuma referência criativa, marca externa, embalagem ou fato inventado será incorporado.

Entregue agora os cinco criativos, em ordem, sem explicações adicionais.`;
}

function compileCollectionMasterPrompt(campaign: CampaignInput, selected: Reference[]) {
  return `Usando exclusivamente o CONTEXTO CAPTURADO — V004 e as fontes factuais já verificadas anteriormente nesta conversa, execute agora um lote com EXATAMENTE CINCO criativos publicitários mestres para a coleção “${campaign.exactTarget}”.

REGRA DE SAÍDA DO LOTE
- Gere cinco imagens finais SEPARADAS e INDEPENDENTES, todas em proporção 4:5.
- Execute as cinco gerações dentro desta única resposta, na ordem CRIATIVO 01, 02, 03, 04 e 05.
- Não crie colagem, carrossel, contact sheet ou uma única imagem contendo as cinco alternativas.
- Não interrompa depois da primeira imagem e não peça confirmação entre elas.
- Identifique cada arquivo fora da imagem com seu número e nome de direção visual.
- Cada imagem deve funcionar sozinha como anúncio da coleção. Somente a direção visual muda.

CONTEÚDO COMUM E OBRIGATÓRIO
- Loja/anunciante: use exatamente a marca da loja/anunciante registrada no CONTEXTO CAPTURADO — V004.
- Coleção anunciada: “${campaign.exactTarget}”.
- Oferta exata: “${campaign.offer}”.
- Idioma: use exatamente o idioma registrado no CONTEXTO CAPTURADO — V004.
- Cada criativo deve comunicar variedade e mostrar simultaneamente quatro produtos ou looks distintos e elegíveis do contexto factual.
- Os quatro produtos ou looks devem permanecer visualmente separados e reconhecíveis; a peça não pode sugerir que formam um kit obrigatório.
- Preserve formato, cores, materiais, componentes, estampas, rótulos, logos e detalhes de cada produto conforme as fontes factuais.
- Não duplique, funda, redesenhe, recolora ou misture características entre produtos ou marcas.
- Não invente preço, benefício, avaliação, garantia, cupom, urgência, embalagem, numeração, selo ou condição comercial.
- Use a identidade da loja/anunciante e não transforme nenhuma marca dos produtos na anunciante principal.
- Se houver conflito entre estética e fidelidade, preserve a fidelidade.

${compileDirections(campaign, selected)}

CHECAGEM FINAL DO LOTE
Antes de gerar, confirme internamente:
1. Serão cinco arquivos separados, não uma colagem com cinco alternativas.
2. Todos estarão em 4:5.
3. Cada criativo mostrará quatro produtos ou looks distintos e elegíveis, comunicando coleção.
4. Loja/anunciante, coleção “${campaign.exactTarget}”, oferta “${campaign.offer}” e idioma estarão corretos.
5. Produtos, logos e características não serão misturados entre os itens elegíveis.
6. Cada arquivo corresponderá somente à sua direção visual numerada.

Entregue agora os cinco criativos, em ordem, sem explicações adicionais.`;
}

export function compileMasterPrompt(campaign: CampaignInput, selected: Reference[]) {
  return campaign.mode === 'collection'
    ? compileCollectionMasterPrompt(campaign, selected)
    : compileSingleMasterPrompt(campaign, selected);
}

export function compileRecoveryPrompt(selected: Reference[], pendingIndexes: number[]) {
  const pending = pendingIndexes.map((index) => itemLabel(index));
  const approved = selected
    .map((_, index) => index)
    .filter((index) => !pendingIndexes.includes(index))
    .map((index) => itemLabel(index));
  const approvedLabel = approved.length === 1 ? 'o CRIATIVO' : 'os CRIATIVOS';

  return `${approved.length ? `Você gerou corretamente ${approvedLabel} ${approved.join(', ')}. Não ${approved.length === 1 ? 'o gere' : 'os gere'} novamente.\n\n` : ''}Agora gere somente ${pending.length === 1 ? 'o criativo pendente' : 'os criativos pendentes'}: ${pending.join(', ')}.
Execute uma geração de imagem independente para cada ID, seguindo integralmente sua receita já definida nesta conversa.

Não produza variações ${approved.length === 1 ? `do CRIATIVO ${approved[0]}` : 'dos criativos já aprovados'}.
Não responda com descrições em texto.
Não misture receitas entre os IDs.
Não peça confirmação entre as gerações.

Entregue ${pending.length === 1 ? 'uma imagem separada' : `${pending.length} imagens separadas`} em 4:5, na ordem ${pending.join(', ')}.`;
}

export function compileSingleRecoveryPrompt(reference: Reference, index: number) {
  return `Agora gere somente o criativo pendente: ${itemLabel(index)}.
Execute uma geração de imagem independente para este ID, seguindo integralmente a receita “${reference.name}” já definida nesta conversa.

Não gere novamente nenhum outro criativo.
Não responda com descrição em texto.
Não misture receitas.
Não peça confirmação.

Entregue uma imagem separada em 4:5: CRIATIVO ${itemLabel(index)}.`;
}

export function compileIndividualPrompt(reference: Reference, index: number, issue: string, kind: 'content' | 'variation') {
  if (kind === 'variation') {
    return `Crie uma nova variação somente do CRIATIVO ${itemLabel(index)} — ${reference.name}.

Preserve integralmente o CONTEXTO CAPTURADO, o produto ou conjunto de produtos, a oferta, o idioma, a proporção 4:5 e a receita visual dessa direção. Mude apenas a solução estética dentro da mesma direção.

Não altere nem gere novamente os outros quatro criativos. Entregue somente uma imagem final, sem explicações.`;
  }

  return `Corrija somente o conteúdo do CRIATIVO ${itemLabel(index)} — ${reference.name}.

ERRO OBSERVADO
${issue.trim() || '[descreva aqui o erro de produto, marca, oferta, texto ou detalhe visual]'}

Preserve tudo o que já está correto. Mantenha a mesma direção visual, composição, CONTEXTO CAPTURADO e proporção 4:5. Corrija apenas o erro informado, sem inventar fatos.

Não altere nem gere novamente os outros quatro criativos. Entregue somente a imagem corrigida, sem explicações.`;
}
