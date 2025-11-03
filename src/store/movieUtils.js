
export const getGenres = (movies = []) => {
  const countryList = movies
    .map((m) => m.country?.trim())
    .filter(Boolean);

  const genres = new Set();

  movies.forEach((m) => {
    if (m.genre) {
      m.genre
        .split(",")
        .map((g) => g.trim())
        .filter((g) => g && !countryList.includes(g))
        .forEach((g) => genres.add(g));
    }
  });

  return Array.from(genres);
};

export const getCountries = (movies = []) => {
  const countries = new Set();
  movies.forEach((m) => {
    if (m.country && m.country.trim()) {
      countries.add(m.country.trim());
    }
  });
  return Array.from(countries);
};

export const filterMovies = (movies = [], genre, country) => {
  let filtered = [...movies];

  if (genre && genre !== "tat-ca") {
    filtered = filtered.filter((m) => {
      if (!m.genre) return false;
      const list = m.genre
        .split(",")
        .map((g) => g.trim().toLowerCase());
      return list.includes(genre.toLowerCase());
    });
  }

  if (country && country !== "tat-ca") {
    filtered = filtered.filter(
      (m) =>
        m.country &&
        m.country.trim().toLowerCase() === country.toLowerCase()
    );
  }

  return filtered;
};
