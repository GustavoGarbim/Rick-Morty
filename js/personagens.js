// Estado do APP.
const appState = {
  currentPage: 1,
  totalPages: 1,
  filters: {
    name: "",
    status: "",
    species: "",
    gender: "",
  },
  currentData: [],
};

// Elementos HTML.
const elements = {
  datetimeDisplay: document.getElementById("datetimeDisplay"),
  searchName: document.getElementById("searchName"),
  filterStatus: document.getElementById("filterStatus"),
  filterSpecies: document.getElementById("filterSpecies"),
  filterGender: document.getElementById("filterGender"),
  btnApplyFilters: document.getElementById("btnApplyFilters"),
  btnClearFilters: document.getElementById("btnClearFilters"),
  uiStateContainer: document.getElementById("uiStateContainer"),
  cardsContainer: document.getElementById("cardsContainer"),
  paginationContainer: document.getElementById("paginationContainer"),
  btnPrevPage: document.getElementById("btnPrevPage"),
  btnNextPage: document.getElementById("btnNextPage"),
  currentPageSpan: document.getElementById("currentPage"),
  totalPagesSpan: document.getElementById("totalPages"),
  modalOverlay: document.getElementById("characterModal"),
  btnCloseModal: document.getElementById("btnCloseModal"),
  modalBody: document.getElementById("modalBody"),
  btnMenuToggle: document.getElementById("btnMenuToggle"),
  sidebar: document.getElementById("sidebar"),
};

// Estado de UI.
function setUIState(state, message = "") {
  elements.uiStateContainer.className = "ui-state";
  elements.cardsContainer.innerHTML = "";
  elements.paginationContainer.classList.add("hidden");

  if (state === "loading") {
    elements.uiStateContainer.innerHTML = `<p class="pulse-text">⏳ ${message || "Carregando dados da API..."}</p>`;
    elements.uiStateContainer.classList.remove("hidden");
  } else if (state === "error") {
    elements.uiStateContainer.classList.add("error");
    elements.uiStateContainer.innerHTML = `<p>⚠️ ${message}</p>`;
    elements.uiStateContainer.classList.remove("hidden");
  } else if (state === "success") {
    // Se tudo der certo, ele esconde a mensagem.
    elements.uiStateContainer.classList.add("hidden");
    elements.paginationContainer.classList.remove("hidden");
  }
}

// função de buscar os personagens.
async function fetchCharacters(loadingMessage = "Carregando informações...") {
  setUIState("loading", loadingMessage);

  await delay(800);

  // montagem dos parametros dos filtros da URL.
  const params = new URLSearchParams({
    page: appState.currentPage,
  });

  if (appState.filters.name) params.append("name", appState.filters.name);
  if (appState.filters.status) params.append("status", appState.filters.status);
  if (appState.filters.species)
    params.append("species", appState.filters.species);
  if (appState.filters.gender) params.append("gender", appState.filters.gender);

  try {
    const response = await fetch(
      `https://rickandmortyapi.com/api/character/?${params.toString()}`,
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(
          "Nenhum personagem encontrado com os filtros aplicados.",
        );
      }
      throw new Error(
        `Erro na comunicação com a API (Status: ${response.status}).`,
      );
    }

    const data = await response.json();

    appState.currentData = data.results;
    appState.totalPages = data.info.pages;

    setUIState("success");
    renderCards(data.results);
    updatePaginationUI();
  } catch (error) {
    setUIState("error", error.message || "Falha na conexão de rede.");
    appState.currentData = [];
  }
}

function renderCards(characters) {
  elements.cardsContainer.innerHTML = characters
    .map((char) => {
      const statusClass = char.status.toLowerCase();
      // Tradução das caracteristicas do personagem.
      const origin =
        char.origin.name === "unknown"
          ? "Origem Desconhecida"
          : char.origin.name;
      const specieText =
        char.species === "Human"
          ? "Humano"
          : char.species === "Robot"
            ? "Robô"
            : char.species === "Humanoid"
              ? "Humanoide"
              : char.species === "Mythological Creature"
                ? "Criatura mitológica"
                : char.species;
      const genderText =
        char.gender === "Male"
          ? "Masculino"
          : char.gender === "Female"
            ? "Feminino"
            : "Desconhecido";
      const statusText =
        char.status === "Alive"
          ? "Vivo"
          : char.status === "Dead"
            ? "Morto"
            : "Desconhecido";

      return `
            <article class="card" onclick="openModal(${char.id})">
                <div class="card-img-wrapper">
                    <div class="status-badge">
                        <span class="status-dot ${statusClass}"></span>
                        ${statusText}
                    </div>
                    <img src="${char.image}" alt="${char.name}" loading="lazy">
                </div>
                <div class="card-info">
                    <h3>${char.name}</h3>
                    <p>${specieText} - ${genderText}</p>
                    <p>${origin}</p>
                </div>
            </article>
        `;
    })
    .join("");
}

function updatePaginationUI() {
  elements.currentPageSpan.textContent = appState.currentPage;
  elements.totalPagesSpan.textContent = appState.totalPages;

  elements.btnPrevPage.disabled = appState.currentPage === 1;
  elements.btnNextPage.disabled = appState.currentPage === appState.totalPages;
}

function openModal(characterId) {
  const character = appState.currentData.find((c) => c.id === characterId);
  if (!character) return;
  const origin =
    character.origin.name === "unknown"
      ? "Desconhecida"
      : character.origin.name;
  const specieText =
    character.species === "Human"
      ? "Humano"
      : character.species === "Robot"
        ? "Robô"
        : character.species === "Humanoid"
          ? "Humanoide"
          : character.species === "Mythological Creature"
            ? "Criatura mitológica"
            : character.species;
  const genderText =
    character.gender === "Male"
      ? "Masculino"
      : character.gender === "Female"
        ? "Feminino"
        : "Desconhecido";
  const statusText =
    character.status === "Alive"
      ? "Vivo"
      : character.status === "Dead"
        ? "Morto"
        : "Desconhecido";

  elements.modalBody.innerHTML = `
        <img src="${character.image}" alt="${character.name}" class="modal-img">
        <div class="modal-details">
            <h2>${character.name}</h2>
            
            <div class="detail-row">
                <span class="detail-label">Status</span>
                <span class="detail-value">${statusText}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">Espécie / Gênero</span>
                <span class="detail-value">${specieText} / ${genderText}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">Origem</span>
                <span class="detail-value">${origin}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">Última Localização Conhecida</span>
                <span class="detail-value">${character.location.name}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">Episódios</span>
                <span class="detail-value">Aparece em ${character.episode.length} episódio(s)</span>
            </div>
        </div>
    `;

  elements.modalOverlay.classList.remove("hidden");
}

function closeModal() {
  elements.modalOverlay.classList.add("hidden");
}

// Botão de aplicar filtros.
elements.btnApplyFilters.addEventListener("click", () => {
  appState.filters.name = elements.searchName.value.trim();
  appState.filters.status = elements.filterStatus.value;
  appState.filters.species = elements.filterSpecies.value;
  appState.filters.gender = elements.filterGender.value;
  appState.currentPage = 1;
  closeSidebarOnMobile();
  fetchCharacters("Aplicando filtros...");
});

// Botão de limpar filtros.
elements.btnClearFilters.addEventListener("click", () => {
  elements.searchName.value = "";
  elements.filterStatus.value = "";
  elements.filterSpecies.value = "";
  elements.filterGender.value = "";

  appState.filters.name = "";
  appState.filters.status = "";
  appState.filters.species = "";
  appState.filters.gender = "";
  appState.currentPage = 1;
  closeSidebarOnMobile();
  fetchCharacters("Limpando filtros...");
});

// Voltar 1 página.
elements.btnPrevPage.addEventListener("click", () => {
  if (appState.currentPage > 1) {
    appState.currentPage--;
    fetchCharacters("Viajando para a página anterior...");
  }
});

// Avançar 1 página.
elements.btnNextPage.addEventListener("click", () => {
  if (appState.currentPage < appState.totalPages) {
    appState.currentPage++;
    fetchCharacters("Buscando mais personagens...");
  }
});

// fechar modal no botão.
elements.btnCloseModal.addEventListener("click", closeModal);

// fechar modal quando clicar fora dele.
elements.modalOverlay.addEventListener("click", (event) => {
  if (event.target === elements.modalOverlay) {
    closeModal();
  }
});

// fechar modal quando apertar no ESC.
document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    !elements.modalOverlay.classList.contains("hidden")
  ) {
    closeModal();
  }
});

fetchCharacters("Abrindo portal espacial...");
