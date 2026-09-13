const startButton = document.querySelector("#start-native-ar");
const log = document.querySelector("#log");

startButton?.addEventListener("click", () => {
  console.log("start native ar spike");
  if (log) {
    log.textContent = "start native ar spike";
  }
});
