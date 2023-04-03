import axios from 'axios';
import Notiflix from 'notiflix';
import './css/style.css';
// Описаний в документації
import SimpleLightbox from 'simplelightbox';
// Додатковий імпорт стилів
import 'simplelightbox/dist/simple-lightbox.min.css';
import { fetchImage } from './fetchForm';
import { createMarkup } from './createMarkup';

const refs = {
  form: document.querySelector('.search-form'),
  input: document.querySelector('.search-input'),
  gallery: document.querySelector('.gallery'),
  loadMore: document.querySelector('.load-more'),
};

const { form, input, gallery, loadMore } = refs;

let page = 1;

form.addEventListener('submit', onSubmit);
loadMore.addEventListener('click', onLoadMoreBtn);

const lightbox = new SimpleLightbox('.gallery a', { captionDelay: 300 });

//  CLICK SEARCH //

async function onSubmit(evt) {
  evt.preventDefault();
  gallery.innerHtml = '';
  page = 1;

  const inputValue = input.value;
  const value = inputValue.trim();

  if (!value) {
    Notiflix.Notify.failure('Sorry, blank line. Enter your request!');
    loadMore.hidden = true;
    return;
  }
  return await fetchThen(value);
}

loadMore.hidden = true;

// REQUEST

async function fetchThen(value) {
  try {
    const resp = await fetchImage(value);
    const array = resp.data.hits;
    // const number = resp.data.total;
    const number = resp.data.totalHits;

    if (array.length === 0) {
      Notiflix.Notify.failure(
        'Sorry, there are no images your search query. Please try again'
      );

      loadMore.hidden = true;
      return;
    }
    if (number > 0) {
      Notiflix.Notify.info(`Hooray! We found ${number} images.`);
    }

    createMarkup(array, gallery);
    lightbox.refresh();
    loadMore.hidden = false;

    if (array.length < 40) {
      loadMore.hidden = true;
    }
  } catch (error) {
    console.log(error);
  }
}

// ADD IMAGE

async function onLoadMoreBtn() {
  const valueLoadBtn = input.value;
  let limitAdd = 40;
  page += 1;
  try {
    const resp = await fetchImage(valueLoadBtn, page, limitAdd);
    const hits = resp.data.hits;
    const totalHits = resp.data.totalHits;
    const maxIndex = (page - 1) * limitAdd + hits.length;

    // createMarkup(resp.data.hits, gallery);
    createMarkup(hits, gallery);
    onPageScrolling();
    lightbox.refresh();

    if (maxIndex >= totalHits) {
      loadMore.hidden = true;
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
      return;
    }
  } catch (error) {
    console.log(error);
  }
}

// SCROLL

function onPageScrolling() {
  const { height: cardHeight } =
    gallery.firstElementChild.getBoundingClientRect();
  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
