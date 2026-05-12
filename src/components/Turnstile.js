"use client";

import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from "react";

const TURNSTILE_SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

let scriptLoaded = false;
let scriptLoading = false;
const loadCallbacks = [];

function loadScript() {
  if (scriptLoaded) return Promise.resolve();
  if (scriptLoading) {
    return new Promise((resolve) => loadCallbacks.push(resolve));
  }

  scriptLoading = true;
  return new Promise((resolve) => {
    loadCallbacks.push(resolve);
    const script = document.createElement("script");
    script.src = TURNSTILE_SCRIPT_URL;
    script.async = true;
    script.onload = () => {
      scriptLoaded = true;
      loadCallbacks.forEach((cb) => cb());
      loadCallbacks.length = 0;
    };
    document.head.appendChild(script);
  });
}

const Turnstile = forwardRef(function Turnstile({ onSuccess, onError, onExpire }, ref) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  const reset = useCallback(() => {
    if (widgetIdRef.current !== null && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
    }
  }, []);

  useImperativeHandle(ref, () => ({ reset }), [reset]);

  useEffect(() => {
    if (!siteKey) return;

    let mounted = true;

    loadScript().then(() => {
      if (!mounted || !containerRef.current || !window.turnstile) return;

      // Clean up any existing widget
      if (widgetIdRef.current !== null) {
        window.turnstile.remove(widgetIdRef.current);
      }

      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: (token) => onSuccess?.(token),
        "error-callback": () => onError?.(),
        "expired-callback": () => onExpire?.(),
        theme: "auto",
        size: "flexible",
      });
    });

    return () => {
      mounted = false;
      if (widgetIdRef.current !== null && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, onSuccess, onError, onExpire]);

  if (!siteKey) return null;

  return <div ref={containerRef} className="flex justify-center my-2" />;
});

export default Turnstile;