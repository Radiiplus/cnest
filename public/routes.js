import renderHomePage from './src/home.js';
import render404Page from './src/404.js';


const routes = {
  '/': renderHomePage,
  '/404': render404Page,
};

export default routes;