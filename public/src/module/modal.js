const addStyle = () => {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideDown {
      0% {
        transform: translateY(100%);
        opacity: 0;
      }
      100% {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .modal-pop, .modal-fade, .modal-slide {
      position: fixed;
      box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.1);
      text-align: center;
      transition: all 0.4s ease;
      backdrop-filter: blur(5px);
      color: white;
      border: 0.2px solid rgba(200, 200, 200, 0.2);
      border-radius: 10px;
      display: flex;
      flex-direction: column;
      background: rgba(0, 0, 0, 0.95);
    }

    .modal-pop {
      top: -100%;
      left: 0;
      width: 100%;
      z-index: 1001;
      opacity: 0;
    }

    .modal-pop.active {
      animation: slideDown 0.4s forwards;
      opacity: 1;
      bottom: 0;
      top: auto;
    }

    .modal-fade {
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0);
      opacity: 0;
      max-height: 0;
      overflow-x: hidden;
      overflow-y: auto;
      width: auto;
      padding: 1%;
      z-index: 999;
    }

    .modal-fade.active {
      transform: translate(-50%, -50%) scale(1);
      opacity: 1;
      max-height: 70vh;
    }

    .modal-slide {
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      z-index: 1001;
    }

    .modal-slide.active {
      left: 0;
    }

    .close-wrap {
      display: flex;
      justify-content: flex-end;
      padding: 3%;
      position: sticky;
      top: 0;
      z-index: 1001;
      background: inherit;
    }

    .close-btn {
      width: 30px;
      height: 30px;
      background-color: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border: none;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .close-btn i {
      font-size: 24px;
      color: #007BFF;
    }

    .modal-body {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      justify-content: start;
      align-items: center;
    }
    
    .modal-pop.active.dynamic-height {
       transition-duration : initial; 
       height : auto; 
       max-height : none; 
       overflow-y : auto; 
     }
   `;

   document.head.appendChild(style);
};
const modalState = {
  activeModals: new Set(),
  modalStack: [],
  eventListeners: new Map(),
  slideModalActive: false,
  initialized: false
};

const cleanupModal = (modal) => {
  if (!modal) return;

  const modalName = modal.dataset.modalName;
  if (modalState.eventListeners.has(modalName)) {
    modalState.eventListeners.get(modalName).forEach(({ element, type, handler }) => {
      element.removeEventListener(type, handler);
    });
    modalState.eventListeners.delete(modalName);
  }
  modal.classList.remove('active', 'dynamic-height');
  modalState.activeModals.delete(modalName);
  if (!modal.classList.contains('modal-slide')) {
    const modalBody = modal.querySelector('.modal-body');
    if (modalBody) {
      modalBody.innerHTML = '';
    }
  }

  if (modal.classList.contains('modal-slide')) {
    modalState.slideModalActive = false;
  }
};

const addEventListenerWithCleanup = (element, type, handler, modalName) => {
  const existingListeners = modalState.eventListeners.get(modalName);
  if (existingListeners) {
    const existing = existingListeners.find(l => 
      l.element === element && l.type === type
    );
    if (existing) {
      element.removeEventListener(type, existing.handler);
    }
  }
  element.addEventListener(type, handler);
  
  if (!modalState.eventListeners.has(modalName)) {
    modalState.eventListeners.set(modalName, []);
  }
  modalState.eventListeners.get(modalName).push({ element, type, handler });
};

const make = (type, name, content, height = 'auto') => {
  const existingModal = document.querySelector(`[data-modal-name="${name}"]`);
  if (existingModal) {
    cleanupModal(existingModal);
    existingModal.remove();
  }

  const modal = document.createElement('div');
  modal.className = `modal-${type}`;
  modal.dataset.modalName = name;

  modal.innerHTML = `
    <div class="close-wrap">
      <button class="close-btn" data-modal-close="${name}">
        <i class="material-icons">close</i>
      </button>
    </div>
    <div class="modal-body">
      ${content}
    </div>
  `;

  modal.style.height = height;
  document.body.appendChild(modal);
  
  return modal;
};

const setupModalHandlers = (modal, name) => {
  if (modalState.eventListeners.has(name)) {
    modalState.eventListeners.get(name).forEach(({ element, type, handler }) => {
      element.removeEventListener(type, handler);
    });
    modalState.eventListeners.delete(name);
  }

  const closeBtn = modal.querySelector('.close-btn');
  const closeHandler = (e) => {
    e.stopPropagation();
    e.preventDefault();
    hide(name);
  };

  addEventListenerWithCleanup(closeBtn, 'click', closeHandler, name);

  const triggerButtons = modal.querySelectorAll('[data-modal-trigger]');
  triggerButtons.forEach(button => {
    const triggerHandler = (e) => {
      e.stopPropagation();
      const targetModalName = button.dataset.modalTrigger;
      show(targetModalName);
    };

    addEventListenerWithCleanup(button, 'click', triggerHandler, name);
  });
};

const show = (name) => {
  const modal = document.querySelector(`[data-modal-name="${name}"]`);
  if (!modal) return;
  if (modalState.activeModals.has(name)) {
    return;
  }

  if (modal.classList.contains('modal-slide')) {
    modalState.slideModalActive = true;
  } else if (!modalState.slideModalActive) {
    modalState.activeModals.forEach(modalName => {
      if (modalName !== name) {
        const activeModal = document.querySelector(`[data-modal-name="${modalName}"]`);
        if (activeModal && !activeModal.classList.contains('modal-slide')) {
          cleanupModal(activeModal);
        }
      }
    });
  }

  modal.classList.add('active');
  modalState.activeModals.add(name);
  modalState.modalStack.push(name);

  if (modal.classList.contains('modal-pop')) {
    modal.classList.add('dynamic-height');
  }

  setupModalHandlers(modal, name);

  const url = new URL(window.location.href);
  url.searchParams.set('sub', name);
  history.pushState({ modalName: name }, '', url.toString());
};

const hide = (name) => {
  const modal = document.querySelector(`[data-modal-name="${name}"]`);
  if (!modal) return;

  cleanupModal(modal);

  modalState.modalStack = modalState.modalStack.filter(modalName => modalName !== name);

  if (modalState.modalStack.length > 0) {
    const lastModalName = modalState.modalStack[modalState.modalStack.length - 1];
    const url = new URL(window.location.href);
    url.searchParams.set('sub', lastModalName);
    history.pushState({ modalName: lastModalName }, '', url.toString());

    if (!modalState.slideModalActive) {
      show(lastModalName);
    }
  } else {
    const url = new URL(window.location.href);
    url.searchParams.delete('sub');
    history.pushState({ modalName: null }, '', url.toString());
  }
};

const bind = () => {
  if (modalState.initialized) return;

  const globalClickHandler = (e) => {
    const trigger = e.target.closest('[data-modal-trigger]');
    if (trigger) {
      const name = trigger.dataset.modalTrigger;
      show(name);
    }
  };

  document.addEventListener('click', globalClickHandler, { capture: true });

  const popstateHandler = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const name = urlParams.get('sub');

    if (name) {
      show(name);
    } else if (modalState.modalStack.length > 0) {
      const lastModalName = modalState.modalStack[modalState.modalStack.length - 1];
      show(lastModalName);
    }
  };

  window.addEventListener('popstate', popstateHandler);
  modalState.initialized = true;
};

const init = () => {
  modalState.activeModals.clear();
  modalState.modalStack = [];
  modalState.slideModalActive = false;
  document.querySelectorAll('.modal-pop.active, .modal-fade.active, .modal-slide.active').forEach(modal => {
    if (!modal.classList.contains('modal-slide')) {
      cleanupModal(modal);
    }
  });

  bind();

  const urlParams = new URLSearchParams(window.location.search);
  const name = urlParams.get('sub');
  
  if (name) {
    const modal = document.querySelector(`[data-modal-name="${name}"]`);
    if (modal) {
      show(name);
    }
  }
};

export { addStyle, make, bind, show, hide, init };