# Relatório do projeto — Simulador de Linguagens Formais e Autômatos

## 1. Descrição do projeto

O projeto é uma aplicação web para estudar três representações de linguagens: expressões regulares, autômatos finitos e gramáticas. O usuário pode testar palavras com expressões regulares, construir e simular autômatos e acompanhar a derivação de palavras em gramáticas.

Este relatório concentra-se na máquina implementada: o **autômato finito**, disponível nas modalidades determinística (AFD) e não determinística (AFND). A aplicação permite cadastrar e editar estados e transições, visualizar o diagrama e verificar a aceitação de uma ou várias palavras. Também oferece uma simulação passo a passo.

O projeto usa JavaScript, HTML e CSS. O servidor Express disponibiliza as páginas, e a biblioteca Cytoscape desenha o diagrama de estados e transições.

## 2. Funcionamento da máquina

Um autômato finito lê uma palavra símbolo por símbolo, a partir de um estado inicial. A palavra é aceita quando, após a leitura completa, a máquina está em um estado final.

No **AFD**, cada estado pode ter no máximo uma transição para cada símbolo e não há transições vazias. No **AFND**, diferentes caminhos podem ser possíveis para o mesmo símbolo e podem existir transições ε, percorridas sem consumir entrada.

Na interface, o usuário marca os estados inicial e final e informa a origem, o destino e os símbolos das transições. O programa verifica as regras antes de alterar o autômato.

## 3. Técnicas utilizadas

### Lista de adjacência

O modelo armazena os estados em uma lista. Cada estado guarda seu nome, as marcações de inicial e final e suas transições de saída. Cada transição contém origem, destino e símbolos. Durante o reconhecimento, essa estrutura permite consultar os caminhos disponíveis a partir dos estados atuais.

### Validação

O código impede nomes vazios ou repetidos para estados, limita o autômato a um estado inicial e exige estados de origem e destino válidos. Para AFDs, rejeita transições ε e símbolos repetidos nas saídas de um mesmo estado. Ao mudar de AFND para AFD, verifica se as transições existentes respeitam essas restrições.

### Reconhecimento por conjuntos de estados

A simulação mantém um conjunto de estados possíveis. Para cada símbolo da palavra, reúne os destinos alcançáveis pelas transições correspondentes. Ao fim, aceita a palavra se pelo menos um estado do conjunto é final. O mesmo procedimento atende AFDs e AFNDs.

### Fecho ε

No AFND, o programa calcula o *fecho ε*: os estados alcançáveis por zero ou mais transições ε, sem consumir um símbolo. Esse cálculo ocorre antes da leitura da palavra e depois de cada símbolo. Um conjunto de estados já visitados evita repetições em ciclos de transições ε.

### Visualização e execução passo a passo

O Cytoscape apresenta o autômato como um diagrama. A interface diferencia estados iniciais e finais e, na simulação passo a passo, destaca os estados possíveis após cada símbolo lido. Isso ajuda a relacionar o resultado do reconhecimento aos caminhos percorridos.

## 4. Estruturação do código

| Arquivo ou pasta | Responsabilidade |
| --- | --- |
| `src/models/automato.js` | Armazena estados e transições, valida operações e reconhece palavras. |
| `src/controllers/representacao2.js` | Processa ações do usuário, atualiza a interface e apresenta resultados. |
| `src/views/representacao2/` | Contém o HTML e o CSS da página de autômatos. |
| `src/index.js` | Configura o servidor Express e as rotas das páginas. |

As outras representações também possuem modelos, controladores e páginas próprios. Essa organização facilita localizar as regras de cada representação e modificar a interface sem concentrar toda a lógica em um arquivo.

## 5. Avaliação da solução

A solução atende ao objetivo didático. O usuário pode montar um autômato pela interface, corrigir seus elementos, testar palavras e acompanhar o reconhecimento por etapas. As validações ajudam a evitar configurações incompatíveis com um AFD, enquanto a visualização torna o comportamento do AFND mais fácil de entender.

Há pontos a melhorar:

- **Testes do autômato:** os testes automatizados existentes cobrem apenas o modelo de gramática. Seria útil testar palavra vazia, múltiplos caminhos, ciclos ε e a mudança de AFND para AFD.
- **Disponibilidade do diagrama:** a página carrega o Cytoscape de uma URL externa, portanto a visualização depende da disponibilidade desse recurso no navegador.
- **Descrição das gramáticas:** a navegação usa o nome “gramáticas regulares”, mas o modelo aceita produções mais gerais, com vários símbolos e não terminais em diferentes posições. O nome da página ou as regras aceitas devem ser ajustados para manter a descrição precisa.

## 6. Verificação

O comando `npm test` foi executado, e os quatro testes existentes passaram. Esses testes verificam casos do modelo de gramática; o resultado não substitui testes específicos de reconhecimento nos autômatos.

## 7. Conclusão

O projeto apresenta conceitos de linguagens formais de maneira interativa. A implementação do autômato usa uma estrutura simples para guardar transições, valida as regras do AFD e utiliza conjuntos de estados e fecho ε para simular AFNDs. A divisão entre modelos, controladores e páginas favorece a leitura e a manutenção do código. A principal melhoria recomendada é ampliar os testes automatizados para cobrir o comportamento da máquina.
