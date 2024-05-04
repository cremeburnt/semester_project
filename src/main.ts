import {controller as catController} from './cat_model';

window.addEventListener("DOMContentLoaded", main);
window.addEventListener('resize', onWindowResize, false);

type controller = {
    draw: () => void,
    init: () => void,
    resize: () => void
};
let mainController : controller = null;

let canvas : HTMLCanvasElement = null;

function main() {
    canvas = document.querySelector('#main-canvas');
    const hash = window.location.hash;
    mainController = catController;
    mainController.init();
    onWindowResize();
}

function onWindowResize() {
    const container = document.getElementById('canvas-container');
    
    // Resize the canvas
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    
    mainController.resize();
    mainController.draw();
}