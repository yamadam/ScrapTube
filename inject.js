function videoInfo(){
    const player = document.getElementById('movie_player');

    // TODO: fill in required data
    return {
        url: player.getVideoUrl(),
        duration: player.getDuration(),
        time: player.getCurrentTime()
    };   
}

// TODO: message is looping! receiving self messages ?
window.addEventListener("message", (e) => {
    if(e.data.from == "content.js"){
        console.log("message received at inject.js from content.js");
        const info = videoInfo();
        e.source.postMessage({ from: "inject.js", info }, e.origin);
    }
})