const { createCanvas, loadImage } = require("canvas");
const fs = require('fs');
const path = require("path");

// Constants
const EXIT_SUCCESS = 0;
const EXIT_FAILURE = 1;
const RGB_MIN      = 0;
const RGB_MAX      = 255;

function drawRandomNoise(context, width, height) {
    const randomRGBValue = () => {
        return Math.floor(RGB_MIN + (RGB_MAX - RGB_MIN + 1) * Math.random());
    };
    
    for(let i = 0; i < width; i++) {
        for(let j = 0; j < height; j++) {
            context.fillStyle = `rgb(${randomRGBValue()},${randomRGBValue()},${randomRGBValue()})`;
            context.fillRect(i, j, 1, 1);
        }
    }
}

// Main function
async function main() {
    const file_names = fs.readdirSync("images/source", {withFileTypes: true});
    
    if(!fs.existsSync(path.join("images", "random"))) {
            fs.mkdirSync(path.join("images", "random"));
    }
    
    for(let idx = 0; idx < file_names.length; idx++) {
        if(!(file_names[idx].isFile())) {
            continue;
        }
        
        // Load the background image
        const background = await loadImage(`images/source/${file_names[idx].name}`);
        
        // Create the canvas object
        const canvas = createCanvas(background.width, background.height);
        const context = canvas.getContext('2d');
        
        // Overlay the background image
        context.globalAlpha = 1.0;
        context.drawImage(background, 0, 0, background.width, background.height);
        
        // Overlay the random noise
        context.globalAlpha = 0.05;
        drawRandomNoise(context, background.width, background.height);
        
        // Store the result image
        const buffer = canvas.toBuffer('image/jpeg', {quality: 0.75});
        fs.writeFileSync(`images/random/${path.parse(file_names[idx].name).name}.jpg`, buffer);
    }
}

main()
    .then(() => {
        process.exit(EXIT_SUCCESS);
    })
    .catch((error) => {
        console.error(error);
        process.exit(EXIT_FAILURE);
    });