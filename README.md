# Eternity Creative Assistant

Ferramenta web para guiar o processo de criativos da Eternity: contexto da campanha, referências visuais, prompts de imagem, formatos, redes sociais, narração, vídeo e panfleto.

O app não chama APIs de IA e não gera imagens por conta própria. Ele organiza o fluxo e compila prompts prontos para serem usados no mesmo chat do aluno.

## Rodar localmente

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Build de produção

```bash
npm run build
npm run start
```

## Deploy no Vercel

1. Suba esta pasta como raiz do repositório `criativos-eternity`.
2. No Vercel, importe o repositório do GitHub.
3. Framework: `Next.js`.
4. Build command: `npm run build`.
5. Install command: `npm install`.
6. Output directory: deixe vazio, o Vercel detecta automaticamente.

Não é necessário configurar variáveis de ambiente para o MVP atual.

## Fluxo implementado

1. Questionário em quatro perguntas: alvo exato, link, acesso ao link e oferta.
2. Prompt separado para captura do contexto inicial no ChatGPT.
3. Instrução explícita para anexar produtos e prints no ChatGPT quando a loja for protegida.
4. Biblioteca visual em masonry, com imagens completas, filtros e seleção de exatamente cinco.
5. Prompt separado para cinco imagens mestres independentes em 4:5.
6. Revisão em cinco cartões com recuperação das falhas de lote por ID.
7. Correção individual de conteúdo e variação estética sem regenerar o conjunto.
8. Fila segura, um item por vez, se a primeira recuperação também falhar.
