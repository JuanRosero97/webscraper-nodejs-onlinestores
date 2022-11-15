const { chromium } = require("playwright");

const returnObject = (vendor, price, features, descript) => {
  return {
    vendor,
    price,
    features,
    description: descript,
  };
};

const shops = [
  {
    vendor: "Vistronica",
    reSearch: (item) => {
      return encodeURIComponent(item);
    },
    url: (item) => {
      return `https://www.vistronica.com/#q=${item}&from_user=&page=0&refinements=%5B%5D&numerics_refinements=%7B%7D&index_name=%22prestashop1763_all_es%22`;
    },
    searchInPage: async (page, vendor) => {
      const selector =
        "#js-product-list > div > article:nth-child(1) > div > div.thumbnail-wrapper > a";
      await page.waitForSelector(selector, { timeout: 10000 });
      await page.click(selector);
      await page.waitForSelector("#description", { timeout: 10000 });

      const description = await page.innerText(
        "#description > div > p:nth-child(2)"
      );

      const features = await page.$$eval(
        "#description > div > table > tbody > tr",
        (features) => {
          return features.map((feature, index) => {
            const name = feature.querySelector(
              `#description > div > table > tbody > tr:nth-child(${
                index + 1
              }) > td:nth-child(1)`
            );
            const value = feature.querySelector(
              `#description > div > table > tbody > tr:nth-child(${
                index + 1
              }) > td:nth-child(2)`
            );
            return {
              name: name.textContent.trim(),
              value: value.textContent.trim(),
            };
          });
        }
      );

      const price = (
        await page.innerText(".product-prices .current-price>.price")
      )
        .split(",")[0]
        .split("$")[1]
        .replace(/\./g, "");

      return returnObject(vendor, price, features, description);
    },
  },
  {
    vendor: "Demoss",
    reSearch: (item) => {
      return item.replace(/ /g, "+");
    },
    url: (item) => {
      return `https://demosspro.com/cb/busqueda?s=${item}`;
    },
    searchInPage: async (page, vendor) => {
      await page.click(
        "#js-product-list > div > div:nth-child(2) > article > div.img_block > a"
      );
      features = {};
      description = "";
      const price = (
        await page.innerText(
          ".product-prices .price, .product-prices .current-price span:first-child"
        )
      )
        .split(",")[0]
        .split("$")[1]
        .replace(/\./g, "");
      return returnObject(vendor, price, features, description);
    },
  },
  {
    vendor: "Dinastia Tecnologica",
    reSearch: (item) => {
      return item.replace(/ /g, "+");
    },
    url: (item) => {
      return `https://dinastiatecnologica.com/?orderby=price&s=${item}&post_type=product`;
    },
    searchInPage: async (page, vendor) => {
      try {
        const selector = "#content > ul";
        await page.waitForSelector(selector, { timeout: 10000 });
        await page.click("#content > ul > li:first-child > a");
        features = {};
        description = "";
        const price = (await page.innerText(".price")).replace(/\./g, "");
        return returnObject(vendor, price, features, description);
      } catch (e) {
        console.log(e);
        return returnObject(vendor, "", "", "");
      }
    },
  },
];

(async () => {
  //const item = "arduino mega 2560 r3";
  const item = "servo sg90";
  let products = [];
  const browser = await chromium.launch({ headless: false });

  for (const shop of shops) {
    const { vendor, reSearch, url, searchInPage } = shop;
    const itemSearch = reSearch(item);
    const pageUrl = url(itemSearch);
    const page = await browser.newPage();
    await page.goto(pageUrl);
    const infoPage = await searchInPage(page, vendor);
    products.push(infoPage);
  }

  const lowerPrice = products.reduce(function (prev, curr) {
    return prev.price < curr.price ? prev : curr;
  });
  console.log(
    "🚀 ~ file: index.js ~ line 133 ~ lowerPrice ~ lowerPrice",
    lowerPrice
  );
  console.log("🚀 ~ file: index.js ~ line 128 ~ products", products);
  await browser.close();
})();
