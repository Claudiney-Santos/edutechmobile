class Sistema {
    get turno() {
        return this._turno;
    };

    reset() {
        const baralho = [];
        while(baralho.length < 11) {
            let carta;
            do
                carta = Math.floor(Math.random()*11)+1;
            while(baralho.includes(carta));
            baralho.push(carta);
        };

        this._baralho = baralho;
        this._compras = [];
        this._turno = Math.round(Math.random());
        this._skips = 0;
    };

    init() {
        this.reset();
        for(let i=0;i<4;i++) {
            this._compras.push(this._turno);
            this._nextPlayer();
        };
    };

    get acabou() {
        return this._skips >= 3;
    };

    play(index, action) {
        if(this.acabou || index !== this._turno) return;
        let carta;
        if(action.toLowerCase() === 'hit' && this.somaDe(index) <= 21) {
            this._compras.push(index);
            this._skips = 0;
            carta = this._baralho[this._compras.length-1];
        } else
            this._skips++;
        this._nextPlayer();
        return carta;
    };

    cartasDe(index) {
        const cartas = [];
        for(let i=0;i<this._compras.length;i++) {
            if(this._compras[i] !== index) continue;
            cartas.push(this._baralho[i]);
        };
        return cartas;
    };

    somaDe(index) {
        return this.cartasDe(index).reduce((soma, carta) => { return soma + carta; });
    };

    get vencedor() {
        const soma = [];
        for(let i=0;i<2;i++) 
            soma.push(this.somaDe(i));
        const venceu = [];
        for(let i=0;i<2;i++) {
            const j = Number(!i);
            venceu[i] = soma[i] <= 21 && (soma[i] > soma[j] || soma[j] > 21);
        };
        let vencedor;
        if(venceu[0] === venceu[1])
            vencedor = 2;
        else if(venceu[0])
            vencedor = 0;
        else if(venceu[1])
            vencedor = 1;
        return vencedor
    };

    _nextPlayer() {
        this._turno = Number(!this._turno);
    };
};

class Visual {
    constructor(delay, divJogador, divOponente, estado) {
        this.div = {
            jogador: divJogador,
            oponente: divOponente,
            estado: estado
        };
        this.delay = delay;
    };

    reset() {
        for(const player of ['jogador', 'oponente']) {
            while(this.div[player].lastChild)
                this.div[player].removeChild(this.div[player].lastChild);
        };
    };

    atualizarEstado(estado) {
        let mensagem = estado % 2 === 0 ? 'Jogador' : 'Oponente';
        mensagem += ' ';

        if(estado === -1)
            mensagem = 'Ninguém está jogando'
        else if(estado < 2)
            mensagem += 'está jogando';
        else if(estado < 4)
            mensagem += 'comprou uma carta';
        else if(estado < 6)
            mensagem += 'pulou'
        else if(estado < 8)
            mensagem += 'venceu';
        else
            mensagem = 'Empate';
        mensagem += '!';
        this.div.estado.innerText = mensagem;
    };

    exibirCartasOcultas(cartasJogador, cartasOponente) {
        const cartas = {
            jogador: cartasJogador,
            oponente: cartasOponente
        };
        for(const player of ['jogador', 'oponente']) {
            const divCartas = this.div[player].children;
            for(let i=0;i<divCartas.length;i++) {
                const carta = divCartas[i];
                if(carta.classList.contains('carta-oculta')) {
                    carta.classList.remove('carta-oculta');
                    carta.innerText = cartas[player][i];
                };
            };
        };
    };

    atualizarMao(player, carta) {
        return new Promise(async resolve => {
            const animationDuration = this.delay/2;
            if(carta === undefined)
                setTimeout(resolve, animationDuration/2);
            else {
                const div = this.div[player];

                const spanCarta = document.createElement('span');
                div.appendChild(spanCarta);
                spanCarta.innerText = carta;
                spanCarta.classList.add('carta');
                spanCarta.style.animationDuration = animationDuration + 'ms';

                const delay = new Promise(resolve => {
                    spanCarta.addEventListener('animationend', resolve);
                });
                await delay;
                resolve();
            };
        });
    };

    async init(cartasJogador, cartasOponente) {
        this.reset();
        this.atualizarEstado(-1);
        const cartas = {
            oponente: cartasOponente,
            jogador: cartasJogador
        };

        const animationDuration = this.delay/2;
        for(let i=0;i<2;i++) {
            for(const player in cartas) {
                let carta;
                const jogada = new Promise(resolve => {
                    carta = document.createElement('span');
                    this.div[player].appendChild(carta);

                    carta.classList.add('carta');
                    carta.style.animationDuration = animationDuration + 'ms';
                    if(i === 0)
                        carta.classList.add('carta-oculta');
                    carta.innerText = i === 1 || player === 'jogador' ? cartas[player][i] : '?';
                    carta.addEventListener('animationend', resolve);
                });
                await jogada;
            };
        };

        const delayFinal = new Promise(resolve => {
            setTimeout(resolve, this.delay/2);
        });
        await delayFinal;
    };
};

class Jogo {
    constructor(delay, divJogador, divOponente, estado) {
        this._sistema = new Sistema();
        this._visual = new Visual(delay, divJogador, divOponente, estado);
    };

    get turno() {
        return this._sistema.turno;
    };

    get acabou() {
        return this._sistema.acabou;
    };

    get cartasDoJogadorAtual() {
        return this._sistema.cartasDe(this._sistema.turno);
    };

    get cartasVisiveisDoOutroJogador() {
        return this._sistema.cartasDe(Number(!this._sistema.turno)).slice(1);
    };

    atualizarEstado() {
        this._visual.atualizarEstado(this.turno);
    };

    fim() {
        const vencedorIndex = this._sistema.vencedor;
        this._visual.atualizarEstado(6+vencedorIndex);
        this._visual.exibirCartasOcultas(this._sistema.cartasDe(0), this._sistema.cartasDe(1));
        
    };

    async jogada(jogada) {
        const turno = this.turno;
        const carta = this._sistema.play(turno, jogada);
        const estado = turno + (carta ? 2 : 4);
        this._visual.atualizarEstado(estado);
        const delay = new Promise(resolve => {
            this._visual.atualizarMao(turno ? 'oponente' : 'jogador', carta)
            .then(() => {
                setTimeout(resolve, this._visual.delay/2);
            });
        });
        await delay;
    };

    async init() {
        this._sistema.init();
        await this._visual.init(this._sistema.cartasDe(0), this._sistema.cartasDe(1));
    };
};
