const puppeteer = require("puppeteer");
process.env.TZ = 'Europe/Rome';
function waitUntil(targetHour, targetMinute, targetSecond) {
    return new Promise((resolve) => {
        const interval = setInterval(() => {
            const now = new Date();
            // console.log(now)
            // console.log(
            //     now.getHours(),
            //     now.getMinutes(),
            //     now.getSeconds()
            // )
            if (now.getHours() === targetHour && 
                now.getMinutes() === targetMinute &&
                now.getSeconds() >= targetSecond
            ) {
                clearInterval(interval);
                resolve();
            }
        },500); // every 500 milliseconds
    });
}

async function check_if_available(page) {
    const availability = await page.evaluate(() => {
        return document.body.innerText.includes("Unavailable");
        }
    );
    return !availability;
}

async function navigate(page, wait_for_rome=false) {
    
    try {
        await page.goto("https://prenotami.esteri.it/Home", {waitUntil: "networkidle2"});
        await page.type("input[id=login-email]",process.env.email);
        await page.type("input[id=login-password]",process.env.password);
        await page.click('button[type="submit"]');
        await page.waitForSelector('a[href="/Services"]');
        if (!check_if_available(page)) {
            throw new Error('Page unavailable');
        }
        await page.click('a[href="/Services"]');
        await page.waitForSelector('a[href="/Services/Booking/5256"]');
        if (!check_if_available(page)) {
            throw new Error('Page unavailable');
        }
        if (wait_for_rome){
            await waitUntil(0,0,1);
        }
        await page.click('a[href="/Services/Booking/5256"]');
        await page.waitForNavigation();
    } catch (error){
        console.log("Error occured:",error);
        navigate(page, wait_for_rome);
    }
}

(async () => {
    await waitUntil(22,45,0);
    const browser = await puppeteer.launch({headless: false, args: [`--window-size=1366,720`], defaultViewport: { width:1366, height: 720} });
    const page = await browser.newPage();
    const now = new Date();
    console.log(now);
    navigate(page,wait_for_rome=false);
})();