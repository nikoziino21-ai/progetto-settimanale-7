const API_BASE = "https://www.thesportsdb.com/api/v1/json/123/";

const MOCK_TEAMS = [
  {
    idTeam: "133604",
    strTeam: "Arsenal",
    strBadge: "https://www.thesportsdb.com/images/media/team/badge/uyhbfe1612467038.png",
    strLeague: "English Premier League",
    strCountry: "England",
    strSport: "Soccer"
  },
  {
    idTeam: "133681",
    strTeam: "Inter Milan",
    strBadge: "https://www.thesportsdb.com/images/media/team/badge/quprqp1420568193.png",
    strLeague: "Italian Serie A",
    strCountry: "Italy",
    strSport: "Soccer"
  },
  {
    idTeam: "133739",
    strTeam: "Barcelona",
    strBadge: "https://www.thesportsdb.com/images/media/team/badge/wq9sir1639406443.png",
    strLeague: "Spanish La Liga",
    strCountry: "Spain",
    strSport: "Soccer"
  },
  {
    idTeam: "134880",
    strTeam: "Los Angeles Lakers",
    strBadge: "https://www.thesportsdb.com/images/media/team/badge/vqvvv11448814222.png",
    strLeague: "NBA",
    strCountry: "USA",
    strSport: "Basketball"
  },
  {
    idTeam: "134937",
    strTeam: "Kansas City Chiefs",
    strBadge: "https://www.thesportsdb.com/images/media/team/badge/xvwvwv1448813268.png",
    strLeague: "NFL",
    strCountry: "USA",
    strSport: "American Football"
  }
];

const MOCK_EVENTS = {
  "133604": {
    next: [
      { idEvent: "9001", dateEvent: "2026-11-28", strHomeTeam: "Arsenal", strAwayTeam: "Chelsea", intHomeScore: null, intAwayScore: null, strLeague: "English Premier League", strSport: "Soccer", strVenue: "Emirates Stadium" },
      { idEvent: "9002", dateEvent: "2026-12-05", strHomeTeam: "Tottenham", strAwayTeam: "Arsenal", intHomeScore: null, intAwayScore: null, strLeague: "English Premier League", strSport: "Soccer", strVenue: "Tottenham Hotspur Stadium" }
    ],
    last: [
      { idEvent: "9003", dateEvent: "2026-11-14", strHomeTeam: "Arsenal", strAwayTeam: "Manchester United", intHomeScore: "2", intAwayScore: "0", strLeague: "English Premier League", strSport: "Soccer", strVenue: "Emirates Stadium" },
      { idEvent: "9004", dateEvent: "2026-11-07", strHomeTeam: "Aston Villa", strAwayTeam: "Arsenal", intHomeScore: "1", intAwayScore: "3", strLeague: "English Premier League", strSport: "Soccer", strVenue: "Villa Park" }
    ]
  },
  "133681": {
    next: [
      { idEvent: "9011", dateEvent: "2026-11-29", strHomeTeam: "Inter Milan", strAwayTeam: "Napoli", intHomeScore: null, intAwayScore: null, strLeague: "Italian Serie A", strSport: "Soccer", strVenue: "San Siro" }
    ],
    last: [
      { idEvent: "9012", dateEvent: "2026-11-08", strHomeTeam: "Inter Milan", strAwayTeam: "Hellas Verona", intHomeScore: "1", intAwayScore: "1", strLeague: "Italian Serie A", strSport: "Soccer", strVenue: "San Siro" }
    ]
  },
  "133739": {
    next: [
      { idEvent: "9021", dateEvent: "2026-12-02", strHomeTeam: "Barcelona", strAwayTeam: "Atletico Madrid", intHomeScore: null, intAwayScore: null, strLeague: "Spanish La Liga", strSport: "Soccer", strVenue: "Spotify Camp Nou" }
    ],
    last: [
      { idEvent: "9022", dateEvent: "2026-11-15", strHomeTeam: "Barcelona", strAwayTeam: "Real Betis", intHomeScore: "3", intAwayScore: "1", strLeague: "Spanish La Liga", strSport: "Soccer", strVenue: "Spotify Camp Nou" }
    ]
  },
  "134880": {
    next: [
      { idEvent: "9031", dateEvent: "2026-11-24", strHomeTeam: "Los Angeles Lakers", strAwayTeam: "Boston Celtics", intHomeScore: null, intAwayScore: null, strLeague: "NBA", strSport: "Basketball", strVenue: "Crypto.com Arena" }
    ],
    last: [
      { idEvent: "9032", dateEvent: "2026-11-16", strHomeTeam: "Los Angeles Lakers", strAwayTeam: "Denver Nuggets", intHomeScore: "114", intAwayScore: "108", strLeague: "NBA", strSport: "Basketball", strVenue: "Crypto.com Arena" }
    ]
  },
  "134937": {
    next: [
      { idEvent: "9041", dateEvent: "2026-11-26", strHomeTeam: "Kansas City Chiefs", strAwayTeam: "Buffalo Bills", intHomeScore: null, intAwayScore: null, strLeague: "NFL", strSport: "American Football", strVenue: "Arrowhead Stadium" }
    ],
    last: [
      { idEvent: "9042", dateEvent: "2026-11-15", strHomeTeam: "Kansas City Chiefs", strAwayTeam: "Las Vegas Raiders", intHomeScore: "27", intAwayScore: "20", strLeague: "NFL", strSport: "American Football", strVenue: "Arrowhead Stadium" }
    ]
  }
};

function getMockTeams(query) {
  const q = query.trim().toLowerCase();
  return MOCK_TEAMS.filter((t) => t.strTeam.toLowerCase().includes(q));
}

function getMockEvents(idTeam) {
  if (MOCK_EVENTS[idTeam]) {
    return MOCK_EVENTS[idTeam];
  }
  return {
    next: [
      { idEvent: "9901", dateEvent: "2026-12-01", strHomeTeam: "Home Club", strAwayTeam: "Away Club", intHomeScore: null, intAwayScore: null, strLeague: "Championship", strSport: "Soccer", strVenue: "Main Stadium" }
    ],
    last: [
      { idEvent: "9902", dateEvent: "2026-11-10", strHomeTeam: "Home Club", strAwayTeam: "Rival FC", intHomeScore: "2", intAwayScore: "1", strLeague: "Championship", strSport: "Soccer", strVenue: "Main Stadium" }
    ]
  };
}

async function fetchTeamsByQuery(query, signal) {
  const url = new URL("searchteams.php", API_BASE);
  url.searchParams.set("t", query);

  try {
    const response = await fetch(url.toString(), { signal });
    if (!response.ok) {
      throw new Error("Errore durante la richiesta alle squadre.");
    }
    const data = await response.json();
    if (data.teams && data.teams.length > 0) {
      return data.teams;
    }
    return getMockTeams(query);
  } catch (error) {
    if (error.name === "AbortError") {
      throw error;
    }
    return getMockTeams(query);
  }
}

async function fetchTeamEvents(idTeam) {
  const nextUrl = new URL("eventsnext.php", API_BASE);
  nextUrl.searchParams.set("id", idTeam);

  const lastUrl = new URL("eventslast.php", API_BASE);
  lastUrl.searchParams.set("id", idTeam);

  try {
    const [resNext, resLast] = await Promise.all([
      fetch(nextUrl.toString()),
      fetch(lastUrl.toString())
    ]);

    if (!resNext.ok || !resLast.ok) {
      throw new Error("Errore nel caricamento degli eventi.");
    }

    const [dataNext, dataLast] = await Promise.all([
      resNext.json(),
      resLast.json()
    ]);

    const next = dataNext.events || [];
    const last = dataLast.results || [];

    if (next.length === 0 && last.length === 0) {
      return getMockEvents(idTeam);
    }

    return { next, last };
  } catch {
    return getMockEvents(idTeam);
  }
}
