export function renderPage({
  showHeader = true,
  showFooter = true,
  headerContent = '',
  bodyContent = '',
  footerContent = ''
}) {
  const headerHtml = showHeader ? `<header class="header">${headerContent}</header>` : '';
  const footerHtml = showFooter ? `<footer class="footer">${footerContent}</footer>` : '';

  document.getElementById('root').innerHTML = `${headerHtml}<main class="main-body"><div class="container">${bodyContent}</div></main>${footerHtml}`;

  const adjustVhElements = () => {
    const headerHeight = showHeader ? document.querySelector('.header').offsetHeight : 0;
    const footerHeight = showFooter ? document.querySelector('.footer').offsetHeight : 0;
    const totalHeightToSubtractVh = (headerHeight + footerHeight) / window.innerHeight * 100;

    document.querySelectorAll('.main-body [style*="vh"]').forEach(element => {
      const vhMatch = window.getComputedStyle(element).height.match(/(\d+\.?\d*)vh/);
      if (vhMatch) element.style.height = `${parseFloat(vhMatch[1]) - totalHeightToSubtractVh}vh`;
    });
  };

  if (!document.getElementById('layout-styles')) {
    const style = document.createElement('style');
    style.id = 'layout-styles';
    style.innerHTML = `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        -webkit-tap-highlight-color: transparent; 
        -webkit-touch-callout: none; 
        -webkit-user-select: none; 
        -moz-user-select: none; 
        -ms-user-select: none;
        user-select: none;
        outline: none;        
      }
      html, body {
        height: 100%;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      #root {
        display: flex;
        flex-direction: column;
        height: 100%;
      }
      .header, .footer {
        background-color: rgba(128, 128, 128, 0.08);
        padding: 3%;
        text-align: center;
        width: 100%;
        backdrop-filter: blur(3px);
      }
      .header {
        border-bottom-left-radius: 8px;
        border-bottom-right-radius: 8px;
      }
      .footer {
        border-top-left-radius: 8px;
        border-top-right-radius: 8px;
      }
      .main-body {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .container {
        text-align: center;
      }
    `;
    document.head.appendChild(style);
  }

  adjustVhElements();
  window.addEventListener('resize', adjustVhElements);
}
