import eventManager from './events.js';

function makeWait() {
  const style = document.createElement('style');
  style.textContent = `
    #wait-container {
      position: fixed;
      top: 2%;
      left: 50%;
      transform: translateX(-50%);
      z-index: 1000;
      display: flex;
      justify-content: center;
      align-items: center;
      width: auto;
      height: auto; 
      pointer-events: none;
    }
    .wait {
      opacity: 0;
      transition: opacity 0.5s ease, transform 0.5s ease;
      pointer-events: auto;
    }
    .wait.is-active {
      opacity: 1;
      transform: translateY(0);
    }
    .wait.fade-out {
      opacity: 0;
      transform: translateY(-20px);
    }
    .loader-container {
      width: 50vw;
      height: 1vh;
      background-color: rgba(100, 100, 100, 0.3);
      border: 0.4px solid rgba(200, 200, 200, 0.2);
      position: relative;
      overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 10px;
      backdrop-filter: blur(10px);
    }
    .moving-bar {
      width: 30%;
      height: 20px;
      background-color: rgba(225, 225, 225, 0.7);
      border-radius: 10px;
      position: absolute;
      animation: horizontal-slide 2s linear infinite;
    }
    @keyframes horizontal-slide {
      0% {
        left: 0;
      }
      50% {
        left: calc(100% - 50px);
      }
      100% {
        left: 0;
      }
    }
  `;
  
  document.head.appendChild(style);

  const cont = document.createElement('div');
  cont.id = 'wait-container';
  document.body.appendChild(cont);
}

function showWait() {
  if (!document.getElementById('wait-container')) {
    makeWait();
  }

  const wait = document.createElement('div');
  wait.className = 'wait';
  
  wait.innerHTML = `
    <div class="loader-container">
      <div class="moving-bar"></div>
    </div>
  `;

  const cont = document.getElementById('wait-container');
  cont.appendChild(wait);

  setTimeout(() => {
    wait.classList.add('is-active');
  }, 100);

  eventManager.on('fadeOutWait', () => {
    wait.classList.add('fade-out');
    setTimeout(() => {
      wait.remove();
    }, 500);
    
    if (cont.children.length === 0) {
      cont.remove();
    }
  });
}

function hideWait() {
  eventManager.emit('fadeOutWait');
}

eventManager.registerEvents();

export { showWait, hideWait };
