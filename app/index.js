const electron = require('electron').ipcRenderer;

let picturesList = [];
const locations = JSON.parse(window.localStorage.getItem('locations')) || [];
const progressBar = document.querySelector('.files footer');
const locationInput = document.querySelector('#locationInput');


//******************************* WEB EVENTS HANDLERS *******************************//
const displayFiles = function (files) {
  weld(document.querySelector('.file'), files);
};

const displayLocations = function (locations) {
  weld(document.querySelector('.location'), locations.reverse());
};

const handleFiles = function () {
  picturesList = [].slice.call(this.files);
  displayFiles(picturesList.map((file) => {
    return {
      name: file.name,
      size: file.size,
      type: file.type
    };
  }));
};

const tagFiles = function () {
  addLocation(locationInput.value);
  electron.send('tag', picturesList.map((file) => file.path), locationInput.value);
};

const pickFiles = function () {
  document.querySelector('#filesInput').click();
};

const removeAll = function () {
  picturesList = [];
  displayFiles([{ name: '' }]);
};

const addLocation = function (location) {
  if (!locations.includes(location)) {
    locations.push(location);
    window.localStorage.setItem('locations', JSON.stringify(locations));
    displayLocations(locations);
  }
};

const selectLocation = function (event) {
  if (event.target.classList.contains('location')) {
    locationInput.value = event.target.textContent;
  }
};


//************************************* UI INIT *************************************//
displayLocations(locations);


//*********************************** WEB EVENTS ***********************************//
document.querySelector('#filesInput').addEventListener('change', handleFiles, true);
document.querySelector('#tagIt').addEventListener('click', tagFiles, true);
document.querySelector('#select').addEventListener('click', pickFiles, true);
document.querySelector('#removeAll').addEventListener('click', removeAll, true);
document.querySelector('.locations').addEventListener('click', selectLocation, true);


//********************************* ELECTRON EVENTS *********************************//
electron.on('files', (event, newFiles) => {
  displayFiles(newFiles.map((file) => ({ name: file })));
});

electron.on('tagged', (event, filePath) => {
  const currentPic = picturesList.find((pic) => pic.path === filePath);
  currentPic.done = true;
  progressBar.style.width = `${Math.round(100 * picturesList.filter((pic) => pic.done).length / picturesList.length)}%`;
});
