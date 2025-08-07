document.addEventListener('DOMContentLoaded', function() {
    // Variáveis globais
    const statusFilters = document.querySelectorAll('.status-filters a');
    const publisherFilters = document.querySelectorAll('.publisher-filters a');
    const sortBySelect = document.querySelector('#sort-by');
    let currentFilterStatus = 'all';
    let currentFilterPublisher = 'all';
    let allHqData = [];
    const statusOrder = ['watching', 'completed', 'paused', 'plan-to-watch', 'dropped', 'upcoming'];

    // Modais e seus botões (garantir que estejam ocultos ao iniciar)
    const addHqModal = document.getElementById('add-hq-modal');
    const editHqModal = document.getElementById('edit-hq-modal');
    addHqModal.style.display = 'none';
    editHqModal.style.display = 'none';

    const closeAddModalButton = document.querySelector('#add-hq-modal .close-button');
    const closeEditModalButton = document.getElementById('close-edit-modal');
    const cancelEditButton = document.getElementById('cancel-edit-button');

    // Formulários
    const addHqForm = document.getElementById('add-hq-form');
    const editHqForm = document.getElementById('edit-hq-form');

    // Campos do Modal de Adicionar HQ
    const hqNameInput = document.getElementById('hq-name');
    const hqCoverLinkInput = document.getElementById('hq-cover-link');
    const hqPublisherSelect = document.getElementById('hq-publisher');
    const hqStatusSelect = document.getElementById('hq-status');
    const hqScoreInput = document.getElementById('hq-score');
    const hqReadChaptersInput = document.getElementById('hq-read-chapters');
    const hqTotalChaptersInput = document.getElementById('hq-total-chapters');
    const hqHashtagsInput = document.getElementById('hq-hashtags'); // NOVO CAMPO DE HASHTAGS

    // Campos do Modal de Editar HQ
    const editHqIdInput = document.getElementById('edit-hq-id');
    const editHqNameInput = document.getElementById('edit-hq-name');
    const editHqCoverLinkInput = document.getElementById('edit-hq-cover-link');
    const editHqPublisherSelect = document.getElementById('edit-hq-publisher');
    const editHqStatusSelect = document.getElementById('edit-hq-status');
    const editHqScoreInput = document.getElementById('edit-hq-score');
    const editHqReadChaptersInput = document.getElementById('edit-hq-read-chapters');
    const editHqTotalChaptersInput = document.getElementById('edit-hq-total-chapters');
    const editHqHashtagsInput = document.getElementById('edit-hq-hashtags'); // NOVO CAMPO DE HASHTAGS
    let currentEditingHq = null;

    // Barra de Pesquisa
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');

    const hqListMain = document.querySelector('.hq-list');

    // Funções de salvamento e carregamento
    function saveHqData(newHq) {
        const storedHq = localStorage.getItem('myHqList');
        let hqArray = storedHq ? JSON.parse(storedHq) : [];
        hqArray.push(newHq);
        localStorage.setItem('myHqList', JSON.stringify(hqArray));
        allHqData = hqArray;
    }

    function loadHqData() {
        const storedHq = localStorage.getItem('myHqList');
        allHqData = storedHq ? JSON.parse(storedHq) : [];
        return allHqData;
    }

    function updateHqData(id, updates) {
        let hqArray = loadHqData();
        const hqIndex = hqArray.findIndex(hq => hq.id === id);
        if (hqIndex !== -1) {
            hqArray[hqIndex] = { ...hqArray[hqIndex], ...updates };
            localStorage.setItem('myHqList', JSON.stringify(hqArray));
            allHqData = hqArray;
        }
    }

    // Funções de comparação para ordenação
    function compareByScoreDescending(a, b) {
        const scoreA = parseFloat(a.score) || -1;
        const scoreB = parseFloat(b.score) || -1;
        if (scoreB !== scoreA) {
            return scoreB - scoreA;
        } else {
            return a.name.localeCompare(b.name);
        }
    }

    function compareByScoreAscending(a, b) {
        const scoreA = parseFloat(a.score) || -1;
        const scoreB = parseFloat(b.score) || -1;
        if (scoreA !== scoreB) {
            return scoreA - scoreB;
        } else {
            return a.name.localeCompare(b.name);
        }
    }

    function compareByTitleAscending(a, b) {
        return a.name.localeCompare(b.name);
    }

    function compareByTitleDescending(a, b) {
        return b.name.localeCompare(a.name);
    }

    // Função para renderizar os cards de HQ
    function renderHqCard(hq) {
        const hqCard = document.createElement('div');
        hqCard.classList.add('hq-card');
        hqCard.setAttribute('data-id', hq.id);
        hqCard.setAttribute('data-status', hq.status);
        hqCard.setAttribute('data-score', hq.score);
        hqCard.setAttribute('data-name', hq.name);
        hqCard.setAttribute('data-publisher', hq.publisher);

        const readChapters = hq.readChapters || 0;
        const totalChapters = hq.totalChapters || 0;
        let chaptersText = '';

        if (totalChapters > 0) {
            chaptersText = `${readChapters}/${totalChapters}`;
        } else if (readChapters > 0) {
            chaptersText = `${readChapters}`;
        } else {
            chaptersText = '0';
        }

        hqCard.innerHTML = `
            <img src="${hq.coverLink || 'placeholder.jpg'}" alt="${hq.name} Cover">
            <div class="info-overlay">${hq.score || 'N/A'}</div>
            <div class="chapters-overlay">${chaptersText}</div>
            <h3>${hq.name}</h3>
            <div class="chapters-controls">
                <button class="decrease-chapters"><i class="fas fa-minus"></i></button>
                <span class="current-chapters">${readChapters}</span>
                <button class="increase-chapters"><i class="fas fa-plus"></i></button>
            </div>
            <div class="buttons-container">
                <button class="options-button edit-button" data-id="${hq.id}"><i class="fas fa-edit"></i></button>
                <button class="remove-button" data-id="${hq.id}"><i class="fas fa-times"></i></button>
            </div>
        `;

        return hqCard;
    }

    // Função para renderizar um grupo de status
    function renderHqGroup(status, hqs) {
        let targetGrid = document.querySelector(`.status-group[data-status="${status}"] .hq-grid`);
        if (!targetGrid) {
            const statusGroupSection = document.createElement('section');
            statusGroupSection.classList.add('status-group');
            statusGroupSection.setAttribute('data-status', status);

            const title = document.createElement('h2');
            title.textContent = status.charAt(0).toUpperCase() + status.slice(1).replace(/-/g, ' ');
            statusGroupSection.appendChild(title);

            targetGrid = document.createElement('div');
            targetGrid.classList.add('hq-grid');
            statusGroupSection.appendChild(targetGrid);

            hqListMain.appendChild(statusGroupSection);
        } else {
            targetGrid.innerHTML = '';
        }

        hqs.forEach(hq => {
            targetGrid.appendChild(renderHqCard(hq));
        });
    }

    // Função principal para carregar e exibir HQ's
    function loadAndDisplayHq(sortBy = 'default', filterByStatus = 'all', filterByPublisher = 'all', searchTerm = '') {
        let hqsToDisplay = loadHqData();

        // Aplicar pesquisa (com lógica de hashtag ou título)
        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            if (lowerCaseSearchTerm.startsWith('#')) {
                const searchHashtag = lowerCaseSearchTerm.substring(1); // Remove o #
                hqsToDisplay = hqsToDisplay.filter(hq =>
                    hq.hashtags && hq.hashtags.includes(searchHashtag)
                );
            } else {
                hqsToDisplay = hqsToDisplay.filter(hq =>
                    hq.name.toLowerCase().includes(lowerCaseSearchTerm)
                );
            }
        }

        // Aplicar filtro de status
        if (filterByStatus !== 'all') {
            hqsToDisplay = hqsToDisplay.filter(hq => hq.status === filterByStatus);
        }

        // Aplicar filtro de editora
        if (filterByPublisher !== 'all') {
            hqsToDisplay = hqsToDisplay.filter(hq => hq.publisher === filterByPublisher);
        }

        // Aplicar ordenação
        switch (sortBy) {
            case 'score-desc':
                hqsToDisplay.sort(compareByScoreDescending);
                break;
            case 'score-asc':
                hqsToDisplay.sort(compareByScoreAscending);
                break;
            case 'title-asc':
                hqsToDisplay.sort(compareByTitleAscending);
                break;
            case 'title-desc':
                hqsToDisplay.sort(compareByTitleDescending);
                break;
            case 'default':
            default:
                break;
        }

        // Limpar todos os grupos existentes antes de renderizar
        document.querySelectorAll('.hq-grid').forEach(grid => grid.innerHTML = '');
        document.querySelectorAll('.status-group').forEach(group => group.style.display = 'none');

        // Agrupar e renderizar
        const groupedHqs = {};
        hqsToDisplay.forEach(hq => {
            if (!groupedHqs[hq.status]) {
                groupedHqs[hq.status] = [];
            }
            groupedHqs[hq.status].push(hq);
        });

        statusOrder.forEach(status => {
            const groupSection = document.querySelector(`.status-group[data-status="${status}"]`);
            if (groupSection) {
                if (groupedHqs[status] && groupedHqs[status].length > 0) {
                    groupSection.style.display = 'block';
                    renderHqGroup(status, groupedHqs[status]);
                } else {
                    groupSection.style.display = 'none';
                }
            }
        });

        addChaptersButtonListeners();
        addOptionsButtonListeners();
    }

    // Adiciona listeners para os botões de capítulos (+/-)
    function addChaptersButtonListeners() {
        document.querySelectorAll('.hq-card .increase-chapters').forEach(button => {
            button.onclick = function(event) {
                event.stopPropagation();
                const hqCard = this.closest('.hq-card');
                const hqId = parseInt(hqCard.getAttribute('data-id'));
                let hq = allHqData.find(item => item.id === hqId);
                if (hq) {
                    let newReadChapters = (hq.readChapters || 0) + 1;
                    if (hq.totalChapters && newReadChapters > hq.totalChapters) {
                        newReadChapters = hq.totalChapters;
                    }
                    updateHqData(hqId, { readChapters: newReadChapters });
                    loadAndDisplayHq(sortBySelect.value, currentFilterStatus, currentFilterPublisher, searchInput.value.trim());
                }
            };
        });

        document.querySelectorAll('.hq-card .decrease-chapters').forEach(button => {
            button.onclick = function(event) {
                event.stopPropagation();
                const hqCard = this.closest('.hq-card');
                const hqId = parseInt(hqCard.getAttribute('data-id'));
                let hq = allHqData.find(item => item.id === hqId);
                if (hq) {
                    let newReadChapters = (hq.readChapters || 0) - 1;
                    if (newReadChapters < 0) newReadChapters = 0;
                    updateHqData(hqId, { readChapters: newReadChapters });
                    loadAndDisplayHq(sortBySelect.value, currentFilterStatus, currentFilterPublisher, searchInput.value.trim());
                }
            };
        });
    }

    // Adiciona listeners para os botões de opções (Editar e Remover)
    function addOptionsButtonListeners() {
        document.querySelectorAll('.hq-card .edit-button').forEach(button => {
            button.onclick = function(event) {
                event.stopPropagation();
                const hqId = parseInt(this.getAttribute('data-id'));
                currentEditingHq = allHqData.find(hq => hq.id === hqId);
                if (currentEditingHq) {
                    editHqIdInput.value = currentEditingHq.id;
                    editHqNameInput.value = currentEditingHq.name;
                    editHqCoverLinkInput.value = currentEditingHq.coverLink || '';
                    editHqPublisherSelect.value = currentEditingHq.publisher || 'outros';
                    editHqStatusSelect.value = currentEditingHq.status;
                    editHqScoreInput.value = currentEditingHq.score;
                    editHqReadChaptersInput.value = currentEditingHq.readChapters || 0;
                    editHqTotalChaptersInput.value = currentEditingHq.totalChapters || 0;
                    // NOVO: Preenche o campo de hashtags com as hashtags existentes, formatadas com '#' e separadas por vírgula
                    editHqHashtagsInput.value = currentEditingHq.hashtags && currentEditingHq.hashtags.length > 0
                                                    ? currentEditingHq.hashtags.map(tag => '#' + tag).join(', ')
                                                    : '';
                    editHqModal.style.display = 'flex';
                }
            };
        });

        document.querySelectorAll('.hq-card .remove-button').forEach(button => {
            button.onclick = function(event) {
                event.stopPropagation();
                const hqId = parseInt(this.getAttribute('data-id'));
                if (confirm('Tem certeza que deseja remover esta HQ da sua lista?')) {
                    removeHq(hqId);
                }
            };
        });
    }

    // Função para remover uma HQ
    function removeHq(id) {
        let hqArray = loadHqData();
        hqArray = hqArray.filter(hq => hq.id !== id);
        localStorage.setItem('myHqList', JSON.stringify(hqArray));
        allHqData = hqArray;
        loadAndDisplayHq(sortBySelect.value, currentFilterStatus, currentFilterPublisher, searchInput.value.trim());
    }

    // Event Listeners

    // Abre o modal de adicionar HQ
    const addHqBtn = document.getElementById('add-hq-btn');
    addHqBtn.addEventListener('click', function() {
        addHqForm.reset();
        hqPublisherSelect.value = 'outros'; // Define um valor padrão para editora
        hqHashtagsInput.value = ''; // Limpa o campo de hashtags
        addHqModal.style.display = 'flex';
    });

    // Fecha o modal de adicionar HQ
    closeAddModalButton.addEventListener('click', function() {
        addHqModal.style.display = 'none';
    });

    // Fecha o modal de edição
    closeEditModalButton.addEventListener('click', function() {
        editHqModal.style.display = 'none';
    });

    cancelEditButton.addEventListener('click', function() {
        editHqModal.style.display = 'none';
    });

    // Fechar modais ao clicar fora
    window.addEventListener('click', function(event) {
        if (event.target == addHqModal) {
            addHqModal.style.display = 'none';
        }
        if (event.target == editHqModal) {
            editHqModal.style.display = 'none';
        }
    });

    // Submissão do formulário de adicionar HQ
    addHqForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const hashtagsText = hqHashtagsInput.value.trim(); // Pega o texto do novo campo de hashtags
        const newHq = {
            id: Date.now(),
            name: hqNameInput.value.trim(),
            coverLink: hqCoverLinkInput.value.trim(),
            publisher: hqPublisherSelect.value,
            status: hqStatusSelect.value,
            score: parseFloat(hqScoreInput.value) || null,
            readChapters: parseInt(hqReadChaptersInput.value) || 0,
            totalChapters: parseInt(hqTotalChaptersInput.value) || 0,
            // Processa as hashtags: divide por vírgula, trim, remove '#' e converte para minúsculas
            hashtags: hashtagsText ? hashtagsText.split(',').map(tag => tag.trim().replace(/^#/, '').toLowerCase()).filter(tag => tag) : []
        };
        saveHqData(newHq);
        addHqModal.style.display = 'none';
        loadAndDisplayHq(sortBySelect.value, currentFilterStatus, currentFilterPublisher, searchInput.value.trim());
    });

    // Submissão do formulário de editar HQ
    editHqForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const hashtagsText = editHqHashtagsInput.value.trim(); // Pega o texto do novo campo de hashtags
        const hqId = parseInt(editHqIdInput.value);
        const updates = {
            name: editHqNameInput.value.trim(),
            coverLink: editHqCoverLinkInput.value.trim(),
            publisher: editHqPublisherSelect.value,
            status: editHqStatusSelect.value,
            score: parseFloat(editHqScoreInput.value) || null,
            readChapters: parseInt(editHqReadChaptersInput.value) || 0,
            totalChapters: parseInt(editHqTotalChaptersInput.value) || 0,
            // Processa as hashtags: divide por vírgula, trim, remove '#' e converte para minúsculas
            hashtags: hashtagsText ? hashtagsText.split(',').map(tag => tag.trim().replace(/^#/, '').toLowerCase()).filter(tag => tag) : []
        };
        updateHqData(hqId, updates);
        editHqModal.style.display = 'none';
        loadAndDisplayHq(sortBySelect.value, currentFilterStatus, currentFilterPublisher, searchInput.value.trim());
    });

    // Filtros de Status
    statusFilters.forEach(filter => {
        filter.addEventListener('click', function(event) {
            event.preventDefault();
            const status = this.getAttribute('data-status');
            currentFilterStatus = status;

            document.querySelector('.status-filters a.active').classList.remove('active');
            this.classList.add('active');

            loadAndDisplayHq(sortBySelect.value, currentFilterStatus, currentFilterPublisher, searchInput.value.trim());
        });
    });

    // Filtros de Editora
    publisherFilters.forEach(filter => {
        filter.addEventListener('click', function(event) {
            event.preventDefault();
            const publisher = this.getAttribute('data-publisher');
            currentFilterPublisher = publisher;

            document.querySelector('.publisher-filters a.active').classList.remove('active');
            this.classList.add('active');

            loadAndDisplayHq(sortBySelect.value, currentFilterStatus, currentFilterPublisher, searchInput.value.trim());
        });
    });

    // Ordenação
    if (sortBySelect) {
        sortBySelect.addEventListener('change', function() {
            loadAndDisplayHq(this.value, currentFilterStatus, currentFilterPublisher, searchInput.value.trim());
        });
    }

    // Pesquisa por título ou hashtag
    searchInput.addEventListener('input', function() {
        loadAndDisplayHq(sortBySelect.value, currentFilterStatus, currentFilterPublisher, this.value.trim());
    });

    searchButton.addEventListener('click', function() {
        loadAndDisplayHq(sortBySelect.value, currentFilterStatus, currentFilterPublisher, searchInput.value.trim());
    });

    // Carrega e exibe as HQ's na inicialização da página
    loadAndDisplayHq(sortBySelect ? sortBySelect.value : 'default', currentFilterStatus, currentFilterPublisher);
});
