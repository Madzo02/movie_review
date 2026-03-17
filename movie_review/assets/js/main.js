$(document).ready(function () {
    LoadData("menu", function (data) {
        PrintHeader(data);
        PrintFooter();
    });

    if (window.location.pathname.includes("movie.html")) {
        LoadData("movies", function (data) {
            PrintMovie(
                data.find(function (x) {
                    return x.id == FindById();
                }),
            );

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

            $(document).on("change", "#filter-category", function () {
                PrintContent(DataSplit(FilterMovies(data), FindById(), 8, data));
            });

            $(document).on("change", "#filter-year", function () {
                PrintContent(DataSplit(FilterMovies(data), FindById(), 8, data));
            });

            $(document).on("change", "#filter-sort", function () {
                PrintContent(
                    SortContent(
                        DataSplit(FilterMovies(data), FindById(), 8, data),
                        $("#filter-sort").val(),
                    ),
                );
            });

            $(document).on("click", "#next-page", function (e) {
                e.preventDefault();
                PrintContent(
                    DataSplit(FilterMovies(data), parseInt(FindById()) + 1, 8, data),
                );
            });

            $(document).on("click", "#prev-page", function (e) {
                e.preventDefault();
                PrintContent(
                    DataSplit(FilterMovies(data), parseInt(FindById()) - 1, 8, data),
                );
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

    data.forEach(function (movie) {
        let card = `
        <div class="movie">
            <a href="movie.html?id=${movie.id}">
			<figure class="movie-poster"><img src="${movie.image}" alt="${movie.title}"></figure>
			<div class="movie-title">${movie.title}</div>
            </a>
			<strong>Rating:</strong> 
			<div class="star-rating"><span style="width:${movie.rating * 20}%"></span></div>
            </br>
            </br>
            <p>${movie.description.short}</p>
            <button value="${movie.id}" class="wishlist-btn">
		    <i class="fa fa-heart"></i> Add to Wishlist
	        </button>
		</div>
        `;
        container.append(card);
    });
}

function FilterMovies(data) {
    let filteredContent = FilterMoviesCategory(data, $("#filter-category").val());

    filteredContent = FilterMoviesYear(filteredContent, $("#filter-year").val());

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
                <div class="mobile-navigation"></div></div>`;

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

function PrintMovieGenres(data) {
    let container = ``;

    let distinctGenres = [];
    data.forEach(function (x) {
        x.category.forEach(function (y) {
            distinctGenres[y.id] = y.name;
        });
    });

    for (let i = 0; i < distinctGenres.length; i++) {
        if (distinctGenres[i]) {
            container += `<option value="${i}">${distinctGenres[i]}</option>`;
        }
    }

    $("#filter-category").append(container);
}

function PrintMovieYear(data) {
    let container = ``;

    let distinctYears = [];
    data.forEach(function (x) {
        distinctYears.push(x.premiere.split("-")[0]);
    });

    distinctYears = [...new Set(distinctYears)];
    distinctYears.sort((a, b) => a - b);

    distinctYears.forEach(function (x) {
        container += `<option value="${x}">${x}</option>`;
    });

    $("#filter-year").append(container);
}

function FindById() {
    let urlpath = new URLSearchParams(window.location.search);
    return urlpath.get("id") || 1;
}

function SetUrlPath(id) {
    window.history.pushState({}, "", "?id=" + id);
}

function PrintPagination(data, numberOfMoviesOnPage, pagepath) {
    let container = `<a href="#" id="prev-page" class="page-number prev"><i class="fa fa-angle-left"></i></a>`;

    for (let i = 0; i < data.length / numberOfMoviesOnPage; i++) {
        container += `<a href="${pagepath}.html?id=${i + 1}" class="page-number">${i + 1}</a>`;
    }

    container += `<a href="#" id="next-page" class="page-number next"><i class="fa fa-angle-right"></i></a>`;
    $("#pagination").append(container);
}

function DataSplit(data, id, numberOfMoviesOnPage, dataMax) {
    if (id < 1) {
        id = 1;
    }
    if (dataMax.length % numberOfMoviesOnPage && id > dataMax.length / numberOfMoviesOnPage) {
        id = Math.floor(dataMax.length / numberOfMoviesOnPage + 1);
    }

    SetUrlPath(id);

    if (data.length < numberOfMoviesOnPage) {
        return data;
    }

    return data.filter(function (x) {
        if (id == 1) {
            return x.id <= id * numberOfMoviesOnPage;
        }
        return (
            x.id > id * numberOfMoviesOnPage - numberOfMoviesOnPage &&
            x.id <= id * numberOfMoviesOnPage
        );
    });
}

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
										<p>${data.description.long}</p>
									</div>
									<ul class="movie-meta">
										<li><strong>Rating:</strong> 
											<div class="star-rating"><span style="width:${data.rating * 20}%"></span></div>
										</li>
										<li><strong>Length:</strong> ${data.duration.toString()} min</li>
										<li><strong>Premiere:</strong> ${data.premiere}</li>
										<li><strong>Category:</strong> ${data.category.map((x) => x.name).join(", ")}</li>
									</ul>

									<ul class="starring">
										<li><strong>Directors:</strong> ${data.crew.director} </li>
										<li><strong>Writers:</strong> ${data.crew.writer}</li>
										<li><strong>Stars:</strong> ${data.crew.actors.map((x) => x).join(", ")}</li>
									</ul>
                                    <button value="${data.id}" class="wishlist-btn">
		                            <i class="fa fa-heart"></i> Add to Wishlist
	                                </button>
								</div>
                                
							</div> 	
						</div>
					</div>
				</div>`;
    $("#movie-content").append(container);
}

function PrintMainMoviePage(data) {
    let randomNumber = Math.floor(Math.random() * (data.length - 8));
    let container = ``;
    container += `<div class="container">
					<div class="page">
					<div class="row">
					<div class="col-md-9">
                    <a href="movie.html?id=${data[randomNumber].id}"><img src="${data[randomNumber].image}" alt="${data[randomNumber].title}"></a>`;
    randomNumber += 1;
    container += `</div>
				    <div class="col-md-3">
					<div class="row">`;
    data.slice(randomNumber, randomNumber + 3).forEach(function (x) {
        container += `<div class="col-sm-6 col-md-12">
						<div class="latest-movie">
						<a href="movie.html?id=${x.id}"><img src="${x.image}" alt="${x.title}"></a>
						</div>
						</div>`;
    });
    container += `</div></div></div><div class="row">`;
    randomNumber += 3;
    data.slice(randomNumber, randomNumber + 4).forEach(function (x) {
        container += `<div class="col-sm-6 col-md-3">
                        <div class="latest-movie">
                        <a href="movie.html?id=${x.id}"><img src="${x.image}" alt="${x.title}"></a>
                        </div>
                        </div>`;
    });
    container += `</div></div></div>`;
    $("#main-page").append(container);
}

function SendDataToLocalStorage(data) {
    let localStorageData = JSON.parse(localStorage.getItem("movies")) || [];
    if (CheckLocalStorage(localStorageData, data)) {
        ShowWatchlistPopUp(data, "wishlist-popup", " movie is in watchlist");
    } else {
        localStorageData.push({ id: data.id });
        ShowWatchlistPopUp(data, "wishlist-popup", " added to watchlist");
    }

    localStorage.setItem("movies", JSON.stringify(localStorageData));
}

function GetDataFromLocalStorage() {
    let data = JSON.parse(localStorage.getItem("movies"));

    return data;
}

function CheckLocalStorage(localStorageData, data) {
    return localStorageData.filter((x) => x.id == data.id).length;
}

function RemoveLocalStorageData(movieId) {
    let data = JSON.parse(localStorage.getItem("movies")) || [];

    data = data.filter((x) => x.id != movieId);

    localStorage.setItem("movies", JSON.stringify(data));
}

function PrintWatchlistMovies(data) {
    let container = $("#watchlist");
    container.empty();

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

function ShowWatchlistPopUp(data, elementId, popUpText) {
    let container = document.getElementById(`${elementId}`);

    container.innerText = `${data.title} ${popUpText}`;

    container.classList.add("show");

    setTimeout(function () {
        container.classList.remove("show");
    }, 3000);
}
