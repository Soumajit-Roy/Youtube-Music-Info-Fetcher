const fetchEL = document.getElementById("fetch-btn");
const copyEL = document.getElementById("copy-btn");
const clearEL = document.getElementById("clear-btn");
const dataEl = document.getElementById("data-el");

const fs = require('fs');

const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));


let apiUrl = ''; // Declare apiUrl as a global variable

// Function to get the YouTube video ID from the URL
function getYouTubeVideoID(url) {
  let videoID = null;
  const urlObj = new URL(url);

  // Check if the URL is a YouTube URL
  if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
    if (urlObj.hostname === 'youtu.be') {
      videoID = urlObj.pathname.substring(1); // The video ID is the path in youtu.be URLs
    } else {
      videoID = urlObj.searchParams.get('v'); // The video ID is the 'v' parameter in youtube.com URLs
    }
  }
  return videoID;
}

// Main Fetching Function
function scrapper() {
  if (!apiUrl) {
    dataEl.textContent = 'API URL not set.';
    return;
  }

  fetch(apiUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (data.items && data.items.length > 0) {
        const videoInfo = data.items[0].snippet;
        const description = videoInfo.description;
        dataEl.textContent = `Description: ${description}`;
      } else {
        dataEl.textContent = "Video not found or unable to retrieve description.";
      }
    })
    .catch((error) => {
      dataEl.textContent = `Error fetching the video data: ${error}`;
    });
}

// Function to set up the API URL and run the scrapper
function setupAndFetch() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    const url = tabs[0].url;
    const videoID = getYouTubeVideoID(url);
    if (videoID) {
      const API_KEY = config.API_KEY;
      apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoID}&key=${API_KEY}`;
      console.log('API URL:', apiUrl);
      scrapper(); // Now call scrapper after setting apiUrl
    } else {
      dataEl.textContent = 'Not a YouTube video or no video ID found.';
    }
  });
}

// Button function to run the setup and fetch function
fetchEL.addEventListener("click", setupAndFetch);

// Add functionality to copy and clear buttons if needed
copyEL.addEventListener("click", function() {
  if (dataEl.textContent) {
    navigator.clipboard.writeText(dataEl.textContent).then(() => {
      console.log('Text copied to clipboard');
      alert('Text copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  }
});

clearEL.addEventListener("click", function() {
  dataEl.textContent = '';
});
