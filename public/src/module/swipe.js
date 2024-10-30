const DIST = 20; 
const TIME = 500; 

export const SwipeType = {
  LEFT: 'left',
  RIGHT: 'right',
  UP: 'up',
  DOWN: 'down'
};

class Swipe {
  constructor(el) {
    this.el = el;
    this.x = 0;
    this.y = 0;
    this.time = 0;
    this.acts = {
      [SwipeType.LEFT]: [],
      [SwipeType.RIGHT]: [],
      [SwipeType.UP]: [],
      [SwipeType.DOWN]: []
    };

    this.start = this.start.bind(this);
    this.end = this.end.bind(this);
    this.keyDown = this.keyDown.bind(this);

    this.el.addEventListener('touchstart', this.start, { passive: true });
    this.el.addEventListener('touchend', this.end, { passive: true });
    window.addEventListener('keydown', this.keyDown);
  }

  start(e) {
    const touch = e.touches[0];
    this.x = touch.clientX;
    this.y = touch.clientY;
    this.time = new Date().getTime();
  }

  end(e) {
    const touch = e.changedTouches[0];
    const endX = touch.clientX;
    const endY = touch.clientY;
    const endTime = new Date().getTime();

    const dx = endX - this.x;
    const dy = endY - this.y;
    const dt = endTime - this.time;

    if (dt > TIME) return;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) > DIST) {
        if (dx > 0) {
          this.run(SwipeType.RIGHT);
        } else {
          this.run(SwipeType.LEFT);
        }
      }
    } else {
      if (Math.abs(dy) > DIST) {
        if (dy > 0) {
          this.run(SwipeType.DOWN);
        } else {
          this.run(SwipeType.UP);
        }
      }
    }
  }

  keyDown(e) {
    switch (e.key) {
      case 'ArrowLeft':
        this.run(SwipeType.LEFT);
        break;
      case 'ArrowRight':
        this.run(SwipeType.RIGHT);
        break;
      case 'ArrowUp':
        this.run(SwipeType.UP);
        break;
      case 'ArrowDown':
        this.run(SwipeType.DOWN);
        break;
      default:
        break;
    }
  }

  on(type, fn) {
    if (this.acts[type]) {
      this.acts[type].push(fn);
    }
  }

  off(type, fn) {
    if (this.acts[type]) {
      this.acts[type] = this.acts[type].filter(f => f !== fn);
    }
  }

  run(type) {
    this.acts[type].forEach(fn => fn());
  }

  stop() {
    this.el.removeEventListener('touchstart', this.start);
    this.el.removeEventListener('touchend', this.end);
    window.removeEventListener('keydown', this.keyDown);
    this.acts = {
      [SwipeType.LEFT]: [],
      [SwipeType.RIGHT]: [],
      [SwipeType.UP]: [],
      [SwipeType.DOWN]: []
    };
  }
}

export function newSwipe(el) {
  return new Swipe(el);
}
