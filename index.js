// set up express server 
const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');
const Jimp = require('jimp/dist');
const MIME_PNG = 'image/png';
const fs = require('fs');
// set up body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// set up base route 

// set up route which will accept inscription ID string and return content 
app.get('/:inscriptionId', async(req, res) => {

    const baseUrl = `https://ord.zuexeuz.net`;
    const {inscriptionId} = req.params;

    const localImageBuffer = await fs.promises.readFile(
        __dirname + '/assets/og_template.png',
    );

    const url = baseUrl + '/preview/' + inscriptionId;
    console.log(url);
    const width = 400;
    const height = 400;

    const browser = await puppeteer.launch({
        args: [`--window-size=${width},${height}`, '--no-sandbox'],
        defaultViewport: {
          width,
          height,
        },
      });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });
    const screenshotBuffer = await page.screenshot({
    omitBackground: true,
    });
    await browser.close();
    const onlineImage = await Jimp.read(screenshotBuffer);
    const localImage = await Jimp.read(localImageBuffer);

    if (onlineImage.getWidth() < 400 || onlineImage.getHeight() < 400) {
    onlineImage.resize(450, 450, Jimp.RESIZE_INSIDE);

    onlineImage.pixelate(8);
    }

    localImage.composite(
    onlineImage,
    (localImage.getWidth() - onlineImage.getWidth()) / 2,
    (localImage.getHeight() - onlineImage.getHeight()) / 2 - 10,
    );

    const combinedImageBuffer = await localImage.getBufferAsync(MIME_PNG);
    res.set('Content-Type', 'image/png');
    res.send(combinedImageBuffer);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));