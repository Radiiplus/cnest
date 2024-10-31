import routes from './routes.js';
import eventManager from './src/module/events.js';
import { setBg, applyGlass } from './src/module/background.js';
import { renderPage } from './src/module/layout.js';
import { pageCache, pageFetcher } from './cache.js';

class AdvancedRouter {
    constructor(routes) {
        this.routes = routes;
        this.isTransitioning = false;
        this.currentPage = '';
        this.transitionTimeout = null;
        this.maxTransitionTime = 5000;
        
        this.initializeRouter();
    }

    initializeRouter() {
        this.createBackdropStyles();
        this.handleLocation();
        
        window.addEventListener('popstate', () => this.handleLocation());
        window.addEventListener('online', () => this.handleNetworkReconnect());
        window.addEventListener('offline', () => this.handleNetworkDisconnect());

        document.body.addEventListener('click', (e) => {
            const linkElement = e.target.closest('[data-link]');
            if (linkElement) {
                e.preventDefault();
                this.navigateTo(linkElement.dataset.link);
            }
        });
    }

    async handleLocation() {
        if (this.isTransitioning) return;
        
        this.startTransitionTimeout();
        this.isTransitioning = true;

        const url = new URL(window.location.href);
        const path = url.pathname;
        const route = this.routes[path];

        this.applyTransitionEffects();

        try {
            setBg();

            if (!route) {
                history.replaceState(null, null, '/404');
                await this.routes['/404']();
                return;
            }

            const fetchOptions = {
                tags: ['page-load'],
                params: { path }
            };

            const { content, fromCache, status } = await pageFetcher.fetch(path, fetchOptions);
            
            if (fromCache) {
                console.log(`Serving ${path} from cache (Status: ${status})`);
            }

            await Promise.resolve(route(content));

            this.currentPage = path;
            applyGlass();

        } catch (error) {
            console.error('Error loading page:', error);
            
            if (navigator.onLine) {
                history.replaceState(null, null, '/404');
                await this.routes['/404']();
            } else {
                this.handleOfflineError(path);
            }
        } finally {
            this.resetTransitionEffects();
            this.isTransitioning = false;
            eventManager.emit('pageLoad', path);
        }
    }

    navigateTo(action) {
        switch(action) {
            case 'back':
                history.back();
                break;
            case 'forward':
                history.forward();
                break;
            default:
                window.open(action, '_blank');
        }
    }

    createBackdropStyles() {
        const style = document.createElement('style');
        style.textContent = `
            body {
                transition: backdrop-filter 0.5s ease, opacity 0.5s ease;
            }
        `;
        document.head.appendChild(style);
    }

    applyTransitionEffects() {
        document.body.style.backdropFilter = 'blur(30px)';
        document.body.style.opacity = '0.75';
    }

    resetTransitionEffects() {
        document.body.style.backdropFilter = 'blur(5px)';
        document.body.style.opacity = '1';
    }

    startTransitionTimeout() {
        this.clearTransitionTimeout();
        this.transitionTimeout = setTimeout(() => {
            if (this.isTransitioning) {
                console.warn('Page transition timed out');
                this.isTransitioning = false;
                this.resetTransitionEffects();
            }
        }, this.maxTransitionTime);
    }

    clearTransitionTimeout() {
        if (this.transitionTimeout) {
            clearTimeout(this.transitionTimeout);
            this.transitionTimeout = null;
        }
    }

    handleNetworkReconnect() {
        console.log('Network reconnected. Attempting to reload current page.');
        this.handleLocation();
    }

    handleNetworkDisconnect() {
        console.warn('Network disconnected. Serving cached content if available.');
    }

    handleOfflineError(path) {
        const cachedPage = pageCache.get(path);
        if (cachedPage) {
            console.warn(`Serving offline version of ${path}`);
            this.routes[path](cachedPage.content);
        } else {
            history.replaceState(null, null, '/offline');
            this.routes['/offline']();
        }
    }

    openModal(modalName) {
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
    }

    closeModal(modalName) {
        setTimeout(() => {
            const modal = document.querySelector(`.modal-${modalName}`);
            if (modal) {
                modal.classList.remove('active');
                const url = new URL(window.location.href);
                url.searchParams.delete('modal');
                history.pushState(null, null, url.toString());
            }
        }, 100);
    }
}

const router = new AdvancedRouter(routes);

export const initRouter = () => router.initializeRouter();
export const openModal = (modalName) => router.openModal(modalName);
export const closeModal = (modalName) => router.closeModal(modalName);
export { renderPage };