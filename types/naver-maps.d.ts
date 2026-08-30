declare global {
  namespace naver.maps {
    class LatLng {
      constructor(lat: number, lng: number);
    }

    class Point {
      constructor(x: number, y: number);
    }

    type MapOptions = {
      center: LatLng;
      zoom: number;
      minZoom?: number;
      maxZoom?: number;
      gl?: boolean;
      customStyleId?: string;
    };

    class Map {
      constructor(mapDiv: HTMLElement, options: MapOptions);

      setCenter(center: LatLng): void;
      panTo(center: LatLng): void;
    }

    type MarkerIcon = {
      content: string;
      anchor?: Point;
    };

    type MarkerOptions = {
      position: LatLng;
      map?: Map | null;
      icon?: MarkerIcon;
      title?: string;
      clickable?: boolean;
      zIndex?: number;
    };

    class Marker {
      constructor(options: MarkerOptions);

      setMap(map: Map | null): void;
      setPosition(position: LatLng): void;
    }

    class MapEventListener {}

    const Event: {
      addListener(target: Marker, eventName: string, listener: () => void): MapEventListener;
      removeListener(listener: MapEventListener): void;
      trigger(target: Map, eventName: string): void;
    };

    let jsContentLoaded: boolean | undefined;
    let onJSContentLoaded: (() => void) | undefined;
  }

  interface Window {
    naver?: {
      maps: typeof naver.maps;
    };
  }
}

export {};
