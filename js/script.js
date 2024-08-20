let songs;
let currFolder;
async function getsongs(folder) {
    currFolder = folder
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith("wav")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    //add all the songs in the playlist 
    let songUL = document.querySelector(".songs-list").getElementsByTagName("ul")[0]
    songUL.innerHTML=""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
                        <img class="invert" src="img/music.svg" alt="music">
                        <div class="info">
                        <div>${song.replaceAll("%20", " ")}</div>
                        <div>MishrAyush</div>
                    </div>
                    <div class="play-now">
                        <span>play</span>
                        <img class="invert" src="img/play.svg" alt="">
                    </div>
                    </li>`
    }
    //attach an event listener to each song
    Array.from(document.querySelector(".songs-list").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim(), false)

        })
    })
    
    return songs

}


let currentSong = new Audio()
function convertToMinutesSeconds(totalSeconds) {
    if (isNaN(totalSeconds) || totalSeconds < 0) {
        return "00:00"
    }
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);

    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;

    return `${formattedMinutes}:${formattedSeconds}`;
}
playMusic = (track, pause = "false") => {
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "img/pause.svg"
        console.log('playing');

    }
    document.querySelector(".song-info").innerHTML = decodeURI(track)
    document.querySelector(".song-time").innerHTML = "00:00 / 00:00"

}

async function displayAlbums (){
    let a = await fetch(`http://127.0.0.1:3000/songs/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response
    let anchors = div.getElementsByTagName("a")
    array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
      if (e.href.includes("/songs")) {
        let folder = (e.href.split("/").slice(-2)[0])
        //get the meta data of the folder
        let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`)
        let response = await a.json()
        console.log(response)
        document.querySelector('.card-container').innerHTML = document.querySelector('.card-container').innerHTML + 
                    `<div data-folder="${folder}" class="card">
                        <div class="play-button">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" color="#000000" fill="none">
                                <defs>
                                    <clipPath id="circle-clip">
                                        <circle cx="12" cy="12" r="10" />
                                    </clipPath>
                                </defs>
                                <rect width="24" height="24" fill="#1ed760" clip-path="url(#circle-clip)" />
                                <path d="M9.5 11.1998V12.8002C9.5 14.3195 9.5 15.0791 9.95576 15.3862C10.4115 15.6932 11.0348 15.3535 12.2815 14.6741L13.7497 13.8738C15.2499 13.0562 16 12.6474 16 12C16 11.3526 15.2499 10.9438 13.7497 10.1262L12.2815 9.32594C11.0348 8.6465 10.4115 8.30678 9.95576 8.61382C9.5 8.92086 9.5 9.6805 9.5 11.1998Z" fill="currentColor" />
                            </svg>
                    </div>   
                    <img src="/songs/${folder}/cover.jpg" alt="">
                    <h3>${response.title}</h3>
                    <p>${response.description}</p>
                    </div>`
                    //load the list whenever card is clicked
                    Array.from(document.getElementsByClassName("card")).forEach((e) => {
                        e.addEventListener("click", async item => {
                            songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`)
                            playMusic(songs[0],false)
                        })
                    });
      }
    }
    
}
async function main() {
    //get list of all the songs
    await getsongs("songs/music")
    playMusic(songs[0], true)

    //display the albums
    await displayAlbums()

    // attach an event listener to next previous and play
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            play.src = "img/pause.svg"
            currentSong.play()
        }
        else {
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })
    //adding event listener to previous
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if (index - 1 < 0) {
            index = (songs.length - 1);
            playMusic(songs[songs.length - 1], false)
        }
        else {
            playMusic(songs[index - 1], false)
        }
    })
    //adding event listener to next
    next.addEventListener("click", () => {
        console.log('next is clicked');
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if (index + 1 >= songs.length) {
            index = 0;
            playMusic(songs[0], false)
        }
        else {
            playMusic(songs[index + 1], false)
        }
    })

    currentSong.addEventListener("timeupdate", () => {

        document.querySelector(".song-time").innerHTML = ` ${convertToMinutesSeconds(currentSong.currentTime)} / ${convertToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
    }
    )
    //add eventlistener to seekbar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%"
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })
    //adding event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })
    //adding event listener for close
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })
    
    //add event listener to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("setting volume to ", e.target.value)
        currentSong.volume = parseInt(e.target.value) / 100
    }
    )
    //add event listener to mute the volume
    document.querySelector(".volume > img").addEventListener("click", (e) => {
        console.log(e.target)
        if (e.target.src.includes("img/volume.svg")) {
          e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg");
          currentSong.volume = 0;
          document.querySelector(".range").getElementsByTagName("input")[0].value = 0
        } else {
          e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg");
          currentSong.volume = 0.10;
          document.querySelector(".range").getElementsByTagName("input")[0].value = 10
        }
      })
}

main()
