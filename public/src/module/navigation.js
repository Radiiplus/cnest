const menuStyles = `
  .slide-menu {
    position: fixed;
    top: 45%;
    right: -100px;
    transform: translateY(-50%);
    width: auto;
    border: 0.4px solid rgba(200, 200, 200, 0.2); 
    backdrop-filter: blur(3px);
    border-radius: 15px;
    transition: right 0.3s ease-in-out;
    padding: 4.5%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .slide-menu.active {
    right: 0;
  }
  .icon-wrapper {
    display: flex;
    justify-content: center;
    margin: 10px 0;
    cursor: pointer;
  }
  .icon-wrapper .material-icons {
    font-size: 30px;
    color: white;
  }
  .nav-circle {
    cursor: pointer;
  }
`;

function injectMenuStyles() {
  const styleElement = document.createElement('style');
  styleElement.textContent = menuStyles;
  document.head.appendChild(styleElement);
}

export function initNavigationMenu({ icons }) {
  injectMenuStyles();

  const slideMenu = document.createElement('div');
  slideMenu.classList.add('slide-menu');
  slideMenu.id = 'slideMenu';

  icons.forEach(icon => {
    const iconWrapper = document.createElement('div');
    iconWrapper.classList.add('icon-wrapper');
    iconWrapper.dataset.iconId = icon.id;

    const iconElement = document.createElement('span');
    iconElement.classList.add('material-icons');
    iconElement.textContent = icon.icon;

    iconWrapper.appendChild(iconElement);
    slideMenu.appendChild(iconWrapper);
  });

  document.body.appendChild(slideMenu);

  document.querySelector('.nav-circle').addEventListener('click', () => {
    slideMenu.classList.toggle('active');
  });

  document.querySelectorAll('.icon-wrapper').forEach(iconWrapper => {
    iconWrapper.addEventListener('click', event => {
      event.preventDefault();
      const iconId = iconWrapper.dataset.iconId;
      const iconConfig = icons.find(icon => icon.id === iconId);

      if (iconConfig) {
        if (iconConfig.isNavigation) {
          window.location.href = iconId === 'home' ? '/' : `/${iconId}`;
        } else if (iconConfig.callback) {
          iconConfig.callback();
        } else {
        }
      }
    });
  });
}
