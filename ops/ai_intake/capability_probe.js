window.AIIntake = window.AIIntake || {};
AIIntake.capabilities = () => ({
  mic: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
  cam: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
  loc: 'geolocation' in navigator,
  webauthn: !!(window.PublicKeyCredential),
  os: navigator.platform || 'unknown',
  ua: navigator.userAgent || 'unknown'
});
