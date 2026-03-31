let currentPage = 1;
let totalPages = 1;
let currentFilters = { name: "", episode: "" };
let currentData = [];

const datetimeDisplay = document.getElementById("datetimeDisplay");
const searchName = document.getElementById("searchName");
const searchEpisode = document.getElementById("searchEpisode");
const btnApplyFilters = document.getElementById("btnApplyFilters");
const btnClearFilters = document.getElementById("btnClearFilters");
const uiStateContainer = document.getElementById("uiStateContainer");
const cardsContainer = document.getElementById("cardsContainer");
const paginationContainer = document.getElementById("paginationContainer");
const btnPrevPage = document.getElementById("btnPrevPage");
const btnNextPage = document.getElementById("btnNextPage");
const currentPageSpan = document.getElementById("currentPage");
const totalPagesSpan = document.getElementById("totalPages");

const btnMenuToggle = document.getElementById("btnMenuToggle");
const sidebar = document.getElementById("sidebar");

function setUIState(state, message = "") {
  uiStateContainer.className = "ui-state";
  cardsContainer.innerHTML = "";
  paginationContainer.classList.add("hidden");

  if (state === "loading") {
    uiStateContainer.innerHTML = `<p class="pulse-text">⏳ ${message || "Carregando..."}</p>`;
    uiStateContainer.classList.remove("hidden");
  } else if (state === "error") {
    uiStateContainer.classList.add("error");
    uiStateContainer.innerHTML = `<p>⚠️ ${message}</p>`;
    uiStateContainer.classList.remove("hidden");
  } else if (state === "success") {
    uiStateContainer.classList.add("hidden");
    paginationContainer.classList.remove("hidden");
  }
}

async function fetchEpisodes(loadingMessage = "Carregando episódios...") {
  setUIState("loading", loadingMessage);

  await delay(1500);

  const params = new URLSearchParams({
    page: currentPage,
  });

  if (currentFilters.name) params.append("name", currentFilters.name);
  if (currentFilters.episode) params.append("episode", currentFilters.episode);

  try {
    const response = await fetch(
      `https://rickandmortyapi.com/api/episode/?${params.toString()}`,
    );

    if (!response.ok) {
      throw new Error("Erro na requisição da API");
    }

    const data = await response.json();
    console.log("Episódios retornados:", data);

    currentData = data.results;
    totalPages = data.info.pages;

    setUIState("success");
    renderCards(data.results);
    updatePaginationUI();
  } catch (error) {
    console.error(error);
    setUIState("error", "Nenhum episódio encontrado com esses filtros.");
    currentData = [];
  }
}

function renderCards(episodes) {
  cardsContainer.innerHTML = episodes
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
  datetimeDisplay.textContent = now.toLocaleDateString("pt-BR", options);
}

setInterval(updateDateTime, 1000);
updateDateTime();

function updatePaginationUI() {
  currentPageSpan.textContent = currentPage;
  totalPagesSpan.textContent = totalPages;

  btnPrevPage.disabled = currentPage === 1;
  btnNextPage.disabled = currentPage === totalPages;
}

function closeSidebarOnMobile() {
  if (window.innerWidth <= 768) {
    sidebar.classList.remove("active");
  }
}

btnMenuToggle.addEventListener("click", () => {
  sidebar.classList.toggle("active");
});

btnApplyFilters.addEventListener("click", () => {
  currentFilters.name = searchName.value.trim();
  currentFilters.episode = searchEpisode.value.trim();
  currentPage = 1;
  closeSidebarOnMobile();
  fetchEpisodes("Aplicando filtros...");
});

btnClearFilters.addEventListener("click", () => {
  searchName.value = "";
  searchEpisode.value = "";
  currentFilters.name = "";
  currentFilters.episode = "";
  currentPage = 1;
  closeSidebarOnMobile();
  fetchEpisodes("Limpando...");
});

btnPrevPage.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    fetchEpisodes();
  }
});

btnNextPage.addEventListener("click", () => {
  if (currentPage < totalPages) {
    currentPage++;
    fetchEpisodes();
  }
});

fetchEpisodes();
