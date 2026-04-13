const { createClient } = supabase;
const sb = createClient(
  'https://viyeyixvxvqwzwnmsfdl.supabase.co',
  'sb_publishable_NWlQdFBD-JcgNl8EuN-Qqw_jx0mBh7-'
);

// Hide page until auth confirmed
document.documentElement.style.visibility = 'hidden';

const INACTIVITY_LIMIT    = 15 * 60 * 1000; // 15 min
const SESSION_POLL_MS     = 20 * 1000;       // check every 20s
const DEVICE_KEY          = 'tt_device_id';

let inactivityTimer;
let pollTimer;

// Generate or retrieve a stable device ID stored in localStorage
function getDeviceId() {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = 'dev_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

function resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => secureLogout('idle'), INACTIVITY_LIMIT);
}

['click', 'keydown', 'mousemove', 'touchstart', 'scroll'].forEach(e =>
  document.addEventListener(e, resetInactivityTimer, { passive: true })
);

function clearSensitiveData() {
  ['tt_balance', 'tt_transactions', 'tt_recent_users'].forEach(k =>
    localStorage.removeItem(k)
  );
}

async function secureLogout(reason) {
  clearTimeout(pollTimer);
  clearSensitiveData();
  await sb.auth.signOut();
  const msg = reason ? `?reason=${encodeURIComponent(reason)}` : '';
  window.location.replace('login.html' + msg);
}

function logout() { secureLogout('manual'); }

sb.auth.onAuthStateChange((event) => {
  if (event === 'SIGNED_OUT') window.location.replace('login.html');
});

// Poll Supabase to check if active_device_id still matches this device
async function pollSession() {
  pollTimer = setInterval(async () => {
    try {
      const { data, error } = await sb.auth.getUser();
      if (error || !data.user) { secureLogout('session_expired'); return; }

      const storedDevice = data.user.user_metadata?.active_device_id;
      const myDevice     = getDeviceId();

      if (storedDevice && storedDevice !== myDevice) {
        clearInterval(pollTimer);
        secureLogout('another_device');
      }
    } catch { /* network error — skip this tick */ }
  }, SESSION_POLL_MS);
}

(async function requireAuth() {
  try {
    const { data: sessionData } = await sb.auth.getSession();
    if (!sessionData.session) { window.location.replace('login.html'); return; }

    const { data: userData, error } = await sb.auth.getUser();
    if (error || !userData.user) { window.location.replace('login.html'); return; }

    const storedDevice = userData.user.user_metadata?.active_device_id;
    const myDevice     = getDeviceId();

    // If another device is registered, kick this one out
    if (storedDevice && storedDevice !== myDevice) {
      clearSensitiveData();
      await sb.auth.signOut();
      window.location.replace('login.html?reason=another_device');
      return;
    }

    // All good — show page
    document.documentElement.style.visibility = 'visible';
    resetInactivityTimer();
    pollSession();

  } catch {
    window.location.replace('login.html');
  }
})();
