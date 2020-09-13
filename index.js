const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

const cellsHorizontal = 10; 
const cellsVertical = 7;
const width = window.innerWidth;
const height = window.innerHeight;
const unitLengthX = width / cellsHorizontal;
const unitLengthY = height / cellsVertical;

const engine = Engine.create();
engine.world.gravity.y = 0;
const { world } = engine;
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        wireframes: false,
        width,
        height
    }
});
Render.run(render);
Runner.run(Runner.create(), engine);



// walls
const walls = [
    Bodies.rectangle(width/2, 0, width, 2, { isStatic: true }),
    Bodies.rectangle(width/2, height, width, 2, { isStatic: true }),
    Bodies.rectangle(0, height/2, 2, height, { isStatic: true }),
    Bodies.rectangle(width, height/2, 2, height, { isStatic: true })
];

World.add(world, walls);

// grid generation
const grid = Array(cellsVertical)
    .fill(null)
    .map(() => Array(cellsHorizontal).fill(false));

const verticals = Array(cellsVertical).fill(null)
    .map(()=>Array(cellsVertical - 1).fill(false));

const horizontals = Array(cellsHorizontal - 1).fill(null)
    .map(()=>Array(cellsHorizontal).fill(false));

const startRow = Math.floor(Math.random() * cellsVertical);
const startColumn = Math.floor(Math.random() * cellsHorizontal);

//shuffle neighbors array
const shuffle = (arr) => {
    let counter = arr.length;
    while(counter > 0){
        const index = Math.floor(Math.random() * counter);
        counter--

        let temp = arr[counter];
        arr[counter] = arr[index];
        arr[index] = temp;
    }
    return arr;
};

// maze generation function
const stepThroughCell = (row, column) => {
    // if visited, return
    if(grid[row][column]) return;
    // Mark this cell as visited
    grid[row][column] = true;
    // Assemble neighbors
    const neighbors = shuffle([
        [row, column - 1, 'left'],
        [row, column + 1, 'right'],
        [row + 1, column, 'down'],
        [row - 1, column, 'up']
    ]);
    // for each neighbor check 
    for(let neighbor of neighbors){
        const [nextRow, nextColumn, direction] = neighbor;
            // if outside of grid? 
        if(nextRow < 0 || nextRow >= cellsVertical || 
            nextColumn < 0 || nextColumn >= cellsHorizontal){
            continue;
        }   // if visited?
        if(grid[nextRow][nextColumn]){
            continue;
        }  // find wall to remove
        if(direction === 'left'){
            verticals[row][column - 1] = true;
        } else if(direction === 'right'){
            verticals[row][column] = true;
        } else if(direction === 'up'){
            horizontals[row - 1][column] = true;
        } else if(direction === 'down'){
            horizontals[row][column] = true;
        }  
        stepThroughCell(nextRow, nextColumn);
    }
};

stepThroughCell(startRow, startColumn);

// draw walls
horizontals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if (open) return;

        const wall = Bodies.rectangle(
            columnIndex * unitLengthX + unitLengthX / 2,
            rowIndex * unitLengthY + unitLengthY,
            unitLengthX, 5, {
            isStatic: true,
            label: 'wall',
            render: {
                fillStyle: '#FFE4B9'
            }
        }
        );
        World.add(world, wall);

    });
});

verticals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if (open) return;

        const wall = Bodies.rectangle(
            columnIndex * unitLengthX + unitLengthX,
            rowIndex * unitLengthY + unitLengthY / 2,
            10, unitLengthY, {
            isStatic: true,
            label: 'wall',
            render: {
                fillStyle: '#FFE4B9'
            }
        }
        );
        World.add(world, wall);

    });
});

// goal
const goal = Bodies.rectangle(
    width - unitLengthX / 2,
    height - unitLengthY / 2,
    unitLengthX * .7,
    unitLengthY * .7, {
        isStatic: true,
        label: 'goal',
        render: {
            fillStyle: '#3EB489'
        }
    }
);
World.add(world, goal)

// ball
const ballRadius = Math.min(unitLengthX, unitLengthY) / 4;
const ball = Bodies.circle(
    unitLengthX/2,
    unitLengthY/2,
    ballRadius, {
        label: 'ball',
        render: {
            fillStyle: '#7FD7FF'
        }
    }
);
World.add(world, ball)
        
document.addEventListener('keydown', event => {
    const { x, y } = ball.velocity
    if(event.keyCode === 65) //left  a
    Body.setVelocity(ball, { x: x - 3, y })
    if(event.keyCode === 87) //up  w
    Body.setVelocity(ball, { x, y: y - 3 })
    if(event.keyCode === 68) //right d
    Body.setVelocity(ball, { x: x + 3, y })
    if(event.keyCode === 83) //down s
    Body.setVelocity(ball, { x, y: y + 3 })
}
);

const button = document.querySelector('.btn')
function reloadThePage(){
    window.location.reload();
} 
// Win Condition
Events.on(engine, 'collisionStart', event => {
    event.pairs.forEach(collision => {
        const labels = ['ball', 'goal'];
        
        if(labels.includes(collision.bodyA.label) &&
        labels.includes(collision.bodyB.label)){
        
            document.querySelector('.winner').classList.remove('hidden')
            world.gravity.y = 1;
            
            world.bodies.forEach(body => { 
            if(body.label === 'wall'){
                Body.setStatic(body, false);
                }
            });

            button.classList.remove('hidden')
            
        }
    });
});