const puppeteer = require('puppeteer');

async function getCPCBDataViaBrowser() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  await page.goto("https://airquality.cpcb.gov.in/AQI_India/", {
    waitUntil: "networkidle2",
  });

  // Grab session cookies
  const cookies = await page.cookies();
  const accesstokenCookie = cookies.find((c) => c.name === "accesstoken");

  const token = accesstokenCookie?.value;
  const payload = new URLSearchParams({
    date: new Date().toISOString().split("T")[0],
    state: "",
    city: "",
    station: "",
    parameter: "",
  });

  const response = await page.evaluate(async (payload, token) => {
    const res = await fetch(
      "https://airquality.cpcb.gov.in/aqi_dashboard/aqi_all_Parameters",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          accesstoken: token,
        },
        body: payload,
      }
    );
    return await res.text();
  }, payload.toString(), token);

  await browser.close();
  return response;
}

module.exports = { getCPCBDataViaBrowser };
