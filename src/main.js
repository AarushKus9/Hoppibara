import kaboom from "kaboom";

const Window_HEIGHT = -66;
const FLOOR_HEIGHT = 263;
const JUMP_FORCE = 800;
const SPEED = 480;
let score = -1;
const EnemySprites = ["Cappyinbath", "Box", "PinkCappy", "oranges"];

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

kaboom({
  background: [255, 211, 147],
  color: [0, 0, 0],
  backgroundAudio: true,
  fullscreen: true, // Enable fullscreen
  scale: 1, // Scale to fit the screen
});

debug.inspect = false;

loadSpriteAtlas("/sprites/Cappy.png", {
  bean: {
    x: 10,
    y: 48,
    width: 350,
    height: 148,
    sliceX: 2,
    anims: {
      Run: {
        from: 0,
        to: 1,
        speed: 5,
        loop: true,
      },
    },
  },
});

loadSprite("Floor", "/sprites/Floor.png");
loadSprite("Window", "/sprites/Window.png");
loadSprite("Box", "/sprites/obstacle3.png");
loadSprite("PinkCappy", "/sprites/pinkcappy.png");
loadSprite("Cappyinbath", "/sprites/Cappyinbath.png");
loadSprite("Main", "/sprites/Board.svg");
loadSprite("Text", "/sprites/Button.svg");
loadSprite("oranges", "/sprites/obstacle1.png");

loadFont("MainFont", "/sprites/BaiJamjuree-Bold.ttf", { 
  size: 50, 
  outline: .1, 
  outlineColor: [0, 0, 0] 
});

loadSound("MainMusic", "/sprites/MainMusic.mp3");
loadSound("Jump", "/sprites/Jump.mp3");
loadSound("Point", "/sprites/Point.wav");

let music;

function PlayMusic(trackName) {
  console.log(`Playing music: ${trackName}`);
  if (music) {
    music.stop();
  }
  music = play(trackName, {
    loop: true,
    volume: 0.5,
  });
}

scene("game", (score) => {
  setGravity(1000);

  const player = add([
    sprite("bean", { anim: "Run" }),
    pos(width() * 0.1, height() * 0.1), // Relative positioning
    rotate(0),
    area(),
    body(),
    z(2),
    anchor("center"),
  ]);

  function WindowSpawn() {
    add([
      sprite("Window"),
      z(0),
      scale(0.5),
      outline(4),
      pos(width(), height() - Window_HEIGHT),
      anchor("botleft"),
      move(LEFT, SPEED - 100),
    ]);

    wait(rand(3, 3), WindowSpawn);
  }

  loop(1.9, () => {
    play("Point", { volume: 10 });
    score++;
    scoreLabel.text = `${score}`;
  });

  WindowSpawn();

  function Floor() {
    const floorWidth = width();
    const floorHeight = height() + 491;
    const SPEED = 400;

    const floor1 = add([
      sprite("Floor"),
      pos(0, floorHeight),
      anchor("botleft"),
      area(),
      body({ isStatic: true }),
      z(1),
    ]);

    const floor2 = add([
      sprite("Floor"),
      pos(floorWidth, floorHeight),
      anchor("botleft"),
      area(),
      body({ isStatic: true }),
      z(1),
    ]);

    onUpdate(() => {
      floor1.pos.x -= SPEED * dt();
      floor2.pos.x -= SPEED * dt();

      if (floor1.pos.x <= -floorWidth) {
        floor1.pos.x = floor2.pos.x + floorWidth;
      }
      if (floor2.pos.x <= -floorWidth) {
        floor2.pos.x = floor1.pos.x + floorWidth;
      }
    });
  }

  Floor();

  function jump() {
    if (player.isGrounded()) {
      let spinAngle = 0;
      const SPIN_SPEED = 500;
      const JUMP_DURATION = 0.1;

      const spinInterval = setInterval(() => {
        const increment = SPIN_SPEED * dt();
        spinAngle += increment;
        player.angle += increment;

        if (spinAngle >= 360 || player.isGrounded()) {
          player.angle = 0;
          clearInterval(spinInterval);
        }
      }, 1000 / 60);

      player.jump(JUMP_FORCE);
      play("Jump");
    }
  }

  onKeyDown("left", () => {
    if (player.pos.x > 0) {
      player.move(-SPEED, 0);
    }
  });

  onKeyDown("right", () => {
    if (player.pos.x < width() - player.width) {
      player.move(SPEED, 0);
    }
  });

  onKeyDown("escape", () => {
    debug.inspect = true;
  });

  onKeyDown("`", () => {
    debug.inspect = false;
  });

  onKeyPress("space", jump);
  onClick(jump);

  function EnemySpawn() {
    const randomSprite = randomChoice(EnemySprites);
    console.log("Spawned sprite:", randomSprite); // Debugging line

    if (randomSprite == "Box") {
      add([
        sprite("Box"),
        area(),
        scale(0.5),
        z(3),
        outline(4),
        pos(width(), height() - FLOOR_HEIGHT),
        anchor("botleft"),
        move(LEFT, SPEED),
        offscreen({ wait: 5, destroy: true }),
        "Enemy",
      ]);
    } else {
      add([
        sprite(randomSprite),
        area(),
        scale(0.6),
        z(3),
        outline(4),
        pos(width(), height() - FLOOR_HEIGHT),
        anchor("botleft"),
        move(LEFT, SPEED),
        offscreen({ wait: 5, destroy: true }),
        "Enemy",
      ]);
    }

    wait(rand(1, 2), EnemySpawn);
  }

  EnemySpawn();
  player.onCollide("Enemy", () => {
    go("MainScreen", score);
  });

  const scoreLabel = add([
    text(`${score}`, {
      font: "MainFont",
      size: 50,
    }),
    color(0, 0, 0),
    pos(width() * 0.5, height() * 0.05), // Relative positioning
    z(4),
  ]);
});

scene("MainScreen", (score) => {
  if (!music || music.stopped) {
    PlayMusic("MainMusic");
  }

  const mainSprite = add([
    sprite("Main"),
    pos(width() / 2, height() / 2),
    scale(Math.min(width() / 1900, height() / 720)), // Dynamic scaling
    anchor("center"),
  ]);

  add([
    text(`Score: ${score}`, {
      font: "MainFont",
      size: 50,
    }),
    color(0, 0, 0),
    pos(width() / 1.37, height() / 1.9 + 300),
    anchor("center"),
  ]);

  add([
    sprite("Text"),
    pos(width() / 1.37, height() / 1.399),
    anchor("center"),
    {
      update() {
        const scale = Math.sin(time() * 2) * 0.1 + 1;
        this.scale = vec2(scale);
      },
    },
  ]);
  onKeyPress("space", () => go("game", -1));
});

scene("force", () => {
  add([
    text("Press anything Enter Game", {
      font: "MainFont",
      size: 50,
    }),
    color(0, 0, 0),
    pos(width() / 2, height() / 2),
    anchor("center"),
  ]);

  onKeyPress(() => go("MainScreen", 0));
});

go("force");