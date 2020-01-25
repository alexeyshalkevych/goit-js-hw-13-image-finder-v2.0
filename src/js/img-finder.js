import imagesService from './services/api-service.js';
import searchFormTemplate from '../templates/search-form.hbs';
import photoCardListTemplate from '../templates/photo-card-list.hbs';
import photoCardItemsTemplate from '../templates/photo-card-items.hbs';
import loadMoreButtonTemplate from '../templates/load-button.hbs';
import searchImagesAppTemplate from '../templates/search-image-app.hbs';
import PNotify from 'pnotify/dist/es/PNotify';
import PNotifyStyleMaterial from 'pnotify/dist/es/PNotifyStyleMaterial';
import spinnerTemplate from '../templates/spinner.hbs';
import spinner from './spinner.js';

class searchImageApp {
  constructor() {
    this.body = document.querySelector('body');
    this.app = null;
    this.searchForm = null;
    this.imageList = null;
    this.loadMoreBtn = null;
    this.inputValue = null;
    this.spinner = null;

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
  }

  createDomElement(insertElem, element, path) {
    insertElem.insertAdjacentHTML(path, element);
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

    this.clearImageListItems();
    imagesService.resetPage();

    imagesService.searchQuery = this.input.value;

    this.axiosImages();

    this.input.value = '';
  }

  axiosImages() {
    spinner.show(this.spinner);

    imagesService
      .axiosImages()
      .then(data => {
        if (data.hits.length) {
          spinner.hide(this.spinner);

          this.insertListItems(data.hits);

          PNotify.success({
            text: 'Successful request!',
            styling: 'material',
            icons: 'material',
            icon: true,
            width: '155px',
            addClass: 'pad-top',
            delay: 2000,
          });

          window.scrollTo({
            top: this.loadMoreBtn.offsetTop,
            behavior: 'smooth',
          });
        } else {
          spinner.hide(this.spinner);
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
        }
      })
      .catch(console.error);
  }

  insertListItems(item) {
    if (!this.imageList.children.length && !this.loadMoreBtn) {
      this.createDomElement(this.app, loadMoreButtonTemplate(), 'beforeend');
      this.loadMoreBtn = document.querySelector(
        'button[data-action="load-more"]',
      );

      this.loadMoreBtn.addEventListener(
        'click',
        this.loadMoreButtonHadlerCLick.bind(this),
      );
    }

    this.createDomElement(
      this.imageList,
      photoCardItemsTemplate(item),
      'beforeend',
    );
  }

  loadMoreButtonHadlerCLick() {
    this.axiosImages();
  }

  clearImageListItems() {
    this.imageList.innerHTML = '';
  }
}

new searchImageApp();
