<!-- #Problem solving

https://www.answeroverflow.com/m/1114467774736121896 -->

# Mission X Scrapper

This Repository is part of the three repos that compose Mission X for team 2 / 2024

You'll need a version of chrome that support headless browsing. It should be all good if your chrome is updated.

[ More info here - Chrome Headless CLI](https://developer.chrome.com/blog/headless-chrome#using_programmatically_node)

---

## Folder structure

```
├── mission-x-backend
├── mission-x-frontend
└── mission-x-scrapper
```

The three main folders MUST be on the same location in order to the scrapper to work.
In addition to that, check for a folder called 'projects\_' inside 'mission-x-frontend'

```
../mission-x-frontend/public/images/project_
```

That is a necessary folder that will get all the projects images.

Last, the database will be saved on a JSON file (or rewriteen) on the 'formated_json' folder'.

MySQL is already updated, but if anything is wrong. There'a a endpoint on the backend to rewrite any changes that might be needed.
For that, after the scrapping is done and no errors are found. you just need to run the backend and type on your browser the end point

On the mission-x-backend

```
npm run dev
```

On your browser open:
[/update-project-db endpoint](http://localhost:4000/update-project-db)

Note: The port has to match your backend (In case you changed it.)

With that out of the way we can go to the fun part. Scrap our database and images and try it out.

---

## Scrapping

On your terminal and on the mission-x-scrapper folder run a npm install and a audit fix to get rid of some vulnerabilities on puppeteer.

```
npm i
npm audit fix --force
```

After all dependecies are good to go, you can either run:

```
npm run scrap
or
node scrap.js
```

Your terminal will log all the images paths as they're downloaded.

And you'll get a report on bad articles that did not get downloaded or pushed to the JSON database file.
Any article with no text or without enough information will be skipped and flagged on the bad articles on the report.

## The Padawans

@T-Tavares @BesteSevinc Damien Raj and Duc
Thiago, Beste, Damien, Raj and Duc.

## Acknowledgements

Big Thanks to @bonne-bonne @phoebesu1025 @JojorioCh @HMoana and Jordan for all the guidance and help.

-   Bonnie and Phoebe were amazing on our everyday learning. Thanks for all the good energies and commitment put on our classes, along with a lot of patiente for our memes and zooning outs.
-   Heni was always pushing our moral up! Thanks a lot for the good vibes!
-   Joseph and Jordan for being almost 24/7 available to pop in a Teams Meeting to help us!
