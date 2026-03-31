let currentPage = 1;
let totalPages = 1;
let currentFilters = { name: "", type: "", dimension: "" };
let currentData = [];

const datetimeDisplay = document.getElementById("datetimeDisplay");
const searchName = document.getElementById("searchName");
const searchType = document.getElementById("searchType");
const searchDimension = document.getElementById("searchDimension");
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

async function fetchDimensions(loadingMessage = "Carregando dimensões...") {
  setUIState("loading", loadingMessage);
  
  await delay(1500);

  const params = new URLSearchParams({
    page: currentPage,
  });

  if (currentFilters.name) params.append("name", currentFilters.name);
  if (currentFilters.type) params.append("type", currentFilters.type);
  if (currentFilters.dimension)
    params.append("dimension", currentFilters.dimension);

  try {
    const response = await fetch(
      `https://rickandmortyapi.com/api/location/?${params.toString()}`,
    );

    if (!response.ok) {
      throw new Error("Erro na requisição da API");
    }

    const data = await response.json();
    console.log("Dimensões retornadas:", data);

    currentData = data.results;
    totalPages = data.info.pages;

    setUIState("success");
    renderCards(data.results);
    updatePaginationUI();
  } catch (error) {
    console.error(error);
    setUIState("error", "Nenhuma dimensão encontrada com esses filtros.");
    currentData = [];
  }
}

function renderCards(dimensions) {
  cardsContainer.innerHTML = dimensions
    .map((loc) => {
      return `
    <article class="card" style="padding: 20px;">
        <h3 style="color: #97ce4c; margin-bottom: 10px; font-size: 1.3rem;">${loc.name}</h3>
        <p style="color: #898c99; margin-bottom: 5px;"><strong>Tipo:</strong> ${loc.type}</p>
        
        <p style="color: #898c99; margin-bottom: 15px;">
            <strong>Dimensão:</strong> ${loc.dimension === "unknown" ? "Desconhecida" : loc.dimension}
        </p>
        
        <div style="background: #222533; padding: 10px; border-radius: 6px; font-size: 0.9rem;">
            Residentes conhecidos: <strong>${loc.residents.length}</strong>
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
  currentFilters.type = searchType.value.trim();
  currentFilters.dimension = searchDimension.value.trim();
  currentPage = 1;
  closeSidebarOnMobile();
  fetchDimensions("Aplicando filtros...");
});

btnClearFilters.addEventListener("click", () => {
  searchName.value = "";
  searchType.value = "";
  searchDimension.value = "";
  currentFilters.name = "";
  currentFilters.type = "";
  currentFilters.dimension = "";
  currentPage = 1;
  closeSidebarOnMobile();
  fetchDimensions("Limpando...");
});

btnPrevPage.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    fetchDimensions();
  }
});

btnNextPage.addEventListener("click", () => {
  if (currentPage < totalPages) {
    currentPage++;
    fetchDimensions();
  }
});

fetchDimensions();