class ModuleBox {
    constructor(container) {
        for(const className of ['moduleBox', 'invisivel']) {
            container.classList.add(className);
        };

        this._modules = {};

        const extensoesValidas = ['.bg', '.bitgrid'];
        container.innerHTML = `
            <header>
                <button class="closeBtn">&times;</button>
            </header>
            <main>
                <h1>Module List</h1>
                <!--<button class="addModuleBtn">Add Module</button>-->
                <input type="file" accept="${extensoesValidas.join()}">
                <div class="moduleList"></div>
            </main>
        `;

        const moduleList = document.querySelector('.moduleList');

        moduleList.addEventListener('dragover', evento => {
            evento.preventDefault();
        });
        moduleList.addEventListener('drop', evento => {
            evento.preventDefault();

            const arquivos = [];
            if(evento.dataTransfer.items) {
                for(let i=0;i<evento.dataTransfer.items.length;i++) {
                    let file = evento.dataTransfer.items[i];
                    if(file.kind === 'file') {
                        const extensao = file.getAsFile().name.slice(-file.getAsFile().name.split('').reverse().join('').search(/\./)-1);
                        if(extensoesValidas.includes(extensao))
                            arquivos.push(file.getAsFile());
                        else {
                            alert(`"${file.getAsFile().name}" doesn't have a valid extension...\nValid extensions: "${extensoesValidas.join('", "')}"...`)
                            return false;
                        };
                    } else
                        alert(`"${file}" isn't a file!`);
                };
            } else {
                for(let i=0;i<evento.dataTransfer.files.length;i++) {
                    let file = evento.dataTransfer.files[i];
                    const extensao = file.name.slice(-file.name.split('').reverse().join('').search(/\./));
                    if(extensoesValidas.includes(extensao))
                        arquivos.push(file);
                    else {
                        alert(`"${file.getAsFile().name}" doesn't have a valid extension...\nValid extensions: ${extensoesValidas.join(', ')}!`)
                        return false;
                    }
                };
            };

            for(const arquivo of arquivos) {
                arquivo.text().then(texto => {
                    this.addModule(arquivo.name, texto);
                });
            };
        });

        container.querySelector('.closeBtn').onclick = () => { this.close() };
        /*container.querySelector('.addModuleBtn').onclick = () => {
            const module = document.createElement('div');
            module.classList.add('module');
            module.innerHTML = `
                <button class="deleteModule">&times;</button>
                <button class="moduleScript">Module Script...</button>
                <input class="moduleName" type="text" placeholder="Module Name" onclick="this.select()" >
            `;
            const moduleName = module.querySelector('.moduleName');
            moduleName.onkeydown = function(tecla) {
                let ehUmComando = true;
                switch(tecla.key) {
                    case 'Enter':
                        this.blur();
                        break;
                    default:
                        ehUmComando = false;
                        break;
                };
                if(ehUmComando)
                    tecla.preventDefault();
            };
            module.querySelector('.deleteModule').onclick = () => { moduleList.removeChild(module); };
            moduleList.appendChild(module);
        };
        container.querySelector('.addModuleBtn').onclick();*/
        /*
        const closeBtn = document.createElement('button');
        closeBtn.classList.add('closeBtn');
        closeBtn.innerHTML = '&times';

        closeBtn.onclick = () => { this.close(); };

        const titulo = document.createElement('h1');
        titulo.innerText = 'Module List';

        const addModuleSpan = document.createElement('span');
        addModuleSpan.innerText = 'Add Module';

        const moduleList = document.createElement('div');
        moduleList.classList.add('moduleList');

        const moduleTable = document.createElement('table');
        moduleTable.classList.add('moduleTable');

        const bodyRow = document.createElement('tbody');
        moduleTable.appendChild(bodyRow);

        moduleList.appendChild(moduleTable);
        const addModuleBtn = document.createElement('button');
        addModuleBtn.innerText = '+';
        addModuleBtn.onclick = () => {
            const moduleRow = document.createElement('tr');

            for(const className of ['moduleName', 'moduleScript']) {
                const element = document.createElement('td');
                element.setAttribute('contentEditable', true);
                element.innerText = className;
                element.classList.add(className);
                moduleRow.appendChild(element);
            };

            const deleteModuleBtn = document.createElement('button');
            deleteModuleBtn.innerHTML = '&times;';
            deleteModuleBtn.style.width = '100%';
            deleteModuleBtn.onclick = () => { bodyRow.removeChild(moduleRow); };

            const deleteTd = document.createElement('td');
            deleteTd.appendChild(deleteModuleBtn);
            moduleRow.appendChild(deleteTd);

            bodyRow.appendChild(moduleRow);
        };

        for(const elemento of [closeBtn, titulo, addModuleSpan, addModuleBtn, moduleList]) {
            container.appendChild(elemento);
        };*/

        this.container = container;
    };

    addModule(name='Module Name', content='Module Script') {
        let id;
        do {
            id = '';
            for(let i=0;i<0x10;i++)
                id += Math.floor(Math.random()*0x10).toString(0x10);
        } while(id in this._modules)
        
        if(name.search(/\./) > -1)
            name = name.slice(0, -name.split('').reverse().join('').search(/\./)-1);
        
        this._modules[id] = { name: name, content: content };

        const moduleList = document.querySelector('.moduleList');
        const module = document.createElement('div');
        module.innerHTML = `
            <button class="deleteModuleBtn">&times;</button>
            <span class="moduleName">${name}</span>
        `;

        module.querySelector('.deleteModuleBtn').onclick = () => {
            moduleList.removeChild(module);
            delete this._modules[id];
        };
        
        moduleList.appendChild(module);
    };

    show() {
        this.container.classList.remove('invisivel');
    };


    close() {
        this.container.classList.add('invisivel');
        this.onclose();
    };

    onclose() {};

    getModules() {
        const modules = [];
        
        for(const id in this._modules) {
            modules.push(this._modules[id]);
        };

        return modules;
    };
};