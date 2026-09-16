const EPSILON = "ε";

/** Modelo de autômato finito baseado em uma lista de adjacência. */
export class AutomatoFinito {
  constructor(tipo = "AFD") {
    this.tipo = tipo;
    this.listaAdjacencia = [];
    this.proximoIdTransicao = 1;
    this.instanciaCytoscape = null;
  }

  obterEstados() {
    return this.listaAdjacencia.map(({ transicoes, ...estado }) => ({ ...estado }));
  }

  obterTransicoes() {
    return this.listaAdjacencia.flatMap((item) =>
      item.transicoes.map((transicao) => ({
        ...transicao,
        simbolos: [...transicao.simbolos],
      })),
    );
  }

  buscarEstado(nome) {
    return this.listaAdjacencia.find((estado) => estado.nome === nome);
  }

  definirTipo(tipo) {
    if (!["AFD", "AFND"].includes(tipo)) {
      throw new Error("O tipo deve ser AFD ou AFND.");
    }
    if (tipo === "AFD") this.validarComoAFD();
    this.tipo = tipo;
  }

  adicionarEstado(nome, inicial = false, final = false) {
    const nomeNormalizado = nome.trim();
    if (!nomeNormalizado) throw new Error("Informe o nome do estado.");
    if (this.buscarEstado(nomeNormalizado)) {
      throw new Error(`O estado “${nomeNormalizado}” já existe.`);
    }
    if (inicial && this.listaAdjacencia.some((estado) => estado.inicial)) {
      throw new Error("O autômato já possui um estado inicial.");
    }
    this.listaAdjacencia.push({
      nome: nomeNormalizado,
      inicial: Boolean(inicial),
      final: Boolean(final),
      transicoes: [],
    });
  }

  editarEstado(nomeAtual, novoNome, inicial, final) {
    const estado = this.buscarEstado(nomeAtual);
    const nomeNormalizado = novoNome.trim();
    if (!estado) throw new Error("Estado não encontrado.");
    if (!nomeNormalizado) throw new Error("Informe o nome do estado.");
    if (nomeAtual !== nomeNormalizado && this.buscarEstado(nomeNormalizado)) {
      throw new Error(`O estado “${nomeNormalizado}” já existe.`);
    }
    if (
      inicial &&
      this.listaAdjacencia.some(
        (item) => item.inicial && item.nome !== nomeAtual,
      )
    ) {
      throw new Error("O autômato já possui outro estado inicial.");
    }
    this.listaAdjacencia.forEach((item) => {
      item.transicoes.forEach((transicao) => {
        if (transicao.destino === nomeAtual) transicao.destino = nomeNormalizado;
        if (transicao.origem === nomeAtual) transicao.origem = nomeNormalizado;
      });
    });
    estado.nome = nomeNormalizado;
    estado.inicial = Boolean(inicial);
    estado.final = Boolean(final);
  }

  removerEstado(nome) {
    const indice = this.listaAdjacencia.findIndex((estado) => estado.nome === nome);
    if (indice < 0) throw new Error("Estado não encontrado.");
    this.listaAdjacencia.splice(indice, 1);
    this.listaAdjacencia.forEach((estado) => {
      estado.transicoes = estado.transicoes.filter(
        (transicao) => transicao.destino !== nome,
      );
    });
  }

  adicionarTransicao(origem, destino, simbolo) {
    this.validarTransicao(origem, destino, simbolo);
    const transicao = {
      id: `t${this.proximoIdTransicao++}`,
      origem,
      destino,
      simbolos: this.normalizarSimbolos(simbolo),
    };
    this.buscarEstado(origem).transicoes.push(transicao);
    return transicao.id;
  }

  editarTransicao(id, origem, destino, simbolo) {
    let estadoAnterior;
    let indiceAnterior = -1;
    for (const estado of this.listaAdjacencia) {
      const indice = estado.transicoes.findIndex((item) => item.id === id);
      if (indice >= 0) {
        estadoAnterior = estado;
        indiceAnterior = indice;
        break;
      }
    }
    if (!estadoAnterior) throw new Error("Transição não encontrada.");
    const existente = estadoAnterior.transicoes.splice(indiceAnterior, 1)[0];
    try {
      this.validarTransicao(origem, destino, simbolo);
      existente.origem = origem;
      existente.destino = destino;
      existente.simbolos = this.normalizarSimbolos(simbolo);
      this.buscarEstado(origem).transicoes.push(existente);
    } catch (erro) {
      estadoAnterior.transicoes.splice(indiceAnterior, 0, existente);
      throw erro;
    }
  }

  removerTransicao(id) {
    for (const estado of this.listaAdjacencia) {
      const indice = estado.transicoes.findIndex((item) => item.id === id);
      if (indice >= 0) {
        estado.transicoes.splice(indice, 1);
        return;
      }
    }
    throw new Error("Transição não encontrada.");
  }

  normalizarSimbolos(entrada) {
    const partes = entrada.split(",").map((simbolo) => simbolo.trim());
    if (!partes.length || partes.some((simbolo) => simbolo === "")) {
      throw new Error("Informe os símbolos separados por vírgula, sem itens vazios.");
    }

    const simbolos = partes.map((simbolo) =>
      simbolo.toLowerCase() === "epsilon" ? EPSILON : simbolo,
    );
    simbolos.forEach((simbolo) => {
      if (Array.from(simbolo).length !== 1) {
        throw new Error(
          `“${simbolo}” não é um símbolo único. Separe os símbolos por vírgula.`,
        );
      }
    });
    return [...new Set(simbolos)];
  }

  validarTransicao(origem, destino, simbolo) {
    const simbolosNormalizados = this.normalizarSimbolos(simbolo);
    if (!this.buscarEstado(origem) || !this.buscarEstado(destino)) {
      throw new Error("Selecione estados de origem e destino válidos.");
    }
    if (this.tipo === "AFD" && simbolosNormalizados.includes(EPSILON)) {
      throw new Error("Um AFD não pode possuir transições ε.");
    }
    const simbolosExistentes = new Set(
      this.buscarEstado(origem).transicoes.flatMap((item) => item.simbolos),
    );
    const conflito = simbolosNormalizados.find((item) => simbolosExistentes.has(item));
    if (this.tipo === "AFD" && conflito) {
      throw new Error(
        `O estado “${origem}” já possui uma transição com “${conflito}”.`,
      );
    }
  }

  validarComoAFD() {
    for (const estado of this.listaAdjacencia) {
      const simbolos = new Set();
      for (const transicao of estado.transicoes) {
        for (const simbolo of transicao.simbolos) {
          if (simbolo === EPSILON || simbolos.has(simbolo)) {
            throw new Error(
              "O autômato atual possui não determinismo e não pode ser convertido em AFD.",
            );
          }
          simbolos.add(simbolo);
        }
      }
    }
  }

  fechoEpsilon(nomes) {
    const fecho = new Set(nomes);
    const pendentes = [...fecho];
    while (pendentes.length) {
      const atual = this.buscarEstado(pendentes.pop());
      if (!atual) continue;
      atual.transicoes
        .filter((transicao) => transicao.simbolos.includes(EPSILON))
        .forEach((transicao) => {
          if (!fecho.has(transicao.destino)) {
            fecho.add(transicao.destino);
            pendentes.push(transicao.destino);
          }
        });
    }
    return fecho;
  }

  criarPassos(palavra) {
    const inicial = this.listaAdjacencia.find((estado) => estado.inicial);
    if (!inicial) {
      throw new Error("Defina um estado inicial antes de reconhecer palavras.");
    }
    let atuais = this.fechoEpsilon([inicial.nome]);
    const passos = [{ indice: 0, simbolo: null, estados: [...atuais] }];
    Array.from(palavra).forEach((simbolo, indice) => {
      const proximos = new Set();
      atuais.forEach((nome) => {
        const estado = this.buscarEstado(nome);
        estado.transicoes
          .filter((transicao) => transicao.simbolos.includes(simbolo))
          .forEach((transicao) => proximos.add(transicao.destino));
      });
      atuais = this.fechoEpsilon(proximos);
      passos.push({ indice: indice + 1, simbolo, estados: [...atuais] });
    });
    const aceita = [...atuais].some((nome) => this.buscarEstado(nome).final);
    return { palavra, aceita, passos };
  }

  reconhecer(palavra) {
    return this.criarPassos(palavra);
  }

  reconhecerMultiplas(palavras) {
    return palavras.map((palavra) => this.reconhecer(palavra));
  }

  /** Cria e devolve a visualização Cytoscape deste modelo. */
  exibir(container, cytoscapeLib = globalThis.cytoscape) {
    if (!container || !cytoscapeLib) {
      throw new Error("Cytoscape ou elemento de exibição não disponível.");
    }
    if (this.instanciaCytoscape) this.instanciaCytoscape.destroy();
    const elementos = this.listaAdjacencia.map((estado) => ({
      data: {
        id: `estado:${estado.nome}`,
        label: estado.inicial ? `→ ${estado.nome}` : estado.nome,
      },
      classes: [estado.inicial ? "inicial" : "", estado.final ? "final" : ""]
        .filter(Boolean)
        .join(" "),
    }));
    elementos.push(
      ...this.obterTransicoes().map((transicao) => ({
        data: {
          id: transicao.id,
          source: `estado:${transicao.origem}`,
          target: `estado:${transicao.destino}`,
          label: transicao.simbolos.join(", "),
        },
      })),
    );
    this.instanciaCytoscape = cytoscapeLib({
      container,
      elements: elementos,
      style: [
        { selector: "node", style: { label: "data(label)", color: "#eeeeee", "background-color": "#292d35", "border-color": "#777777", "border-width": 2, "font-size": 14, width: 58, height: 58 } },
        { selector: "node.inicial", style: { "border-color": "#eeeeee" } },
        { selector: "node.final", style: { "border-width": 7, "border-color": "#62d99b" } },
        { selector: "edge", style: { label: "data(label)", color: "#eeeeee", "font-size": 13, "text-background-color": "#101217", "text-background-opacity": 1, "text-background-padding": 3, width: 2, "line-color": "#777777", "target-arrow-color": "#777777", "target-arrow-shape": "triangle", "curve-style": "bezier", "loop-direction": "-45deg", "loop-sweep": "70deg" } },
        { selector: ".ativo", style: { color: "#111111", "background-color": "#eeeeee", "border-color": "#eeeeee", "line-color": "#eeeeee", "target-arrow-color": "#eeeeee" } },
      ],
      layout: { name: "circle", padding: 45 },
    });
    return this.instanciaCytoscape;
  }
}

export { EPSILON };
