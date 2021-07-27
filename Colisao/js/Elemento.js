class Elemento {
    constructor(x, y, largura, altura, cor) {
        this.x = x;
        this.y = y;
        this.largura = largura;
        this.altura = altura;
        this.cor = cor;
        this._ehMovivel = false;
    };

    get ehMovivel() {
        return this._ehMovivel;
    };
}

class ElementoMovivel extends Elemento {
    constructor(x, y, largura, altura, res, cor) {
        super(x, y, largura, altura, cor);
        this._ehMovivel = true;
        this.tipo = 1;
        this._vel = {
            x: 0,
            y: 0
        };
        this._velExterno = {
            x: 0,
            y: 0
        };
        this.res = res;
    };
    
    set velX(vel) {
        this._vel.x = vel;
    };

    get velX() {
        return this._vel.x;
    };

    get velExterno() {
        return this._velExterno;
    };
    get velFinal() {
        return { x: (1-this.res)*(this._vel.x+this._velExterno.x), y: (1-this.res)*(this._vel.y+this._velExterno.y) };
    };

    set velY(vel) {
        this._vel.y = vel;
    };

    get velY() {
        return this._vel.y;
    };
};

class Jogador extends ElementoMovivel {
    constructor(x, y, largura, altura, vel, cor) {
        super(x, y, largura, altura, 0, cor);
        this._vel.global = vel;
        this._movimentacao = [false, false, false, false];
    };

    set vel(vel) {
        this._vel.global = vel;
    };

    get vel() {
        return this._vel.global;
    };

    
    atualizarMovimento() {
        const mov = this._movimentacao;
        const newVel = { x: undefined, y: undefined };

        if(mov[0] === mov[2])
            newVel.y = 0;
        else if(mov[0])
            newVel.y = -1;
        else if(mov[2])
            newVel.y = 1;

        if(mov[1] === mov[3])
            newVel.x = 0;
        else if(mov[1])
            newVel.x = -1;
        else if(mov[3])
            newVel.x = 1;
        
        const velTotal = Math.abs(newVel.x) + Math.abs(newVel.y);
        if(velTotal > 0) {
            for(const eixo of ['x', 'y']) {
                const sentido = newVel[eixo] < 0 ? -1 : 1;
                this._vel[eixo] = sentido*this._vel.global*Math.sqrt(Math.abs(newVel[eixo])/velTotal);
            };
        } else
            this._vel.x = this._vel.y = 0;
    };

    moverCom(teclas) {
        addEventListener('keydown', event => {
            for(let i=0;i<4;i++) {
                for(const tecla of teclas[i]) {
                    if(event.key === tecla) {
                        this._movimentacao[i] = true;
                        this.atualizarMovimento();
                        event.preventDefault();
                        break;
                    };
                };
            };
        });

        addEventListener('keyup', event => {
            for(let i=0;i<4;i++) {
                for(const tecla of teclas[i]) {
                    if(event.key === tecla) {
                        this._movimentacao[i] = false;
                        this.atualizarMovimento();
                        event.preventDefault();
                        break;
                    };
                };
            };
        });
    };
}
