let activeLoaders = new Map();

function createSpinLoader({ size = 'medium', color = 'blue', overlay = false, container = null } = {}) {
  const allowedColors = {
    blue: '#3498db',
    green: '#28a745',
    red: '#e74c3c'
  };
  const selectedColor = allowedColors[color] || allowedColors.blue;

  const loaderContainer = document.createElement('div');
  loaderContainer.classList.add('loading-container');

  const loader = document.createElement('div');
  loader.classList.add('loader', `is-${size}`);
  loader.style.borderTopColor = selectedColor;

  loaderContainer.appendChild(loader);

  if (overlay) {
    loaderContainer.classList.add('overlay');
    if (container) {
      loaderContainer.style.position = 'absolute';
      loaderContainer.style.top = '0';
      loaderContainer.style.left = '0';
      loaderContainer.style.width = '100%';
      loaderContainer.style.height = '100%';

      const containerStyle = window.getComputedStyle(container);
      const borderRadius = containerStyle.borderRadius;
      loaderContainer.style.borderRadius = borderRadius; 
      const resizeObserver = new ResizeObserver(() => {
        const containerRect = container.getBoundingClientRect();
        loaderContainer.style.width = `${containerRect.width}px`;
        loaderContainer.style.height = `${containerRect.height}px`;
      });

      resizeObserver.observe(container);
    } else {
      loaderContainer.classList.add('full-page-overlay');
      loaderContainer.style.borderRadius = '0';
    }
  }

  const targetContainer = container || document.body;
  
  function startLoader() {
    if (!activeLoaders.has(targetContainer)) {
      targetContainer.style.position = 'relative';
      targetContainer.appendChild(loaderContainer);
      activeLoaders.set(targetContainer, loaderContainer);
    }
  }

  function stopLoader() {
    const existingLoader = activeLoaders.get(targetContainer);
    if (existingLoader && existingLoader.parentNode === targetContainer) {
      targetContainer.removeChild(existingLoader);
      activeLoaders.delete(targetContainer);
    }
  }

  startLoader();

  return stopLoader;
}

const style = document.createElement('style');
style.innerHTML = `
  .loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    z-index: 9999;
  }

  .loader {
    border: 10px solid rgba(150, 150, 150, 0.5);
    border-top: 10px solid #3498db; 
    border-radius: 50%;
    animation: spin 2s linear infinite;
    margin-bottom: 0%;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .is-smallest { width: 20px; height: 20px; }
  .is-smaller  { width: 30px; height: 30px; }
  .is-small    { width: 40px; height: 40px; }
  .is-medium   { width: 60px; height: 60px; }
  .is-big      { width: 80px; height: 80px; }
  .is-bigger   { width: 100px; height: 100px; }
  .is-biggest  { width: 120px; height: 120px; }
  .full-page-overlay {
    background-color: rgba(0, 0, 0, 0.5);
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
  }
  .overlay {
    background-color: rgba(0, 0, 0, 0.5);
  }
`;
document.head.appendChild(style);

export { createSpinLoader };