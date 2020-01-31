const inquirer = require("inquirer");
const fs = require("fs"),
  convertFactory = require('electron-html-to');
const util = require("util");
const axios = require("axios");

const conversion = convertFactory({
  converterPath: convertFactory.converters.PDF
});

governor();

function promptUser() {
  return inquirer.prompt([
    {
      type: "input",
      name: "username",
      message: "Enter your GitHub Username"
    },
    {
      type: "list",
      name: "color",
      choices: [
        "blue",
        "pink",
        "green",
        "red"
      ]
    },
    {
      type: "list",
      name: "background",
      choices: [
        "blue",
        "pink",
        "green",
        "red"
      ]
    },
  ]);
}

async function governor() {
  try {
    const userAnswers = await promptUser();
    const githubResponse = await githubQuery(userAnswers);
    const starredResponse = await starredQuery(userAnswers);
    const githubProfile = profileMaker(githubResponse, starredResponse);
    const documentString = generateDocument(userAnswers, githubProfile);
    writeDocumentFile(documentString);
    pdfConversion(documentString);
  } catch (err) {
    console.log(err);
  }
};

const pdfConversion = (htmlString) => {
  conversion({ html: htmlString }, function(err, result) {
    if (err) {
      return console.error(err);
    }
    result.stream.pipe(fs.createWriteStream('profile.pdf'));
    conversion.kill();
  });
}

async function githubQuery(userAnswers) {
  const { username } = userAnswers;
  const queryUrl = `https://api.github.com/users/${username}`;
  return await axios
    .get(queryUrl)
    .then(response => {
      return response;
    });
}

async function starredQuery(userAnswers) {
  const { username } = userAnswers;
  const starredUrl = `https://api.github.com/users/${username}/starred`;
  return await axios
    .get(starredUrl)
    .then(response => {
      return response;
    });
}


const profileMaker = (githubResponse, starredResponse) => {
  const data = githubResponse.data;
  const starred = starredResponse.data;
  const profile = new Profile(
    data.name,
    data.login,
    data.avatar_url,
    data.bio,
    data.location,
    data.public_repos,
    data.followers,
    data.following,
    starred.length
  );
  return profile;
}

function Profile(name, username, picURL, bio, location, numRepos, numFollowers, numFollowing, numStars) {
  this.name = name,
    this.username = username,
    this.picURL = picURL,
    this.bio = bio,
    this.location = location,
    this.numRepos = numRepos,
    this.numFollowers = numFollowers,
    this.numFollowing = numFollowing;
  this.numStars = numStars;
}


const writeDocumentFile = (text) => {
  fs.writeFile('index.html', text, (err, data) => {
    if (err) {
      console.log(err);
    }
    console.log('success');
  })
}

const generateDocument = (userAnswers, githubProfile) => {
  return `
  <!DOCTYPE html>
<html lang="en">
   <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta http-equiv="X-UA-Compatible" content="ie=edge" />
      <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.8.1/css/all.css"/>
      <link href="https://fonts.googleapis.com/css?family=BioRhyme|Cabin&display=swap" rel="stylesheet">
      <title>Document</title>
      <style>
          @page {
            margin: 0;
          }
         *,
         *::after,
         *::before {
         box-sizing: border-box;
         }
         html, body {
         padding: 0;
         margin: 0;
         }
         html, body, .wrapper {
         height: 100%;
         }
         .wrapper {
         background-color: ${colors[userAnswers.color].wrapperBackground};
         padding-top: 100px;
         }
         body {
         background-color: white;
         -webkit-print-color-adjust: exact !important;
         font-family: 'Cabin', sans-serif;
         }
         main {
         background-color: #E9EDEE;
         height: auto;
         padding-top: 30px;
         }
         h1, h2, h3, h4, h5, h6, p {
         font-family: 'BioRhyme', serif;
         margin: 0;
         text-align: center;
         }
         h1 {
         font-size: 3em;
         }
         h2 {
         font-size: 2.5em;
         }
         h3 {
         font-size: 2em;
         }
         h4 {
         font-size: 1.5em;
         }
         h5 {
         font-size: 1.3em;
         }
         h6 {
         font-size: 1.2em;
         }
         .photo-header {
         position: relative;
         margin: 0 auto;
         margin-bottom: -50px;
         display: flex;
         justify-content: center;
         flex-wrap: wrap;
         background-color: ${colors[userAnswers.color].headerBackground};
         color: ${colors[userAnswers.color].headerColor};
         padding: 10px;
         width: 95%;
         border-radius: 6px;
         }
         .photo-header img {
         width: 250px;
         height: 250px;
         border-radius: 50%;
         object-fit: cover;
         margin-top: -75px;
         border: 6px solid ${colors[userAnswers.color].photoBorderColor};
         box-shadow: rgba(0, 0, 0, 0.3) 4px 1px 20px 4px;
         }
         .photo-header h1, .photo-header h2 {
         width: 100%;
         text-align: center;
         }
         .photo-header h1 {
         margin-top: 10px;
         }
         .links-nav {
         width: 100%;
         text-align: center;
         padding: 20px 0;
         font-size: 1.1em;
         }
         .nav-link {
         display: inline-block;
         margin: 5px 10px;
         }
         .workExp-date {
         font-style: italic;
         font-size: .7em;
         text-align: right;
         margin-top: 10px;
         }
         .container {
         padding: 50px;
         padding-left: 100px;
         padding-right: 100px;
         }

         .background {
          background-color: ${colors[userAnswers.background].headerBackground};
          color: ${colors[userAnswers.background].headerColor};
         }

         .row {
           display: flex;
           flex-wrap: wrap;
           justify-content: space-between;
           margin-top: 20px;
           margin-bottom: 20px;
         }

         .card {
           padding: 20px;
           border-radius: 6px;
           background-color: ${colors[userAnswers.color].headerBackground};
           color: ${colors[userAnswers.color].headerColor};
           margin: 20px;
         }
         
         .col {
         flex: 1;
         text-align: center;
         }

         a, a:hover {
         text-decoration: none;
         color: inherit;
         font-weight: bold;
         }

         @media print { 
          body { 
            zoom: .75; 
          } 
         }
      </style>
    <title>${githubProfile.name}'s Developer Profile</title>
  </head>
  
  <body>
    <div class="container background">
  

    
      <div class="row">
        <div class="card">
          <div class="card-body text-center">
          <img src=${githubProfile.picURL} alt="profile pic">
            <h1 class="display-4">Hi! My name is ${githubProfile.name}</h1>
            <p>
            <a href="https://www.google.com/maps?q=${githubProfile.location}"><i class="fas fa-location-arrow"></i> ${githubProfile.location}</a>
             <a href="https://www.github.com/${userAnswers.username}"><i class="fab fa-github-square"></i> My GitHub</a>
            </p>
          </div>
        </div>
  
      </div>
      </div>
  
  <div class="container">
        <div class="row text-center">
          <h6 class="lead">${githubProfile.bio}.</h6>
        </div>
        <div class="row">
  
          <div class="col-md-1"></div>
          <div class="col-md-5">
            <div class="card">
              <div class="card-body">
                <h6>Public Repositories</h6>
                <p>${githubProfile.numRepos}</p>
              </div>
            </div>
          </div>
          <div class="col-md-5">
            <div class="card">
              <div class="card-body">
                <h6>Stars</h6>
                <p>${githubProfile.numStars}</p>
              </div>
            </div>
          </div>
          <div class="col-md-1"></div>
  
        </div>

        <div class="row">
  
          <div class="col-md-1"></div>
  
          <div class="col-md-5">
            <div class="card">
              <div class="card-body">
                <h6>Followers</h6>
                <p>${githubProfile.numFollowers}</p>
              </div>
            </div>
          </div>
  
          <div class="col-md-5">
            <div class="card">
              <div class="card-body">
                <h6>Following</h6>
                <p>${githubProfile.numFollowing}</p>
              </div>
            </div>
          </div>
          <div class="col-md-1"></div>
  
        </div>
  
        <div class="container background>
        <div class="row">
        <div class="card">
        <div class="card-body">
        </div>
        </div>
        </div>
        </div>
  
  
  </body>
  
  </html>`;
}

const colors = {
  green: {
    wrapperBackground: "#E6E1C3",
    headerBackground: "#C1C72C",
    headerColor: "black",
    photoBorderColor: "#black"
  },
  blue: {
    wrapperBackground: "#5F64D3",
    headerBackground: "#26175A",
    headerColor: "white",
    photoBorderColor: "#73448C"
  },
  pink: {
    wrapperBackground: "#879CDF",
    headerBackground: "#FF8374",
    headerColor: "white",
    photoBorderColor: "#FEE24C"
  },
  red: {
    wrapperBackground: "#DE9967",
    headerBackground: "#870603",
    headerColor: "white",
    photoBorderColor: "white"
  }
};

