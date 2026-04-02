const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function updateDateTime() {
  const datetimeDisplay = document.getElementById("datetimeDisplay");
  if (!datetimeDisplay) return;

  const now = new Date();
  const options = {
    weekday: "long", year: "numeric", month: "long",
    day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit",
  };
  datetimeDisplay.textContent = now.toLocaleDateString("pt-BR", options);
}

setInterval(updateDateTime, 1000);
updateDateTime();

function setupSidebar() {
  const btnMenuToggle = document.getElementById("btnMenuToggle");
  const sidebar = document.getElementById("sidebar");

  if (btnMenuToggle && sidebar) {
    btnMenuToggle.addEventListener("click", () => {
      sidebar.classList.toggle("active");
    });
  }
}

setupSidebar();
function closeSidebarOnMobile() {
  const sidebar = document.getElementById("sidebar");
  if (sidebar && window.innerWidth <= 768) {
    sidebar.classList.remove("active");
  }
}