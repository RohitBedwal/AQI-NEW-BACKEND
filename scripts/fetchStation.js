const puppeteer = require("puppeteer");

async function fetchCPCBStations() {
  const browser = await puppeteer.launch({ headless: "new" }); // or false if you want to debug
  const page = await browser.newPage();

  // Go to the AQI dashboard homepage where cookies + tokens are initialized
  await page.goto("https://airquality.cpcb.gov.in/AQI_India/", {
    waitUntil: "networkidle2",
  });

  // Wait for some JS on the page to set cookies or tokens if needed
  await new Promise((r) => setTimeout(r, 2000));


  const data = await page.evaluate(async () => {
    const res = await fetch("/aqi_dashboard/aqi_station_all_india", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "data=",
    });

    return await res.text(); // Or res.json() if it's JSON
  });

  await browser.close();
  return data;
}

fetchCPCBStations()
  .then((data) => {
    console.log("✅ Data fetched:\n");
    console.log(data.slice(0, 500)); // preview
  })
  .catch((err) => {
    console.error("❌ Fetch failed:", err.message);
  });
