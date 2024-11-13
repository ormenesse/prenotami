const puppeteer = require("puppeteer");
const pptr = require('puppeteer-core');

process.env.TZ = 'Europe/Rome';

function waitUntil(targetHour, targetMinute, targetSecond) {
    return new Promise((resolve) => {
        const interval = setInterval(() => {
            const now = new Date();
            if (now.getHours() >= targetHour && 
                now.getMinutes() >= targetMinute &&
                now.getSeconds() >= targetSecond
            ) {
                clearInterval(interval);
                resolve();
            }
        },500); // every 500 milliseconds
    });
}

function delay(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

async function check_if_available(page) {
    const availability = await page.evaluate(() => {
        return document.body.innerText.includes("Unavailable");
        }
    );
    return !availability;
}

async function check_if_worked(page) {
    const worked = await page.evaluate(() => {
        const t = "Sorry, all appointments for this service are currently booked.";
        const e = "ERR_CONNECTION_RESET"
        if (
            document.body.innerText.includes(t) |
            document.body.innerText.includes(e)
        ) {
            return true
        } else {
            return false
        }
    });
    return !worked;
}

async function click_on_reservation(page) { 
    await page.waitForSelector('a[href="/Services/Booking/5256"]');
    if (! await check_if_available(page)) {
        throw new Error('Page unavailable');
    }
    await page.click('a[href="/Services/Booking/5256"]');
    await delay(1000);
    if ( await check_if_worked(page)) {

        console.log("Funcionou nem sei o que fazer agora.");
        return false;
    } else {
        await page.click('button[type="button"]');
        console.log("Clicou no botão de ok...");
        return true;
    }
}

async function navigate(page, wait_for_rome=false, login=true) {
    
    try {
        if (login) {
            await page.goto("https://prenotami.esteri.it/Home", {waitUntil: "networkidle2"});
            await page.type("input[id=login-email]",process.env.email);
            await page.type("input[id=login-password]",process.env.password);
            await delay(5000);
            await page.click('button[type="submit"]');
        } else {
            await page.goto("https://prenotami.esteri.it/Home", {waitUntil: "networkidle2"});
        }
        await page.waitForSelector('a[href="/Services"]');
        if (!check_if_available(page)) {
            throw new Error('Page unavailable');
        }
        await delay(5000);
        await page.click('a[href="/Services"]');
        if (wait_for_rome){
            await waitUntil(23,58,1);
        }
        let worked = true;
        while(worked) {
            console.log("CLICANDO NAS RESERVAS");
            worked = await click_on_reservation(page);
            console.log("RESULTADO:" + worked);
        }
    } catch (error) {
        console.log("Error occured:",error);
        await navigate(page, wait_for_rome, false);
    }
}

// function main

(async () => {
    // await waitUntil(23,45,0);
    // const browser = await pptr.launch(
    //     {
    //         headless: false, 
    //         args: [`--window-size=1366,720`], 
    //         defaultViewport: { width:1366, height: 720},
    //         executablePath: "/usr/bin/google-chrome-stable",
    //         userDataDir: '/home/ormenesse/.config/google-chrome'
    //     }
    // );
    const browser = await puppeteer.launch(
        {
            headless: false,
            defaultViewport: { width:1366, height: 720},
            args: [`--window-size=1366,720`]
        }
    )
    const page = await browser.newPage();
    const now = new Date();
    console.log(now);
    await navigate(page,wait_for_rome=false, login=true);
})();