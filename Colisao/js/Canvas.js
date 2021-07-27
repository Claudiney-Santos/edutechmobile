class Canvas {
    constructor(canvas) {
        this._element = canvas;
        this._ctx = canvas.getContext('2d');
    };

    get element() {
        return this._element;
    };

    set element(canvas) {
        this._element = canvas;
        this._ctx = canvas.getContext('2d');
    };

    get backgroundColor() {
        return this._element.style.backgroundColor;
    };

    set backgroundColor(cor) {
        this._element.style.backgroundColor = cor;
        this.clearScreen();
    };

    get color() {
        return this._element.style.backgroundColor;
    };

    set color(cor) {
        this._element.style.color = cor;
    };

    fillRect(x, y, largura, altura, cor) {
        if(typeof(cor) !== 'string')
            cor = this._element.style.color;
        this._ctx.fillStyle = cor;
        this._ctx.fillRect(x, y, largura, altura);
    };

    clearScreen() {
        this._ctx.clearRect(0, 0, this._element.width, this._element.height);
    };

    fillCirc(x, y, raio, cor) {
        if(typeof(cor) !== 'string')
            cor = this._element.style.color;
        this._ctx.fillStyle = cor;
        this._ctx.beginPath();
        this._ctx.arc(x, y, raio, 0, 2*Math.PI);
        this._ctx.fill();
    };

    strokeEllipse(x, y, raioX, raioY, rotacao, anguloInicial, anguloFinal, ehAntiHorario) {
        this._ctx.beginPath();
        this._ctx.ellipse(x, y, raioX, raioY, rotacao, anguloInicial, anguloFinal, ehAntiHorario);
        this._ctx.stroke();
    };

    lineFromTo(x1, y1, x2, y2, cor) {
        const corAnterior = this._ctx.strokeStyle;
        if(cor === undefined)
            cor = corAnterior;
            
        this._ctx.strokeStyle = cor;
        this._ctx.beginPath();
        this._ctx.moveTo(x1, y1);
        this._ctx.lineTo(x2, y2);
        this._ctx.stroke();
        this._ctx.strokeStyle = corAnterior;
    };

    bezierCurveFromTo(x1, y1, control1x, control1y, control2x, control2y, x2, y2) {
        this._ctx.beginPath();
        this._ctx.moveTo(x1, y1);
        this._ctx.bezierCurveTo(control1x, control1y, control2x, control2y, x2, y2);
        this._ctx.stroke();
    };

    atualizarTela() {};
};
