import { createCanvas, loadImage, registerFont } from 'canvas';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import * as http from 'http';
const fs = require('fs');
dotenv.config();

export class App
{
  private _express: express.Express;
  private _server: http.Server;

  constructor()
  {
    this._express = express();
    this._express.use(express.json({limit: '50mb'}));

    this._express.post('/generate', async (req: Request, res: Response) => {
      let password = req.headers['password'];

      if (password !== process.env.API_PASSWORD)
        return res.send('ERROR_INVALID_PASSWORD');

      const { image_name, message, author } = req.body;

      const imagePath = process.env.TEMPLATES_PATH + image_name + '.png';

      if (!fs.existsSync(imagePath))
        return res.send('ERROR_TEMPLATE_NOT_FOUND');

      const templateWidth = parseInt(process.env.TEMPLATE_WIDTH);
      const templateHeight = parseInt(process.env.TEMPLATE_HEIGHT);
      const canvas = createCanvas(templateWidth, templateHeight);
      const context = canvas.getContext('2d');

      const lines = this.getLines(context, message.split("").join(String.fromCharCode(8202)), parseInt(process.env.TEXT_MAX_WIDTH));

      if (lines.length > parseInt(process.env.LINE_LIMIT))
        return res.send('ERROR_LINE_LIMIT');

      const templateImage = await loadImage(imagePath);

      if (!templateImage)
        return res.send('ERROR_TEMPLATE_NOT_LOADED');

      context.clearRect(0, 0, templateWidth, templateHeight);
      context.drawImage(templateImage, 0, 0, templateWidth, templateHeight);
  
      registerFont(process.env.FONT_PATH, { family: 'postcardFont' });
      context.font = process.env.TEXT_SIZE + ' postcardFont';
  
      var i = 0;
      for (const line of lines)
      {
        context.fillText(line, parseInt(process.env.TEXT_OFFSET_X), parseInt(process.env.TEXT_OFFSET_Y) + (i * parseInt(process.env.TEXT_LINE_OFFSET)));
        i++;
      }

      context.fillText(author.split("").join(String.fromCharCode(8202)), parseInt(process.env.TEXT_OFFSET_X), parseInt(process.env.AUTHOR_OFFSET_Y));

      const image = canvas.toBuffer('image/png');

      if (!image)
        return res.send('ERROR_IMAGE_NOT_GENERATED');

      const uid = this.randomId();
      fs.writeFileSync(process.env.OUTPUT_PATH + uid + '.png', image);

      return res.send(uid);
    });

    this._server = http.createServer(this._express);

    this._server.listen(process.env.API_PORT, () =>
    {
      console.log(`Listening on Port ${process.env.API_PORT}`);
    });
  }

  private getLines(ctx: any, text: string, maxWidth: number): string[]
  {
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

  private randomId(): string
  {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < 50; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
}

try {
  const _ = new App();
}
catch(err)
{
  console.error(err.message || err);
}