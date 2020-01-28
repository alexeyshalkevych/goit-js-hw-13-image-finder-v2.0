import photoCardItemTemplate from '../templates/photo-card-item.hbs';
import PNotify from 'pnotify/dist/es/PNotify';
import PNotifyStyleMaterial from 'pnotify/dist/es/PNotifyStyleMaterial';
import spinner from './spinner.js';

import * as basicLightbox from 'basiclightbox';
import InfiniteScroll from 'infinite-scroll';

class SearchImageApp {
  static query = null;

  constructor() {
    this.body = document.querySelector('body');
    this.appRoot = null;
    this.searchForm = null;
    this.imageList = null;
    this.spinner = null;
    this.infScrollInstance = null;
    this.proxyEl = document.createElement('div');
    this.items = null;
    this.photoCards = null;

    this.init();
  }

  /**
   * Method to initialize
   */
  init() {
    this.body.prepend(this.createDomElements());

    this.setDomElements();

    this.searchForm.addEventListener('submit', this.handlerSubmit.bind(this));

    this.imageList.addEventListener('click', this.handlerListClick.bind(this));

    this.createInfiniteScrollInstanse();
  }

  /**
   * Method for sets all reference
   */
  setDomElements() {
    this.appRoot = document.querySelector('.js-app');
    this.searchForm = document.querySelector('.js-search-form');
    this.imageList = document.querySelector('.js-card-list');
    this.spinner = document.querySelector('.spinner');
  }

  /**
   * Method for creates DOM element and return it
   */
  createElem(tagName, className) {
    const element = document.createElement(tagName);
    element.classList.add(...className);

    return element;
  }

  /**
   * Method for creates all elements and return them.
   * appRoot contains all the elements
   */
  createDomElements() {
    const appRoot = this.createElem('div', ['app', 'js-app']);

    const form = this.createElem('form', ['search-form', 'js-search-form']);

    const inputMarkup = this.createElem('input', ['search-form__input']);

    inputMarkup.type = 'text';
    inputMarkup.name = 'query';
    inputMarkup.autocomplete = 'off';
    inputMarkup.placeholder = 'Search images...';

    form.append(inputMarkup);

    const list = this.createElem('ul', ['card-list', 'js-card-list']);

    const spin = this.createSpinnerElement();

    appRoot.append(form, list, spin);

    return appRoot;
  }

  /**
   * Method create Spinner and return it
   */
  createSpinnerElement() {
    const spinnerElement = this.createElem('div', [
      'spinner',
      'js-spinner',
      'is-hidden',
    ]);

    const firstSpinnerELement = this.createElem('div', ['loader', 'first']);
    const secondSpinnerELement = this.createElem('div', ['loader', 'second']);
    const thirdSpinnerELement = this.createElem('div', ['loader', 'third']);

    spinnerElement.append(
      firstSpinnerELement,
      secondSpinnerELement,
      thirdSpinnerELement,
    );

    return spinnerElement;
  }

  /**
   * Method for create InfiniteScroll Instance
   */
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

      this.proxyEl.innerHTML = this.createPhotoCardItems(this.photoCards.hits);

      this.items = this.proxyEl.querySelectorAll('.card-list__item');

      this.infScrollInstance.appendItems(this.items);
    });
  }

  /**
   * Method for settings Pnotify plugin
   */
  pnotifySettings() {
    return {
      styling: 'material',
      icons: 'material',
      icon: true,
      width: '155px',
      addClass: 'pad-top',
      delay: 3000,
    };
  }

  /**
   * Method for validated list card items
   */
  checkValidItems(items) {
    if (items.length < 12 && items.length > 0) {
      PNotify.notice({
        text: 'It`s all!',
        ...this.pnotifySettings(),
        minHeight: '50px',
      });

      spinner.hide(this.spinner);
    } else if (!items.length) {
      PNotify.error({
        text:
          'No results were found for your request. Please enter valid data!',
        ...this.pnotifySettings(),
        width: '260px',
        minHeight: '120px',
      });

      spinner.hide(this.spinner);
      return;
    } else {
      PNotify.success({
        text: 'Successful request!',
        ...this.pnotifySettings(),
      });
    }
  }

  /**
   * Method for created card items and returned them
   */
  createPhotoCardItems(items) {
    return items.map(item => photoCardItemTemplate(item));
  }

  /**
   * Method for handler list click
   */
  handlerListClick(e) {
    if (e.target.tagName !== 'IMG') {
      return;
    }

    /**
     * Initial basicLightbox plugin
     */
    basicLightbox.create(`<img src="${e.target.dataset.source}">`).show();
  }

  /**
   * Method for handler form submit
   */
  handlerSubmit(event) {
    event.preventDefault();

    this.input = event.currentTarget.elements.query;

    if (this.input.value === '') {
      PNotify.error({
        text:
          'No results were found for your request. Please enter valid data!',
        ...this.pnotifySettings(),
        width: '260px',
        minHeight: '120px',
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

  /**
   * Method for clearing list with cards
   */
  clearImageListItems() {
    this.imageList.innerHTML = '';
  }
}

new SearchImageApp();
