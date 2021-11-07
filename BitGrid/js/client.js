const limparIntervalos = () => {
    let intervalo = setInterval(()=>{}, 1000);
    for(let i=1; i<=intervalo;i++) {
        clearInterval(i);
    };
};

window.onload = () => {
    let output = '';
    const bitGrid = new BitGrid();
    const textarea = document.getElementById('input-code');
    const inputDiv = document.getElementById('program-input');
    const inputField = document.getElementById('input-field');
    const outputField = document.getElementById('output-field');
    const programState = document.getElementById('program-state');
    const delayInput = document.getElementById('delay-input');
    const delayLabel = document.getElementById('delay-text');
    const btn = {
        act: document.getElementById('Action'),
        modules: document.getElementById('Modules'),
        pause: document.getElementById('Pause'),
        step: document.getElementById('Step'),
        stop: document.getElementById('Stop')
    };
    btn.act.emExecucao = false;
    btn.act.isPaused = false;
    btn.act.stepWTF = false;
    const errorBox = new ErrorBox(document.getElementById('errorbox'));
    const grade = new Grid(document.getElementById('output'));
    const moduleBox = new ModuleBox(document.getElementById('modulebox'));

    for(const moduleName in bitGrid.modules)
        moduleBox.addModule(moduleName, bitGrid.modules[moduleName]);

    for(const evento of ['drop', 'dragover']) {
        window.addEventListener(evento, event => {
            //event.preventDefault();
            return false;
        }, false);
    };
    
    moduleBox.onclose = () => {
        const modules = moduleBox.getModules();
        const bitModules = {};
        for(const module of modules) {
            bitModules[module.name] = module.content;
        };
        console.log(modules);
        bitGrid.modules = bitModules;
    };

    const executarComando = (ehComeco, charIndex, steps, forceSteps)  => {
        btn.stop.innerText = 'Stop Execution';
        btn.act.emExecucao = true;
        if(ehComeco) {
            errorBox.hide();
            bitGrid.resetAll();
            output = '';
            outputField.innerText = '';
        };
        bitGrid.script = textarea.value;
    
        if(ehComeco)
            bitGrid.start(steps, forceSteps);
        else
            bitGrid.run(charIndex, steps, forceSteps);

        const erros = bitGrid.error;
        let estado = 2;

        if(bitGrid.isComplete || erros.hasAny) {
            btn.act.emExecucao = false;
            btn.act.isPaused = false;
            btn.act.stepWTF = false;
            btn.stop.innerText = 'Clear';
            btn.act.innerText = 'Execute';
        };
        if(erros.hasAny) {
            errorBox.trigger(erros.title, erros.message);
            limparIntervalos();
            estado = -1;
        } else if(bitGrid.requestInput) {
            inputDiv.classList.remove('invisivel');
            inputField.focus();
        } else if(bitGrid.thereIsOutput)
            atualizarOutput();
        
        if(bitGrid.isComplete)
            estado = 1;
        atualizarEstado(estado);
        desenharGrade();
    };

    const desenharGrade = () => {
        grade.pontoFixo.x = bitGrid.grid.x >= grade.columns/2 ? bitGrid.grid.x - grade.columns/2 : 0;
        grade.pontoFixo.y = bitGrid.grid.y >= grade.rows/2 ? bitGrid.grid.y - grade.rows/2 : 0;
        grade.representar(bitGrid.grid, bitGrid.defaultValue);
    };

    const atualizarEstado = (estado) => {
        let state;
        switch(estado) {
            case -1:
                state = 'Error!';
                break;
            case 0:
                state = 'Waiting...';
                break;
            case 1:
                state = 'Complete!';
                break;
            case 2:
                state = 'Running...';
                break;
            case 3:
                state = 'Paused...'
                break;
            default:
                state = 'Unknown State...'
                break;
        };
        programState.innerText = `Program State: ${state}`;
    };

    const atualizarOutput = () => {
        const bin = bitGrid.output.join('');
        const char = String.fromCharCode(parseInt(bin, 2));
        output += char;
        outputField.innerText = output;
        desenharGrade();
    };

    textarea.oninput = () => {
        inputField.esconder();
        bitGrid.resetAll();
        btn.act.innerText = 'Execute';
        btn.act.emExecucao = false;
        btn.act.isPaused = false;
        btn.act.stepWTF = false;
        btn.stop.innerText = 'Clear'
        limparIntervalos();
        atualizarEstado(0);
    };

    delayInput.oninput = () => {
        delayLabel.innerText = `${delayInput.value}ms`;
        if(btn.act.emExecucao && !bitGrid.requestInput) {
            limparIntervalos();
            if(delayInput.value == 0) {
                do {
                    executarComando(false, bitGrid.currentChar);
                } while(bitGrid.thereIsOutput)
            } else
                funcaoExecutar();
        };
    };
    
    btn.act.onclick = () => {
        if(!bitGrid.requestInput) {
            if(btn.act.emExecucao) {
                btn.act.innerText = 'Execute';
                btn.act.isPaused = true;
                btn.act.emExecucao = false;
                limparIntervalos();
                atualizarEstado(3);
            } else {
                if(delayInput.value == 0) {
                    const ehComeco = !btn.act.isPaused && !btn.act.stepWTF;
                    btn.act.isPaused = false;
                    btn.act.stepWTF = false;
                    executarComando(ehComeco);
                    while(bitGrid.thereIsOutput) {
                        executarComando(false, bitGrid.currentChar);
                    };
                } else {
                    btn.act.innerText = 'Pause';
                    if(!btn.act.isPaused && !btn.act.stepWTF) {
                        errorBox.hide();
                        bitGrid.resetAll();
                        outputField.innerText = '';
                        output = '';
                    };
                    btn.act.isPaused = false;
                    btn.act.stepWTF = false;
                    desenharGrade();
                    executarComando(false, bitGrid.currentChar, 0, true);
                    funcaoExecutar();
                };
            };
        };
    };

    const funcaoExecutar = () => {
        setInterval(() => {
            executarComando(false, bitGrid.currentChar, 1, true);
            if(bitGrid.isComplete || bitGrid.thereIsOutput || bitGrid.requestInput) {
                limparIntervalos();
                btn.act.innerText = bitGrid.requestInput ? 'Pause' : 'Execute';
                if(bitGrid.thereIsOutput)
                    setTimeout(funcaoExecutar, delayInput.value);
            };
        }, delayInput.value);
    };

    btn.step.onclick = () => {
        limparIntervalos();
        const ehComeco = bitGrid.isComplete;
        if(ehComeco || bitGrid.error.hasAny) {
            bitGrid.resetAll();
            desenharGrade();
            atualizarEstado(0);
        } else {
            if(bitGrid.requestInput) {
                bitGrid.input = valorDoInputFieldEmBits();
                inputField.esconder();
            } else if(!(btn.act.isPaused || btn.act.emExecucao || btn.act.stepWTF)) {
                output = '';
                outputField.innerText = '';
            };
            executarComando(ehComeco, bitGrid.currentChar, 1, true);
            btn.act.innerText = 'Execute';
            btn.act.emExecucao = false;
            btn.act.isPaused = false;
            btn.act.stepWTF = true;
        };
    };

    btn.stop.onclick = () => {
        if(!btn.act.emExecucao && !btn.act.isPaused && !btn.act.stepWTF) {
            textarea.value = '';
            outputField.innerText = '';
            desenharGrade();
            errorBox.hide();
        };
        output = '';
        btn.act.innerText = 'Execute';
        btn.act.emExecucao = false;
        btn.act.isPaused = false;
        btn.act.stepWTF = false;
        bitGrid.resetAll();
        inputField.esconder();
        atualizarEstado(0)
        limparIntervalos();
        btn.stop.innerText = 'Clear';
    };

    btn.modules.onclick = () => { moduleBox.show(); };

    inputField.esconder = () => {
        inputDiv.classList.add('invisivel');
        inputField.value = '';
    };

    inputField.addEventListener('keyup', (event) => {
        let preventDefault = true;

        switch(event.key) {
            case 'Enter':
                bitGrid.input = valorDoInputFieldEmBits();
                inputField.esconder();
                if(delayInput.value == 0) {
                    do {
                        executarComando(false, bitGrid.currentChar);
                    } while(bitGrid.thereIsOutput);
                } else {
                    setInterval(funcaoExecutar(), delayInput.value);
                };
                break;
            default:
                preventDefault = false;
                break;
        }
        if(preventDefault)
            event.preventDefault();
    });

    const valorDoInputFieldEmBits = () => {
        const char = inputField.value;
        const binary = char === '' ? [0] : char.charCodeAt().toString(2).split('');
        return binary;
    };

    bitGrid.resetAll();
    desenharGrade();
    errorBox.hide();
};
