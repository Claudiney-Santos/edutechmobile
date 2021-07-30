class Ia {
    constructor(delay) {
        this.delay = delay;
    };

    async jogada(cartasIa, cartasJogador) {
        const soma = cartasIa.reduce( (sum, index) => { return sum + index; });
        let acao = 'skip';
        if(soma <= 21) {
            const baralho = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

            for(const cartas of [cartasIa, cartasJogador]) {
                for(let i=0;i<cartas.length;i++) {
                    for(let j=0;j<baralho.length;j++) {
                        if(cartas[i] === baralho[j])
                            baralho.splice(j, 1);
                    };
                };
            };

            let derrota = 0;
            for(let i=0;i<baralho.length;i++) {
                if(baralho[i] + soma > 21)
                    derrota++;
            };
            const chanceDeDerrota = derrota/baralho.length;
            if(chanceDeDerrota <= 0.6)
                acao = 'hit';
        };
        return new Promise(resolve => {
            setTimeout(resolve, this.delay, acao);
        });
    };
};

window.onload = () => {
    const delay = 1000;
    const btn = {
        start: document.getElementById('comecar-jogo'),
        hit: document.getElementById('comprar-carta'),
        skip: document.getElementById('pular-jogada')
    };
    const jogo = new Jogo(
        delay,
        document.getElementById('cartas-jogador'),
        document.getElementById('cartas-oponente'),
        document.getElementById('status')
    );
    const ia = new Ia(delay/1.25);

    const jogadorJogada = async cartas => {
        soma = cartas.reduce( (sum, index) => { return sum + index; });
        acoes = {hit: undefined, skip: undefined};
        for(const acao in acoes) {
            acoes[acao] = new Promise(resolve => {
                const escolha = soma > 21 ? 'skip' : acao;
                btn[acao].onclick = () => { resolve(escolha); };
            });
        };
        return Promise.race([acoes.hit, acoes.skip]);
    };

    btn.start.onclick = async () => {
        btn.start.classList.add('desativado');
        jogo.init()
        .then(async () => {
            while(!jogo.acabou) {
                jogo.atualizarEstado();
                await new Promise(async resolve => {
                    let jogada;
                    if(jogo.turno)
                        jogada = async (cartasOponente, cartasJogador) => {
                            return ia.jogada(cartasOponente, cartasJogador);
                        };
                    else {
                        for(let action of ['hit', 'skip'])
                            btn[action].classList.remove('desativado');
                        const soma = jogo.cartasDoJogadorAtual.reduce( (sum, index) => { return sum + index; });
                        if(soma > 21)
                            btn.hit.classList.add('desativado');
                        jogada = jogadorJogada;
                    };
                    await new Promise(resolve => {
                        jogada(jogo.cartasDoJogadorAtual, jogo.cartasVisiveisDoOutroJogador).
                        then( async action => {
                            for(let action of ['hit', 'skip'])
                                btn[action].classList.add('desativado');
                            await jogo.jogada(action);
                        }).then(() => {
                            resolve();
                        });
                    });
                    resolve();
                });
            };
            jogo.fim();
            btn.start.classList.remove('desativado');
        });
    };
};