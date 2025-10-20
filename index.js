const input = document.getElementById("query");
const searchBtn = document.getElementById("search-btn");
const results = document.getElementById("main");

/* Watchlist functions */
const LOCAL_STORAGE_KEY = "watchlist_ids";

function getWatchList() {
  try {
    return new Set(JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "[]"));
  } catch {
    return new Set();
  }
}
function saveWatchlist(set) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(Array.from(set)));
}
function inWatchlist(id) {
  return getWatchList().has(id);
}
function toggleWatchlist(id) {
  const set = getWatchList();
  set.has(id) ? set.delete(id) : set.add(id);
  saveWatchlist(set);
}

/* Search section */
searchBtn.addEventListener("click", async () => {
  const query = input.value.trim();
  if (!query) return;

  let movies;
  try {
    const res = await fetch(
      `https://www.omdbapi.com/?apikey=thewdb&s=${encodeURIComponent(query)}`
    );
    if (!res.ok) throw new Error("Network");
    const data = await res.json();
    movies = data.Search;
    results.innerHTML = ""; //CLEAR start/previous
    if (!movies) {
      results.innerHTML = `<p class="start-msg">No movies found.</p>`;
      return;
    }
  } catch (err) {
    results.innerHTML = `<p class="start-msg">Something went wrong. Try again.</p>`;
    return;
  }

  //Fetching details for each movie
  movies.forEach(async (movie) => {
    try {
      const res = await fetch(
        `https://www.omdbapi.com/?apikey=thewdb&i=${movie.imdbID}&plot=full`
      );
      if (!res.ok) throw new Error("Network");
      const data = await res.json();
      renderFilm(data);
    } catch (err) {
      console.error(err);
    }
  });
});

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("read-more")) {
    const plot = e.target.closest("film-content").querySelector(".film-plot");
    plot.classList.toggle("expanded");
    e.target.textContent = plot.classList.contains("expanded")
      ? " Read less"
      : "...Read more";
  }

  if (e.target.classList.contains("watch-btn")) {
    const id = e.target.dataset.id;
    toggleWatchlist(id);

    if (inWatchlist(id)) {
      e.target.classlist.add("added");
      e.target.textContent = "✓ Watchlist";
    } else {
      e.target.classList.remove("added");
      e.target.textContent = "+ Watchlist";
    }
  }
});

/* Renderer */
function renderFilm(film) {
  const poster =
    film.Poster && film.Poster !== "N/A"
      ? film.Poster
      : "https://via.placeholder.com/150x225?text=No+Image";

  const imdb =
    film.imdbRating && film.imdbRating !== "N/A" ? film.imdbRating : "-";

  const runtime = film.Runtime && film.Runtime !== "N/A" ? film.Runtime : "";

  const genre = film.Genre && film.Genre !== "N/A" ? film.Genre : "";

  const added = inWatchlist(film.imdbID);

  results.insertAdjacentHTML(
    "beforeend",
    `
    <div class="film-container">
      <img src="${poster}" alt="${film.Title} poster" class="film-poster" />
      <div class="film-content">
        <div class="film-title-row">
          <h2 class="film-title">${film.Title}</h2>
          <span class="film-imdb">${imdb}</span>
        </div> 

        <div class="text-flex">
          <span>${runtime}</span>
          <span class="dot">${genre}</span>
          <button 
          class="watch-btn ${added ? "added" : ""}" 
          data-id="${film.imdbID}">
          ${added ? "✓ Watchlist" : "+ Watchlist"}
          </button>
        </div>

        <p class="film-plot">${film.Plot || ""}</p>
        <span class="read-more">Read more</span>
      </div>
    </div>
    `
  );
}
