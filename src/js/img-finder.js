import searchFormTemplate from '../templates/search-form.hbs';
import photoCardListTemplate from '../templates/photo-card-list.hbs';
import photoCardItemTemplate from '../templates/photo-card-item.hbs';
import searchImagesAppTemplate from '../templates/search-image-app.hbs';
import PNotify from 'pnotify/dist/es/PNotify';
import PNotifyStyleMaterial from 'pnotify/dist/es/PNotifyStyleMaterial';
import spinnerTemplate from '../templates/spinner.hbs';
import spinner from './spinner.js';

import * as basicLightbox from 'basiclightbox';
import InfiniteScroll from 'infinite-scroll';

class SearchImageApp {
  static query = null;

  constructor() {
    this.body = document.querySelector('body');
    this.app = null;
    this.searchForm = null;
    this.imageList = null;
    this.spinner = null;
    this.infScrollInstance = null;
    this.proxyEl = null;
    this.items = null;
    this.photoCards = null;

    this.init();
  }

  init() {
    this.createDomElement(this.body, searchImagesAppTemplate(), 'afterbegin');
    this.app = document.querySelector('.js-app');

    this.createDomElement(this.app, searchFormTemplate(), 'beforeend');
    this.createDomElement(this.app, photoCardListTemplate(), 'beforeend');
    this.searchForm = document.querySelector('.js-search-form');
    this.imageList = document.querySelector('.js-card-list');

    this.searchForm.addEventListener('submit', this.handlerSubmit.bind(this));

    this.createDomElement(this.app, spinnerTemplate(), 'beforeend');
    this.spinner = document.querySelector('.spinner');

    this.imageList.addEventListener('click', this.handlerListClick.bind(this));

    this.createInfiniteScrollInstanse();
  }

  createInfiniteScrollInstanse() {
    this.infScrollInstance = new InfiniteScroll(this.imageList, {
      responseType: 'text',
      history: false,

      /**
       * For work with CORS: 
       * Add this: https://cors-anywhere.herokuapp.com/ before your URL 
       */
      path() {
        return `https://cors-anywhere.herokuapp.com/https://pixabay.com/api/?key=14950911-bbc5df412008123c8c9940cf8&image_type=photo&orientation=horizontal&q=dog&page=${this.pageIndex}&per_page=12`;
      },
    });
    this.infScrollInstance.on('load', response => {
      this.photoCards = JSON.parse(response);

      this.checkValidItems(this.photoCards.hits);

      this.proxyEl = document.createElement('div');
      this.proxyEl.innerHTML = this.createPhotoCardItems(this.photoCards.hits);

      this.items = this.proxyEl.querySelectorAll('.card-list__item');

      this.infScrollInstance.appendItems(this.items);
    });
  }

  checkValidItems(items) {
    if (items.length < 12 && items.length > 0) {
      PNotify.notice({
        text: 'It`s all!',
        styling: 'material',
        icons: 'material',
        icon: true,
        addClass: 'pad-top',
        width: '160px',
        minHeight: '50px',
        delay: 3000,
      });

      spinner.hide(this.spinner);
    } else if (!items.length) {
      PNotify.error({
        text:
          'No results were found for your request. Please enter valid data!',
        styling: 'material',
        icons: 'material',
        icon: true,
        addClass: 'pad-top',
        width: '260px',
        minHeight: '120px',
        delay: 3000,
      });

      spinner.hide(this.spinner);
      return;
    } else {
      PNotify.success({
        text: 'Successful request!',
        styling: 'material',
        icons: 'material',
        icon: true,
        width: '155px',
        addClass: 'pad-top',
        delay: 2000,
      });
    }
  }

  createPhotoCardItems(items) {
    return items.map(item => photoCardItemTemplate(item));
  }

  createDomElement(insertElem, element, path) {
    insertElem.insertAdjacentHTML(path, element);
  }

  handlerListClick(e) {
    if (e.target === e.currentTarget) {
      return;
    }

    basicLightbox.create(`<img src="${e.target.dataset.source}">`).show();
  }

  handlerSubmit(event) {
    event.preventDefault();

    this.input = event.currentTarget.elements.query;

    if (this.input.value === '') {
      PNotify.error({
        text:
          'No results were found for your request. Please enter valid data!',
        styling: 'material',
        icons: 'material',
        icon: true,
        width: '260px',
        minHeight: '120px',
        delay: 3000,
      });

      return;
    }

    SearchImageApp.query = this.input;

    this.clearImageListItems();

    this.infScrollInstance.pageIndex = 1;

    this.infScrollInstance.option({
      /**
       * For work with CORS: 
       * Add this: https://cors-anywhere.herokuapp.com/ before your URL 
       */
      path() {
        return `https://cors-anywhere.herokuapp.com/https://pixabay.com/api/?key=14950911-bbc5df412008123c8c9940cf8&image_type=photo&orientation=horizontal&q=${SearchImageApp.query.value}&page=${this.pageIndex}&per_page=12`;
      },
    });

    this.infScrollInstance.updateGetPath();
    this.infScrollInstance.updateGetAbsolutePath();

    spinner.show(this.spinner);

    this.infScrollInstance.loadNextPage();
  }

  clearImageListItems() {
    this.imageList.innerHTML = '';
  }
}

new SearchImageApp();
