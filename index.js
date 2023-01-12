const { createCanvas, loadImage, registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');

function getLines(ctx, text, maxWidth) {
  var words = text.split(" ");
  var lines = [];
  var currentLine = "";

  for (var i = 0; i < words.length; i++) {
    var word = words[i];
    var width = ctx.measureText(currentLine + " " + word).width;
    if (width < maxWidth) {
        currentLine += (currentLine.length ? " " : "") + word;
    } else {
        lines.push(currentLine);
        currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}

const formatText = (text) =>
{
  return text.split("").join(String.fromCharCode(8202));
};

const faz = async () => {
  const canvas = createCanvas(300, 181);
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, 300, 181);

  const image = await loadImage('./CARTAO_Verao1.png');
  context.drawImage(image, 0, 0, 300, 181);

  registerFont('volter.ttf', { family: 'volter' })
  context.font = '9px volter';
  i = 0;
  for (const line of getLines(context, "coiuewhfiuwesssssssssssssssssssssssshfewpiu dwieujhdiuw ouwihdwpiuh p wh dp", 116))
  {
    context.fillText(formatText(line), 25, 36 + (i * 15));
    i++;
  }

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync('./test.png', buffer)
};

faz();