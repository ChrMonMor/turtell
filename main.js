class Game {
  constructor() {
    /**@type {Hexagon[]} */
    this.hexGrid = [];
    /**@type {HTMLCanvasElement} */
    this.canvas = document.getElementById("canvas");
    /**@type {CanvasRenderingContext2D} */
    this.ctx = this.canvas.getContext("2d");
    this.canvasRect = this.canvas.getBoundingClientRect();
    // Skal brugs for tilrette af størrelsen for canvas 
    this.devicePixelRatio = window.devicePixelRatio*0.9;
    this.sizeX = 16;
    this.sizeY = 16;
    this.hexagonSize = 64 * this.devicePixelRatio; // Hexagon radius
    /**@type {Coordinates} */
    this.coordinate = new Coordinates(0, 0);
    /**@type {ControllerStats} */
    this.controllerStats = new ControllerStats(0, 0); 
  }

  /**@param {Hexagon} hexagon  */
  draw(hexagon) {
    const x = hexagon.coordinate.left * this.controllerStats.zoomLevel + this.controllerStats.offset.left;
    const y = hexagon.coordinate.top * this.controllerStats.zoomLevel + this.controllerStats.offset.top;
    this.ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3; // 60-degree increments
      this.ctx.lineTo(
        x + this.hexagonSize * this.controllerStats.zoomLevel * Math.cos(angle) + this.coordinate.left * this.controllerStats.zoomLevel,
        y + this.hexagonSize * this.controllerStats.zoomLevel * Math.sin(angle) + this.coordinate.top * this.controllerStats.zoomLevel
      );
    }
    this.ctx.closePath();
    this.ctx.stroke();
    this.ctx.drawImage(hexagon.sprite.spritemap, // image source
      hexagon.sprite.spritemapCoordinates.left, hexagon.sprite.spritemapCoordinates.top, // sprite 
      hexagon.sprite.size, hexagon.sprite.size, 
      x - hexagon.sprite.size/2 + this.coordinate.left * this.controllerStats.zoomLevel,
      y - hexagon.sprite.size/2 + this.coordinate.top * this.controllerStats.zoomLevel, 
      hexagon.sprite.size, hexagon.sprite.size);
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
    requestAnimationFrame(() => this.render()); 
  }

  setup() {
    this.addControlles();
    this.addEvents();
    for (let i = 0; i < this.sizeX; i++) {
      for (let j = 0; j < this.sizeY; j++) {
        if (i % 2 === j % 2) {
          const x = i * 1.5 * this.controllerStats.zoomLevel * this.hexagonSize;
          const y = j * Math.sqrt(3) * this.hexagonSize * 0.5 * this.controllerStats.zoomLevel;
          this.hexGrid.push(new Hexagon(x, y, i, j));
        }
      }
    }  
    // aligning the Canvas css with the code
    this.canvas.width = window.innerWidth * this.devicePixelRatio;
    this.canvas.height = window.innerHeight * this.devicePixelRatio;
  }

  gameBoardPanningControlles() {
    document.addEventListener("mousemove", (e) => {
      if (this.controllerStats.mouseHolding) {
        const deltaX = e.clientX - this.controllerStats.mousePos.left;
        const deltaY = e.clientY - this.controllerStats.mousePos.top;
        this.coordinate.left += deltaX / this.controllerStats.zoomLevel * window.devicePixelRatio;
        this.coordinate.top += deltaY / this.controllerStats.zoomLevel * window.devicePixelRatio;
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
        const mouseX = e.clientX - this.canvasRect.left; 
        const mouseY = e.clientY - this.canvasRect.top;
        const previousZoom = this.controllerStats.zoomLevel;
        const zoomDelta = e.deltaY * this.controllerStats.scrollSpeed;

        this.controllerStats.zoomLevel = Math.min(
          Math.max(this.controllerStats.minZoom, previousZoom + zoomDelta),
          this.controllerStats.maxZoom
        );

        const zoomFactor = this.controllerStats.zoomLevel / previousZoom;

        this.controllerStats.offset.left = mouseX - zoomFactor * (mouseX - this.controllerStats.offset.left);
        this.controllerStats.offset.top = mouseY - zoomFactor * (mouseY - this.controllerStats.offset.top);
    }, { passive: false });
  }


  addControlles() {
    this.gameBoardPanningControlles();
    this.gameBoardZoomControlles();
  }
  addEvents(){
    addEventListener("resize", () => {
      var dpr = window.devicePixelRatio;
      this.canvas.width = window.innerWidth * dpr * this.devicePixelRatio;
      this.canvas.height = window.innerHeight * dpr * this.devicePixelRatio;
    });
    screen.orientation.addEventListener("change", function(e) {
      var dpr = window.devicePixelRatio;
      this.canvas.width = window.innerWidth * dpr * this.devicePixelRatio;
      this.canvas.height = window.innerHeight * dpr * this.devicePixelRatio;
    });
  }
}

class ControllerStats {
  constructor() {
    this.mouseHolding = false;
    this.mousePos = new Coordinates(0, 0);
    this.scrollSpeed = -0.002;
    this.zoomLevel = 1;
    this.minZoom = 0.25;
    this.maxZoom = 4;
    this.offset = new Coordinates(0, 0);
  }
}

class Coordinates {
  constructor(left, top) {
    this.left = left;
    this.top = top;
  }
}

class Hexagon {
  constructor(x, y, i, j) {
    this.coordinate = new Coordinates(x, y);
    this.arrCoor = new Coordinates(i, j);
    this.sprite = new Sprite();
  }
}

class Sprite {
  /**@param {string} spritemapURL  */
  constructor(spritemapURL){
    this.assetsDir = "assets/sprites/";
    this.sizeName = "64";
    /**@type {HTMLImageElement} */
    this.spritemap = new Image();
    this.spritemap.src = this.assetsDir+this.sizeName+"Map.png";
    /**@type {Coordinates} */
    this.spritemapCoordinates = new Coordinates(0,0);
    /**@type {number} */
    this.size = 64;
  }

}
class Direction {
  static Up = new Direction('Up',0);
  static Down = new Direction('Down',1);
  static LeftUp = new Direction('LeftUp',2);
  static RightUp = new Direction('RightUp',3);
  static LeftDown = new Direction('LeftDown',4);
  static RightDown = new Direction('RightDown',5);
  /**@type {Direction} */
  static enum = [this.Up, this.Down, this.LeftUp, this.RightUp, this.LeftDown, this.RightDown];
  /**
   * 
   * @param {string} name 
   * @param {number} index 0-indexed 
   */
  constructor(name, index) {
    this.name = name;
    this.index = index
  }
  toString() {
    return `${this.name}`;
  }
  getIndex() {
    return this.index;
  }
  findIndex(target){
    this.enum.forEach(element => {
      if (element.toString() === target) {
        return element;
      }
    });
  }
}

// the object start
const game = new Game();
function startGame() {
  game.setup();
  game.render(); // Start rendering
}