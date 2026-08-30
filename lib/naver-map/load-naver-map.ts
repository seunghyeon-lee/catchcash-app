const NAVER_MAP_SCRIPT_ID = "naver-map-sdk";

let naverMapSdkPromise: Promise<typeof naver.maps> | null = null;

function getNaverMapClientId() {
  return process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID?.trim();
}

function getNaverMapStyleId() {
  return process.env.NEXT_PUBLIC_NAVER_MAP_STYLE_ID?.trim();
}

function resolveWhenNaverMapsReady(resolve: (maps: typeof naver.maps) => void, reject: (error: Error) => void) {
  const maps = window.naver?.maps;
  if (!maps) {
    reject(new Error("Naver Maps SDK loaded, but window.naver.maps is unavailable."));
    return;
  }

  if (maps.jsContentLoaded === false) {
    maps.onJSContentLoaded = () => resolve(maps);
    return;
  }

  resolve(maps);
}

export function loadNaverMapSdk() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Naver Maps SDK can only be loaded in the browser."));
  }

  if (window.naver?.maps) {
    return Promise.resolve(window.naver.maps);
  }

  const clientId = getNaverMapClientId();
  if (!clientId) {
    return Promise.reject(new Error("NEXT_PUBLIC_NAVER_MAP_CLIENT_ID is required to load Naver Maps."));
  }

  if (naverMapSdkPromise) {
    return naverMapSdkPromise;
  }

  naverMapSdkPromise = new Promise<typeof naver.maps>((resolve, reject) => {
    const existingScript = document.getElementById(NAVER_MAP_SCRIPT_ID) as HTMLScriptElement | null;
    const script = existingScript ?? document.createElement("script");

    const rejectLoad = (error: Error) => {
      naverMapSdkPromise = null;
      reject(error);
    };

    const handleLoad = () => {
      resolveWhenNaverMapsReady(resolve, rejectLoad);
    };

    const handleError = () => {
      script.remove();
      rejectLoad(new Error("Failed to load Naver Maps SDK."));
    };

    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", handleError, { once: true });

    if (!existingScript) {
      const styleId = getNaverMapStyleId();
      const submodulesQuery = styleId ? "&submodules=gl" : "";

      script.id = NAVER_MAP_SCRIPT_ID;
      script.async = true;
      script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}${submodulesQuery}`;
      document.head.appendChild(script);
    }
  });

  return naverMapSdkPromise;
}
