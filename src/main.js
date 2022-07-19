import { Car } from './car';
import { Road } from './road';
import { getRandomColor, lerp } from './utils';
import { NeuralNetwork } from './network';
import { Visualizer } from './visualizer';

import './style.css';
const app = document.getElementById("app");
app.appendChild(document.createElement("canvas")).id = "carCanvas";
carCanvas.width = 300;

const carCtx = carCanvas.getContext("2d");
const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9);

const N = 1000;
const cars = generateCars(N);

let bestCar = cars[0];
let activeCar

app.appendChild(document.createElement("h2")).id = "activeCars";
activeCars.innerHTML = activeCar;

app.appendChild(document.createElement("button")).id = "loadButton";
loadButton.innerText = "Load";
loadButton.onclick = load;

app.appendChild(document.createElement("button")).id = "saveButton";
saveButton.innerText = "Save";
saveButton.onclick = save;

app.appendChild(document.createElement("button")).id = "discardButton";
discardButton.innerText = "Discard";
discardButton.onclick = discard;

app.appendChild(document.createElement("div")).id = "verticalButtons";
verticalButtons.appendChild(activeCars)
verticalButtons.appendChild(loadButton)
verticalButtons.appendChild(saveButton)
verticalButtons.appendChild(discardButton)

app.appendChild(document.createElement("canvas")).id = "networkCanvas";
networkCanvas.width = 500;
const networkCtx = networkCanvas.getContext("2d");

if (localStorage.getItem("bestBrain")) {

    for (let i = 0; i < cars.length; i++) {
        cars[i].brain = JSON.parse(
            localStorage.getItem("bestBrain"));
        if (i != 0) {
            NeuralNetwork.mutate(cars[i].brain, 0.15);
        }
    }

}

const traffic = [];   // Generate some traffic;

for (let i = 0; i < 100; i++) {
    const randomLane = Math.floor(Math.random() * road.laneCount);
    traffic.push(new Car(road.getLaneCenter(randomLane), i * -100 - 100, 30, 50, "DUMMY", 5, getRandomColor()));
}

const playerCar = new Car(road.getLaneCenter(1), -50, 30, 50, "KEYS", 20, "red");
//traffic.push(playerCar)

function load() {
    // Fetch the json goodbrain and load it into the local storage
    fetch("./goodbrain.json")
        .then(response => response.json())
        .then(data => {
            localStorage.setItem("bestBrain", JSON.stringify(data));
        });
}

function save() {
    // Save the best brain to local storage and as a json file
    localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain));
    const a = document.createElement('a');
    a.href = URL.createObjectURL(
        new Blob([JSON.stringify(bestCar.brain)], { type: 'text/plain' })
    );
    a.download = 'goodbrain.json';
    a.click();
}

function discard() {
    localStorage.removeItem("bestBrain");
}

function generateCars(N) {
    const cars = [];
    for (let i = 1; i <= N; i++) {
        cars.push(new Car(road.getLaneCenter(2), 100, 30, 50, "AI", 10));
    }
    return cars;
}



animate();

function animate(time) {

    activeCars.innerHTML = activeCar;
    //console.log(activeCar);

    // Count the number of cars that are still active
    activeCar = cars.length;

    for (let i = 0; i < cars.length; i++) {
        if (cars[i].damaged) {
            activeCar--;
        }
    }

    for (let i = 0; i < traffic.length; i++) {
        traffic[i].update(road.borders, []);
    }
    for (let i = 0; i < cars.length; i++) {
        cars[i].update(road.borders, traffic);
    }
    bestCar = cars.find(
        c => c.y == Math.min(...cars.map(c => c.y)
        ));

    playerCar.update(road.borders, traffic);

    carCanvas.height = window.innerHeight;
    networkCanvas.height = window.innerHeight;

    carCtx.save();
    if (/* !playerCar.damaged */ false) {
        carCtx.translate(0, -playerCar.y + carCanvas.height * 0.7);
    } else {
        carCtx.translate(0, -bestCar.y + carCanvas.height * 0.7);
    }

    road.draw(carCtx);
    for (let i = 0; i < traffic.length; i++) {
        traffic[i].draw(carCtx);
    }
    carCtx.globalAlpha = 0.2;
    for (let i = 0; i < cars.length; i++) {
        cars[i].draw(carCtx);
    }
    carCtx.globalAlpha = 1;
    bestCar.draw(carCtx, true);
    playerCar.draw(carCtx, true);

    carCtx.restore();

    networkCtx.lineDashOffset = -time/100;

    Visualizer.drawNetwork(networkCtx, bestCar.brain);
    requestAnimationFrame(animate);
}

