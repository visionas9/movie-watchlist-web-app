//Same key
const LOCAL_STORAGE_KEY = "watchlist_ids";
const watchlistEl = document.getElementById("watchlist");

function getIds() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}
function saveIds(arr) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(arr));
}

function removeFromWatchlist(id) {
  const ids = getIds().filter((movieId) => movieId !== id);
  saveIds(ids);
  //removing row from DOM:
  const row = document.querySelector(`[data-row="${id}"]`);
  if (row) row.remove();
  if (getIds().length === 0) {
    watchlistEl.innerHTML = `<h2 class="start-msg">Your watchlist is empty.</h2>`;
  }
}

function filmRowHTML(film) {
  const poster =
    film.Poster && film.Poster !== "N/A"
      ? film.Poster
      : "https://via.placeholder.com/150x225?text=No+Image";

  const imdb =
    film.imdbRating && film.imdbRating !== "N/A" ? film.imdbRating : "-";

  const runtime = film.Runtime && film.Runtime !== "N/A" ? film.Runtime : "";

  const genre = film.Genre && film.Genre !== "N/A" ? film.Genre : "";

  return `
  <div class="film-container" data-row="${film.imdbID}"> 
    <img src="${poster}" alt="${film.Title} poster" class="film-poster" />
    <div class="film-content">
      <div class="film-title-row">
        <h2 class="film-title">${film.Title}</h2>
        <span class="film-imdb">${imdb}</span>
      </div>
      
      <div class="text-flex">
        <span>${runtime}</span>
        <span class="dot">${genre}</span>
        <button class="watch-btn added" data-remove="${
          film.imdbID
        }">Remove</button>
      </div>

      <p class="film-plot">${film.Plot || ""}</p>
      <span class="read-more">Read more</span>
    </div>
  </div>
  `;
}

async function loadWatchlist() {
  const ids = getIds();
  if (!ids.length) {
    watchlistEl.innerHTML = `<h2 class="start-msg">Your watchlist is empty.</h2>`;
    return;
  }
  watchlistEl.innnerHTML = "";
  for (const id of ids) {
    try {
      const res = await fetch(
        `https://www.omdbapi.com/?apikey=thewdb&i=${id}&plot=full`
      );
      const data = await res.json();
      watchlistEl.insertAdjacentHTML("beforeend", filmRowHTML(data));
    } catch (err) {
      console.error("Failed to load", id, err);
    }
  }
}

/* Read more and Remove events */
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("read-more")) {
    const plot = e.target.closest(".film-content").querySelector(".film-plot");
    plot.classList.toggle("expanded");
    e.target.textContent = plot.classList.contains("expanded")
      ? " Read less"
      : "...Read more";
  }
  if (e.target.matches("[data-remove]")) {
    removeFromWatchlist(e.target.dataset.remove);
  }
});

loadWatchlist();
