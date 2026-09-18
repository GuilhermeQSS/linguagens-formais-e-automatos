export const EPSILON = "ε";

/** Gramática com produções arbitrárias. Cada linha guarda [não terminal, ...produções]. */
export class Gramatica {
  constructor() {
    this.inicial = "N";
    this.terminais = [];
    this.producoes = [[this.inicial]];
  }

  definirTerminais(entrada) {
    const simbolos = entrada === "" ? [] : entrada.split(",").map((item) => item.trim());
    if (simbolos.some((item) => Array.from(item).length !== 1 || /^[A-Z]$/.test(item) || item === EPSILON || /\s/.test(item))) {
      throw new Error("Informe terminais de um caractere, separados por vírgula, sem letras maiúsculas ou ε.");
    }
    if (new Set(simbolos).size !== simbolos.length) {
      throw new Error("Há símbolos terminais repetidos.");
    }
    this.terminais = simbolos;
  }

  obterNaoTerminais() {
    return this.producoes.map(([nome]) => nome);
  }

  adicionarNaoTerminal(nome) {
    if (!/^[A-Z]$/.test(nome)) throw new Error("O não terminal deve ser uma letra maiúscula de A a Z.");
    if (this.obterNaoTerminais().includes(nome)) throw new Error(`O não terminal “${nome}” já existe.`);
    this.producoes.push([nome]);
  }

  removerNaoTerminal(nome) {
    if (nome === this.inicial) throw new Error("O símbolo inicial N não pode ser removido.");
    const indice = this.producoes.findIndex(([atual]) => atual === nome);
    if (indice < 0) throw new Error("Não terminal não encontrado.");
    if (this.producoes.some((linha) => linha.slice(1).some((valor) => Array.from(valor).includes(nome)))) {
      throw new Error(`Remova as produções que usam “${nome}” antes de excluí-lo.`);
    }
    this.producoes.splice(indice, 1);
  }

  validarProducao(producao) {
    if (typeof producao !== "string") throw new Error("A produção deve ser um texto.");
    if (producao === "" || producao === EPSILON) return true;
    const naoTerminais = this.obterNaoTerminais();
    for (const simbolo of Array.from(producao)) {
      if (!this.terminais.includes(simbolo) && !naoTerminais.includes(simbolo)) {
        throw new Error(`Produção “${producao}” inválida. Cadastre todos os seus símbolos; use ε somente sozinho.`);
      }
    }
    return true;
  }

  adicionarProducao(nome, producao) {
    const linha = this.producoes.find(([atual]) => atual === nome);
    if (!linha) throw new Error(`Não terminal “${nome}” não encontrado.`);
    this.validarProducao(producao);
    const normalizada = producao === "" ? EPSILON : producao;
    if (linha.slice(1).includes(normalizada)) throw new Error(`A produção ${nome} → ${normalizada} já existe.`);
    linha.push(normalizada);
  }

  removerProducao(nome, indice) {
    const linha = this.producoes.find(([atual]) => atual === nome);
    if (!linha || !Number.isInteger(indice) || indice < 0 || indice >= linha.length - 1) {
      throw new Error("Produção não encontrada.");
    }
    linha.splice(indice + 1, 1);
  }

  obterProducoes(nome) {
    const linha = this.producoes.find(([atual]) => atual === nome);
    if (!linha) throw new Error(`Não terminal “${nome}” não encontrado.`);
    return linha.slice(1);
  }

  prepararSimulacao() {
    if (!this.obterNaoTerminais().includes(this.inicial)) throw new Error("Cadastre o símbolo inicial N.");
    for (const [nome, ...alternativas] of this.producoes) {
      if (!alternativas.length) throw new Error(`Adicione ao menos uma produção para “${nome}”.`);
      alternativas.forEach((producao) => this.validarProducao(producao));
    }
    return { inicial: this.inicial, producoes: this.producoes.map((linha) => [...linha]) };
  }
}
