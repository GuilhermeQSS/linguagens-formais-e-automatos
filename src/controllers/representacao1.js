import { verifica, converterParaRegex } from "../models/regex.js";

const entrada = document.querySelector("#regex");
const botao = document.querySelector("#simulateButton");
const limpar = document.querySelector("#clearButton");

const status = document.querySelector("#status");
const conversion = document.querySelector("#conversion");
const convertedRegex = document.querySelector("#convertedRegex");

const recognition = document.querySelector("#recognition");
const word = document.querySelector("#word");
const testButton = document.querySelector("#testButton");

const tests = document.querySelector("#tests");
const counter = document.querySelector("#counter");
const clearTests = document.querySelector("#clearTests");

let regexAtual = null;
let expressaoAtual = "";
let quantidadeTestes = 0;

botao.addEventListener("click", () => {
  const expressao = entrada.value;

  if (verifica(expressao)) {
    const regex = converterParaRegex(expressao);

    regexAtual = new RegExp(regex);
    expressaoAtual = expressao;

    status.textContent = "Expressão válida.";
    status.className = "status valid";

    convertedRegex.textContent = regex;
    conversion.classList.remove("hidden");

    recognition.classList.remove("hidden");
  } else {
    status.textContent = "Expressão inválida.";
    status.className = "status invalid";

    conversion.classList.add("hidden");
    recognition.classList.add("hidden");

    regexAtual = null;
    expressaoAtual = "";
  }
});

testButton.addEventListener("click", () => {
  const palavra = word.value;

  if (regexAtual === null) {
    return;
  }

  const aceita = regexAtual.test(palavra);

  const palavraExibida = palavra === "" ? "ε" : palavra;

  const item = document.createElement("div");

  item.className = "test-item";

  item.innerHTML = `
        <div>
            <div class="test-expression">
                Expressão: <code>${expressaoAtual}</code>
            </div>

             <div class="test-word">
                Palavra: <strong>${palavraExibida}</strong>
            </div>
        </div>

        <span class="${aceita ? "accepted" : "rejected"}">
            ${aceita ? "ACEITA" : "REJEITADA"}
        </span>
    `;

  tests.appendChild(item);

  quantidadeTestes++;

  counter.textContent =
    quantidadeTestes === 1 ? "1 teste" : `${quantidadeTestes} testes`;

  word.value = "";
  word.focus();
});

clearTests.addEventListener("click", () => {
  tests.innerHTML = "";

  quantidadeTestes = 0;

  counter.textContent = "0 testes";
});

limpar.addEventListener("click", () => {
  entrada.value = "";
  word.value = "";

  status.textContent = "Aguardando expressão.";
  status.className = "status neutral";

  conversion.classList.add("hidden");
  recognition.classList.add("hidden");

  convertedRegex.textContent = "";

  tests.innerHTML = "";

  quantidadeTestes = 0;
  counter.textContent = "0 testes";

  regexAtual = null;
  expressaoAtual = "";

  entrada.focus();
});

/* NAVEGAÇÃO */

const navRegex = document.querySelector("#navRegex");
const navAutomatos = document.querySelector("#navAutomatos");
const navGramatica = document.querySelector("#navGramatica");

const pageRegex = document.querySelector("#pageRegex");
const pageAutomatos = document.querySelector("#pageAutomatos");
const pageGramatica = document.querySelector("#pageGramatica");

function mudarPagina(pagina, botao) {
  pageRegex.classList.remove("active");
  pageAutomatos.classList.remove("active");
  pageGramatica.classList.remove("active");

  navRegex.classList.remove("active");
  navAutomatos.classList.remove("active");
  navGramatica.classList.remove("active");

  pagina.classList.add("active");
  botao.classList.add("active");
}

navRegex.addEventListener("click", () => {
  mudarPagina(pageRegex, navRegex);
});

navAutomatos.addEventListener("click", () => {
  window.location.href = "/representacao2";
});

navGramatica.addEventListener("click", () => {
  window.location.href = "/representacao3";
});
