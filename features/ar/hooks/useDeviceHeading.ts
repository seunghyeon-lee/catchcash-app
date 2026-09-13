"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export type DeviceHeadingPermission = "unknown" | "granted" | "denied" | "unsupported";

export type DeviceHeadingState = {
  heading: number | null;
  permission: DeviceHeadingPermission;
  canRequestPermission: boolean;
  requestPermission: () => Promise<void>;
};

type DeviceOrientationPermissionState = "granted" | "denied" | "prompt";

type DeviceOrientationEventConstructorWithPermission = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<DeviceOrientationPermissionState>;
};

type DeviceOrientationEventWithCompass = DeviceOrientationEvent & {
  webkitCompassHeading?: number;
};

function normalizeHeading(value: number) {
  return ((value % 360) + 360) % 360;
}

function resolveHeading(event: DeviceOrientationEventWithCompass): number | null {
  if (typeof event.webkitCompassHeading === "number" && Number.isFinite(event.webkitCompassHeading)) {
    return normalizeHeading(event.webkitCompassHeading);
  }

  if (typeof event.alpha === "number" && Number.isFinite(event.alpha)) {
    return normalizeHeading(360 - event.alpha);
  }

  return null;
}

function getDeviceOrientationConstructor(): DeviceOrientationEventConstructorWithPermission | null {
  if (typeof window === "undefined" || typeof window.DeviceOrientationEvent === "undefined") {
    return null;
  }

  return window.DeviceOrientationEvent as DeviceOrientationEventConstructorWithPermission;
}

export function useDeviceHeading(): DeviceHeadingState {
  const orientationEvent = useMemo(() => getDeviceOrientationConstructor(), []);
  const needsExplicitPermission = typeof orientationEvent?.requestPermission === "function";
  const [heading, setHeading] = useState<number | null>(null);
  const [permission, setPermission] = useState<DeviceHeadingPermission>(() =>
    orientationEvent ? "unknown" : "unsupported",
  );

  const requestPermission = useCallback(async () => {
    if (!orientationEvent) {
      setHeading(null);
      setPermission("unsupported");
      return;
    }

    if (!needsExplicitPermission) {
      setPermission("granted");
      return;
    }

    try {
      const result = await orientationEvent.requestPermission?.();
      setPermission(result === "granted" ? "granted" : "denied");
      if (result !== "granted") {
        setHeading(null);
      }
    } catch {
      setHeading(null);
      setPermission("denied");
    }
  }, [needsExplicitPermission, orientationEvent]);

  useEffect(() => {
    if (!orientationEvent) {
      setHeading(null);
      setPermission("unsupported");
      return;
    }

    if (needsExplicitPermission && permission !== "granted") {
      return;
    }

    if (!needsExplicitPermission && permission === "unknown") {
      setPermission("granted");
    }

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const nextHeading = resolveHeading(event as DeviceOrientationEventWithCompass);
      if (nextHeading === null) return;
      setHeading(nextHeading);
      setPermission("granted");
    };

    const removeOrientationListener = () => {
      window.removeEventListener("deviceorientation", handleOrientation, true);
    };

    window.addEventListener("deviceorientation", handleOrientation, true);
    window.addEventListener("pagehide", removeOrientationListener);

    return () => {
      removeOrientationListener();
      window.removeEventListener("pagehide", removeOrientationListener);
    };
  }, [needsExplicitPermission, orientationEvent, permission]);

  return {
    heading,
    permission,
    canRequestPermission: needsExplicitPermission,
    requestPermission,
  };
}
