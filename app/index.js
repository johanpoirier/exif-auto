const electron = require('electron').ipcRenderer;

let picturesList = [];

const displayFiles = function (files) {
  weld(document.querySelector('.file-list'), files);
};

const handleFiles = function () {
  const fileList =[].slice.call(this.files);
  fileList.forEach((file) => picturesList.push(file.path));
  displayFiles(fileList.map((file) => {
    return {
      name: file.name,
      size: file.size,
      type: file.type
    };
  }));
};

const tagFiles = function () {
  electron.send('tag', picturesList, 'Taluyers');
};

document.querySelector('#filesInput').addEventListener('change', handleFiles, true);
document.querySelector('#tagIt').addEventListener('click', tagFiles, true);

electron.on('files', (event, newFiles) => {
  displayFiles(newFiles.map((file) => ({ name: file })));
});
