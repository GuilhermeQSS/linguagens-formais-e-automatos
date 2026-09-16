import { AutomatoFinito, EPSILON } from "../models/automato.js";

const automato = new AutomatoFinito("AFD");
const porId = (id) => document.getElementById(id);
const elementos = {
  tipo: porId("tipoAutomato"), mensagem: porId("mensagem"), grafo: porId("grafo"),
  formEstado: porId("formEstado"), nomeEstado: porId("nomeEstado"),
  estadoInicial: porId("estadoInicial"), estadoFinal: porId("estadoFinal"),
  salvarEstado: porId("salvarEstado"), cancelarEstado: porId("cancelarEstado"),
  listaEstados: porId("listaEstados"), formTransicao: porId("formTransicao"),
  origem: porId("origem"), destino: porId("destino"), simbolo: porId("simbolo"),
  salvarTransicao: porId("salvarTransicao"), cancelarTransicao: porId("cancelarTransicao"),
  listaTransicoes: porId("listaTransicoes"),
};

let estadoEmEdicao = null;
let transicaoEmEdicao = null;
let simulacao = null;
let indicePasso = 0;

function informar(texto, tipo = "neutra") {
  elementos.mensagem.textContent = texto;
  elementos.mensagem.className = `mensagem ${tipo}`;
}

function executar(acao, sucesso) {
  try {
    acao();
    invalidarSimulacaoPassoAPasso();
    informar(sucesso, "sucesso");
    atualizarInterface();
  } catch (erro) {
    informar(erro.message, "erro");
  }
}

function invalidarSimulacaoPassoAPasso() {
  simulacao = null;
  indicePasso = 0;
  porId("controlePassos").classList.add("oculto");
  porId("resultadoPassos").className = "resultado vazio";
  porId("resultadoPassos").textContent = "Inicie uma simulação.";
}

function criarBotao(texto, classe, aoClicar) {
  const botao = document.createElement("button");
  botao.type = "button";
  botao.textContent = texto;
  botao.className = classe;
  botao.addEventListener("click", aoClicar);
  return botao;
}

function preencherSelects() {
  const valorOrigem = elementos.origem.value;
  const valorDestino = elementos.destino.value;
  [elementos.origem, elementos.destino].forEach((select) => {
    select.replaceChildren();
    automato.obterEstados().forEach((estado) => {
      const opcao = document.createElement("option");
      opcao.value = estado.nome;
      opcao.textContent = estado.nome;
      select.appendChild(opcao);
    });
  });
  if (automato.buscarEstado(valorOrigem)) elementos.origem.value = valorOrigem;
  if (automato.buscarEstado(valorDestino)) elementos.destino.value = valorDestino;
}

function renderizarEstados() {
  const estados = automato.obterEstados();
  elementos.listaEstados.replaceChildren();
  elementos.listaEstados.className = estados.length ? "lista-itens" : "lista-vazia";
  if (!estados.length) {
    elementos.listaEstados.textContent = "Nenhum estado criado.";
    return;
  }
  estados.forEach((estado) => {
    const item = document.createElement("div");
    item.className = "item-lista";
    const nome = document.createElement("span");
    nome.textContent = `${estado.nome}${estado.inicial ? " · inicial" : ""}${estado.final ? " · final" : ""}`;
    const acoes = document.createElement("div");
    acoes.append(
      criarBotao("Editar", "link", () => iniciarEdicaoEstado(estado)),
      criarBotao("Remover", "link perigo", () => executar(
        () => {
          automato.removerEstado(estado.nome);
          cancelarEdicaoEstado();
          cancelarEdicaoTransicao();
        },
        `Estado “${estado.nome}” removido.`,
      )),
    );
    item.append(nome, acoes);
    elementos.listaEstados.appendChild(item);
  });
}

function renderizarTransicoes() {
  const transicoes = automato.obterTransicoes();
  elementos.listaTransicoes.replaceChildren();
  elementos.listaTransicoes.className = transicoes.length ? "lista-itens" : "lista-vazia";
  if (!transicoes.length) {
    elementos.listaTransicoes.textContent = "Nenhuma transição criada.";
    return;
  }
  transicoes.forEach((transicao) => {
    const item = document.createElement("div");
    item.className = "item-lista";
    const descricao = document.createElement("span");
    descricao.textContent = `${transicao.origem} —${transicao.simbolos.join(", ")}→ ${transicao.destino}`;
    const acoes = document.createElement("div");
    acoes.append(
      criarBotao("Editar", "link", () => iniciarEdicaoTransicao(transicao)),
      criarBotao("Remover", "link perigo", () => executar(
        () => { automato.removerTransicao(transicao.id); cancelarEdicaoTransicao(); },
        "Transição removida.",
      )),
    );
    item.append(descricao, acoes);
    elementos.listaTransicoes.appendChild(item);
  });
}

function atualizarInterface() {
  preencherSelects();
  renderizarEstados();
  renderizarTransicoes();
  automato.exibir(elementos.grafo);
}

function iniciarEdicaoEstado(estado) {
  estadoEmEdicao = estado.nome;
  elementos.nomeEstado.value = estado.nome;
  elementos.estadoInicial.checked = estado.inicial;
  elementos.estadoFinal.checked = estado.final;
  elementos.salvarEstado.textContent = "Salvar alterações";
  elementos.cancelarEstado.classList.remove("oculto");
  elementos.nomeEstado.focus();
}

function cancelarEdicaoEstado() {
  estadoEmEdicao = null;
  elementos.formEstado.reset();
  elementos.salvarEstado.textContent = "Adicionar estado";
  elementos.cancelarEstado.classList.add("oculto");
}

function iniciarEdicaoTransicao(transicao) {
  transicaoEmEdicao = transicao.id;
  elementos.origem.value = transicao.origem;
  elementos.destino.value = transicao.destino;
  elementos.simbolo.value = transicao.simbolos.join(", ");
  elementos.salvarTransicao.textContent = "Salvar alterações";
  elementos.cancelarTransicao.classList.remove("oculto");
  elementos.simbolo.focus();
}

function cancelarEdicaoTransicao() {
  transicaoEmEdicao = null;
  elementos.formTransicao.reset();
  elementos.salvarTransicao.textContent = "Adicionar transição";
  elementos.cancelarTransicao.classList.add("oculto");
}

elementos.tipo.addEventListener("change", () => {
  executar(
    () => automato.definirTipo(elementos.tipo.value),
    `Tipo alterado para ${elementos.tipo.value}.`,
  );
  elementos.tipo.value = automato.tipo;
});

elementos.formEstado.addEventListener("submit", (evento) => {
  evento.preventDefault();
  const editando = Boolean(estadoEmEdicao);
  executar(() => {
    if (editando) {
      automato.editarEstado(estadoEmEdicao, elementos.nomeEstado.value, elementos.estadoInicial.checked, elementos.estadoFinal.checked);
      cancelarEdicaoTransicao();
    } else {
      automato.adicionarEstado(elementos.nomeEstado.value, elementos.estadoInicial.checked, elementos.estadoFinal.checked);
    }
    cancelarEdicaoEstado();
  }, editando ? "Estado atualizado." : "Estado adicionado.");
});
elementos.cancelarEstado.addEventListener("click", cancelarEdicaoEstado);

elementos.formTransicao.addEventListener("submit", (evento) => {
  evento.preventDefault();
  const editando = Boolean(transicaoEmEdicao);
  executar(() => {
    if (editando) {
      automato.editarTransicao(transicaoEmEdicao, elementos.origem.value, elementos.destino.value, elementos.simbolo.value);
    } else {
      automato.adicionarTransicao(elementos.origem.value, elementos.destino.value, elementos.simbolo.value);
    }
    cancelarEdicaoTransicao();
  }, editando ? "Transição atualizada." : "Transição adicionada.");
});
elementos.cancelarTransicao.addEventListener("click", cancelarEdicaoTransicao);

porId("centralizar").addEventListener("click", () => {
  const cy = automato.instanciaCytoscape;
  if (cy) cy.layout({ name: "circle", padding: 45, animate: true }).run();
});

document.querySelectorAll(".aba").forEach((aba) => {
  aba.addEventListener("click", () => {
    document.querySelectorAll(".aba").forEach((item) => item.classList.remove("ativa"));
    document.querySelectorAll(".painel").forEach((item) => item.classList.remove("ativo"));
    aba.classList.add("ativa");
    porId(aba.dataset.alvo).classList.add("ativo");
  });
});

function exibirResultado(container, resultado) {
  container.className = `resultado ${resultado.aceita ? "aceita" : "rejeita"}`;
  const palavra = resultado.palavra === "" ? EPSILON : resultado.palavra;
  container.textContent = `“${palavra}” foi ${resultado.aceita ? "ACEITA" : "REJEITADA"}.`;
}

porId("reconhecerUma").addEventListener("click", () => {
  try {
    exibirResultado(porId("resultadoUnico"), automato.reconhecer(porId("palavraUnica").value));
  } catch (erro) { informar(erro.message, "erro"); }
});

porId("reconhecerMultiplas").addEventListener("click", () => {
  try {
    const texto = porId("palavrasMultiplas").value.replace(/\r/g, "");
    const palavras = texto === "" ? [""] : texto.split("\n");
    const resultados = automato.reconhecerMultiplas(palavras);
    const lista = porId("resultadosMultiplos");
    lista.replaceChildren();
    resultados.forEach((resultado) => {
      const item = document.createElement("div");
      item.className = resultado.aceita ? "mini-resultado aceita" : "mini-resultado rejeita";
      item.textContent = `${resultado.palavra || EPSILON} — ${resultado.aceita ? "ACEITA" : "REJEITADA"}`;
      lista.appendChild(item);
    });
  } catch (erro) { informar(erro.message, "erro"); }
});

porId("iniciarPassos").addEventListener("click", () => {
  try {
    simulacao = automato.criarPassos(porId("palavraPassos").value);
    indicePasso = 0;
    porId("controlePassos").classList.remove("oculto");
    mostrarPasso();
  } catch (erro) { informar(erro.message, "erro"); }
});

function mostrarPasso() {
  const passo = simulacao.passos[indicePasso];
  const ultimo = indicePasso === simulacao.passos.length - 1;
  const estados = passo.estados.length ? passo.estados.join(", ") : "∅";
  porId("descricaoPasso").textContent = passo.simbolo === null
    ? `Início: {${estados}}`
    : `Após “${passo.simbolo}”: {${estados}}`;
  porId("passoAnterior").disabled = indicePasso === 0;
  porId("proximoPasso").disabled = ultimo;
  const resultado = porId("resultadoPassos");
  if (ultimo) exibirResultado(resultado, simulacao);
  else {
    resultado.className = "resultado vazio";
    resultado.textContent = `${indicePasso} de ${simulacao.passos.length - 1} símbolo(s) consumido(s).`;
  }
  const cy = automato.instanciaCytoscape;
  if (cy) {
    cy.elements().removeClass("ativo");
    passo.estados.forEach((nome) => cy.getElementById(`estado:${nome}`).addClass("ativo"));
  }
}

porId("passoAnterior").addEventListener("click", () => {
  if (indicePasso > 0) { indicePasso--; mostrarPasso(); }
});
porId("proximoPasso").addEventListener("click", () => {
  if (indicePasso < simulacao.passos.length - 1) { indicePasso++; mostrarPasso(); }
});

atualizarInterface();
