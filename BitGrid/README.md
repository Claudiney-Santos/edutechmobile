[1]: #cursor
[2]: #switch
[3]: #seleção-de-bits
[4]: #operadores-lógicos

# BitGrid

## O que é BitGrid?
  BitGrid é uma linguagem esotérica criada por mim (Claudiney Santos). Ela se baseia numa grade de bits com, teoricamente, infinitas colunas e infinitas linhas.

## Conceitos fundamentais:
  - ### Bit:
    Um bit é a menor unidade de informação que computador pode usar. Ele pode ter dois valores: 0 ou 1.

  - ### Cursor:
    Na execução de um script há um cursor, e ele é a base para que seja possível modicar a grade. Visualmente o cursor é identificado por uma borda preta ao redor de um bit.
    É possível mover o cursor pelos comandos:
      - `>` _(maior que)_;
      - `<` _(menor que)_;
      - `^` _(acento circunflexo)_;
      - `v` _(v)_.

    _Obs: No ínicio da execução, o cursor se encontra no índice (0, 0)._
    
    _PS: O termo "bit atual" irá se referir ao bit onde o cursor está._

  - ### Switch:
    Inicialmente todos os bits possuem valor 0, e para alterá-los é utilizado o comando `!` (SWITCH), que inverte o valor do [bit atual][1];
    se o bit for 0 ele se torna 1, e se for 1 ele se torna 0.

  - ### Seleção de Bits:
    Também é possível selecionar bits para usar comandos mais complexos, como os [operadores lógicos][4]. Para selecionar o [bit atual][1], é utilizado o comando `.` (SELECT).
    Caso o bit já esteja selecionado, ele será retirado da seleção. Visualmente um bit selecionado fica com o fundo amarelo.
    Para retirar todos os bits selecionados da seleção, usá-se o comando `,` (CLEAR SELECTION).

  - ### Comentários:
    Qualquer comando entre duas `"` (aspas duplas) será ignorado.

## Conceitos Intermediários:
  - ### Operadores Lógicos:
    Os operadores lógicos analisam os [bits selecionados][2] e se eles seguirem a condição do operador é aplicado o comando `!` [(SWITCH)][2] no [bit atual][1].
    OPERADOR | NOME | CONDIÇÃO
    :---: | :---: | :---
    `&` | AND | Se todos os bits selecionados forem iguais a 1
    `\|` | OR | Se pelo menos um dos bits selecionados for igual a 1

  - ### Input:
    Por meio do comando `i` (INPUT) é possível requesitar que o usuário digite um caractere, ou nenhum, e o armazene nos [bits selecionados][3].

  - ### Output:
    Por meio do comando `o` (OUTPUT) é possível exibir o caractere, em UTF-8, referente ao valor dentro dos [bits selecionados][3].

  - ### Loops:
    Loops são demarcados por dois comandos:
      - `[` (START LOOP);
      - `]` (END LOOP).

    Serão executados os comandos entre `[` e `]` enquanto o [bit atual][1] for igual a 1.
    A análise do [bit atual][1] é feita ao tentar adentrar no loop, pelo comando `[`, e ao tentar sair do loop, pelo comando `]`.

    _Obs: O bit atual ao sair do loop não precisa ser necessáriamente o bit atual que entrou no loop._

## Exemplo:
  - ### 1 + 1:
    ```
    "valor 1:" .i,
    >
    "valor 2:" .i,
    <

    .>.>
    !&>|<<<^&,>>v.>.<<^&
    ,>v.&,>.&,
    <<<^.>.>
    ```
    Este script pede ao usuário que digite um caractere na área de input, mas, como há apenas um bit selecionado, será salvo apenas o último bit do caractere convertido para
    binário.

    Exemplos de Input:
      - "0" --> 0011000\[0]
      - "1" --> 0011000\[1]
      - "2" --> 0011001\[0]
      - "3" --> 0011001\[1]
      - "a" --> 0110000\[1]
      - " " --> 0010000\[0]
      - "" --> 0000000\[0]

    Depois que os inputs são salvos, o programa compara os dois bits e, no dígito da unidade, verifica se os bits são diferentes, se forem o bit atual é invertido, e em seguida,
    no dígito da dezena, compara se os dois bits do input são iguais a 1, se forem o bit atual é invertido.

     Dessa forma é realizada a conta 1 + 1, ou 1 + 0, ou 0 + 1, ou 0 + 0, e são selecionados os bits da dezena e da unidade para maior destaque visual.
  - Há mais scripts prontos na pasta [códigos-bitgrid](./codigos-bitgrid).
