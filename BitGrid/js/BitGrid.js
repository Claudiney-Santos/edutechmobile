class BitGrid {
    constructor(config) {
        this.script = '';

        this._config = {
            commentChar: '"',
            columns: 1000,
            rows: 1000,
            defaultValue: false,
            ignoreErrors: false,
            loopsLimit: 10
        };
        this._errorMessages = {
            'Range': {
                'index<0': '%0 index cannot be lower than zero!',
                'loopsLimit': `This program has exceeded the limit of active loops (${this._config.loopsLimit} loops)!`
            },
            'Syntax': {
                'open': 'There is an open %0!'
            },
            'Internal': {
                'notPairGroup': '"%0" is not in this._runtime.charPosition!'
            }
        };

        this._modules = {};
        this._error = {};
        this._runtime = {};
        this._grid = {};
        this.resetAll();
    };

    get grid() {
        return Object.assign([], this._grid);
    };

    get error() {
        return Object.assign({}, this._error);
    };

    get currentChar() {
        return this._runtime.currentChar;
    };

    set currentChar(index) {
        this._runtime.currentChar = index;
    };

    /**
     * @param {string} input
     */
    set input(input) {
        this._runtime.input = input;
    };

    get defaultValue() {
        return this._config.defaultValue;
    };

    get requestInput() {
        return this._runtime.requestInput;
    };

    get output() {
        return this._runtime.output;
    };

    get thereIsOutput() {
        return this._runtime.thereIsOutput;
    };

    get isComplete() {
        return this._runtime.isComplete;
    }

    get modules() {
        return this._modules;
    };

    set modules(module) {
        if(typeof(module) === 'object' && !Array.isArray(module))
            this._modules = new Object.assign({}, module);
        else
            throw new TypeError(`Module "${module}" is not an object with keys!`);
    };

    resetGrid() {
        this._grid = {
            array: [],
            selectedCells: [],
            x: 0,
            y: 0
        }
        const gridArray = [];

        for(let y=0; y<this._config.rows; y++) {
            gridArray[y] = [];
            for(let x=0; x<this._config.columns; x++) {
                gridArray[y].push(this._config.defaultValue);
            };
        };

        this._grid.array = gridArray;
    };

    resetError() {
        this._error = {
            hasAny: false,
            type: undefined,
            title: undefined,
            message: undefined,
            position: { x: undefined, y: undefined },
            char: undefined
        };
    };

    resetRuntime() {
        this._runtime = {
            input: undefined,
            requestInput: false,
            output: undefined,
            thereIsOutput: false,
            currentChar: 0,
            currentLoops: 0,
            isComplete: false,
            charPosition: {
                '[]': [],
                '{}': []
            }
        };
    };

    resetAll() {
        this.resetGrid();
        this.resetError();
        this.resetRuntime();
    };

    addModule(name, script) {
        this._modules[name] = script;
    };

    removeModule(name) {
        delete this._modules[name];
    };

    _lookForPairCharsIn(string) {
        const charPosition = this._runtime.charPosition;
        const tempOpen = {};
        for(let char in charPosition) {
            tempOpen[char] = [];
            for(let i=0; i<string.length; i++) {
                switch(string[i]) {
                    case char[0]:
                        tempOpen[char].push(i);
                        break;
                    case char[1]:
                        if(tempOpen[char].length === 0)
                            this._triggerError('Syntax', 'open', `"${char[1]}"`);
                        else
                            charPosition[char].push([tempOpen[char].splice(-1)[0], i]);
                        break;
                };
            };
            if(tempOpen[char].length > 0)
                this._triggerError('Syntax', 'open', `"${char[0]}"`);
        };
    };

    start(steps, forceSteps)  {
        this.resetAll();
        return this.run(0, steps, forceSteps);
    };

    run(startChar, steps, forceSteps) {
        if(this._runtime.isComplete)
            this.resetAll();
        const commentChar = this._config.commentChar;
        const whitespaces = /\s/g;
        const comments = new RegExp(
            `${commentChar}[^${commentChar}]*${commentChar}`,
            'g');
        const modules = new RegExp(
            '(\{\w*:?[^:]*:?[]\})',
            'g');
        const script = this.script.
            replace(whitespaces, '').
            replace(comments, '');
        if(typeof(startChar) !== 'number')
            startChar = isNaN(Number(startChar)) ? 0 : Number(startChar);
        if(typeof(steps) !== 'number')
            steps = isNaN(Number(steps)) ? script.length-startChar : Number(steps);
        
        if(forceSteps === undefined)
            forceSteps = false;

        console.log(script);
        this._lookForPairCharsIn(script);

        if(script.indexOf(commentChar) > -1)
            this._triggerError('Syntax', 'open', 'comment');
        this._runtime.currentChar = startChar;
        
        let temInput = this._runtime.requestInput;
        this._runtime.requestInput = false;
        this._runtime.thereIsOutput = false;
        while(steps>0) {
            if(this._runtime.currentChar >= script.length)
                break;
            const char = script[this._runtime.currentChar].toLowerCase();

            if(this._error.hasAny && !this._config.ignoreErrors)
                break;

            let ehComando = true;
            switch(char) {
                case '^':
                    this._moveUp();
                    break;
                case '<':
                    this._moveLeft();
                    break;
                case 'v':
                    this._moveDown();
                    break;
                case '>':
                    this._moveRight();
                    break;
                case '!':
                    this._switchCurrentCell();
                    break;
                case '.':
                    this._switchSelectionInCurrentCell();
                    break;
                case ',':
                    this._unselectAllCells();
                    break;
                case '&':
                    this._andOperator();
                    break;
                case '|':
                    this._orOperator();
                    break;
                case 'i':
                    if(temInput) {
                        temInput = false;
                        this._getInput();
                    } else {
                        this._runtime.requestInput = true;
                        return;
                    };
                    break;
                case 'o':
                    this._output();
                    this._runtime.thereIsOutput = true;
                    return;
                case '[':
                    const beforeOpenLoop = this._runtime.currentChar;
                    this._loop(true);
                    const afterOpenLoop = this._runtime.currentChar;
                    steps -= forceSteps ? 0 : afterOpenLoop - beforeOpenLoop;
                    break;
                case ']':
                    const beforeEndLoop = this._runtime.currentChar;
                    this._loop(false);
                    const afterEndLoop = this._runtime.currentChar;
                    steps += forceSteps ? 0 : beforeEndLoop - afterEndLoop;
                    break;
                default:
                    ehComando = false;
                    break;
            };

            if(this._error.hasAny && !this._config.ignoreErrors)
                break;

            if(ehComando)
                steps--;
            this._runtime.currentChar++;
        };
        
        if(this._runtime.currentChar >= script.length)
            this._runtime.isComplete = true;

        return Object.assign({}, this._error);
    };

    _moveUp() {
        this._grid.y++;
        while(this._grid.array.length <= this._grid.y) {
            const newRow = [];

            for(let x=0; x<this._grid.array[0].length; x++) {
                newRow[x] = this._config.defaultValue;
            };

            this._grid.array.push(newRow);
        };
    };

    _moveLeft() {
        this._grid.x--;
        if(this._grid.x < 0) {
            this._triggerError('Range', 'index<0', 'X');
        };
    };

    _moveDown() {
        this._grid.y--;
        if(this._grid.y < 0) {
            this._triggerError('Range', 'index<0', 'Y');
        };
    };

    _moveRight() {
        this._grid.x++;
        while(this._grid.array[0].length <= this._grid.x) {
            for(let y=0; y < this._grid.array.length; y++) {
                this._grid.array[y].push(this._config.defaultValue);
            };
        };
    };

    _switchCurrentCell() {
        this._grid.array[this._grid.y][this._grid.x] = !this._grid.array[this._grid.y][this._grid.x];
    };

    _switchSelectionInCurrentCell() {
        const indice = indexSubInArray([this._grid.x, this._grid.y], this._grid.selectedCells);
        if(indice > -1) {
            this._grid.selectedCells.splice(indice, 1);
        } else
            this._grid.selectedCells.push([this._grid.x, this._grid.y]);
    };

    _unselectAllCells() {
        this._grid.selectedCells = [];
    };

    _andOperator() {
        if(this._grid.selectedCells.length === 0)
            return;
        const celulas = this._grid.selectedCells;
        const grade = this._grid.array;
        
        let condicao = true;
        for(let i=0; i<celulas.length; i++) {
            const cel = { x: celulas[i][0], y: celulas[i][1] };
            if(!grade[cel.y][cel.x]) {
                condicao = false;
                break;
            };
        };

        if(condicao) {
            grade[this._grid.y][this._grid.x] = !grade[this._grid.y][this._grid.x];
        };

        return;
    };

    _orOperator() {
        if(this._grid.selectedCells.length === 0)
            return;
        const celulas = this._grid.selectedCells;
        const grade = this._grid.array;

        let condicao = false;
        for(let i=0; i<celulas.length; i++) {
            const cel = { x: celulas[i][0], y: celulas[i][1] };
            if(grade[cel.y][cel.x]) {
                condicao = true;
                break;
            };
        };

        if(condicao) {
            grade[this._grid.y][this._grid.x] = !grade[this._grid.y][this._grid.x];
        };

        return;
    };

    _getInput() {
        const selectedCells = this._grid.selectedCells;
        const binary = this._runtime.input.charCodeAt().toString(2);
        const grid = this._grid.array;

        for(let i=0; i<binary.length; i++) {
            const b = binary.length-1-i;
            const s = selectedCells.length-1-i;

            if(s<0)
                break;
            
            const coord = {x: selectedCells[s][0], y: selectedCells[s][1]};

            //grid[coord.y][coord.x] = binary[b] == '1' ? true : false;
            if(binary[b] == '1') 
                grid[coord.y][coord.x] = !grid[coord.y][coord.x];
        };
    };

    _output() {
        const selectedCells = this._grid.selectedCells;
        const grid = this._grid.array;

        let binary = '';
        for(let i=0; i<selectedCells.length; i++) {
            const coord = { x: selectedCells[i][0], y: selectedCells[i][1] };

            binary += grid[coord.y][coord.x] ? '1' : '0';
        };
        const char = String.fromCharCode(parseInt(binary, 2));
        this._runtime.output = char;
    };

    _loop(isStart) {
        const currentBit = this._grid.array[this._grid.y][this._grid.x];
        const index = isStart ? 0 : 1;
        const logic = isStart ? !currentBit : currentBit;

        if(logic) {
            /*if(this._runtime.currentLoops > this._config.loopsLimit)
                this._triggerError('Range', 'loopsLimit');*/
            this._gotoRespectiveChar('[]', index);
        }/* else
            this._runtime.currentLoops += isStart ? 1 : -1*/;
    };

    _gotoRespectiveChar(group, index) {
        const charPosition = this._runtime.charPosition;
        const retorno = index === 0 ? 1 : 0;

        for(let i=0; i<charPosition[group].length; i++) {
            if(charPosition[group][i][index] === this._runtime.currentChar) {
                this._runtime.currentChar = charPosition[group][i][retorno];
                return;
            };
        };
        const message = `It was not possible to find the respective char to "${group[index]}", "${group[retorno]}" at ${this._runtime.currentChar}`;
        throw new ReferenceError(message);
    };

    _triggerError(type, extras, variables) {
        this._error.hasAny = true;
        this._error.type = type;
        this._error.position.x = this._grid.x;
        this._error.position.y = this._grid.y;
        this._error.char = this._runtime.currentChar;

        const title = `${type}Error`;
        let message = this._errorMessages[type][extras];

        if(variables !== undefined) {
            if(Array.isArray(variables)) {
                for(let i=0; i<variables.length; i++) {
                    message = message.replace(`%${i}`, variables[i]);
                };
            } else if(typeof(variables) === 'object') {
                for(key in variables) {
                    message = message.replace(key, variables[key]);
                };
            } else {
                message = message.replace('%0', variables);
            }
        };

        this._error.title = title;
        this._error.message = message;
    };
};
