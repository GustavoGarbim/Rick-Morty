const appState = {
  currentPage: 1,
  totalPages: 1,
  filters: {
    name: "",
    episode: "",
  },
  currentData: [],
}

const elements = {
  datetimeDisplay: document.getElementById("datetimeDisplay"),
  searchName: document.getElementById("searchName"),
  searchEpisode: document.getElementById("searchEpisode"),
  btnApplyFilters: document.getElementById("btnApplyFilters"),
  btnClearFilters: document.getElementById("btnClearFilters"),
  uiStateContainer: document.getElementById("uiStateContainer"),
  cardsContainer: document.getElementById("cardsContainer"),
  paginationContainer: document.getElementById("paginationContainer"),
  btnPrevPage: document.getElementById("btnPrevPage"),
  btnNextPage: document.getElementById("btnNextPage"),
  currentPageSpan: document.getElementById("currentPage"),
  totalPagesSpan: document.getElementById("totalPages"),
  btnMenuToggle: document.getElementById("btnMenuToggle"),
  sidebar: document.getElementById("sidebar")
};

function setUIState(state, message = "") {
  elements.uiStateContainer.className = "ui-state";
  elements.cardsContainer.innerHTML = "";
  elements.paginationContainer.classList.add("hidden");

  if (state === "loading") {
    elements.uiStateContainer.innerHTML = `<p class="pulse-text">⏳ ${message || "Carregando..."}</p>`;
    elements.uiStateContainer.classList.remove("hidden");
  } else if (state === "error") {
    elements.uiStateContainer.classList.add("error");
    elements.uiStateContainer.innerHTML = `<p>⚠️ ${message}</p>`;
    elements.uiStateContainer.classList.remove("hidden");
  } else if (state === "success") {
    elements.uiStateContainer.classList.add("hidden");
    elements.paginationContainer.classList.remove("hidden");
  }
}

async function fetchEpisodes(loadingMessage = "Carregando episódios...") {
  setUIState("loading", loadingMessage);

  await delay(1000);

  const params = new URLSearchParams({
    page: appState.currentPage,
  });

  if (appState.filters.name) params.append("name", appState.filters.name);
  if (appState.filters.episode) params.append("episode", appState.filters.episode);

  try {
    const response = await fetch(
      `https://rickandmortyapi.com/api/episode/?${params.toString()}`,
    );

    if (!response.ok) {
      throw new Error("Erro na requisição da API");
    }

    const data = await response.json();
    console.log("Episódios retornados:", data);

    appState.currentData = data.results;
    appState.totalPages = data.info.pages;

    setUIState("success");
    renderCards(data.results);
    updatePaginationUI();
  } catch (error) {
    console.error(error);
    setUIState("error", "Nenhum episódio encontrado com esses filtros.");
    appState.currentData = [];
  }
}

function renderCards(episodes) {
  elements.cardsContainer.innerHTML = episodes
    .map((ep) => {
      return `
            <article class="card" style="padding: 20px;">
                <h3 style="color: #97ce4c; margin-bottom: 10px; font-size: 1.3rem;">${ep.name}</h3>
                <p style="color: #898c99; margin-bottom: 5px;"><strong>Código:</strong> ${ep.episode}</p>
                <p style="color: #898c99; margin-bottom: 15px;"><strong>Lançamento:</strong> ${ep.air_date}</p>
                
                <div style="background: #222533; padding: 10px; border-radius: 6px; font-size: 0.9rem;">
                    Personagens neste ep: <strong>${ep.characters.length}</strong>
                </div>
            </article>
        `;
    })
    .join("");
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function updateDateTime() {
  const now = new Date();
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };
  elements.datetimeDisplay.textContent = now.toLocaleDateString("pt-BR", options);
}

setInterval(updateDateTime, 1000);
updateDateTime();

function updatePaginationUI() {
  elements.currentPageSpan.textContent = appState.currentPage;
  elements.totalPagesSpan.textContent = appState.totalPages;

  elements.btnPrevPage.disabled = appState.currentPage === 1;
  elements.btnNextPage.disabled = appState.currentPage === appState.totalPages;
}

function closeSidebarOnMobile() {
  if (window.innerWidth <= 768) {
    elements.sidebar.classList.remove("active");
  }
}

elements.btnMenuToggle.addEventListener("click", () => {
  elements.sidebar.classList.toggle("active");
});

elements.btnApplyFilters.addEventListener("click", () => {
  appState.filters.name = elements.searchName.value.trim();
  appState.filters.episode = elements.searchEpisode.value.trim();
  appState.currentPage = 1;
  closeSidebarOnMobile();
  fetchEpisodes("Aplicando filtros...");
});

elements.btnClearFilters.addEventListener("click", () => {
  elements.searchName.value = "";
  elements.searchEpisode.value = "";
  appState.filters.name = "";
  appState.filters.episode = "";
  appState.currentPage = 1;
  closeSidebarOnMobile();
  fetchEpisodes("Limpando filtros...");
});

elements.btnPrevPage.addEventListener("click", () => {
  if (appState.currentPage > 1) {
    appState.currentPage--;
    fetchEpisodes("Viajando para a página anterior...");
  }
});

elements.btnNextPage.addEventListener("click", () => {
  if (appState.currentPage < appState.totalPages) {
    appState.currentPage++;
    fetchEpisodes("Buscando mais episódios...");
  }
});

fetchEpisodes();
