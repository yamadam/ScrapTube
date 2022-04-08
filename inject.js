function videoInfo(player){
    return {
        url: player.getVideoUrl(),
        duration: player.getDuration(),
        time: player.getCurrentTime(),
        caption: document.querySelector(".captions-text").innerText
    };
}

function setOptions(player){
    const captionId = player.getCaptionWindowContainerId();
    if(document.getElementById(captionId).childElementCount == 0){
      player.toggleSubtitles();
    }
    player.setOption("captions", "track", { "languageCode": "en" });
}

window.addEventListener("message", (e) => {
    if(e.data.from == "content.js"){
        const player = document.getElementById('movie_player');

        switch (e.data.type) {
            case "info":
                console.log("message received at inject.js from content.js");
                setOptions(player);
                player.seekTo(player.getCurrentTime() + e.data.sec);
                setTimeout(() => {
                    const info = videoInfo(player);
                    e.source.postMessage({ from: "inject.js", info }, e.origin);
                }, 200);
                break;
            case "play":
                player.playVideo();
                break;
            case "pause":
                player.pauseVideo();
                break;
        }
    }
})