const carregarConteudosColapsaveis = () => {
    const titulos = document.getElementsByClassName('titulo-colapsavel');

    for(const titulo of titulos) {
        titulo.addEventListener('click', function() {
            this.classList.toggle('ativo');

            const conteudo = this.nextElementSibling;
            if(!conteudo.classList.contains('conteudo-colapsavel')) return;
            conteudo.style.maxHeight = conteudo.style.maxHeight ? null : conteudo.scrollHeight + 'px';
        });
    };
};

carregarConteudosColapsaveis();