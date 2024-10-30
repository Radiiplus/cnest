import { renderPage } from '../router.js';
import { createSpinLoader } from './module/loader.js';
import { showToast } from './module/toast.js';

const renderHomePage = () => {
  if (window.innerWidth > 768) {
    showToast('Switch to mobile device. This framework hasn’t been optimized for desktop', 5000);
  }

  renderPage({ showHeader: false, showFooter: false, bodyContent: '' });

  const stopSpinLoader = createSpinLoader({
    size: 'bigger',
    color: 'blue',
    overlay: true,
    container: document.body
  });

  setTimeout(() => {
    stopSpinLoader();
    window.location.href = '/dashboard';
  }, 5000);
};

export default renderHomePage;
