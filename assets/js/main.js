$(document).ready(function () {
  LoadData("menu", function (data) {
    PrintHeader(data);
    MobileMenu();
    PrintFooter();
  });

  if (window.location.pathname.includes("movie.html")) {
    LoadData("movies", function (data) {
      PrintMovie(
        data.find(function (x) {
          return x.id == FindById();
        }),
      );
      WatchlistButtons();

      $(document).on("click", ".wishlist-btn", function (e) {
        e.preventDefault();
        let movieId = $(this).val();
        SendDataToLocalStorage(
          data.find(function (x) {
            return x.id == movieId;
          }),
        );
      });
    });
  }

  if (window.location.pathname.includes("review.html")) {
    LoadData("movies", function (data) {
      PrintMovieGenres(data);
      PrintMovieYear(data);
      PrintPagination(data, 8, "review");
      PrintContent(
        SortContent(
          DataSplit(FilterMovies(data), FindById(), 8, data),
          $("#filter-sort").val(),
        ),
      );
      WatchlistButtons();

      $(document).on(
        "change",
        "#filter-category, #filter-year, #filter-duration, #filter-sort",
        function () {
          PrintContent(
            SortContent(
              DataSplit(FilterMovies(data), FindById(), 8, data),
              $("#filter-sort").val(),
            ),
          );
          WatchlistButtons();
        },
      );

      $(document).on("click", "#next-page", function (e) {
        e.preventDefault();
        PrintContent(
          SortContent(
            DataSplit(FilterMovies(data), parseInt(FindById()) + 1, 8, data),
            $("#filter-sort").val(),
          ),
        );
        WatchlistButtons();
      });

      $(document).on("click", "#prev-page", function (e) {
        e.preventDefault();
        PrintContent(
          SortContent(
            DataSplit(FilterMovies(data), parseInt(FindById()) - 1, 8, data),
            $("#filter-sort").val(),
          ),
        );
        WatchlistButtons();
      });

      $(document).on("click", ".wishlist-btn", function (e) {
        e.preventDefault();
        let movieId = $(this).val();
        SendDataToLocalStorage(
          data.find(function (x) {
            return x.id == movieId;
          }),
        );
      });
    });
  }
  if (window.location.pathname.includes("index.html")) {
    LoadData("movies", function (data) {
      PrintMainMoviePage(data);
    });
  }

  if (window.location.pathname.includes("watchlist.html")) {
    LoadData("movies", function (data) {
      let localStorageData = GetDataFromLocalStorage();
      data = data.filter(function (x) {
        return localStorageData.some(function (y) {
          return y.id == x.id;
        });
      });
      PrintMovieGenres(data);
      PrintMovieYear(data);
      PrintWatchlistMovies(
        SortContent(FilterMovies(data), $("#filter-sort").val()),
      );

      $(document).on("change", "#filter-category", function () {
        PrintWatchlistMovies(FilterMovies(data), $("#filter-sort"));
      });

      $(document).on("change", "#filter-year", function () {
        PrintWatchlistMovies(FilterMovies(data), $("#filter-sort"));
      });

      $(document).on("change", "#filter-sort", function () {
        PrintWatchlistMovies(
          SortContent(FilterMovies(data), $("#filter-sort").val()),
        );
      });

      $(document).on("click", ".wishlist-btn", function (e) {
        e.preventDefault();
        let movieId = $(this).val();
        ShowWatchlistPopUp(
          data.find((x) => x.id == movieId),
          "wishlist-popup",
          " movie is removed from watchlist",
        );
        data = data.filter((x) => x.id != movieId);

        RemoveLocalStorageData(movieId);
        PrintWatchlistMovies(
          SortContent(FilterMovies(data), $("#filter-sort").val()),
        );
      });
    });
  }

  if (window.location.pathname.includes("contact.html")) {
    document
      .getElementById("contactForm")
      .addEventListener("submit", function (e) {
        e.preventDefault();
        let validForm = true;

        let nameSurname = document.querySelector(".name").value.trim();
        let email = document.querySelector(".email").value.trim();
        let message = document.querySelector(".message").value.trim();
        let gender = document.querySelector("input[name='gender']:checked");
        let agreement = document.querySelector(
          "input[name='agreement']",
        ).checked;

        let nameSurnameRegEx = /^[A-Za-z]{1,10} [A-Za-z]{1,15}$/;
        let emailRegEx = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;

        if (!nameSurnameRegEx.test(nameSurname)) {
          ShowFormPopUp("Please enter a valid name and surname");
          validForm = false;
        }

        if (!emailRegEx.test(email)) {
          ShowFormPopUp("Please enter a valid email");
          validForm = false;
        }

        if (!gender) {
          ShowFormPopUp("Please choose gender");
          validForm = false;
        }

        if (message.length < 10) {
          ShowFormPopUp("Message should be longer than 10 letters");
          validForm = false;
        }

        if (!agreement) {
          ShowFormPopUp(
            "Please confirm that you agree to the storage of your personal information.",
          );
          validForm = false;
        }

        if (validForm) {
          ShowFormPopUp("Your form has been submitted successfully.");
          document.getElementById("contactForm").reset();
        }
      });
  }
});

function LoadData(filename, data) {
  $.ajax({
    url: "data/" + filename + ".json",
    method: "get",
    dataType: "json",
    success: data,
    error: function (err) {
      console.error(err);
    },
  });
}

function PrintContent(data) {
  let container = $("#movie-review");
  container.empty();

  if (!data.length) {
    container.html(`<div><p>No movies found</p></div>`);
  } else {
    data.forEach(function (movie) {
      let card = `
        <div class="movie">
            <a href="movie.html?id=${movie.id}">
			<figure class="movie-poster"><img src="${movie.image}" alt="${movie.title}"></figure>
			<div class="movie-title">${movie.title}</div>
            </a>
			<strong>Rating:</strong> 
			<div class="star-rating"><span style="width:${movie.rating * 20}%"></span></div>
            <div><strong>Duration:</strong> ${MovieDurationHoursMinutes(movie.duration)}</div></br>
            <p>${DescriptionShortener(movie.description, 250)}<a href="movie.html?id=${movie.id}">Read More</a></p>
            <button value="${movie.id}" class="wishlist-btn">
		    <i class="fa fa-heart"></i> Add to Wishlist
	        </button>
		</div>
        `;
      container.append(card);
    });
  }
}

function DescriptionShortener(data, textLength) {
  if (data.length <= textLength) return data;

  let shortenText = data.substring(0, textLength);
  return shortenText.substring(0, shortenText.lastIndexOf(" ")) + "...";
}

function MovieDurationHoursMinutes(data) {
  let hours = Math.floor(data / 60);
  let minutes = data % 60;
  return `${hours}h ${minutes}m`;
}

function FilterMovies(data) {
  let filteredContent = FilterMoviesCategory(data, $("#filter-category").val());

  filteredContent = FilterMoviesYear(filteredContent, $("#filter-year").val());

  filteredContent = FilterMovieDuration(
    filteredContent,
    $("#filter-duration").val(),
  );

  $("#pagination").toggle(filteredContent.length >= 8);

  PrintMovieGenres(filteredContent, $("#filter-category").val());

  PrintMovieYear(filteredContent, $("#filter-year").val());

  if (!filteredContent.length) {
    PrintMovieGenres(data);
    PrintMovieYear(data);
  }

  return filteredContent;
}

function FilterMoviesCategory(data, categoryValue) {
  if (categoryValue == 0) {
    return data;
  } else {
    return data.filter(function (x) {
      return x.category.some(function (y) {
        return y.id == categoryValue;
      });
    });
  }
}

function FilterMoviesYear(data, yearValue) {
  if (yearValue == 0) {
    return data;
  } else {
    return data.filter(function (x) {
      return x.premiere.split("-")[0] == yearValue;
    });
  }
}

function FilterMovieDuration(data, durationValue) {
  if (durationValue == 0) {
    return data;
  } else {
    return data.filter((x) => {
      switch (durationValue) {
        case "1":
          return x.duration < 90;
        case "2":
          return x.duration >= 90 && x.duration <= 150;
        case "3":
          return x.duration > 150;
        default:
          return true;
      }
    });
  }
}

function SortContent(data, sortValue) {
  if (sortValue == "asc") {
    return data.sort((a, b) => a.title.localeCompare(b.title));
  }
  if (sortValue == "desc") {
    return data.sort((a, b) => b.title.localeCompare(a.title));
  }
  if (sortValue == "rating") {
    return data.sort((a, b) => b.rating - a.rating);
  }
}

function MovieRating(data) {
  let starRating = ``;
  for (let i = 0; i < data; i++) {
    starRating += `<i class="fa fa-star"></i>`;
  }
  return starRating;
}
function MobileMenu() {
  $(".mobile-navigation").html($(".main-navigation .menu").clone());

  $(document).on("click", ".menu-toggle", function () {
    $(".mobile-navigation").slideToggle();
  });
}
function PrintHeader(data) {
  let container = ``;

  container += `<div class="container">
                    <a href="index.html" id="branding">
                    <img src="img/logo.png" alt="Movie Review" class="logo">
                    <div class="logo-copy">
                    <h1 class="site-title">Filmotip</h1>
                    <small class="site-description">Movie reviews</small>
                    </div>
                    </a>
                    <div class="main-navigation">
                    <button type="button" class="menu-toggle"><i class="fa fa-bars"></i></button>
                    <ul class="menu">`;

  data.forEach(function (x) {
    container += `<li class="menu-item"><a href="${x.path}">${x.name}</a></li>`;
  });

  container += `</ul>
                    </div>
                    <div class="mobile-navigation"></div>
                    </div>`;

  $("header").prepend(container);
}

function PrintFooter() {
  let container = ``;

  container += `<div class="container">
					<div class="row">
						<div class="col-md-3">
							<div class="widget">
								<h3 class="widget-title">About Us</h3>
								<p>We believe that every movie tells a story, and every viewer has a unique perspective. That’s why our platform brings together different opinions, from casual viewers to passionate film fans.</p>
							</div>
						</div>
						<div class="col-md-3">
							<div class="widget">
								<h3 class="widget-title">Latest Reviews</h3>
								<p>Stay updated with our newest movie reviews and ratings. We cover everything from the latest blockbuster releases to hidden indie gems so you always know what’s worth watching.</p>
							</div>
						</div>
						<div class="col-md-3">
							<div class="widget">
								<h3 class="widget-title">Contact Us</h3>
								<ul class="no-bullet">
									<li><a href="#">mateja.nedeljkovic.106@ict.edu.rs</a></li>
									<li><a href="#">+1 (123) 456-7890</a></li>
									<li><p>Zdravka Celara, ICT</p></li>
								</ul>
							</div>
						</div>
						<div class="col-md-3">
							<div class="widget">
								<h3 class="widget-title">Social Media</h3>
								<ul class="no-bullet">
									<li><a href="#">Facebook</a></li>
									<li><a href="#">Instagram</a></li>
									<li><a href="#">Google+</a></li>
									<li><a href="#">Pinterest</a></li>
								</ul>
							</div>
						</div>
					</div>
				</div>`;

  $("footer").prepend(container);
}

function PrintMovieGenres(data, value = "0") {
  $("#filter-category").empty();
  $("#filter-category").append(`<option value="0">All Genres</option>`);

  let distinctGenres = [];
  data.forEach(function (x) {
    x.category.forEach(function (y) {
      distinctGenres[y.id] = y.name;
    });
  });

  for (let i = 0; i < distinctGenres.length; i++) {
    if (distinctGenres[i]) {
      $("#filter-category").append(
        `<option value="${i}">${distinctGenres[i]}</option>`,
      );
    }
  }
  $("#filter-category").val(value);
}

function PrintMovieYear(data, value = "0") {
  $("#filter-year").empty();
  $("#filter-year").append(`<option value="0">All Years</option>`);

  let distinctYears = [];
  data.forEach(function (x) {
    distinctYears.push(x.premiere.split("-")[0]);
  });

  distinctYears = [...new Set(distinctYears)];
  distinctYears.sort((a, b) => a - b);

  distinctYears.forEach(function (x) {
    $("#filter-year").append(`<option value="${x}">${x}</option>`);
  });

  $("#filter-year").val(value);
}

function FindById() {
  let urlpath = new URLSearchParams(window.location.search);
  return urlpath.get("id") || 1;
}

function SetUrlPath(id) {
  window.history.pushState({}, "", "?id=" + id);
}
//dinamicki ispis paginacije u zavisnosti kolika imamo filmova sa izborom koliko ce biti filmova na stranici
function PrintPagination(data, numberOfMoviesOnPage, pagepath) {
  let container = `<a href="#" id="prev-page" class="page-number prev"><i class="fa fa-angle-left"></i></a>`;

  for (let i = 0; i < data.length / numberOfMoviesOnPage; i++) {
    container += `<a href="${pagepath}.html?id=${i + 1}" class="page-number">${i + 1}</a>`;
  }

  container += `<a href="#" id="next-page" class="page-number next"><i class="fa fa-angle-right"></i></a>`;
  $("#pagination").append(container);
}
//deljenje filmova zbog paginacije tako da se prikazuje po 8 na stranici
function DataSplit(data, id, numberOfMoviesOnPage, dataMax) {
  if (id < 1) {
    id = 1;
  }
  if (
    dataMax.length % numberOfMoviesOnPage &&
    id > dataMax.length / numberOfMoviesOnPage
  ) {
    id = Math.floor(dataMax.length / numberOfMoviesOnPage + 1);
  }

  SetUrlPath(id);

  if (data.length < numberOfMoviesOnPage) {
    return data;
  }

  let movies = [];

  for (let i = 0; i < data.length; i++) {
    let x = data[i];
    if (id == 1) {
      if (i < id * numberOfMoviesOnPage) {
        movies.push(x);
      }
    } else {
      if (
        i >= id * numberOfMoviesOnPage - numberOfMoviesOnPage &&
        i < id * numberOfMoviesOnPage
      ) {
        movies.push(x);
      }
    }
  }

  return movies;
}
//dinamicko stampanje stranice gde se prikazuje samo film o kojem zelimo nesto vise da saznamo
function PrintMovie(data) {
  let container = ``;
  container += `<div class="container">
					<div class="page">
						<div class="breadcrumbs">
							<a href="index.html">Home</a>
							<a href="review.html">Movie Review</a>
							<span>${data.title}</span>
						</div>

						<div class="content">
							<div class="row">
								<div class="col-md-6">
									<figure class="movie-poster"><img src="${data.image}" alt="${data.title}"></figure>
								</div>
								<div class="col-md-6">
									<h2 class="movie-title">${data.title}
                                    </h2>
									<div class="movie-summary">
										<p>${data.description}</p>
									</div>
									<ul class="movie-meta">
										<li><strong>Rating:</strong> 
											<div class="star-rating"><span style="width:${data.rating * 20}%"></span></div>
										</li>
										<li><strong>Length:</strong> ${MovieDurationHoursMinutes(data.duration)}</li>
										<li><strong>Premiere:</strong> ${data.premiere}</li>
										<li><strong>Category:</strong> ${data.category.map((x) => x.name).join(", ")}</li>
									</ul>

									<ul class="starring">
										<li><strong>Directors:</strong> ${data.crew.director} </li>
										<li><strong>Writers:</strong> ${data.crew.writer}</li>
										<li><strong>Stars:</strong> ${data.crew.actors.map((x) => x).join(", ")}</li>
									</ul>
                                    <button value="${data.id}" class="wishlist-btn">
		                            <i class="fa fa-heart"></i> Add to Watchlist
	                                </button>
								</div>
                                
							</div> 	
						</div>
					</div>
				</div>`;
  $("#movie-content").append(container);
}
//ovo je glavna index stranice i ovde sam napravio da filmovi se izvlace nasumicno i prikazuju korisniku
function PrintMainMoviePage(data) {
  let shuffledMovies = data.sort(() => Math.random() - 0.5);

  shuffledMovies = shuffledMovies.slice(0, 8);

  let container = ``;

  container += `<div class="container">
					<div class="page">
					<div class="row">
					<div class="col-md-9">
                    <a href="movie.html?id=${shuffledMovies[0].id}">
                    <img src="${shuffledMovies[0].image}" alt="${shuffledMovies[0].title}">
                    </a>`;

  container += `</div>
				    <div class="col-md-3">
					<div class="row">`;

  for (let i = 1; i <= 3; i++) {
    container += `<div class="col-sm-6 col-md-12">
					<div class="latest-movie">
					<a href="movie.html?id=${shuffledMovies[i].id}">
                    <img src="${shuffledMovies[i].image}" alt="${shuffledMovies[i].title}">
                    </a>
					</div>
					</div>`;
  }

  container += `</div></div></div>
                    <div class="row">`;

  for (let i = 4; i <= 7; i++) {
    container += `<div class="col-sm-6 col-md-3">
                    <div class="latest-movie">
                    <a href="movie.html?id=${shuffledMovies[i].id}">
                    <img src="${shuffledMovies[i].image}" alt="${shuffledMovies[i].title}">
                    </a>
                    </div>
                    </div>`;
  }

  container += `</div></div></div>`;

  $("#main-page").append(container);
}
//slanje podataka u lokal storage i direktno menjanje boje button za watchlist add
function SendDataToLocalStorage(data) {
  let localStorageData = GetDataFromLocalStorage();

  let button = $(`.wishlist-btn[value='${data.id}']`);

  if (CheckLocalStorage(localStorageData, data)) {
    ShowWatchlistPopUp(data, "wishlist-popup", " movie is in watchlist");
    button.addClass("added");
    button.html(`<i class="fa fa-heart"></i> Added to Watchlist`);
  } else {
    localStorageData.push({ id: data.id });
    ShowWatchlistPopUp(data, "wishlist-popup", " added to watchlist");
    button.addClass("added");
    button.html(`<i class="fa fa-heart"></i> Added to Watchlist`);
  }

  localStorage.setItem("movies", JSON.stringify(localStorageData));
}

function GetDataFromLocalStorage() {
  let data = JSON.parse(localStorage.getItem("movies"));

  return data || [];
}

function CheckLocalStorage(localStorageData, data) {
  return localStorageData.filter((x) => x.id == data.id).length;
}

function RemoveLocalStorageData(movieId) {
  let data = GetDataFromLocalStorage();

  data = data.filter((x) => x.id != movieId);

  localStorage.setItem("movies", JSON.stringify(data));
}

function WatchlistButtons() {
  let data = GetDataFromLocalStorage();

  data.forEach((button) => {
    WatchlistButtonColor(button.id);
  });
}

function WatchlistButtonColor(data) {
  let button = $(`.wishlist-btn[value="${data}"]`);
  button.addClass("added");
  button.html(`<i class="fa fa-heart"></i> Added to Watchlist`);
}
//dinamicko stamnje filmova u watchlisti i provera da li uopste ima filmova
function PrintWatchlistMovies(data) {
  let container = $("#watchlist");
  container.empty();
  if (!data.length) {
    container.html(`<div><p>No movies on Watchlist</p></div>`);
  } else {
    data.forEach(function (movie) {
      let card = `<div class="movie">
        <a href="movie.html?id=${movie.id}">
			<figure class="movie-poster"><img src="${movie.image}" alt="${movie.title}"></figure>
			<div class="movie-title">${movie.title}</div>
            </a>
			<strong>Rating:</strong> 
			<div class="star-rating"><span style="width:${movie.rating * 20}%"></span></div>
            </br>
            </br>
			<button value="${movie.id}" class="wishlist-btn">
            Remove
            </button>     
      </div>`;
      container.append(card);
    });
  }
}
//Pop up tekst za korisnika za formu i watchlistu
function ShowWatchlistPopUp(movie, elementId, popUpText) {
  let container = document.getElementById(`${elementId}`);

  container.innerText = `${movie.title} ${popUpText}`;

  container.classList.add("show");

  setTimeout(function () {
    container.classList.remove("show");
  }, 3000);
}

function ShowFormPopUp(popUpText) {
  let container = document.getElementById("form-popup");

  container.innerText = `${popUpText}`;

  container.classList.add("show");

  setTimeout(function () {
    container.classList.remove("show");
  }, 3000);
}
