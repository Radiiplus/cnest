class EventManager {
  constructor() {
    this.events = {};
    this.registeredElements = new WeakSet();
    this.eventListeners = new WeakMap();
    this.activeEvents = new Set();
    new MutationObserver(this.observe.bind(this)).observe(document, { childList: true, subtree: true });
  }

  on = (eventName, callback) => {
    this.events[eventName] = this.events[eventName] || [];
    this.events[eventName].push(callback);
  };

  emit = (eventName, ...args) => {
    if (this.events[eventName]) {
      if (!this.activeEvents.has(eventName)) {
        this.activeEvents.add(eventName);
        this.events[eventName].forEach(callback => callback(...args));
        this.activeEvents.delete(eventName); 
      }
    }
  };

  observe = (mutations) => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1 && !this.registeredElements.has(node)) {
          this.registerDynamicEvents(node);
          this.registeredElements.add(node);
        }
      });
    });
  };

  registerDynamicEvents = (element) => {
    element.querySelectorAll('[data-event]').forEach(el => {
      const eventName = el.getAttribute('data-event');
      const callbackName = el.getAttribute('data-callback');

      if (eventName && callbackName) {
        const registered = this.eventListeners.get(el) || {};

        if (!registered[eventName]) {
          this.on(eventName, (event) => {
            if (typeof window[callbackName] === 'function') {
              window[callbackName]();
            }
          });
          
          el.addEventListener(eventName, event => {
            event.stopPropagation();
            this.emit(eventName, event);
          });

          registered[eventName] = true;
          this.eventListeners.set(el, registered);
        }
      }
    });
  };

  registerEvents = () => {
    this.registerDynamicEvents(document);
  };
}

const eventManager = new EventManager();
export default eventManager;
