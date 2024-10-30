import routes from './routes.js';
import eventManager from './src/module/events.js';
import { setBg, applyGlass } from './src/module/background.js';
import { renderPage } from './src/module/layout.js';
import { pageFetcher } from './cache.js';

let isTransitioning = false;
let currentPage = '';

export const initRouter = () => {
    createBackdropStyles();
    handleLocation();
    
    window.addEventListener('popstate', handleLocation);

    document.body.addEventListener('click', e => {
        if (e.target.matches('[data-link]')) {
            e.preventDefault();
            navigateTo(e.target.dataset.link);
        }
    });
};

const handleLocation = async () => {
    if (isTransitioning) return;
    isTransitioning = true;

    const url = new URL(window.location.href);
    const path = url.pathname;
    
    const route = routes[path];

    document.body.style.backdropFilter = 'blur(30px)';
    document.body.style.opacity = '0.75';

    try {
        setBg(); 

        if (!route) {
            history.replaceState(null, null, '/404');
            await routes['/404']();
            return;
        }

        const { content, fromCache } = await pageFetcher.fetch(path); // Updated method name
        
        if (fromCache) console.log(`Serving ${path} from cache`);

        await Promise.resolve(route(content));

        currentPage = path;
        applyGlass(); 

    } catch (error) {
        console.error('Error loading page:', error);
        history.replaceState(null, null, '/404');
        await routes['/404']();
    } finally {
        document.body.style.backdropFilter = 'blur(5px)';
        document.body.style.opacity = '1';
        isTransitioning = false;

        eventManager.emit('pageLoad', path);
    }
};

const navigateTo = (action) => {
    if (action === 'back') {
        history.back();
    } else if (action === 'forward') {
        history.forward();
    } else {
        window.open(action, '_blank');
    }
};

const createBackdropStyles = () => {
    const style = document.createElement('style');
    style.textContent = `
        body {
            transition: backdrop-filter 0.5s ease, opacity 0.5s ease;
        }
    `;
    document.head.appendChild(style);
};

export const openModal = (modalName) => {
    setTimeout(() => {
        const modal = document.querySelector(`.modal-${modalName}`);
        if (modal) {
            modal.classList.add('active');
            const url = new URL(window.location.href);
            if (url.searchParams.get('modal') !== modalName) {
                url.searchParams.set('modal', modalName);
                history.pushState(null, null, url.toString());
            }
        }
    }, 100);
};

export const closeModal = (modalName) => {
    setTimeout(() => {
        const modal = document.querySelector(`.modal-${modalName}`);
        if (modal) {
            modal.classList.remove('active');
            const url = new URL(window.location.href);
            url.searchParams.delete('modal');
            history.pushState(null, null, url.toString());
        }
    }, 100);
};

export { renderPage };
