import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

// O servidor usa CommonJS, mas o modelo é um módulo ES carregado pelo navegador.
const origem = readFileSync(new URL("../src/models/gramatica.js", import.meta.url), "utf8");
const { EPSILON, Gramatica } = await import(
  `data:text/javascript;base64,${Buffer.from(origem).toString("base64")}`
);

function criarGramatica() {
  const gramatica = new Gramatica();
  gramatica.definirTerminais("a, b, c");
  gramatica.adicionarNaoTerminal("A");
  return gramatica;
}

test("aceita produções longas com não terminais em qualquer posição", () => {
  const gramatica = criarGramatica();
  for (const producao of ["aaN", "Na", "abcNA", "AbcA"]) {
    gramatica.adicionarProducao("N", producao);
  }
  gramatica.adicionarProducao("A", "b");

  assert.deepEqual(gramatica.obterProducoes("N"), ["aaN", "Na", "abcNA", "AbcA"]);
  assert.equal(gramatica.prepararSimulacao().producoes.length, 2);
});

test("normaliza o campo vazio para ε e rejeita duplicação", () => {
  const gramatica = criarGramatica();
  gramatica.adicionarProducao("N", "");
  assert.deepEqual(gramatica.obterProducoes("N"), [EPSILON]);
  assert.throws(() => gramatica.adicionarProducao("N", EPSILON), /já existe/);
});

test("não permite símbolo desconhecido nem ε no meio de uma produção", () => {
  const gramatica = criarGramatica();
  assert.throws(() => gramatica.adicionarProducao("N", "abcX"), /inválida/);
  assert.throws(() => gramatica.adicionarProducao("N", "aε"), /inválida/);
});

test("não remove não terminal usado em qualquer posição", () => {
  const gramatica = criarGramatica();
  gramatica.adicionarProducao("N", "abcNA");
  assert.throws(() => gramatica.removerNaoTerminal("A"), /Remova as produções/);
});
