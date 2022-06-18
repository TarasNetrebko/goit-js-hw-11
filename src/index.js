import axios from "axios";
import Notiflix from "notiflix";
import SimpleLightbox from "simplelightbox";
import "../node_modules/simplelightbox/dist/simple-lightbox.min.css";

const BASE_URL = "https://pixabay.com/api/?key=28124365-0ad47717ab252182c329a634e&";

const gallery = document.querySelector(".gallery");
const form = document.querySelector("#search-form");
const searchField = document.querySelector("input[name='searchQuery']");
const submitBtn = document.querySelector(".submit-btn");
const loadMoreBtn = document.querySelector(".load-more");
let previousKeyWord = "";
let page = 1;
let pageLimit = 40;

form.addEventListener("submit", renderResult);
loadMoreBtn.addEventListener("click", loadMoreHandler);

function renderResult(e) {
    e.preventDefault();
    const word = searchField.value.toLowerCase();
    if (word === "") {
        gallery.innerHTML = "";
        Notiflix.Notify.warning("Please, input key word!");
        return;
    }
    if (word === previousKeyWord) {
        gallery.innerHTML = "";
        previousKeyWord = "";
    }

    searchDataByWords(word);
}

function loadMoreHandler() {
    searchDataByWords(previousKeyWord);
}

async function searchDataByWords(keyWord) {
    try {
        if (keyWord !== previousKeyWord) {
            gallery.innerHTML = "";
            page = 1;
            previousKeyWord = keyWord;
        } else if (keyWord === previousKeyWord) {
            page += 1;
        }
        const result = await axios.get(`${BASE_URL}q=${keyWord}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${pageLimit}`);
        if (result.data.hits.length === 0) {
            gallery.innerHTML = "";
            Notiflix.Notify.failure("Sorry, there are no images matching your search query. Please try again.");
            return;
        }
        const totalHits = await result.data.totalHits;
        if (page === 1) {
            Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
        }
        const imagesProm = await result.data.hits;
        const render = await imagesProm.map(el => `<div class="photo-card">
                <a class="gallery__link" href="${el.largeImageURL}"><img src="${el.webformatURL}" alt="${el.tags}" loading="lazy" /></a>
                <div class="info">
                    <p class="info-item">
                        <b>Likes</b>
                        <span>${el.likes}</span>
                    </p>
                    <p class="info-item">
                        <b>Views</b>
                        <span>${el.views}</span>
                    </p>
                    <p class="info-item">
                        <b>Comments</b>
                        <span>${el.comments}</span>
                    </p>
                    <p class="info-item">
                        <b>Downloads</b>
                        <span>${el.downloads}</span>
                    </p>
                </div>
            </div>`).join("");
        gallery.insertAdjacentHTML("beforeend", render);
       
        const lightbox = new SimpleLightbox(`.gallery a`, { captionDelay: 250 });
        lightbox.refresh();
    } catch (error) {
        console.log(error);
    }
    
}




