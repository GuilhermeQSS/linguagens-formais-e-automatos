import { EPSILON, Gramatica } from "../models/gramatica.js";

const porId = (id) => document.getElementById(id);
const elementos = {
  terminais: porId("terminais"), definicao: porId("definicao"),
  linhas: porId("linhasProducoes"), mensagem: porId("mensagem"),
  adicionar: porId("adicionarNaoTerminal"), simular: porId("simular"),
  editar: porId("editar"), area: porId("areaSimulacao"),
  cadeia: porId("cadeia"), opcoes: porId("opcoes"),
  resultado: porId("resultado"), reiniciar: porId("reiniciar"),
};

let gramatica = null;
let cadeia = [];
let selecionado = null;
let bloqueada = false;

function informar(texto, tipo = "neutra") {
  elementos.mensagem.textContent = texto;
  elementos.mensagem.className = `mensagem ${tipo}`;
}

function botao(texto, classe, descricao, acao) {
  const item = document.createElement("button");
  item.type = "button";
  item.textContent = texto;
  item.className = classe;
  item.setAttribute("aria-label", descricao);
  item.title = descricao;
  item.addEventListener("click", acao);
  return item;
}

function linhas() {
  return [...elementos.linhas.querySelectorAll(".linha-producao")];
}

function atualizarDefinicao() {
  const nomes = linhas().map((linha) => linha.querySelector(".nome-nao-terminal").value)
    .filter((nome) => /^[A-Z]$/.test(nome));
  const terminais = elementos.terminais.value.split(",").map((valor) => valor.trim()).filter(Boolean);
  elementos.definicao.textContent = `GR = {{${nomes.join(", ")}}, {${terminais.join(", ")}}, P, N}`;
}

function adicionarAlternativa(linha) {
  const lista = linha.querySelector(".alternativas");
  if (lista.children.length) {
    const separador = document.createElement("span");
    separador.className = "separador";
    separador.textContent = "|";
    lista.appendChild(separador);
  }
  const grupo = document.createElement("span");
  grupo.className = "grupo-producao";
  const campo = document.createElement("input");
  campo.className = "producao";
  campo.autocomplete = "off";
  campo.placeholder = "Ex.: aaN, Na, abcNA ou ε";
  campo.setAttribute("aria-label", `Produção de ${linha.querySelector(".nome-nao-terminal").value || "novo não terminal"}`);
  const remover = botao("−", "secundario botao-simbolo edicao-acao", "Remover produção", () => {
    const separador = grupo.previousElementSibling?.classList.contains("separador")
      ? grupo.previousElementSibling : grupo.nextElementSibling;
    if (separador?.classList.contains("separador")) separador.remove();
    grupo.remove();
  });
  grupo.append(campo, remover);
  lista.appendChild(grupo);
  campo.focus();
}

function adicionarLinha(inicial = false) {
  const linha = document.createElement("div");
  linha.className = "linha-producao";
  const cabeca = document.createElement("div");
  cabeca.className = "cabeca-producao";
  const nome = document.createElement("input");
  nome.className = "nome-nao-terminal";
  nome.maxLength = 1;
  nome.autocomplete = "off";
  nome.placeholder = "A";
  nome.setAttribute("aria-label", "Não terminal (uma letra maiúscula)");
  nome.value = inicial ? "N" : "";
  nome.readOnly = inicial;
  nome.addEventListener("input", () => {
    const valor = nome.value;
    if (valor && !/^[A-Z]$/.test(valor)) {
      nome.value = "";
      informar("Use uma única letra maiúscula de A a Z para o não terminal.", "erro");
    } else if (valor && linhas().some((outra) => outra !== linha && outra.querySelector(".nome-nao-terminal").value === valor)) {
      nome.value = "";
      informar(`O não terminal “${valor}” já existe.`, "erro");
    } else {
      informar("Continue a definir as produções.");
    }
    atualizarDefinicao();
  });
  const seta = document.createElement("span");
  seta.textContent = "→";
  const remover = inicial ? null : botao("−", "secundario botao-simbolo edicao-acao", "Remover não terminal", () => {
    linha.remove();
    atualizarDefinicao();
  });
  cabeca.append(nome);
  if (remover) cabeca.append(remover);
  cabeca.append(seta);
  const alternativas = document.createElement("div");
  alternativas.className = "alternativas";
  const adicionar = botao("+", "secundario botao-simbolo edicao-acao", "Adicionar produção", () => adicionarAlternativa(linha));
  linha.append(cabeca, alternativas, adicionar);
  elementos.linhas.appendChild(linha);
  atualizarDefinicao();
  if (!inicial) nome.focus();
}

function construirGramatica() {
  const modelo = new Gramatica();
  modelo.definirTerminais(elementos.terminais.value);
  for (const linha of linhas().slice(1)) {
    modelo.adicionarNaoTerminal(linha.querySelector(".nome-nao-terminal").value);
  }
  for (const linha of linhas()) {
    const nome = linha.querySelector(".nome-nao-terminal").value;
    for (const campo of linha.querySelectorAll(".producao")) {
      modelo.adicionarProducao(nome, campo.value);
    }
  }
  modelo.prepararSimulacao();
  return modelo;
}

function bloquearEdicao(bloquear) {
  bloqueada = bloquear;
  elementos.terminais.disabled = bloquear;
  elementos.linhas.querySelectorAll("input").forEach((campo) => {
    if (!campo.readOnly) campo.disabled = bloquear;
  });
  elementos.linhas.querySelectorAll(".edicao-acao").forEach((item) => item.classList.toggle("oculto", bloquear));
  elementos.adicionar.classList.toggle("oculto", bloquear);
  elementos.simular.classList.toggle("oculto", bloquear);
  elementos.editar.classList.toggle("oculto", !bloquear);
}

function renderizarCadeia() {
  elementos.cadeia.replaceChildren();
  cadeia.forEach((parte, indice) => {
    if (parte.tipo === "nao-terminal") {
      const item = botao(parte.valor, "nao-terminal", `Derivar ${parte.valor}`, () => escolherNaoTerminal(indice));
      item.setAttribute("aria-pressed", String(selecionado === indice));
      elementos.cadeia.appendChild(item);
    } else {
      const item = document.createElement("span");
      item.textContent = parte.valor;
      elementos.cadeia.appendChild(item);
    }
  });
  const concluida = !cadeia.some((parte) => parte.tipo === "nao-terminal");
  elementos.resultado.classList.toggle("oculto", !concluida);
  if (concluida) {
    const palavra = cadeia.map((parte) => parte.valor).join("");
    elementos.cadeia.textContent = palavra || EPSILON;
    elementos.resultado.textContent = `Derivação concluída. Palavra gerada: ${palavra || EPSILON}`;
  }
}

function escolherNaoTerminal(indice) {
  selecionado = indice;
  const nome = cadeia[indice].valor;
  elementos.opcoes.replaceChildren();
  const rotulo = document.createElement("span");
  rotulo.textContent = `${nome} →`;
  elementos.opcoes.appendChild(rotulo);
  gramatica.obterProducoes(nome).forEach((producao) => {
    elementos.opcoes.appendChild(botao(producao || EPSILON, "secundario", `Aplicar ${nome} → ${producao || EPSILON}`, () => {
      const caracteres = producao === EPSILON ? [] : Array.from(producao);
      const substituicao = caracteres.map((valor) => ({
        tipo: gramatica.obterNaoTerminais().includes(valor) ? "nao-terminal" : "terminal", valor,
      }));
      cadeia.splice(indice, 1, ...substituicao);
      selecionado = null;
      elementos.opcoes.classList.add("oculto");
      renderizarCadeia();
    }));
  });
  elementos.opcoes.classList.remove("oculto");
  renderizarCadeia();
}

function reiniciar() {
  cadeia = [{ tipo: "nao-terminal", valor: gramatica.inicial }];
  selecionado = null;
  elementos.opcoes.classList.add("oculto");
  elementos.resultado.classList.add("oculto");
  renderizarCadeia();
}

elementos.terminais.addEventListener("input", atualizarDefinicao);
elementos.adicionar.addEventListener("click", () => adicionarLinha());
elementos.simular.addEventListener("click", () => {
  try {
    gramatica = construirGramatica();
    elementos.linhas.querySelectorAll(".producao").forEach((campo) => {
      if (campo.value === "") campo.value = EPSILON;
    });
    bloquearEdicao(true);
    elementos.area.classList.remove("oculto");
    reiniciar();
    informar("Gramática válida. Escolha uma produção para iniciar a derivação.", "sucesso");
  } catch (erro) {
    informar(erro.message, "erro");
  }
});
elementos.editar.addEventListener("click", () => {
  if (!bloqueada) return;
  bloquearEdicao(false);
  elementos.area.classList.add("oculto");
  gramatica = null;
  informar("Edite a gramática e clique em Simular novamente.");
});
elementos.reiniciar.addEventListener("click", reiniciar);

adicionarLinha(true);
