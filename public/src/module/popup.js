export class Popup {
  constructor(slidingPopupEnabled = true, centerPopupEnabled = true) {
    this.slidingPopupEnabled = slidingPopupEnabled;
    this.centerPopupEnabled = centerPopupEnabled;

    this.render();
    this.attachListeners();
  }
  render() {
    document.body.innerHTML += `
      <div id="popup" class="hidden">
        <span id="closePopup" class="material-icons"></span>
        <h2 class="title is-4"></h2>
        <div id="popupContent"></div>
      </div>
      <div id="centerPopup" class="hidden">
        <span id="closeCenterPopup" class="material-icons">close</span>
        <h2 class="title is-5"></h2>
        <div id="centerPopupContent"></div>
      </div>
    `;
    this.applyStyles();
  }
  attachListeners() {
    document.getElementById('closePopup').addEventListener('click', () => {
      this.hidePopup('popup');
    });
    document.getElementById('closeCenterPopup').addEventListener('click', () => {
      this.hidePopup('centerPopup');
    });
  }
  showPopup(type) {
    if ((type === 'popup' && !this.slidingPopupEnabled) || (type === 'centerPopup' && !this.centerPopupEnabled)) {
      console.warn(`${type} is disabled.`);
      return;
    }

    const popup = document.getElementById(type);
    if (popup) {
      popup.classList.remove('hidden');
      if (type === 'popup') {
        popup.style.transition = 'bottom 0.5s ease';
        popup.style.bottom = '0';
      }
    }
  }
  hidePopup(type) {
    const popup = document.getElementById(type);
    if (popup) {
      if (type === 'popup') {
        popup.style.bottom = '-100%';
      }
      setTimeout(() => {
        popup.classList.add('hidden');
      }, 500); 
    }
  }
  applyStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .hidden { display: none; }
      #popup {
        position: fixed;
        bottom: -100%;
        left: 0;
        right: 0;
        background-color: #fff;
        border-radius: 10px 10px 0 0;
        padding: 20px;
        height: 90%;
        box-shadow: 0px -4px 10px rgba(0, 0, 0, 0.2);
        z-index: 10;
        transition: bottom 0.5s ease;
      }

      #centerPopup {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: white;
        padding: 20px;
        border-radius: 10px;
        width: 300px;
        box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.2);
        z-index: 20;
      }

      #closePopup, #closeCenterPopup {
        position: absolute;
        top: 15px;
        right: 20px;
        cursor: pointer;
        font-size: 28px;
      }
    `;
    document.head.appendChild(style);
  }
  
  injectContent(contentId, content) {
    const contentElement = document.getElementById(contentId);
    if (contentElement) {
      contentElement.innerHTML = content;
    } else {
      console.error(`Content element with ID '${contentId}' not found`);
    }
  }
}
