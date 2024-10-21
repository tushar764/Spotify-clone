
let currentSong = new Audio();
let songs = [];
let currFolder;
function secondsTominuteSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    // Ensure that minutes and seconds are always two digits (e.g., "00", "01", etc.)
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getsongs(folder) {
    try {
        currFolder = folder;
        let a = await fetch(`http://127.0.0.1:5500/${folder}/`);

        let response = await a.text();
        let div = document.createElement("div");
        div.innerHTML = response;

        // extract anchor tags
        let as = div.getElementsByTagName("a")
        songs = []



        for (let index = 0; index < as.length; index++) {
            const element = as[index];
            if (element.href.endsWith(".mp3")) {
                songs.push(decodeURIComponent(element.href.split(`/${folder}/`)[1]));
                // Use decodeURIComponent to handle spaces and special characters
            }
        }

        updateSongList();

        // return songs;
    } catch (error) {
        console.error("error h ba")
    }
}

function updateSongList() {

    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li><img class="invert"  src="/img/music.svg" alt=""> 
<div class="info">
  <div> ${song.replaceAll("%20", "")}</div>
  <div>'Tushar'</div>


</div>
<div class="playnow">
  <span>play Now</span>
  <img class="invert" src="/img/play.svg" alt="">
</div>

</li>`;

    }

    // Attach a event listener to each song

    Array.from(songUL.getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })

return songs;
}



const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "/img/pause.svg"
    }

    document.querySelector(".songinfo").innerHTML = track;

    document.querySelector(".songtime").innerHTML = "00:00/ 00:00"
}


//Display albums
async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:5500/songs/`);

    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardcontainer = document.querySelector(".cardcontainer")
    let array = Array.from(anchors);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        console.log(`Processing anchor: ${e.href}`);

        if (e.href.includes("/songs")) {
            let folder = (e.href.split("/").slice(-2)[1]);

            try {
                // Fetch metadata
                let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);

                // Debug the response before parsing
                console.log(`Fetched info.json for folder ${folder}:`, a);

                let response = await a.json();
                console.log(`Parsed info.json:`, response);

                // Append to card container
                cardcontainer.innerHTML += `
                <div data-folder="${folder}" class="card">
                    <div class="play">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#000000" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" />
                            <path d="M9.5 11.1998V12.8002C9.5 14.3195 9.5 15.0791 9.95576 15.3862C10.4115 15.6932 11.0348 15.3535 12.2815 14.6741L13.7497 13.8738C15.2499 13.0562 16 12.6474 16 12C16 11.3526 15.2499 10.9438 13.7497 10.1262L12.2815 9.32594C11.0348 8.6465 10.4115 8.30678 9.95576 8.61382C9.5 8.92086 9.5 9.6805 9.5 11.1998Z" fill="currentColor"/>
                        </svg>
                    </div>
                    <img src="/songs/${folder}/cover.jpg" alt="">
                    <h2>${response.title}</h2>
                    <p>${response.description}</p>
                </div>`;
            } catch (error) {
                console.error(`Error fetching info.json for folder ${folder}:`, error);
            }
        }
    }

    // Load the playlist when card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            console.log("Card clicked: ", item.target.dataset);
            await getsongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0])
        });
    });
}


async function main() {

    await getsongs("songs/ncs")
    playMusic(songs[0], true)

    // Display all the albums on the page
    displayAlbums()

    // attach an event listener to play and music

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "/img/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "/img/play.svg"
        }
    })

    // listen update time event

    currentSong.addEventListener("timeupdate", () => {
        console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songtime").innerHTML = `
     ${secondsTominuteSeconds(currentSong.currentTime)}
     /${secondsTominuteSeconds(currentSong.duration)}`;


        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";

    })

    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    // Add an event listener for hamburger

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })
    // Add an event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })


    // Add an event listener to previous
    previous.addEventListener("click", () => {
        currentSong.pause();
        // console.log("Previous clicked");

        let currentSongName = decodeURIComponent(currentSong.src.split("/").slice(-1)[0]).trim();
        let index = songs.indexOf(currentSongName);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);
        }
    });
    // Add an event listener to next
    next.addEventListener("click", () => {
        currentSong.pause()
        // console.log("Next clicked")

        let currentSongName = decodeURIComponent(currentSong.src.split("/").slice(-1)[0]).trim();
        let index = songs.indexOf(currentSongName);

        // let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })




    
    // ad an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
        console.log("setting volume to", e.target.value, "/100")
        currentSong.volume = parseInt(e.target.value)/100
    })


    //  Add an event listener to mute

document.querySelector(".volume>img").addEventListener("click",
    e=>{
        console.log(e.target)

        let currentSrc = e.target.src.split("/").pop();

       
    if (currentSrc === "volume.svg"){
            e.target.src= e.target.src.replace("volume.svg","mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value=0;
        }
        else{
            e.target.src=e.target.src.replace("mute.svg","volume.svg")
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value=10;
        }
    }
)




    // var audio = new Audio(songs[5]);
    // // audio.play();
    // audio.addEventListener("loadeddata", () => {
    //     let duration = audio.duration;
    //     console.log(duration)
    //     // The duration variable now holds the duration (in seconds) of the audio clip
    //   });

}
main()