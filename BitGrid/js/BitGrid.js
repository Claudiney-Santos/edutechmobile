class BitGrid {
    constructor(config) {
        this.script = '';

        this._config = {
            commentChar: '"',
            columns: 1000,
            rows: 1000,
            defaultValue: false,
            ignoreErrors: false,
            executionTimeLimit: 1000
        };
        this._errorMessages = {
            'Internal': {
                'notPairGroup': '"%0" is not in this._runtime.charPosition!',
                'module': 'There is an error in module "%0":\n%1'
            },
            'Range': {
                'index<0': '%0 index cannot be lower than zero!',
                'executionTimeLimit': `This program has exceeded the execution time limit (${this._config.executionTimeLimit}ms)!`
            },
            'Reference': {
                'moduleDoesNotExist': 'There is no module named "%0"'
            },
            'Syntax': {
                'open': 'There is an open %0!',
                'invalidModule': 'There is an invalid module, the correct syntax is:\n{name:before execution:after execution}'
            }
        };

        this._modules = {
            'true': '!>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>!<![!<!]!>![!^.v>!]!i<![!^!v<!]!o',
            'false': '!>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>!<![!<!]!>![!^.v>!]!io',
            'xor': '!^>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>v>!<![!<!]!>![!^.v>!]!i,<![!<!]!>![!^^!v[v<![!<!]!^!^>[>]v<!]>v!]!<![!<!]!^.o',
            'sum': '!>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>!<![!<!]!>![!^.v>!]!i^|,[!v<![!^.^.^^<&,>vv[!^!v]v[!^^!vv]^^.^.<&,>[!vv!^^]v[!v!^]vvv<!]!>![!^.v>!]!^i|,]v<![!<!]!>![!^^.vv>!]!o',
            'decimal-input': '^!>>>>>>>>>!<![!<!]![v.|>.|>.|>.|>.|<<<<i,[!>^^^.>.>.>.{sum:oooooooooo,<<<vv![!^.v>!]!o:i,}<![!<!]!>^^.|>.|>.|>.|,vv![!v[!^^^!vvv]<^!]!v>]^[>>]<]^^.>.>.>.{sum:o,[!]<[!]<[!]<[!]vv![!^.v>!]!o:<![!^[!]v<!]!i}o'
        };
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
        if(!Array.isArray(input))
            throw new TypeError(`Variable "input" must be an array, but it is "${typeof(input)}"`);
        const inputArray = [];
        for(let i=0; i<input.length;i++) {
            const bit = Number(input[i]);
            if(bit !== 0 && bit !== 1)
                throw new RangeError(`input[${i}] must be 0 or 1, but it is ${bit}`);
            inputArray[i] = bit;
        };
        this._runtime.input = inputArray;
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
        return Object.assign({}, this._modules);
    };

    set modules(module) {
        if(typeof(module) === 'object' && !Array.isArray(module))
            this._modules = Object.assign({}, module);
        else
            throw new TypeError(`Module "${module}" is not an object with keys!`);
    };

    resetGrid() {
        this._grid = {
            array: [],
            selectedCells: [],
            x: 0,
            y: 0
        };
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
            input: [],
            requestInput: false,
            output: [],
            thereIsOutput: false,
            currentChar: 0,
            isComplete: false,
            charPosition: {
                '[]': [],
                '{}': []
            },
            modules: []
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

    removeAllModules() {
        this._modules = {};
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
        const script = this.script.
            replace(whitespaces, '').
            replace(comments, '');
        if(typeof(startChar) !== 'number')
            startChar = isNaN(Number(startChar)) ? 0 : Number(startChar);
        if(typeof(steps) !== 'number')
            steps = isNaN(Number(steps)) ? script.length-startChar : Number(steps);
        
        if(forceSteps === undefined)
            forceSteps = false;

        this._runtime.modules = this._validateModules(script);
        this._lookForPairCharsIn(script);

        if(script.indexOf(commentChar) > -1)
            this._triggerError('Syntax', 'open', 'comment');
        this._runtime.currentChar = startChar;
        
        let temInput = this._runtime.requestInput;
        this._runtime.requestInput = false;
        this._runtime.thereIsOutput = false;
        const executionBegin = performance.now();
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
                    this._runtime.currentChar++;
                    return;
                case '[':
                    ehComando = false;
                    const beforeOpenLoop = this._runtime.currentChar;
                    this._loop(true);
                    const afterOpenLoop = this._runtime.currentChar;
                    steps -= forceSteps ? 0 : afterOpenLoop - beforeOpenLoop;
                    break;
                case ']':
                    ehComando = false;
                    const beforeEndLoop = this._runtime.currentChar;
                    this._loop(false);
                    const afterEndLoop = this._runtime.currentChar;
                    steps += forceSteps ? 0 : beforeEndLoop - afterEndLoop;
                    break;
                case '{':
                    this._useModule();
                default:
                    ehComando = false;
                    break;
            };

            if(performance.now() - executionBegin > this._config.executionTimeLimit)
                this._triggerError('Range', 'executionTimeLimit');
            
            if(this._error.hasAny && !this._config.ignoreErrors)
                break;

            if(ehComando)
                steps--;
            this._runtime.currentChar++;
        };
        
        if(this._runtime.currentChar >= script.length)
            this._runtime.isComplete = true;
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
        const binary = this._runtime.input.join('');
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

        let binary = [];
        for(let i=0; i<selectedCells.length; i++) {
            const coord = { x: selectedCells[i][0], y: selectedCells[i][1] };

            const bit = grid[coord.y][coord.x] ? 1 : 0;
            binary.push(bit);
        };
        this._runtime.output = binary;
    };

    _loop(isStart) {
        const currentBit = this._grid.array[this._grid.y][this._grid.x];
        const index = isStart ? 0 : 1;
        const logic = isStart ? !currentBit : currentBit;

        if(logic)
            this._gotoRespectiveChar('[]', index);
    };

    _useModule() {
        const modules = this._runtime.modules;
        let currentModule;
        for(let i=0; i<modules.length; i++) {
            if(modules[i].charIndex === this._runtime.currentChar) {
                currentModule = modules[i];
                break;
            }
        };
        if(!(currentModule.name in this._modules))
            this._triggerError('Reference', 'moduleDoesNotExist', currentModule.name);

        const modulo = new BitGrid();
        modulo.script = this._modules[currentModule.name];
        modulo.modules = this._modules;
        
        const inputs = [];
        const outputs = [];
        
        let programaParalelo = new BitGrid();
        programaParalelo._grid = this._grid;
        programaParalelo.script = currentModule.before;
        
        while(!(programaParalelo.isComplete || programaParalelo.error.hasAny)) {
            programaParalelo.run(programaParalelo.currentChar);
            
            if(programaParalelo.requestInput)
                programaParalelo.input = [];
            else if(programaParalelo.thereIsOutput)
                outputs.push(programaParalelo.output);
        };
        
        this._grid = programaParalelo._grid;
        
        let outputCount = 0;
        while(!(modulo.isComplete || modulo.error.hasAny)) {
            modulo.run(modulo.currentChar);
            if(modulo.requestInput) {
                modulo.input = outputs[outputCount] || [];
                outputCount++;
            } else if(modulo.thereIsOutput) {
                inputs.push(modulo.output);
            };
        };

        if(modulo.error.hasAny)
            this._triggerError('Internal', 'module', [currentModule.name, modulo.error.message]);
        
        programaParalelo = new BitGrid();
        programaParalelo._grid = this._grid;
        programaParalelo.script = currentModule.after;
        
        let inputCount = 0;
        while(!(programaParalelo.isComplete || programaParalelo.error.hasAny)) {
            programaParalelo.run(programaParalelo.currentChar);

            if(programaParalelo.requestInput) {
                programaParalelo.input = inputs[inputCount] || [];
                inputCount++;
            };
        };
        console.log(inputs, outputs);

        this._grid = programaParalelo._grid;

        this._gotoRespectiveChar('{}', 0);
    };

    _lookForPairCharsIn(string) {
        const charPosition = this._runtime.charPosition;
        for(const char in charPosition)
            charPosition[char] = [];

        const tempOpen = {};
        for(const char in charPosition) {
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

    _validateModules(script) {
        const modulesList = [];
        for(const moduleIndex of this._runtime.charPosition['{}']) {
            const moduleString = script.substring(moduleIndex[0]+1, moduleIndex[1]);
            const moduleParts = moduleString.split(':');
            if(moduleParts.length > 3) {
                this._triggerError('Syntax', 'invalidModule', moduleParts.length);
                return;
            };
            if(moduleParts.length < 1)
                moduleParts.push('');
            if(moduleParts.length < 2)
                moduleParts.push('o');
            else if(moduleParts[1] === '')
                moduleParts[1] = 'o';
            if(moduleParts.length < 3)
                moduleParts.push('i');
            else if(moduleParts[2] === '')
                moduleParts[2] = 'i';
            
            modulesList.push({name: moduleParts[0], before: moduleParts[1], after: moduleParts[2], charIndex: moduleIndex[0]});
        };
        return modulesList;
    };

    _triggerError(type, expecification, variables) {
        this._error.hasAny = true;
        this._error.type = type;
        this._error.position.x = this._grid.x;
        this._error.position.y = this._grid.y;
        this._error.char = this._runtime.currentChar;

        const title = `${type}Error`;
        let message = this._errorMessages[type][expecification];

        if(variables !== undefined) {
            if(Array.isArray(variables)) {
                for(let i=variables.length-1;i>=0;i++)
                    message = message.replace(`%${i}`, variables[i]);
            } else if(typeof(variables) === 'object') {
                for(key in variables)
                    message = message.replace(key, variables[key]);
            } else
                message = message.replace('%0', variables);
        };

        this._error.title = title;
        this._error.message = message;
    };
};
