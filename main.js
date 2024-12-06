class Game {
  constructor() {
    /**@type {Hexagon[]} */
    this.hexGrid = [];
    /**@type {HTMLCanvasElement} */
    this.canvas = document.getElementById("canvas");
    /**@type {CanvasRenderingContext2D} */
    this.ctx = this.canvas.getContext("2d");
    this.canvasRect = this.canvas.getBoundingClientRect();
    this.coordinate = new Coordinates(0, 0);
    this.controllerStats = new ControllerStats();
    this.sizeX = 8;
    this.sizeY = 8;
    this.hexagonSize = 50; // Hexagon radius
  }

  draw(hexagon) {
    const x = hexagon.coordinate.left * this.controllerStats.zoomLevel;
    const y = hexagon.coordinate.top * this.controllerStats.zoomLevel;
    this.ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3; // 60-degree increments
      this.ctx.lineTo(
        x + this.controllerStats.offset.left + this.hexagonSize * this.controllerStats.zoomLevel * Math.cos(angle) + this.coordinate.left * this.controllerStats.zoomLevel,
        y + this.controllerStats.offset.top + this.hexagonSize * this.controllerStats.zoomLevel * Math.sin(angle) + this.coordinate.top * this.controllerStats.zoomLevel
      );
    }
    this.ctx.closePath();
    this.ctx.stroke();
  }

  clear() {
    this.ctx.reset();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  render() {
    this.clear();
    for (const hexagon of this.hexGrid) {
      this.draw(hexagon);
    }
    requestAnimationFrame(() => this.render()); // Sikker render binder
  }

  setup() {
    this.addControlles();
    for (let i = 0; i < this.sizeX; i++) {
      for (let j = 0; j < this.sizeY; j++) {
        if (i % 2 === j % 2) {
          const x = i * 1.5 * this.controllerStats.zoomLevel * this.hexagonSize;
          const y = j * Math.sqrt(3) * this.hexagonSize * 0.5 * this.controllerStats.zoomLevel;
          this.hexGrid.push(new Hexagon(x, y));
        }
      }
    }
  }

  gameBoardPanningControlles() {
    document.addEventListener("mousemove", (e) => {
      if (this.controllerStats.mouseHolding) {
        const deltaX = e.clientX - this.controllerStats.mousePos.left;
        const deltaY = e.clientY - this.controllerStats.mousePos.top;
        this.coordinate.left += deltaX / this.controllerStats.zoomLevel;
        this.coordinate.top += deltaY / this.controllerStats.zoomLevel;
        this.controllerStats.mousePos.left = e.clientX;
        this.controllerStats.mousePos.top = e.clientY;
      }
    });
    this.canvas.addEventListener("mousedown", (e) => {
      this.controllerStats.mouseHolding = true;
      this.controllerStats.mousePos.left = e.clientX;
      this.controllerStats.mousePos.top = e.clientY;
    });
    document.addEventListener("mouseup", () => {
      this.controllerStats.mouseHolding = false;
    });
  }
  gameBoardZoomControlles() {
    this.canvas.addEventListener("wheel", (e) => {
        e.preventDefault();
        // Musens position relativt til canvas
        const mouseX = e.clientX - this.canvasRect.left; 
        const mouseY = e.clientY - this.canvasRect.top;
        const previousZoom = this.controllerStats.zoomLevel;
        const zoomDelta = e.deltaY * this.controllerStats.scrollSpeed;

        // Opdater zoomniveau
        this.controllerStats.zoomLevel = Math.min(
          Math.max(this.controllerStats.minZoom, previousZoom + zoomDelta),
          this.controllerStats.maxZoom
        );

        const zoomFactor = this.controllerStats.zoomLevel / previousZoom;

        // Justér offset for at holde musens position stabil
        this.controllerStats.offset.left = mouseX - zoomFactor * (mouseX - this.controllerStats.offset.left);
        this.controllerStats.offset.top = mouseY - zoomFactor * (mouseY - this.controllerStats.offset.top);
    }, { passive: false });
  }


  addControlles() {
    this.gameBoardPanningControlles();
    this.gameBoardZoomControlles();
  }
}

class ControllerStats {
  constructor() {
    this.mouseHolding = false;
    this.mousePos = new Coordinates(0,0);
    this.scrollSpeed = -0.001;
    this.zoomLevel = 1;
    this.minZoom = 0.25;
    this.maxZoom = 4;
    this.offset = new Coordinates(0,0);
  }
}

class Coordinates {
  constructor(left, top) {
    this.left = left;
    this.top = top;
  }
}

class Hexagon {
  constructor(x, y) {
    this.coordinate = new Coordinates(x, y);
  }
}

// the object start
const game = new Game();
function startGame() {
  game.setup();
  game.render(); // Start rendering
}