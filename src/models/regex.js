function verificaParenteses(entrada) {
  let cont = 0;
  for (let i = 0; i < entrada.length && cont >= 0; i++) {
    if (entrada[i] == "(") {
      cont++;
    } else if (entrada[i] == ")") {
      cont--;
    }
  }

  return cont == 0;
}

function ehSimboloDigito(simbolo) {
  if (simbolo >= "a" && simbolo <= "z") {
    return true;
  } else if (simbolo >= "A" && simbolo <= "Z") {
    return true;
  } else if (simbolo >= "0" && simbolo <= "9") {
    return true;
  } else if (simbolo == "ε") {
    return true;
  } else {
    return false;
  }
}

function ehParenteses(operador) {
  if (operador == "(" || operador == ")") {
    return true;
  } else return false;
}

function ehOperador(operador) {
  if (
    operador == "|" ||
    operador == "*" ||
    operador == "." ||
    operador == "+"
  ) {
    return true;
  } else return false;
}

export function verifica(entrada) {
  let atual, proximo;
  if (!verificaParenteses(entrada)) {
    return false;
  }

  atual = entrada[0];
  if (ehSimboloDigito(atual) || ehParenteses(atual)) {
    if (entrada.length > 1) {
      for (let i = 1; i < entrada.length; i++) {
        proximo = entrada[i];
        if (ehSimboloDigito(atual)) {
          if (
            !ehOperador(proximo) &&
            proximo != ")" &&
            !ehSimboloDigito(proximo)
          ) {
            return false;
          }
        } else if (atual == "(" || (ehOperador(atual) && atual != "*")) {
          if (!ehSimboloDigito(proximo) && proximo != "(") {
            return false;
          }
        } else if (atual == ")" || atual == "*") {
          if (!ehOperador(proximo) && proximo != ")") {
            return false;
          }
        }
        atual = proximo;
      }
      if (atual == "|" || atual == "+" || atual == ".") {
        return false;
      }

      return true;
    } else {
      return true;
    }
  } else {
    return false;
  }
}

export function converterParaRegex(e) {
  e = e.replaceAll(".", "");
  e = e.replaceAll("+", "|");
  e = e.replaceAll("ε", "");

  return "^(" + e + ")$";
}
