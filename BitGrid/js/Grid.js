class Grid {
    constructor(table) {
        table.classList.add('grid');
        this.table = table;
        this.rows = 10;
        this.columns = 10;
        this.pontoFixo = {x: 0, y: 0};
    };

    representar(grade, defaultValue) {
        const linhas = [];

        linhas[0] = document.createElement('tr');
        const dummy = document.createElement('th');
        dummy.innerText = '\u00d7';
        linhas[0].appendChild(dummy);
        for(let x=0; x<this.columns; x++) {
            const indice = document.createElement('th');
            indice.innerText = this.pontoFixo.x + x;
            linhas[0].appendChild(indice);
        };
        for(let y=0; y<this.rows; y++) {
            linhas[y+1] = document.createElement('tr');
            const indice = document.createElement('th');
            indice.innerText = this.pontoFixo.y + y;
            linhas[y+1].appendChild(indice);
            for(let x=0; x<this.columns; x++) {
                const array = {x: this.pontoFixo.x+x, y: this.pontoFixo.y+y}
                const item = document.createElement('td');
                if(defaultValue !== undefined && grade.array[array.y][array.x] === undefined)
                    item.innerText = defaultValue ? 1 : 0;
                else
                    item.innerText = grade.array[array.y][array.x] ? 1 : 0;
                if(grade.x == array.x && grade.y == array.y)
                    item.classList.add('current-cell');
                if(indexSubInArray([array.x, array.y], grade.selectedCells) > -1)
                    item.classList.add('selected-cell');
                linhas[y+1].appendChild(item);
            };
        };

        this.table.textContent = '';
        for(let i=linhas.length-1; i>=0; i--) {
            this.table.appendChild(linhas[i]);
        };
    };
}
