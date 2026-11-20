const STORAGE_KEY = "sportshub_favorites";

let favorites = loadFavorites();
let allLoadedTeams = [];
let activeSportFilter = "all";
let currentController = null;
let debounceTimer = null;

const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const filterButtons = document.querySelectorAll(".filter-btn");
const welcomeState = document.getElementById("welcome-state");

function loadFavorites() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return parsed.map((item) => new Squadra({
      idTeam: item.id,
      strTeam: item.nome,
      strBadge: item.logo,
      strLeague: item.lega,
      strCountry: item.paese,
      strSport: item.sport
    }));
  } catch {
    return [];
  }
}

function saveFavorites(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function isFavorite(id) {
  return favorites.some((fav) => fav.id === id);
}

function getFilteredTeams() {
  if (activeSportFilter === "all") {
    return allLoadedTeams;
  }
  return allLoadedTeams.filter((t) => t.sport === activeSportFilter);
}

function refreshViews() {
  renderFavorites(favorites, isFavorite, handleToggleFavorite, handleSelectTeam);
  renderTeams(getFilteredTeams(), isFavorite, handleToggleFavorite, handleSelectTeam);
}

async function loadAllFavoritesAppointments() {
  if (favorites.length === 0) {
    renderUpcomingFavorites([], openEventModal);
    return;
  }

  const results = await Promise.allSettled(
    favorites.map(async (team) => {
      const data = await fetchTeamEvents(team.id);
      return (data.next || []).map((ev) => new Evento({ ...ev, teamName: team.nome }));
    })
  );

  const upcoming = [];
  results.forEach((res) => {
    if (res.status === "fulfilled") {
      upcoming.push(...res.value);
    }
  });

  upcoming.sort((a, b) => new Date(a.data) - new Date(b.data));
  renderUpcomingFavorites(upcoming, openEventModal);
}

async function handleToggleFavorite(squadra) {
  if (isFavorite(squadra.id)) {
    favorites = favorites.filter((fav) => fav.id !== squadra.id);
  } else {
    favorites.push(squadra);
  }
  saveFavorites(favorites);
  refreshViews();
  await loadAllFavoritesAppointments();
}

async function handleSelectTeam(squadra) {
  hideAlert();
  toggleSpinner(true);
  try {
    const { next, last } = await fetchTeamEvents(squadra.id);
    const nextEvents = next.map((e) => new Evento(e));
    const lastEvents = last.map((e) => new Evento(e));
    renderDetails(squadra.nome, nextEvents, lastEvents, openEventModal);
  } catch {
    showAlert("Impossibile caricare i dettagli della squadra.");
  } finally {
    toggleSpinner(false);
  }
}

async function runSearch(query) {
  const cleanQuery = query.trim();
  if (!cleanQuery) return;

  welcomeState.classList.add("d-none");
  if (currentController) {
    currentController.abort();
  }
  currentController = new AbortController();

  hideAlert();
  toggleSpinner(true);

  try {
    const rawTeams = await fetchTeamsByQuery(cleanQuery, currentController.signal);
    allLoadedTeams = rawTeams.map((t) => new Squadra(t));

    const filtered = getFilteredTeams();
    if (filtered.length === 0) {
      renderTeams([]);
      showAlert("Nessuna squadra trovata.");
      return;
    }

    renderTeams(filtered, isFavorite, handleToggleFavorite, handleSelectTeam);
  } catch (error) {
    if (error.name === "AbortError") return;
    allLoadedTeams = [];
    renderTeams([]);
    showAlert("Errore durante la ricerca delle squadre.");
  } finally {
    toggleSpinner(false);
  }
}

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  clearTimeout(debounceTimer);
  runSearch(searchInput.value);
});

searchInput.addEventListener("input", () => {
  clearTimeout(debounceTimer);
  const val = searchInput.value.trim();
  if (!val) return;
  debounceTimer = setTimeout(() => {
    runSearch(val);
  }, 400);
});

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    activeSportFilter = btn.dataset.sport;

    const filtered = getFilteredTeams();
    renderTeams(filtered, isFavorite, handleToggleFavorite, handleSelectTeam);

    if (allLoadedTeams.length > 0 && filtered.length === 0) {
      showAlert("Nessuna squadra trovata per questo sport.");
    } else {
      hideAlert();
    }
  });
});

refreshViews();
loadAllFavoritesAppointments();
