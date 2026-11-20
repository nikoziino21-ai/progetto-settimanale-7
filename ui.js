class Squadra {
  constructor(data) {
    this.id = data.idTeam;
    this.nome = data.strTeam;
    this.logo = data.strBadge || "";
    this.lega = data.strLeague || "Lega non disponibile";
    this.paese = data.strCountry || "";
    this.sport = data.strSport || "Soccer";
  }
}

class Evento {
  constructor(data) {
    this.id = data.idEvent;
    this.data = data.dateEvent;
    this.casa = data.strHomeTeam;
    this.trasferta = data.strAwayTeam;
    this.punteggioCasa = data.intHomeScore;
    this.punteggioTrasferta = data.intAwayScore;
    this.lega = data.strLeague || "Competizione";
    this.sport = data.strSport || "Sport";
    this.stadio = data.strVenue || "Impianto non specificato";
    this.squadraRiferimento = data.teamName || "";
  }

  formattaData() {
    if (!this.data) return "Data da definire";
    const parsed = new Date(this.data);
    if (Number.isNaN(parsed.getTime())) return this.data;
    return new Intl.DateTimeFormat("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }).format(parsed);
  }

  getPunteggio() {
    if (
      this.punteggioCasa !== null &&
      this.punteggioCasa !== undefined &&
      this.punteggioCasa !== "" &&
      this.punteggioTrasferta !== null &&
      this.punteggioTrasferta !== undefined &&
      this.punteggioTrasferta !== ""
    ) {
      return `${this.punteggioCasa} - ${this.punteggioTrasferta}`;
    }
    return null;
  }
}

const alertBox = document.getElementById("alert-box");
const spinner = document.getElementById("spinner");
const favoritesSection = document.getElementById("favorites-section");
const favoritesGrid = document.getElementById("favorites-grid");
const upcomingFavoritesSection = document.getElementById("upcoming-favorites-section");
const upcomingFavoritesList = document.getElementById("upcoming-favorites-list");
const resultsSection = document.getElementById("results-section");
const teamsGrid = document.getElementById("teams-grid");
const detailsSection = document.getElementById("details-section");
const detailsTeamName = document.getElementById("details-team-name");
const nextEventsList = document.getElementById("next-events-list");
const lastEventsList = document.getElementById("last-events-list");
const modalElement = document.getElementById("event-modal");
const modalSport = document.getElementById("modal-sport");
const modalTitle = document.getElementById("modal-title");
const modalBody = document.getElementById("modal-body");

const modalCloseButton = document.querySelector(".event-modal-close");

function closeEventModal() {
  modalElement.hidden = true;
}

modalCloseButton.addEventListener("click", closeEventModal);
modalElement.addEventListener("click", (event) => {
  if (event.target === modalElement) {
    closeEventModal();
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modalElement.hidden) {
    closeEventModal();
  }
});

function showAlert(message) {
  alertBox.textContent = message;
  alertBox.classList.remove("d-none");
}

function hideAlert() {
  alertBox.classList.add("d-none");
  alertBox.textContent = "";
}

function toggleSpinner(show) {
  spinner.classList.toggle("d-none", !show);
}

function createTeamCard(squadra, isFavSection, isFavCheck, onToggleFav, onSelectTeam) {
  const col = document.createElement("div");
  col.className = "col";

  const card = document.createElement("div");
  card.className = "card h-100 border-0 shadow-sm text-center p-4 team-card";

  const img = document.createElement("img");
  img.className = "mx-auto mb-3 team-badge";
  img.src = squadra.logo;
  img.alt = squadra.nome;

  const name = document.createElement("h3");
  name.className = "h6 fw-bold mb-1";
  name.textContent = squadra.nome;

  const league = document.createElement("p");
  league.className = "text-muted small mb-0";
  league.textContent = squadra.lega;

  const country = document.createElement("p");
  country.className = "text-muted small mb-2";
  country.textContent = squadra.paese;

  const sportTag = document.createElement("span");
  sportTag.className = "badge rounded-pill align-self-center mb-3 px-3 py-1 brand-badge";
  sportTag.textContent = squadra.sport;

  const btn = document.createElement("button");
  btn.type = "button";
  const alreadyFav = isFavCheck(squadra.id);

  if (isFavSection || alreadyFav) {
    btn.className = "btn btn-sm btn-outline-danger fw-semibold mt-auto w-100 rounded-2";
    btn.textContent = "🗑 Rimuovi";
  } else {
    btn.className = "btn btn-sm btn-outline-primary fw-semibold mt-auto w-100 rounded-2";
    btn.textContent = "⭐ Aggiungi ai preferiti";
  }

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    onToggleFav(squadra);
  });

  card.addEventListener("click", () => {
    onSelectTeam(squadra);
  });

  card.append(img, name, league, country, sportTag, btn);
  col.appendChild(card);
  return col;
}

function renderFavorites(favorites, isFavCheck, onToggleFav, onSelectTeam) {
  favoritesGrid.innerHTML = "";
  if (favorites.length === 0) {
    favoritesSection.classList.add("d-none");
    return;
  }

  favoritesSection.classList.remove("d-none");
  favorites.forEach((squadra) => {
    favoritesGrid.appendChild(
      createTeamCard(squadra, true, isFavCheck, onToggleFav, onSelectTeam)
    );
  });
}

function renderTeams(squadre, isFavCheck, onToggleFav, onSelectTeam) {
  teamsGrid.innerHTML = "";
  if (squadre.length === 0) {
    resultsSection.classList.add("d-none");
    return;
  }

  resultsSection.classList.remove("d-none");
  squadre.forEach((squadra) => {
    teamsGrid.appendChild(
      createTeamCard(squadra, false, isFavCheck, onToggleFav, onSelectTeam)
    );
  });
}

function createEventItem(evento, onOpenModal, showTeamPrefix = false) {
  const li = document.createElement("li");
  li.className = "list-group-item py-3 px-3 event-item";

  const dateSpan = document.createElement("div");
  dateSpan.className = "text-muted small mb-1";
  dateSpan.textContent = showTeamPrefix && evento.squadraRiferimento
    ? `${evento.formattaData()} · ${evento.squadraRiferimento}`
    : evento.formattaData();

  const row = document.createElement("div");
  row.className = "d-flex align-items-center justify-content-between gap-2 flex-wrap";

  const matchSpan = document.createElement("span");
  matchSpan.className = "fw-bold small";
  matchSpan.textContent = `${evento.casa} vs ${evento.trasferta}`;
  row.appendChild(matchSpan);

  const score = evento.getPunteggio();
  if (score) {
    const scoreBadge = document.createElement("span");
    scoreBadge.className = "badge bg-success px-2 py-1";
    scoreBadge.textContent = score;
    row.appendChild(scoreBadge);
  } else {
    const sub = document.createElement("span");
    sub.className = "small fw-semibold brand-text";
    sub.textContent = "Dettagli";
    row.appendChild(sub);
  }

  li.addEventListener("click", () => onOpenModal(evento));
  li.append(dateSpan, row);
  return li;
}

function renderEventList(container, eventi, emptyText, onOpenModal) {
  container.innerHTML = "";
  if (!eventi || eventi.length === 0) {
    const li = document.createElement("li");
    li.className = "list-group-item text-muted fst-italic small py-3";
    li.textContent = emptyText;
    container.appendChild(li);
    return;
  }

  eventi.forEach((ev) => {
    container.appendChild(createEventItem(ev, onOpenModal, false));
  });
}

function renderDetails(teamName, prossimiEventi, ultimiRisultati, onOpenModal) {
  detailsTeamName.textContent = teamName;
  renderEventList(nextEventsList, prossimiEventi, "Nessun evento in programma", onOpenModal);
  renderEventList(lastEventsList, ultimiRisultati, "Nessun risultato recente", onOpenModal);
  detailsSection.classList.remove("d-none");
  detailsSection.scrollIntoView({ behavior: "smooth" });
}

function renderUpcomingFavorites(eventi, onOpenModal) {
  upcomingFavoritesList.innerHTML = "";
  if (!eventi || eventi.length === 0) {
    upcomingFavoritesSection.classList.add("d-none");
    return;
  }

  upcomingFavoritesSection.classList.remove("d-none");
  eventi.forEach((ev) => {
    upcomingFavoritesList.appendChild(createEventItem(ev, onOpenModal, true));
  });
}

function openEventModal(evento) {
  modalSport.textContent = `${evento.sport} · ${evento.lega}`;
  modalTitle.textContent = `${evento.casa} vs ${evento.trasferta}`;

  const rows = [
    ["Data", evento.formattaData()],
    ["Squadra di casa", evento.casa],
    ["Squadra in trasferta", evento.trasferta],
    ["Risultato", evento.getPunteggio() || "Da disputare"],
    ["Impianto", evento.stadio],
    ["ID Evento", evento.id]
  ];

  modalBody.innerHTML = "";
  rows.forEach(([label, val]) => {
    const row = document.createElement("div");
    row.className = "d-flex justify-content-between py-2 border-bottom small";

    const spanLabel = document.createElement("span");
    spanLabel.className = "text-muted fw-semibold";
    spanLabel.textContent = label;

    const spanVal = document.createElement("span");
    spanVal.className = "fw-bold text-end";
    spanVal.textContent = val;

    row.append(spanLabel, spanVal);
    modalBody.appendChild(row);
  });

  modalElement.hidden = false;
}
