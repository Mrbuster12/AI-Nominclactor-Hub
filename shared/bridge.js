(function () {
  const BRIDGE_NS = "session_bridge";
  const META_NS = "bridge_meta";
  const DEFAULT_TTL = 2 * 60 * 60 * 1000; // 2 hours

  const ENC_ALGO = "AES-GCM";
  const PBKDF2_ITER = 100000;

  function getHostContext() {
    const ua = navigator.userAgent || "";
    const host = location.hostname || "localhost";
    const path = (location.pathname || "/").split("/")[1] || "root";
    return { ua, host, path };
  }

  function metaKey(ns, key) {
    return `${META_NS}:${ns}:${key}`;
  }

  async function deriveKey() {
    const { ua, host, path } = getHostContext();
    const raw = `${ua}::${host}::${path}::${BRIDGE_NS}`;
    const saltLabel = `${host}/${path}`;
    const enc = new TextEncoder();

    const saltHash = await crypto.subtle.digest(
      "SHA-256",
      enc.encode(`bridge_salt::${saltLabel}`)
    );

    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      enc.encode(raw),
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );

    return crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        iterations: PBKDF2_ITER,
        hash: "SHA-256",
        salt: saltHash
      },
      keyMaterial,
      { name: ENC_ALGO, length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }

  async function encryptJSON(obj) {
    const key = await deriveKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const enc = new TextEncoder();
    const data = enc.encode(JSON.stringify(obj));

    const cipherBuf = await crypto.subtle.encrypt(
      { name: ENC_ALGO, iv },
      key,
      data
    );

    const cipherBytes = new Uint8Array(cipherBuf);
    const merged = new Uint8Array(iv.byteLength + cipherBytes.byteLength);

    merged.set(iv, 0);
    merged.set(cipherBytes, iv.byteLength);

    let b64 = "";
    for (let i = 0; i < merged.length; i++) {
      b64 += String.fromCharCode(merged[i]);
    }
    return btoa(b64);
  }

  async function decryptJSON(b64) {
    const key = await deriveKey();
    const bin = Uint8Array.from(atob(b64), c => c.charCodeAt(0));

    const iv = bin.slice(0, 12);
    const cipherBytes = bin.slice(12);

    const plainBuf = await crypto.subtle.decrypt(
      { name: ENC_ALGO, iv },
      key,
      cipherBytes
    );

    const dec = new TextDecoder();
    return JSON.parse(dec.decode(plainBuf));
  }

  async function rawSave(ns, key, payload, ttlMs) {
    const ttl = typeof ttlMs === "number" ? ttlMs : DEFAULT_TTL;
    const storeKey = `${ns}:${key}`;
    const b64 = await encryptJSON(payload);

    localStorage.setItem(storeKey, b64);
    localStorage.setItem(
      metaKey(ns, key),
      JSON.stringify({
        at: Date.now(),
        ttl
      })
    );

    try {
      // same behavior we relied on before
      sessionStorage.setItem("session_bridge_key", key);
      localStorage.setItem("session_bridge:last_k", key);
    } catch (e) {
      // ignore storage quota / private mode issues
    }

    return { ok: true, key: storeKey, ttl };
  }

  async function rawLoad(ns, key, ttlMs) {
    const storeKey = `${ns}:${key}`;
    const metaRaw = localStorage.getItem(metaKey(ns, key));
    if (!metaRaw) return null;

    let meta;
    try {
      meta = JSON.parse(metaRaw) || {};
    } catch (e) {
      meta = {};
    }

    const at = meta.at || 0;
    const ttl = typeof ttlMs === "number" ? ttlMs : meta.ttl || DEFAULT_TTL;

    if (!at || Date.now() - at > ttl) {
      return null;
    }

    const b64 = localStorage.getItem(storeKey);
    if (!b64) return null;

    try {
      return await decryptJSON(b64);
    } catch (e) {
      console.warn("[Bridge] decrypt failed", e);
      return null;
    }
  }

  window.Bridge = {
    save(ns, key, payload, ttlMs) {
      return rawSave(ns, key, payload, ttlMs);
    },
    load(ns, key, ttlMs) {
      return rawLoad(ns, key, ttlMs);
    }
  };

  window.BRIDGE_NS = BRIDGE_NS;
})();

