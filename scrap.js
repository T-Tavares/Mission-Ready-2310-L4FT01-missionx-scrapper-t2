const puppeteer = require('puppeteer');
const fs = require('fs');
const scrappedSteps = require('./scrappedSteps.js');
// const db = require('./formated_json/data.json');

// ------------------------- LOGIN CHECK -------------------------- //

async function loginIfNotLogged(page) {
    const loginCheck = await page.$('#wpadminbar');

    if (!loginCheck) {
        const projectPage = await page.url();
        await page.goto('https://levelupworks.com.wonderbean.a2hosted.com/levels/index.php/log-in/');

        await page.waitForSelector('#rc_login_form');

        await page.type('#rc_user_login', 'terry');
        await page.type('#rc_user_pass', 'terry1234');
        await page.click('#rc_login_submit');

        await page.waitForSelector('.not-found');
        await page.goto(projectPage);
    }
}

// ------------------------ GET FUNCTIONS ------------------------- //

async function getProjectTitle(page) {
    const pageTitle = await page.$eval('.entry-title', el => el.textContent.match(/(?<= – ).*/)[0]);
    return pageTitle;
}

async function getVideoLink(page) {
    // Could not scrape video links.. probably some block from vimeo or wordpress iframe.
    // left  function here for future reference.

    await page.waitForNavigation();
    const videoLink = await page.$eval('.wp-block-embed-vimeo', el => el.textContent);
    console.log(videoLink);
}

function getArrayRandomItem(arr) {
    // HELPER FUNCTION
    return arr[Math.floor(Math.random() * arr.length)];
}

function getCourseLevel() {
    const courseLevelOptions = ['Beginner', 'Intermediate', 'Advanced'];
    return getArrayRandomItem(courseLevelOptions);
}

function setActivityType() {
    const activityTypeOptions = ['Animation', 'Game', 'Chatbot', 'Augmented Reality'];
    return getArrayRandomItem(activityTypeOptions);
}

function getSubscription() {
    const subscriptionOptions = ['Free', 'Premium'];
    return getArrayRandomItem(subscriptionOptions);
}

function getSubjectMatter() {
    const subjectMatterOptions = ['Computer Science', 'Maths', 'Science', 'Language', 'Art', 'Music'];
    return getArrayRandomItem(subjectMatterOptions);
}

function getYearLevel() {
    return Math.floor(Math.random() * 12) + 1;
}

async function getPageTitle(page) {
    const pageTitleRaw = await page.title();
    const pageTitleFormated = pageTitleRaw
        .toLowerCase()
        .replaceAll(' ', '-')
        .replace('-–-levelup-works', '')
        .replace(/.*?-–-/g, '')
        .replace('?', '');
    return pageTitleFormated;
}

// ---------------------- GET HTML FUNCTIONS ---------------------- //

async function getInstructionsHTML(page) {
    const instructionsHTML = await page.evaluate(() => {
        // Tags to be scrapped
        const checkElList = ['H2', 'P', 'UL', 'FIGURE'];

        const instructionsBlockChildrenEls = Array.from(document.querySelector('.entry-content').children);
        const instructionsEls = instructionsBlockChildrenEls
            .map(el => {
                const tagName = el.nodeName;

                // Guard Clause
                if (!checkElList.includes(tagName)) return;

                // UL Lists Elements Logic
                if (tagName === 'UL') {
                    return `<ul>${el.innerHTML}</ul>`;
                }

                // IMG Elements Logic
                if (tagName === 'FIGURE') {
                    if (el.children[0].nodeName !== 'IMG') return; // Guard clause because some figure tags have videos
                    const imgName = el.children[0].src.match(/\/([^\/?]+)\?/)[1];
                    const pageTitle = document.title
                        .toLowerCase()
                        .replaceAll(' ', '-')
                        .replace('-–-levelup-works', '')
                        .replace(/.*?-–-/g, '')
                        .replace('?', '');
                    return `<img src="/images/projects_/${pageTitle}/${imgName}" alt="${imgName}}">`;
                }

                // Other Elements Logic
                const tag = tagName.toLowerCase();
                const content = el.textContent;
                return `<${tag}>${content}</${tag}>`;
            })
            .filter(el => el != null);
        // const projectInstructionsHTML = InstructionsEls.join('\n'); // for visualization
        const projectInstructionsHTML = instructionsEls.join('');
        return projectInstructionsHTML;
    });
    return `<div className={styles.instructionsWrapper}>${instructionsHTML}<div>`;
}

async function getLearningObjectivesHTML(page, pageTitle) {
    const projectPicEval = await page.$eval('.post-thumbnail img', el => el.src);
    const pictureName = '0-main-project-pic--' + projectPicEval.match(/\/([^/]+)\?/)[1];
    const projectFolderName = await getPageTitle(page);

    const learningObjectivesRaw = await page.$eval('.wp-block-quote', el =>
        el.textContent.replace('Learning Objectives: ', '')
    );

    const learningObjectives = learningObjectivesRaw.split(', ').map(entry => entry[0].toUpperCase() + entry.slice(1));
    const projectTitle = pageTitle[0].toUpperCase() + pageTitle.slice(1);

    const liElements = learningObjectives.map(entry => `<li>${entry}</li>`).join('');
    const html = `<div className={styles.learningObjectivesWrapper}><h1>${projectTitle}</h1><img src="/images/projects_/${projectFolderName}/${pictureName}" alt="" /><h3>The Learning Objectives of ${projectTitle}</h3><ul>${liElements}</ul></div>`;

    /* FORMATED HTML      
    const html = `
    <div className={styles.learningObjectivesWrapper}>
        <h1>${projectTitle}</h1>
        <img src="" alt="" />
        <h3>The Learning Objectives of ${projectTitle}</h3>
        <ul>
            ${learningObjectives.map(entry => `<li>${entry}</li>`).join('')}
        </ul>    
    </div>
    `; */

    return html;
}

// ----------------------- DOWNLOAD IMAGES ------------------------ //

/**
 *
 * @param {*} page Puppeteer Page element of the project page
 * @returns string with path for main project image
 */
async function downloadImages(page) {
    // --------------------- SET UP FOR DOWNLOAD ---------------------- //
    // ------------ GET ALL THE NAMES FOR FILES AND FOLDER ------------ //

    // ---------------------------------------------------------------- //

    // ------ GET ARTICLE PAGE TITLE AND CONVERT TO FOLDER NAME ------- //
    //
    const pageTitle = await page.title();
    const articleFolderName = pageTitle
        .toLowerCase()
        .replaceAll(' ', '-')
        .replace('-–-levelup-works', '')
        .replace(/.*?-–-/g, '')
        .replace('?', '');

    //
    // ----- CHECK IF FOLDER STRUCTURE EXISTS AND CREATE  IF NOT ----- //
    // TODO - Build Logic to sort structure of folders before download images.

    // if (!fs.existsSync(`../mission-x-frontend/public/images/projects_`)) {
    //     fs.mkdir(`../mission-x-frontend/public/images/projects_`, err => {
    //         if (err) console.error(err);
    //         else console.log(`${articleFolderName} folder created.`);
    //     });
    // }

    //
    // --------- CHECK IF FOLDER EXISTS AND CREATE ONE IF NOT --------- //
    //

    if (!fs.existsSync(`../mission-x-frontend/public/images/projects_/${articleFolderName}`)) {
        fs.mkdir(`../mission-x-frontend/public/images/projects_/${articleFolderName}`, err => {
            if (err) console.error(err);
            else console.log(`${articleFolderName} folder created.`);
        });
    }
    // ---------------------------------------------------------------- //

    // ---------------------- GET IMAGES SOURCES ---------------------- //

    const imagesLinks = await page.evaluate(() => {
        const imagesElements = [...document.querySelectorAll('.entry-content img')];
        const imagesSources = imagesElements.map(imgEl => imgEl.src.match(/^(.*?)\?/)[1]);
        return imagesSources;
    });

    // ----------------------- DOWNLOAD IMAGES ------------------------ //

    // TODO - Download images could be refactored to a simpler and more abstract function

    const currProjectURL = await page.url();

    for (link of await imagesLinks) {
        try {
            const imageName = link.match(/[^/]+$/)[0];
            const imageViewSource = await page.goto(link);
            const buffer = await imageViewSource.buffer();

            fs.writeFile(
                `../mission-x-frontend/public/images/projects_/${articleFolderName}/${imageName}`,
                buffer,
                err => {
                    if (err) return console.error(`Error writting image file:\n ${err}`);
                    return console.log(`${articleFolderName}/${imageName} Image Dowloaded`);
                }
            );
        } catch (err) {
            console.error(`Error download images from ${link}\n`, err);
        }
    }
    await page.goto(currProjectURL); // HAVE TO GO BACK TO IT TO KEEP THE FLOW OF THE SCRAPPING

    // ---------------------------------------------------------------- //

    // ----------------- DOWNLOAD PROJECT MAIN IMAGE ------------------ //

    const projectPicEval = await page.$eval('.post-thumbnail img', el => el.src);
    const projectPicLink = projectPicEval.match(/^([^?]+)/)[1];
    const pictureName = '0-main-project-pic--' + projectPicEval.match(/\/([^/]+)\?/)[1];

    const pictureViewSource = await page.goto(projectPicLink);
    const buffer = await pictureViewSource.buffer();

    fs.writeFile(`../mission-x-frontend/public/images/projects_/${articleFolderName}/${pictureName}`, buffer, err => {
        if (err) return console.error(`Error writting image file:\n ${err}`);
        return console.log(`MAIN PROJECT PICTURE => ${articleFolderName}/${pictureName} Image Dowloaded`);
    });

    await page.goto(currProjectURL); // HAVE TO GO BACK TO IT TO KEEP THE FLOW OF THE SCRAPPING
    return `/images/projects_/${articleFolderName}/${pictureName}`;
}

// ---------------------------------------------------------------- //
// ------------------------ SCRAPER INIT() ------------------------ //
// ---------------------------------------------------------------- //

async function scraperInit(urlsArr) {
    const browser = await puppeteer.launch({headless: 'new'});
    const page = await browser.newPage();

    const scrappedObjs = {data: [], badRequests: []};
    for (url of urlsArr) {
        try {
            await page.goto(url);
            await loginIfNotLogged(page);

            // Check for article health and if empty skipps to the next one
            const checkArticleHealthEl = await page.$('.wp-block-quote');

            // ERROR HANDLING
            if (!checkArticleHealthEl) {
                console.log('Bad Article Request:', url);
                scrappedObjs.badRequests.push(url); // get list of bad articles for status
                continue;
            }

            scrappedObjs.data.push({
                project_id: null,
                name_of_project: await getProjectTitle(page),
                project_pic: await downloadImages(page),
                learning_objective: await getLearningObjectivesHTML(page, await getProjectTitle(page)),
                instructions: await getInstructionsHTML(page),
                video: null,
                activity_type: setActivityType(),
                year_level: getYearLevel(),
                course: getCourseLevel(),
                subscription: getSubscription(),
                subject_matter: getSubjectMatter(),
            });
        } catch (err) {
            console.error(`Error on URL ${url}`, err);
        }
    }

    const jsonData = JSON.stringify(scrappedObjs);

    fs.writeFile('formated_json/data.json', jsonData, 'utf8', (err, data) => {
        if (err) return console.error('Faile to create scrapped data json file.\n', err);
        console.log('Scrap done!');
    });

    // REPORT
    console.log(`---- SCRAP REPORT ----\n
    Bad Article Requests: ${scrappedObjs.badRequests.length}\n
    Healthy Article Requests: ${scrappedObjs.data.length}
    `);

    await browser.close();
}

scraperInit(scrappedSteps); // uncomment this will rerun the scrapper

// console.log(`---- SCRAP REPORT ----\n
// Bad Article Requests: ${db.badRequests.length}\n
// Healthy Article Requests: ${db.data.length}
// `);
