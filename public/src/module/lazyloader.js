let loads = {};
let pageLoads = new Set();
let autoStart = true;

const observer = new MutationObserver((mutations) => {
  mutations.forEach(mutation => {
    mutation.addedNodes.forEach(node => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        pageLoads.forEach(cls => {
          if (node.classList.contains(cls)) {
            load(cls);
          }
        });
      }
    });
  });
});

observer.observe(document.body, { childList: true, subtree: true });

const safeRemoveChild = (parent, child) => {
  try {
    if (child && parent && child.parentNode === parent) {
      parent.removeChild(child);
    }
  } catch (error) {
    console.debug('Safe remove child operation skipped');
  }
};

const add = (cls, autoLoad = true) => {
  pageLoads.add(cls);
  if (autoLoad && autoStart) {
    load(cls);
  }
};

const setAutoStart = (value) => {
  autoStart = value;
};

const start = () => {
  pageLoads.forEach(cls => {
    if (!loads[cls]) {
      loads[cls] = make(cls);
    }
  });
};

const load = (cls) => {
  if (!loads[cls]) {
    loads[cls] = make(cls);
  }
};

const stop = (cls) => {
  if (loads[cls]) {
    loads[cls](); 
    delete loads[cls];
    
    const boxes = document.querySelectorAll(`.${cls}`);
    boxes.forEach(box => {
      const shim = box.querySelector('.shim');
      if (shim) {
        shim.style.opacity = '0';
        safeRemoveChild(box, shim);
      }
    });
  }
};

const make = (cls) => {
  const boxes = document.querySelectorAll(`.${cls}`);
  if (boxes.length === 0) return;

  const loads = [];

  boxes.forEach(box => {
    const shim = document.createElement('div');
    shim.className = 'shim';

    const wrap = document.createElement('div');
    wrap.className = 'wrap';
    
    while (box.firstChild) {
      try {
        wrap.appendChild(box.firstChild);
      } catch (error) {
        console.debug('Error moving child to wrap, skipping');
      }
    }

    box.append(wrap, shim);

    box.style.position = 'relative';
    box.style.overflow = 'hidden';

    const fit = () => {
      const rect = box.getBoundingClientRect();
      Object.assign(shim.style, {
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        borderRadius: getComputedStyle(box).borderRadius,
        top: 0,
        left: 0
      });
    };

    fit();

    const resizeObserver = new ResizeObserver(fit);
    resizeObserver.observe(box);

    loads.push({ box, shim, wrap, resizeObserver });
  });

  return () => {
    loads.forEach(({ box, shim, wrap, resizeObserver }) => {
      safeRemoveChild(box, shim);

      while (wrap.firstChild) {
        try {
          box.appendChild(wrap.firstChild);
        } catch (error) {
          console.debug('Error moving child back to box, skipping');
        }
      }
      
      safeRemoveChild(box, wrap);

      resizeObserver.unobserve(box);
    });
  };
};

const style = () => {
  const css = `
    .shim {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(90deg, rgba(240, 240, 240, 0.3) 25%, rgba(224, 224, 224, 0.5) 50%, rgba(240, 240, 240, 0.3) 75%);
      background-size: 200% 100%;
      animation: shim 1.5s infinite linear;
      z-index: 1;
      pointer-events: none;
      opacity: 1;
    }
    @keyframes shim {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    .wrap {
      opacity: 0;
      transition: opacity 0.3s ease;
    }
  `;
  
  const sheet = document.createElement('style');
  sheet.type = 'text/css';
  sheet.appendChild(document.createTextNode(css));
  
  document.head.appendChild(sheet);
};

export { add, setAutoStart, start, load, stop, style };