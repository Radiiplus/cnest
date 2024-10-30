const colorThief = new ColorThief();

export const setBg = () => {
  Object.assign(document.body.style, {
    backgroundImage: "url('./src/assets/img/img.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    height: "100vh",
    margin: "0",
    position: 'relative',
  });
  const over = document.createElement('div');
  Object.assign(over.style, {
    position: 'absolute',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    backgroundColor: 'rgba(0, 0, 0, 0.8)', 
    zIndex: '-1',
  });
  
  document.body.appendChild(over);
};

export const applyGlass = () => {
  const img = new Image();
  img.src = './src/assets/img/img.jpg';
  img.onload = () => {
    const pal = thief.getPal(img, 5);
    const grad = makeGrad(pal);
    const conts = document.querySelectorAll('.dynamic-container');

    conts.forEach(cont => {
      const rad = window.getComputedStyle(cont).borderRadius;
      const styleEl = document.createElement('style');
      styleEl.textContent = `
        .dynamic-container::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          ${grad}
          opacity: 0.5; border-radius: ${rad}; z-index: -1;
        }
      `;
      document.head.appendChild(styleEl);

      Object.assign(cont.style, {
        position: 'relative',
        backdropFilter: 'blur(5px)',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      });
    });
  };
};

const makeGrad = (pal) => {
  const amps = pal.map(ampSat);
  return `background: linear-gradient(to bottom right, 
            rgba(${amps[0].join(',')}, 0.5) 0%,  
            rgba(${amps[1].join(',')}, 0.4) 25%, 
            rgba(${amps[2].join(',')}, 0.3) 50%, 
            rgba(${amps[3].join(',')}, 0.2) 75%, 
            rgba(${amps[4].join(',')}, 0.1) 100%  
        );`;
};

const ampSat = (rgb) => {
  const hsl = rgbToHsl(rgb);
  hsl[1] = Math.min(1, hsl[1] * 1.8);
  return hslToRgb(hsl);
};

const rgbToHsl = ([r, g, b]) => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) h = s = 0;
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h /= 6;
  }
  
  return [h, s, l];
};

const hslToRgb = ([h, s, l]) => {
  let r, g, b;
  
 if (s === 0) r = g = b = l;
 else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1; if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 /2 ) return q;
      if (t <2 /3 ) return p + (q - p) * (2 /3 - t) *6;
      return p;
   };
   
   const q = l < .5 ? l * (1 + s): l + s - l * s;
   const p=2 * l - q;
   r=hue2rgb(p,q,h+1/3);
   g=hue2rgb(p,q,h);
   b=hue2rgb(p,q,h-1/3);
 }
 
 return [Math.round(r *255), Math.round(g *255), Math.round(b *255)];
};