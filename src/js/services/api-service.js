import 'regenerator-runtime';
import axios from 'axios';

axios.defaults.baseURL = 'https://pixabay.com/api/';

const key = '14950911-bbc5df412008123c8c9940cf8';

export default {
  page: 1,
  perPage: 12,
  query: '',

  async axiosImages() {
    try {
      const params = `https://pixabay.com/api/?image_type=photo&orientation=horizontal&q=${this.query}&page=${this.page}&per_page=${this.perPage}`;
      const response = await axios.get(`?key=${key}&${params}`);
      this.incrementPages();
      const data = response.data;

      return data;
    } catch (error) {
      console.error(error);
    }
  },
  incrementPages() {
    this.page += 1;
  },
  resetPage() {
    this.page = 1;
  },
  get searchQuery() {
    return this.query;
  },
  set searchQuery(query) {
    this.query = query;
  },
};
