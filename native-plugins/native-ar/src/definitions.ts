import type { PluginListenerHandle } from "@capacitor/core";

export type NativeARTrackingState = "notAvailable" | "limited" | "normal";

export type NativeARStartSessionResult = {
  ok: boolean;
};

export type NativeARStopSessionResult = {
  ok: boolean;
};

export type NativeARPlaceTestObjectOptions = {
  distanceMeters?: number;
};

export type NativeARPlaceTestObjectResult = {
  objectId: string;
  distanceMeters: number;
};

export type NativeARTrackingStateChangedEvent = {
  state: NativeARTrackingState;
  reason?: string;
};

export type NativeARObjectTapEvent = {
  objectId: string;
};

export type NativeARSessionErrorEvent = {
  code: string;
  message: string;
};

export type NativeARAnchorPlacedEvent = {
  objectId: string;
  distanceMeters: number;
};

export interface NativeARPlugin {
  startSession(): Promise<NativeARStartSessionResult>;
  placeTestObject(options?: NativeARPlaceTestObjectOptions): Promise<NativeARPlaceTestObjectResult>;
  stopSession(): Promise<NativeARStopSessionResult>;

  addListener(
    eventName: "onTrackingStateChanged",
    listenerFunc: (event: NativeARTrackingStateChangedEvent) => void,
  ): Promise<PluginListenerHandle>;
  addListener(eventName: "onObjectTap", listenerFunc: (event: NativeARObjectTapEvent) => void): Promise<PluginListenerHandle>;
  addListener(eventName: "onSessionStarted", listenerFunc: () => void): Promise<PluginListenerHandle>;
  addListener(eventName: "onSessionStopped", listenerFunc: () => void): Promise<PluginListenerHandle>;
  addListener(eventName: "onSessionError", listenerFunc: (event: NativeARSessionErrorEvent) => void): Promise<PluginListenerHandle>;
  addListener(eventName: "onAnchorPlaced", listenerFunc: (event: NativeARAnchorPlacedEvent) => void): Promise<PluginListenerHandle>;
  removeAllListeners(): Promise<void>;
}
