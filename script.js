document.addEventListener('DOMContentLoaded', () => {
    const adicionarHqBotao = document.getElementById('adicionar-hq');
    const modalAdicionar = document.getElementById('modal-adicionar');
    const fecharModalBotao = document.querySelector('.close-button');
    const formAdicionarHq = document.getElementById('form-adicionar-hq');
    const hqListContainer = document.getElementById('hq-list');
    const filtroStatusBotoes = document.querySelectorAll('.status-filter .filter-button');
    const pesquisaTituloInput = document.getElementById('pesquisar-titulo');
    const ordenacaoSelect = document.getElementById('ordenacao');
    const cancelarAdicionarBotao = document.getElementById('cancelar-adicionar');
    const hqTitlesListContainer = document.getElementById('hq-titles-list');

    let listaDeHQs = carregarHQs();
    renderizarListaDeHQs(filtrarHQs(listaDeHQs, 'completed', ''));

    let hqEditandoIndex = -1;

    function carregarHQs() {
        const hqsSalvas = localStorage.getItem('hqs');
        return hqsSalvas ? JSON.parse(hqsSalvas) : [];
    }

    function salvarHQs() {
        localStorage.setItem('hqs', JSON.stringify(listaDeHQs));
    }

function renderizarListaDeHQs(hqs) {
    hqListContainer.innerHTML = '';

    hqs.forEach(hqExibida => {
        const hqItem = document.createElement('div');
        hqItem.classList.add('hq-item');
        const indiceOriginal = listaDeHQs.findIndex(hqOriginal =>
            hqOriginal.titulo === hqExibida.titulo &&
            hqOriginal.status === hqExibida.status &&
            hqOriginal.linkCapa === hqExibida.linkCapa
        );
        hqItem.dataset.hqIdOriginal = indiceOriginal;

        const coverContainer = document.createElement('div');
        coverContainer.classList.add('cover-container');
        if (hqExibida.linkCapa) {
            const capaImg = document.createElement('img');
            capaImg.src = hqExibida.linkCapa;
            capaImg.alt = hqExibida.titulo;
            coverContainer.appendChild(capaImg);
        }

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete-hq-btn');
        deleteButton.textContent = '×';
        coverContainer.appendChild(deleteButton);

        const optionsButton = document.createElement('button');
        optionsButton.classList.add('options-hq-btn');
        optionsButton.innerHTML = '<i class="fas fa-ellipsis-v"></i>';
        coverContainer.appendChild(optionsButton);

        hqItem.appendChild(coverContainer);
        const detalhes = document.createElement('div');
        detalhes.classList.add('hq-details');
        const tituloH3 = document.createElement('h3');
        tituloH3.textContent = hqExibida.titulo;
        detalhes.appendChild(tituloH3);
        const metaContainer = document.createElement('div');
        metaContainer.classList.add('hq-meta');
        const episodiosSpan = document.createElement('span');
        if (hqExibida.totalCapitulos > 0 && hqExibida.capitulosLidos === hqExibida.totalCapitulos) {
            episodiosSpan.textContent = `${hqExibida.capitulosLidos}`;
        } else {
            episodiosSpan.textContent = `${hqExibida.capitulosLidos}/${hqExibida.totalCapitulos}`;
        }
        episodiosSpan.classList.add('episodes');
        metaContainer.appendChild(episodiosSpan);
        if (hqExibida.nota !== undefined) {
            const notaSpan = document.createElement('span');
            notaSpan.textContent = `${hqExibida.nota}`;
            notaSpan.classList.add('score');
            metaContainer.appendChild(notaSpan);
        }
        detalhes.appendChild(metaContainer);
        hqItem.appendChild(detalhes);
        hqListContainer.appendChild(hqItem); // Adiciona o item diretamente ao container principal
    });

    if (listaDeHQs.length === 0) { // Simplifiquei a condição para verificar se há HQs na lista geral
        hqListContainer.innerHTML = '<p>Nenhuma HQ na lista ainda.</p>';
    }
}

    function obterNomeAmigavelStatus(status) {
        switch (status) {
            case 'completed':
                return 'Completed';
            case 'reading':
                return 'Reading';
            case 'plan-to-read':
                return 'Plan to Read';
            case 'paused':
                return 'Paused';
            case 'dropped':
                return 'Dropped';
            default:
                return status.charAt(0).toUpperCase() + status.slice(1);
        }
    }

    function filtrarHQs(hqs, status, textoPesquisa) {
        return hqs.filter(hq => {
            const filtroStatus = status === 'all' || hq.status === status;
            const filtroTitulo = hq.titulo.toLowerCase().includes(textoPesquisa);
            return filtroStatus && filtroTitulo;
        });
    }

    function ordenarHQs(hqs, criterio) {
        if (criterio === 'titulo') {
            hqs.sort((a, b) => a.titulo.localeCompare(b.titulo));
        } else if (criterio === 'nota') {
            hqs.sort((a, b) => b.nota - a.nota);
        } else {
            const hqsSalvas = localStorage.getItem('hqs');
            if (hqsSalvas) {
                const ordemSalva = JSON.parse(hqsSalvas).map(hq => hq.titulo);
                hqs.sort((a, b) => ordemSalva.indexOf(a.titulo) - ordemSalva.indexOf(b.titulo));
            }
        }
    }

    function handleAdicionarHq(event) {
        event.preventDefault();
        const novaHq = {
            titulo: document.getElementById('titulo').value,
            status: document.getElementById('status').value,
            nota: parseFloat(document.getElementById('nota').value),
            capitulosLidos: parseInt(document.getElementById('capitulos-lidos').value) || 0,
            totalCapitulos: parseInt(document.getElementById('total-capitulos').value) || 0,
            linkCapa: document.getElementById('link-capa').value
        };
        listaDeHQs.push(novaHq);
        salvarHQs();
        const statusAtivo = document.querySelector('.status-filter .active').dataset.status;
        const textoPesquisa = pesquisaTituloInput.value;
        renderizarListaDeHQs(filtrarHQs(listaDeHQs, statusAtivo, textoPesquisa));
        fecharModal();
    }

    function handleSalvarEdicaoHq(event) {
        event.preventDefault();
        if (hqEditandoIndex !== -1) {
            listaDeHQs[hqEditandoIndex] = {
                titulo: document.getElementById('titulo').value,
                status: document.getElementById('status').value,
                nota: parseFloat(document.getElementById('nota').value),
                capitulosLidos: parseInt(document.getElementById('capitulos-lidos').value) || 0,
                totalCapitulos: parseInt(document.getElementById('total-capitulos').value) || 0,
                linkCapa: document.getElementById('link-capa').value
            };
            salvarHQs();
            const statusAtivo = document.querySelector('.status-filter .active').dataset.status;
            const textoPesquisa = pesquisaTituloInput.value;
            renderizarListaDeHQs(filtrarHQs(listaDeHQs, statusAtivo, textoPesquisa));
            fecharModal();
            hqEditandoIndex = -1;
        }
    }

    function abrirModalEditar(index) {
        hqEditandoIndex = index;
        const hqParaEditar = listaDeHQs[index];
        document.getElementById('titulo').value = hqParaEditar.titulo;
        document.getElementById('status').value = hqParaEditar.status;
        document.getElementById('nota').value = hqParaEditar.nota === undefined ? '' : hqParaEditar.nota;
        document.getElementById('capitulos-lidos').value = hqParaEditar.capitulosLidos;
        document.getElementById('total-capitulos').value = hqParaEditar.totalCapitulos;
        document.getElementById('link-capa').value = hqParaEditar.linkCapa;
        const modalTitulo = document.querySelector('#modal-adicionar h2');
        modalTitulo.textContent = 'Editar HQ';
        formAdicionarHq.removeEventListener('submit', handleAdicionarHq);
        formAdicionarHq.addEventListener('submit', handleSalvarEdicaoHq);
        modalAdicionar.style.display = 'block';
    }

    function deletarHq(indexParaDeletar) {
        listaDeHQs = listaDeHQs.filter((hq, index) => index !== indexParaDeletar);
        salvarHQs();
        const statusAtivo = document.querySelector('.status-filter .active').dataset.status;
        const textoPesquisa = pesquisaTituloInput.value;
        renderizarListaDeHQs(filtrarHQs(listaDeHQs, statusAtivo, textoPesquisa));
    }

    function abrirModalAdicionar() {
        hqEditandoIndex = -1;
        const modalTitulo = document.querySelector('#modal-adicionar h2');
        modalTitulo.textContent = 'Adicionar Nova HQ';
        formAdicionarHq.removeEventListener('submit', handleSalvarEdicaoHq);
        formAdicionarHq.addEventListener('submit', handleAdicionarHq);
        formAdicionarHq.reset();
        modalAdicionar.style.display = 'block';
    }

    function fecharModal() {
        modalAdicionar.style.display = 'none';
        formAdicionarHq.reset();
        hqEditandoIndex = -1;
        const modalTitulo = document.querySelector('#modal-adicionar h2');
        modalTitulo.textContent = 'Adicionar Nova HQ';
        formAdicionarHq.removeEventListener('submit', handleSalvarEdicaoHq);
        formAdicionarHq.addEventListener('submit', handleAdicionarHq);
    }

    function cliqueForaModal(event) {
        if (event.target === modalAdicionar) {
            fecharModal();
        }
    }

    function filtrarPorStatus() {
        document.querySelector('.status-filter .active').classList.remove('active');
        this.classList.add('active');
        const status = this.dataset.status;
        const textoPesquisa = pesquisaTituloInput.value;
        renderizarListaDeHQs(filtrarHQs(listaDeHQs, status, textoPesquisa));
    }

    function pesquisarPorTitulo() {
        const statusAtivo = document.querySelector('.status-filter .active').dataset.status;
        const textoPesquisa = this.value.toLowerCase();
        renderizarListaDeHQs(filtrarHQs(listaDeHQs, statusAtivo, textoPesquisa));
    }

    function ordenarERenderizar() {
        const criterio = this.value;
        ordenarHQs(listaDeHQs, criterio);
        renderizarListaDeHQs(filtrarHQs(listaDeHQs, document.querySelector('.status-filter .active').dataset.status, pesquisaTituloInput.value));
    }

    formAdicionarHq.addEventListener('submit', handleAdicionarHq);
    adicionarHqBotao.addEventListener('click', abrirModalAdicionar);
    fecharModalBotao.addEventListener('click', fecharModal);
    cancelarAdicionarBotao.addEventListener('click', fecharModal);
    window.addEventListener('click', cliqueForaModal);

    filtroStatusBotoes.forEach(botao => {
        botao.addEventListener('click', filtrarPorStatus);
    });

    pesquisaTituloInput.addEventListener('input', pesquisarPorTitulo);
    ordenacaoSelect.addEventListener('change', ordenarERenderizar);

    // Delegação de eventos para os botões de deletar e editar
    hqListContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('delete-hq-btn')) {
            const hqItem = event.target.closest('.hq-item');
            if (hqItem && hqItem.dataset.hqIdOriginal) {
                const indexParaDeletar = parseInt(hqItem.dataset.hqIdOriginal);
                if (!isNaN(indexParaDeletar)) {
                    deletarHq(indexParaDeletar);
                }
            }
        } else if (event.target.classList.contains('options-hq-btn')) {
            const hqItem = event.target.closest('.hq-item');
            if (hqItem && hqItem.dataset.hqIdOriginal) {
                const indexParaEditar = parseInt(hqItem.dataset.hqIdOriginal);
                if (!isNaN(indexParaEditar)) {
                    abrirModalEditar(indexParaEditar);
                }
            }
        }
    });
});