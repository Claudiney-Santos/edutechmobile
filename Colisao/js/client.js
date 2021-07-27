window.onload = () => {
    const canvas = document.getElementById('tela');
    const jogo = new Jogo(canvas);

    const teclasMovimento = [
        ['ArrowUp', 'w'],   // Cima
        ['ArrowLeft', 'a'], // Esquerda
        ['ArrowDown', 's'] ,// Baixo
        ['ArrowRight', 'd'] // Direita
    ]
    jogo.sistema.criarJogador(teclasMovimento, 0, 0, 50, 50, 10);
    const caixas = [
        [100, 100, 50, 50, 0],
        [400, 60, 50, 50, 0]
    ];
    const paredes = [
        [250, 250, 10, 100],
        [400, 120, 10, 200]
    ];
    for(const caixa of caixas) {
        jogo.sistema.criarElementoMovivel(caixa[0], caixa[1], caixa[2], caixa[3], caixa[4], caixa[5]);
    };
    for(const parede of paredes) {
        jogo.sistema.criarElemento(parede[0], parede[1], parede[2], parede[3], parede[4]);
    };
    jogo.init(10);
};