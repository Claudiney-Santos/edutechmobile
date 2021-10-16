window.onload = () => {
    let gabaritos;
    const headers = new Headers();
    for(const name of ['pragma', 'cache-control'])
        headers.append(name, 'no-cache');
    fetch('json/gabaritos.json', { method: 'GET', headers: headers })
    .then(resultado => {
        if(resultado.ok)
            return resultado.json();
        else
            window.alert('Não foi possível se conectar com o servidor, por favor tente recarregar página!\nCaso o erro persista, entre em contato com o desenvolvedor!');
    }).then(json => {
        if(json !== undefined) {
            gabaritos = json;
            definirAtualizacaoNoHtml(gabaritos);
        };
    });
    document.getElementById('btn-calcular-nota').addEventListener('click', () => {
        const dados = carregarDadosDoForm();
        
        let gabarito = Object.assign([], gabaritos[dados.ano][dados.edicao]);
        
        switch(dados.linguaEstrangeira) {
            case 'ingles':
                gabarito = gabarito.slice(0, gabarito.length-5);
                break;
            case 'espanhol':
                gabarito.splice(gabarito.length-10, 5);
                break;
        };
        const pontuacao = calcularSomatoria(gabarito, dados.respostas, 15);

        exibirRelatorio(pontuacao, gabarito);
    });
};

const exibirRelatorio = (pontuacao, gabarito) => {
    const pontuacaoFinal = pontuacao.reduce((soma, elemento) => { return soma + elemento }, 0);
    const relatorio = document.getElementById('relatorio');
    relatorio.style.display = 'block';
    document.getElementById('pontuacao-total').innerText = pontuacaoFinal;

    const materias = document.getElementsByClassName('materia');
    for(let i=0;i<materias.length;i++) {
        const materia = materias[i];
        const pontosNaMateria = [];

        for(let j=0;j<5;j++)
            pontosNaMateria.push(pontuacao[i*5 + j]);

        materia.getElementsByClassName('pontuacao')[0].innerText = pontosNaMateria.reduce((soma, elemento) => { return soma + elemento }, 0);

        const pontos = materia.getElementsByClassName('pontos')[0].children;
        for(let j=0;j<pontosNaMateria.length;j++) {
            const questao = pontos[j];
            const resposta = gabarito[i*5+j];
            questao.getElementsByClassName('pontuacao-na-questao')[0].innerText = pontosNaMateria[j];
            respostaCorretaSoma = questao.getElementsByClassName('resposta-correta-soma')[0];
            respostaCorretaAlternativas = questao.getElementsByClassName('resposta-correta-alternativas')[0];

            if(resposta == 0) {
                respostaCorretaSoma.innerText = '00';
                respostaCorretaAlternativas.innerText = 'QUESTÃO ANULADA';
            } else {
                let alternativas = '';
                let soma = 0;
                
                if(Array.isArray(resposta)) {
                    for(let i=0;i<resposta.length;i++) {
                        if(resposta[i] == 0)
                            continue
                        else if(alternativas !== '')
                            alternativas += ' + ';
                        
                        if(resposta[i] == 1)
                            soma += 2**i;
                        
                        alternativas += resposta[i] == 2 ? `(0${2**i} ANULADA)` : `0${2**i}`;
                    };
                } else {
                    soma = resposta;
                    for(const valor of [1, 2, 4, 8]) {
                        if(Math.floor(resposta/valor) % 2 !== 0) {
                            if(alternativas !== '')
                            alternativas += ' + ';
                            alternativas += '0' + valor;
                        }
                    };
                }
                respostaCorretaSoma.innerText = soma;

                respostaCorretaAlternativas.innerText = alternativas;
            }
            
            if(Array.isArray(resposta)) {
                respostaCorretaSoma = resposta.reduce((soma, elemento) => { return soma + elemento }, 0);

                let alternativas = '';
                for(let i=0;i<resposta.length;i++) {
                    if(alternativas !== '')
                        alternativas += ' + '
                    if(resposta[i] == 2)
                        alternativas += 'A'    
                };
            } else {
                respostaCorretaSoma.innerText = resposta < 10 ? '0' + resposta : resposta;
                if(resposta == 0)
                    respostaCorretaAlternativas.innerText = 'QUESTÃO ANULADA';
                else {
                    let alternativas = '';
        
                    for(const valor of [1, 2, 4, 8]) {
                        if(Math.floor(resposta/valor) % 2 !== 0) {
                            if(alternativas !== '')
                                alternativas += ' + ';
                            alternativas += '0' + valor;
                        }
                    };
        
                    respostaCorretaAlternativas.innerText = alternativas;
                };
            };

        };
    };
};

const carregarDadosDoForm = () => {
    const dados = {};
    dados.ano = Number(document.getElementsByName('ano-da-edicao')[0].value);

    const edicao = document.getElementsByName('edicao')[0].value;

    switch(edicao) {
        case 'PSS I':
            dados.edicao = 'pss1';
            break;
        case 'PSS II':
            dados.edicao = 'pss2';
            break;
        case 'PSS III':
            dados.edicao = 'pss3';
            break;
    };

    let linguaEstrangeira;
    document.getElementsByName('lingua-estrangeira').forEach(lingua => {
        if(lingua.checked)
            linguaEstrangeira = lingua.id.slice(7);
    });
    dados.linguaEstrangeira = linguaEstrangeira;
    const respostas = [];
    const questoes = document.getElementById('questoes').children;
    for(let i=0; i<questoes.length;i++) {
        let num = (i+1).toString();
        while(num.length < questoes.length.toString().length)
            num = '0' + num;
        const questao = questoes[i];
        respostas[i] = Number(questao.children.namedItem('soma').value) || 0;
    };
    dados.respostas = respostas;
    return dados;
};

const definirAtualizacaoNoHtml = gabaritos => {
    definirAtualizacaoDaEdicaoEAno(gabaritos);
    definirAtualizacaoDeSomas();
};

const definirAtualizacaoDaEdicaoEAno = gabaritos => {
    const ano = document.getElementsByName('ano-da-edicao')[0];
    const edicao = document.getElementsByName('edicao')[0];
    const atualizarEdicao = () => {
        const anoSelecionado = ano.value;
        const edicoes = Object.keys(gabaritos[anoSelecionado]);
        const edicaoSelecionada = edicao.value;
        while(edicao.hasChildNodes())
            edicao.removeChild(edicao.firstChild);
        for(let i=0;i<edicoes.length;i++) {
            const opcao = document.createElement('option');
            opcao.innerText = {'pss1': 'PSS I', 'pss2': 'PSS II', 'pss3': 'PSS III'}[edicoes[i]];
            edicao.appendChild(opcao);
            if(opcao.innerText === edicaoSelecionada)
                edicao.selectedIndex = i;
        };
    };
    const atualizarAno = () => {
        const edicaoSelecionada = {'PSS I': 'pss1', 'PSS II': 'pss2', 'PSS III': 'pss3'}[edicao.value];
        const anos = Object.keys(gabaritos);
        const anosValidos = [];
        const anoSelecionado = ano.value;
        for(let i=0;i<anos.length;i++) {
            if(edicaoSelecionada in gabaritos[anos[i]])
            anosValidos.push(anos[i]);
        };
        anosValidos.reverse();
        while(ano.hasChildNodes())
            ano.removeChild(ano.firstChild);
        for(let i=0;i<anosValidos.length;i++) {
            const opcao = document.createElement('option');
            opcao.innerText = anosValidos[i];
            ano.appendChild(opcao);
            if(opcao.innerText === anoSelecionado)
                ano.selectedIndex = i;
        };
    };
    for(const elemento of [ano, edicao]) {
        while(elemento.hasChildNodes())
            elemento.removeChild(elemento.firstChild);
    };
    for(const anoGabarito of Object.keys(gabaritos).reverse()) {
        const opcaoAno = document.createElement('option');
        opcaoAno.innerText = anoGabarito;
        ano.appendChild(opcaoAno);
    };
    atualizarEdicao();
    ano.addEventListener('change', atualizarEdicao);
    edicao.addEventListener('change', atualizarAno);
};

const definirAtualizacaoDeSomas = () => {
    const questoes = document.getElementById('questoes');
    for(const questao of questoes.children) {
        const soma = questao.getElementsByClassName('soma')[0];
        soma.addEventListener('change', () => {
            while(soma.value.length < 2)
                soma.value = '0' + soma.value;

            atualizarSoma(questao, 'soma');
        });
        const alternativas = questao.getElementsByClassName('alternativa');
        for(const alternativa of alternativas) {
            alternativa.addEventListener('input', () => {
                atualizarSoma(questao, 'alternativa');
            });
        };
    };
};

const atualizarSoma = (questao, campoAlterado) => {
    const soma = questao.getElementsByClassName('soma')[0];
    const alternativas = {};
    for(const alternativa of questao.getElementsByClassName('alternativa')) {
        if(alternativa.dataset.valor)
            alternativas[alternativa.dataset.valor] = alternativa;
    };
    switch(campoAlterado) {
        case 'alternativa':
            let novaSoma = 0;
            for(const valor in alternativas) {
                const alternativa = alternativas[valor];
                if(alternativa.checked)
                    novaSoma += Number(valor);
            };
            soma.value = novaSoma < 10 ? '0' + novaSoma : novaSoma;
            break;
        case 'soma':
            const somaValor = Number(soma.value);
            if(somaValor < 0 || somaValor > 15) return;
            const altMarcadas = [];

            for(const valor of [1, 2, 4, 8]) {
                if(Math.floor(somaValor/valor) % 2 !== 0)
                    altMarcadas.push(valor);
            };

            for(const valor in alternativas) {
                alternativas[valor].checked = false;
                alternativas[valor].toggleAttribute('checked', false);
            };
            
            for(const alt of altMarcadas) {
                alternativas[alt].checked = true;
                alternativas[alt].toggleAttribute('checked', true);
            };
            break;
    };
    if(Number(soma.value) === 0)
        soma.value = '';
};
