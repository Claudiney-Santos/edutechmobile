class JogoSistema {
    constructor(canvas) {
        this._canvas = canvas;
        this._objects = {};
        this.resetConfig();
    };

    set canvas(canvas) {
        this._canvas = canvas;
    };

    get objetos() {
        const objetos = [];
        for(const id in this._objects) {
            const objeto = Object.assign({}, this._objects[id]);
            objetos.push(objeto);
        };
        return objetos;
    };

    resetConfig() {
        this._config = {
            idLength: 4
        };
    };

    criarElemento(x, y, largura, altura, cor='black') {
        const id = this._criarIdUnico();
        const elemento = new Elemento(x, y, largura, altura, cor);
        this._objects[id] = elemento;
    };

    criarElementoMovivel(x, y, largura, altura, res=0, cor='red') {
        const id = this._criarIdUnico();
        const elementoMovivel = new ElementoMovivel(x, y, largura, altura, res, cor);
        this._objects[id] = elementoMovivel;
    };

    criarJogador(teclasMovimento, x, y, largura, altura, vel=1, cor='blue') {
        const id = this._criarIdUnico();
        const jogador = new Jogador(x, y, largura, altura, vel, cor);

        jogador.moverCom(teclasMovimento);

        this._objects[id] = jogador;
    };

    atualizar(delta) {
        for(const id in this._objects) {
            const objeto = this._objects[id];
            if(objeto.ehMovivel)
                this._mover(delta, objeto);
        };
    };

    _mover(delta, objeto) {
        const TIME = delta/100;
        const velX = objeto.velFinal.x * TIME;
        const velY = objeto.velFinal.y * TIME;

        objeto.x += velX;
        objeto.y += velY;

        if(objeto.x < 0)
            objeto.x = 0;
        else if(objeto.x + objeto.largura >= this._canvas.width)
            objeto.x = this._canvas.width - objeto.largura - 1;

        if(objeto.y < 0)
            objeto.y = 0;
        else if(objeto.y + objeto.altura >= this._canvas.height)
            objeto.y = this._canvas.height - objeto.altura - 1;

        for(const id in this._objects) {
            const outroObjeto = this._objects[id];
            if(objeto === outroObjeto) continue;
            else if(this.haColisaoEntre(objeto, outroObjeto)) {
                if(outroObjeto.ehMovivel) {
                    const dir = objeto.x + objeto.largura >= outroObjeto.x && objeto.x + objeto.largura <= outroObjeto.x + outroObjeto.largura;
                    const esq = objeto.x <= outroObjeto.x + outroObjeto.largura && objeto.x >= outroObjeto.x;
                    const cim = objeto.y <= outroObjeto.y + outroObjeto.altura && objeto.y >= outroObjeto.y;
                    const bai = objeto.y + objeto.altura >= outroObjeto.y && objeto.y + objeto.altura <= outroObjeto.y + outroObjeto.altura;
                    let direita = (dir && (cim || bai)) && velX > 0;
                    let esquerda = (esq && (cim || bai)) && velX < 0;
                    let cima = (cim && (esq || dir)) && velY < 0;
                    let baixo = (bai && (esq || dir)) && velY > 0;
                    const velExternoAnterior = Object.assign({}, outroObjeto.velExterno);
                    
                    if(direita || esquerda) {
                        if(outroObjeto.velFinal.x === 0) {
                            outroObjeto.velExterno.x = objeto.velFinal.x;
                        };
                    };
                    if(cima || baixo) {
                        if(outroObjeto.velFinal.y === 0) {
                            outroObjeto.velExterno.y = objeto.velFinal.y;
                        };
                    };
                    if(velExternoAnterior.x !== outroObjeto.velExterno.x || velExternoAnterior.y !== outroObjeto.velExterno.y) {
                        this._mover(delta, outroObjeto);
                        outroObjeto.velExterno.x = velExternoAnterior.x;
                        outroObjeto.velExterno.y = velExternoAnterior.y;
                        if(this.haColisaoEntre(objeto, outroObjeto)) {
                            objeto.x -= velX;
                            if(!this.haColisaoEntre(objeto, outroObjeto)) continue;
                            objeto.x += velX;
                            objeto.y -= velY;
                            if(!this.haColisaoEntre(objeto, outroObjeto)) continue;
                            objeto.x -= velX;
                        };
                    };
                } else {
                    objeto.x -= velX;
                    if(!this.haColisaoEntre(objeto, outroObjeto)) continue;
                    objeto.x += velX;
                    objeto.y -= velY;
                    if(!this.haColisaoEntre(objeto, outroObjeto)) continue;
                    objeto.x -= velX;
                };
            };
        };
    };

    haColisaoEntre(obj1, obj2) {
        const obj = [obj1, obj2];
        let colisao = false;
        for(let i=0;i<2;i++) {
            const j = Number(!Boolean(i));
            const aresta = {
                x: [obj[i].x, obj[i].x + obj[i].largura],
                y: [obj[i].y, obj[i].y + obj[i].altura]
            };
            let colX = false;
            let colY = false;
            for(let k=0;k<2;k++) {
                if(aresta.x[k] >= obj[j].x && aresta.x[k] <= obj[j].x + obj[j].largura)
                    colX = true;
                if(aresta.y[k] >= obj[j].y && aresta.y[k] <= obj[j].y + obj[j].altura)
                    colY = true;
            };
            colisao = colX && colY;
            if(colisao)
                break;
        };
        return colisao;
    };

    _criarIdUnico() {
        let id;
        do {
            id = criarId(this._config.idLength);
        } while(id in this._objects);
        return id;
    };
};

class JogoVisual {
    constructor(canvas) {
        this._canvas = new Canvas(canvas);
    };

    get canvas() {
        return Object.assign({}, this._canvas.element);
    };

    set canvas(canvas) {
        this._canvas = new Canvas(canvas);
    };

    atualizar(objetos) {
        this._canvas.clearScreen();
        for(const objeto of objetos) {
            this._canvas.fillRect(objeto.x, objeto.y, objeto.largura, objeto.altura, objeto.cor);
        };
    };
};

class Jogo {
    constructor(canvas) {
        this.sistema = new JogoSistema(canvas);
        this.visual = new JogoVisual(canvas);
        this._loop = { lastExecution: 0 };
    };

    set canvas(canvas) {
        this.sistema.canvas = canvas;
        this.visual.canvas = canvas;
    };

    _main(delta) {
        this.sistema.atualizar(delta);
        this.visual.atualizar(this.sistema.objetos);
    };

    init(ms=100) {
        this._loop.lastExecution = Date.now();
        setInterval(() => {
            const inicio = Date.now();
            const delta = inicio - this._loop.lastExecution;
            this._loop.lastExecution = inicio;
            this._main(delta);
        }, ms);
    };

};

const criarId = quantidadeDeCaracteres => {
    let id = '';
    while(id.length < quantidadeDeCaracteres)
        id += Math.floor(Math.random()*0x10).toString(0x10);
    return id;
};