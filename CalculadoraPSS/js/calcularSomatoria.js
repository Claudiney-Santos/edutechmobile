const calcularSomatoria = (gabarito, respostas, valorDaQuestao) => {
    const nota = [];
    for(const i in gabarito) {
        if(respostas[i] === undefined || !(gabarito[i])) {
            if(!(gabarito[i]))
                nota.push(valorDaQuestao);
            continue;
        };

        let alternativasCorretas, alternativasMarcadas = respostas[i].toString(2);
        alternativasCorretas = Array.isArray(gabarito[i]) ? Object.assign([], gabarito[i]).reverse().join('') : gabarito[i].toString(2);

        while(alternativasCorretas.length < 4)
            alternativasCorretas = `0${alternativasCorretas}`;
        while(alternativasMarcadas.length < alternativasCorretas.length)
            alternativasMarcadas = '0' + alternativasMarcadas;

        alternativasCorretas = alternativasCorretas.split('').map(Number);
        alternativasMarcadas = alternativasMarcadas.split('').map(Number);

        const porcentagens = [];
        let qntAltVerdadeiras = 0;
        let qntAltMarcadasCorretamente = 0;
        let errou = false;
        for(let j=0;j<alternativasCorretas.length;j++) {
            const altCorreta = alternativasCorretas[j];
            const altMarcada = alternativasMarcadas[j];
            if(altCorreta == 2)
                continue
            else if(altCorreta)
                qntAltVerdadeiras++;
            
            if(!(altCorreta) && altMarcada) {
                qntAltMarcadasCorretamente = 0;
                errou = true;
            } else if(altMarcada && altCorreta && !errou)
                qntAltMarcadasCorretamente++;
        };
        nota.push((valorDaQuestao*qntAltMarcadasCorretamente)/qntAltVerdadeiras);
    };
    return nota;
};
