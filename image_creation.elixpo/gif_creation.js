import GIFEncoder from 'gif-encoder-2';
import { createCanvas, Image } from 'canvas';

/**
 * Creates a GIF from a series of images.
 *
 * @param {object} destination - The destination write stream for the GIF.
 * @param {number} width - The width of the GIF.
 * @param {number} height - The height of the GIF.
 * @param {string} [algorithm='neuquant'] - The quantization algorithm to use.
 * @returns {{showImage: (function(string): Promise<void>), finish: (function(): void)}}
 */
export function gifCreator(destination, width, height, algorithm = 'neuquant') {
  destination.writeHead(200, { 'Content-Type': 'image/gif' });

  const encoder = new GIFEncoder(width, height, algorithm);
  // Pipe the encoder's read stream to the destination write stream
  encoder.createReadStream().pipe(destination);

  encoder.start();
  encoder.setDelay(1); // Frame delay in ms
  encoder.setRepeat(-1); // -1 for repeat, 0 for no-repeat

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  /**
   * Loads an image from a URL, draws it to the canvas, and adds it as a frame to the GIF.
   * @param {string} url - The URL of the image to add.
   * @returns {Promise<void>}
   */
  const showImage = (url) => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      ctx.drawImage(image, 0, 0, width, height);
      encoder.addFrame(ctx);
      resolve();
    };
    image.onerror = (err) => {
        reject(err);
    };
    image.src = url;
  });

  return {
    showImage,
    finish: () => encoder.finish()
  };
}