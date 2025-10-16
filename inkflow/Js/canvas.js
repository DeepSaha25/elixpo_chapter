// Get canvas and context
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Set initial canvas dimensions
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Variables
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let restore_array = [];
let start_index = -1;

// Event Listeners
canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mouseout", stopDrawing);
window.addEventListener("resize", resizeCanvas); // Add resize listener

document.getElementById("clear-button").addEventListener("click", clearCanvas);
document.getElementById("download-button").addEventListener("click", downloadCanvas);
document.getElementById("undo-button").addEventListener("click", undoLast);


function startDrawing(e) {
  isDrawing = true;
  [lastX, lastY] = [e.offsetX, e.offsetY];
}

function draw(e) {
  if (!isDrawing) return;
  ctx.strokeStyle = document.getElementById("color-picker").value;
  ctx.lineWidth = document.getElementById("brush-size").value;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
  [lastX, lastY] = [e.offsetX, e.offsetY];
}

function stopDrawing() {
    if(isDrawing){
        restore_array.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
        start_index += 1;
    }
  isDrawing = false;

}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  restore_array = [];
  start_index = -1;
}

function downloadCanvas() {
  const link = document.createElement("a");
  link.download = "inkflow-drawing.png";
  link.href = canvas.toDataURL();
  link.click();
}

function undoLast() {
    if (start_index <= 0) {
        clearCanvas();
    } else {
        start_index -= 1;
        restore_array.pop();
        ctx.putImageData(restore_array[start_index], 0, 0);
    }
}


function resizeCanvas() {
    // Save canvas content
    const savedContent = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Resize canvas
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Restore canvas content
    ctx.putImageData(savedContent, 0, 0);
}