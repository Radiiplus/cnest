import { renderPage } from '../router.js';

export default function render404Page() {
  const showHeader = false;  
  const showFooter = false; 

  const bodyContent = `
    <style>
      .full-width-container { display: flex; justify-content: center; align-items: center; height: 100%; }
      .inner-content { width: 95%; max-width: 500px; text-align: center; border-radius: 10px; padding: 20px; border: 0.5px solid rgba(200, 200, 200, 0.1); margin-bottom: 10%; backdrop-filter: blur(10px); }
      .title { color: white; font-size: 36px; margin-bottom: 20px; }
      .paragraph { color: white; margin: 10px 0; font-size: 18px; }
      .button { 
        margin-top: 20px; 
        opacity: 0.7; 
        background-color: transparent; 
        border: 0.7px solid rgba(200, 200, 200, 0.3); 
        border-radius: 10px; 
        color: white; 
        padding: 10px 20px; 
        text-decoration: none; 
        cursor: pointer; 
        transition: background-color 0.3s ease; 
      }
      .button:hover { background-color: rgba(255, 255, 255, 0.1); }
    </style>
    
    <div class="full-width-container">
      <div class="inner-content">
        <h2 class="title">404 - Page Not Found</h2>
        <p class="paragraph">Oops! The page you are looking for does not exist.</p>
        <p class="paragraph">It might have been removed, or the URL might be incorrect.</p>
        <a href="/" class="button">Return to Home</a>
      </div>
    </div>
  `;

  renderPage({ showHeader, showFooter, bodyContent });
}
