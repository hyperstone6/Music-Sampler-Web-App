const searchBar = document.querySelector(".search-bar");
const videoContainer = document.querySelector(".video-container");
const volume = document.querySelector(".volume");
const playPause = document.querySelector("#play-pause");
const videoItems = document.querySelectorAll(".video-in-here");
const infoScreen = document.querySelector(".info-screen");
const currentImage = document.querySelector(".current-song-image");
const currentTimeNode = document.querySelector(".current-time");
const durationNode = document.querySelector(".duration");
const progress = document.querySelector(".progress-bar");
const progressTrack = document.querySelector(".progress-bar-track");
const muteButton = document.getElementById("mute-button");
const loopButton = document.getElementById("loop-button");
const previousBtn = document.getElementById("previous");
const nextBtn = document.getElementById("next");

let apiResponse;
let currentSong;
let fetchedVideos;
let isLooping = false;
let selectedSong;
let ranBefore = false;

const options = {
  method: "GET",
  url: "https://shazam.p.rapidapi.com/search",
  params: { term: "", locale: "en-US", offset: "0", limit: "5" },
  headers: {
    "X-RapidAPI-Key": "825f938870mshf8386410f708a42p18f196jsn191778811a19",
    "X-RapidAPI-Host": "shazam.p.rapidapi.com",
  },
};

const mapSongs = (e) => {
  e.preventDefault();
  options.params.term = e.target.children[0].value;
  callApi();
};

const currSongAndImageFn = () => {
  currentSong = selectedSong.children[2];
  currentImage.children[0].src = selectedSong.children[1].src;
};

const playPauseToggleFn = (playStatus) => {
  if (playStatus) {
    playPause.checked = false;
  } else {
    playPause.checked = true;
  }
};

const updateInfoScreenFn = (playStatus) => {
  if (playStatus) {
    infoScreen.innerHTML = "";
    currentImage.children[0].src = "./images/default.jpg";
  } else {
    infoScreen.innerHTML = "";
    let playStatus = document.createElement("span");
    playStatus.classList.add("play-status");
    let songInfo = `
      <span>Now playing:   ${selectedSong.children[0].innerText}</span>
    `;
    playStatus.innerHTML = songInfo;
    infoScreen.appendChild(playStatus);
  }
};

const loopingFn = (playStatus) => {
  loopButton.addEventListener("click", (e) => {
    if (e.target.checked) {
      currentSong.loop = true;
      isLooping = true;
    } else {
      currentSong.loop = false;
      isLooping = false;
    }
  });
};

const playSongs = (selectedSong) => {
  currSongAndImageFn(selectedSong);
  if (currentSong.paused) {
    currentSong.play();
    playPauseToggleFn(currentSong.paused);
  } else {
    currentSong.pause();
    playPauseToggleFn(currentSong.paused);
  }
  updateInfoScreenFn(currentSong.paused, selectedSong);
  loopingFn(currentSong.paused);
};

const initFunctions = () => {
  videoContainer.addEventListener("click", (e) => {
    selectedSong = e.target.closest("div");
    for (let i of fetchedVideos) {
      i.children[2].pause();
    }
    playSongs();
    progressFn();
    progressTrackFn();
    volumeRocker();
    muteAudioFn();

    if (ranBefore) {
      return;
    } else {
      previousBtnFn();
      nextBtnFn();
    }
    ranBefore = true;
    loopButton.checked = false;
    muteButton.checked = false;
  });
};

const previousBtnFn = () => {
  previousBtn.addEventListener("click", () => {
    let currSong = fetchedVideos.indexOf(selectedSong);
    let previousSong = fetchedVideos[currSong - 1];
    selectedSong = previousSong;
    for (let i of fetchedVideos) {
      i.children[2].pause();
    }
    if (selectedSong !== undefined) {
      loopButton.checked = false;
      muteButton.checked = false;
      playSongs();
      progressFn();
      progressTrackFn();
      volumeRocker();
      muteAudioFn();
    } else {
      playPause.checked = false;
    }
  });
};

const nextBtnFn = () => {
  nextBtn.addEventListener("click", () => {
    let currSong = fetchedVideos.indexOf(selectedSong);
    let nextSong = fetchedVideos[currSong + 1];
    selectedSong = nextSong;
    for (let i of fetchedVideos) {
      i.children[2].pause();
    }
    if (selectedSong !== undefined) {
      loopButton.checked = false;
      muteButton.checked = false;
      playSongs();
      progressFn();
      progressTrackFn();
      volumeRocker();
      muteAudioFn();
    } else {
      playPause.checked = false;
    }
  });
};

const fetchItems = () => {
  apiResponse.map((item) => {
    let videoInHere = document.createElement("div");
    videoInHere.classList.add("video-in-here");
    let renderVideo = `
       <p class="song-title">${item.track.share.subject}</p>
       <img src=${item.track.images.coverart} alt="" class="cover-art">
       <video src=${item.track.hub.actions[1].uri} class="video"></video>
       `;
    videoInHere.innerHTML = renderVideo;
    videoContainer.appendChild(videoInHere);
    fetchedVideos = Array.from(videoContainer.children);
    initFunctions(item);
  });
};

const callApi = async () => {
  try {
    const response = await axios.request(options);
    apiResponse = response.data.tracks.hits;
    if (videoContainer.innerHTML !== "") {
      videoContainer.innerHTML = "";
    }
    fetchItems();
  } catch (e) {
    console.error(e)
  }
};

const currentTime = () => {
  let currentMins = Math.floor(currentSong.currentTime / 60);
  let currentSecs = Math.floor(currentSong.currentTime - currentMins * 60);
  let durationMins = Math.floor(currentSong.duration / 60);
  let durationSecs = Math.floor(currentSong.duration - durationMins * 60);

  currentTimeNode.innerHTML = `${currentMins}:${
    currentSecs < 10 ? "0" + currentSecs : currentSecs
  }`;
  durationNode.innerHTML = `${durationMins}:${durationSecs}`;
};

const progressTrackFn = () => {
  progress.addEventListener("click", (e) => {
    const progressTime =
      (e.offsetX / progress.offsetWidth) * currentSong.duration;
    currentSong.currentTime = progressTime;
  });
};

const progressFn = () => {
  currentSong.addEventListener("timeupdate", () => {
    currentTime();
    const percent = (currentSong.currentTime / currentSong.duration) * 100;
    progressTrack.style.width = `${percent}%`;
    if (percent === 100 && isLooping !== true) {
      playPause.checked = false;
    }
  });
};

const volumeRocker = () => {
  volume.addEventListener("mousemove", (e) => {
    currentSong.volume = e.target.value;
  });
};

const muteAudioFn = () => {
  muteButton.addEventListener("click", (e) => {
    if (e.target.checked) {
      currentSong.muted = true;
    } else {
      currentSong.muted = false;
    }
  });
};

searchBar.addEventListener("submit", mapSongs);

playPause.addEventListener("click", (e) => {
  if (currentSong) {
    if (playPause.checked) {
      currentSong.play();
    } else {
      currentSong.pause();
    }
  }
});
