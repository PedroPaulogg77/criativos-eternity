# Eternity Criativos — MVP local

Interface conversacional para organizar o contexto mínimo de uma campanha, escolher cinco referências aprovadas e compilar prompts determinísticos para uso no ChatGPT do aluno.

O MVP não chama APIs de IA e não gera imagens. Toda correção preserva os cartões já aprovados.

## Rodar localmente

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Fluxo implementado

1. Questionário em quatro perguntas: alvo exato, link, acesso ao link e oferta.
2. Prompt separado para captura do contexto inicial no ChatGPT.
3. Instrução explícita para anexar produtos e prints no ChatGPT quando a loja for protegida.
4. Biblioteca visual em masonry, com imagens completas, filtros e seleção de exatamente cinco.
5. Prompt separado para cinco imagens mestres independentes em 4:5.
6. Revisão em cinco cartões com recuperação das falhas de lote por ID.
7. Correção individual de conteúdo e variação estética sem regenerar o conjunto.
8. Fila segura, um item por vez, se a primeira recuperação também falhar.
