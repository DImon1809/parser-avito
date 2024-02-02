const puppeteer = require("puppeteer");
const ruToLat = require("./ruToLat");
const readLine = require("readline");
const { stdin: input, stdout: output } = require("process");

const rl = readLine.createInterface({ input, output });
let count = 0;
let result = [];

const parser = async (data) => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      defaultViewport: null,
    });

    const page = await browser.newPage();

    let _res = [];

    await (async () => {
      await page.goto(
        `https://www.avito.ru/${data[0]}?p=1&q=${data.at(
          -1
        )}&s=1&searchRadius=75`
      );

      await page.waitForSelector("[data-marker='item-title']");

      let _arr = await page.evaluate(() => {
        return Array.from(
          document.querySelectorAll("[data-marker='item-title']"),
          (_elem) => _elem.href
        );
      });

      _res = [
        _arr?.[0] || 0,
        _arr?.[1] || 0,
        _arr?.[2] || 0,
        _arr?.[3] || 0,
        _arr?.[4] || 0,
        _arr?.[5] || 0,
      ].filter((_elem) => _elem !== 0);

      await browser.close();
    })();

    return _res;
  } catch (err) {
    console.log(err);

    browser.close();
  }
};

const sendDataInParser = (result) => {
  const data = [
    ruToLat(result[0]),
    result
      .at(-1)
      .toLowerCase()
      .replace(/[-\+()\*,:^!\s]/gi, ''),
  ];

  return parser(data)
    .then((res) =>
      res.length ? console.log(res) : console.log("Не удалось ничего найти!")
    )
    .catch((err) => console.error(err));
};

const scrapperDataFromConsole = (str = "Please, input your state... ") => {
  rl.question(str, (data) => {
    result.push(data.trim());
    ++count;

    switch (count) {
      case 0:
        scrapperDataFromConsole();
        break;
      case 1:
        scrapperDataFromConsole("Please, input name of product... ");
        break;

      default:
        sendDataInParser(result);
        rl.close();
        break;
    }
  });
};

scrapperDataFromConsole();
