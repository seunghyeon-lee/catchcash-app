const statusText = document.querySelector("#status");
const startButton = document.querySelector("#start-ar");
const placeButton = document.querySelector("#place-cube");
const stopButton = document.querySelector("#stop-ar");

function setStatus(message) {
  console.log(message);
  if (statusText) {
    statusText.textContent = message;
  }
}

function getNativeARPlugin() {
  return window.Capacitor?.Plugins?.NativeAR ?? null;
}

function withPlugin(action) {
  const plugin = getNativeARPlugin();
  if (!plugin) {
    setStatus("NativeAR plugin을 찾을 수 없습니다. Mac에서 iOS target 연결 후 다시 확인하세요.");
    return;
  }
  void action(plugin);
}

function addNativeListeners() {
  const plugin = getNativeARPlugin();
  if (!plugin?.addListener) return;

  plugin.addListener("onSessionStarted", () => setStatus("AR session started"));
  plugin.addListener("onSessionStopped", () => setStatus("AR session stopped"));
  plugin.addListener("onAnchorPlaced", (event) => setStatus(`Anchor placed: ${event.objectId ?? "test-cube"}`));
  plugin.addListener("onObjectTap", (event) => setStatus(`Object tapped: ${event.objectId ?? "test-cube"}`));
  plugin.addListener("onSessionError", (event) => setStatus(`AR error: ${event.message ?? "unknown"}`));
  plugin.addListener("onTrackingStateChanged", (event) => {
    setStatus(`Tracking: ${event.state ?? "unknown"}${event.reason ? ` (${event.reason})` : ""}`);
  });
}

startButton?.addEventListener("click", () => {
  withPlugin(async (plugin) => {
    try {
      await plugin.startSession();
      setStatus("startSession() called");
    } catch (error) {
      setStatus(`startSession 실패: ${error?.message ?? error}`);
    }
  });
});

placeButton?.addEventListener("click", () => {
  withPlugin(async (plugin) => {
    try {
      await plugin.placeTestObject({ distanceMeters: 1.5 });
      setStatus("placeTestObject() called");
    } catch (error) {
      setStatus(`placeTestObject 실패: ${error?.message ?? error}`);
    }
  });
});

stopButton?.addEventListener("click", () => {
  withPlugin(async (plugin) => {
    try {
      await plugin.stopSession();
      setStatus("stopSession() called");
    } catch (error) {
      setStatus(`stopSession 실패: ${error?.message ?? error}`);
    }
  });
});

addNativeListeners();
