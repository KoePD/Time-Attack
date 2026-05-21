import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-database.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

// Erstatt med din faktiske Firebase-konfigurasjon fra Firebase Console
const firebaseConfig = {
    apiKey: "DIN_API_KEY",
    authDomain: "koepd-liga.firebaseapp.com",
    databaseURL: "https://koepd-liga-default-rtdb.firebaseio.com",
    projectId: "koepd-liga",
    storageBucket: "koepd-liga.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:1234:web:abcd"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

/* ==========================================
   1. REALTIME LIVE STREAM OPPDATERINGER
   ========================================== */
const liveMatchRef = ref(db, 'live_matches/match_tv_1');

onValue(liveMatchRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    // Oppdater navn og score
    document.getElementById('player-a-score').innerText = data.score_a;
    document.getElementById('player-b-score').innerText = data.score_b;
    document.getElementById('shotclock-value').innerText = `${data.shotclock_seconds}s`;

    // Sjekk kritisk tid (< 5 minutter gjenstående i omgangen)
    const timerElement = document.getElementById('match-timer');
    timerElement.innerText = data.match_time_string || "45:00";
    
    if (data.is_critical_time) {
        timerElement.classList.add('pulse-critical');
    } else {
        timerElement.classList.remove('pulse-critical');
    }
});

/* ==========================================
   2. AUTH & TIPPE-PANEL LOGIKK
   ========================================== */
const loginBtn = document.getElementById('btn-google-login');
const authContainer = document.getElementById('auth-container');
const tippeInterface = document.getElementById('tippe-interface');

loginBtn.addEventListener('click', () => {
    signInWithPopup(auth, provider).catch(err => console.error("Innloggingsfeil:", err));
});

onAuthStateChanged(auth, (user) => {
    if (user) {
        authContainer.classList.add('hidden');
        tippeInterface.classList.remove('hidden');
        console.log("Innlogget som:", user.displayName);
    } else {
        authContainer.classList.remove('hidden');
        tippeInterface.classList.add('hidden');
    }
});

// Håndtering av seertips (H, U, B)
const tippeButtons = document.querySelectorAll('.btn-tippe');
tippeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        tippeButtons.forEach(b => b.classList.remove('selected'));
        e.target.classList.add('selected');
        const prediction = e.target.getAttribute('data-bet');
        
        // HER LEGGES LOGIKK FOR Å SKRIVE TIL FIREBASE:
        // set(ref(db, `predictions/match_tv_1/${auth.currentUser.uid}`), { ... })
        alert(`Du har tippet: ${prediction}! Valget lagres i Firebase.`);
    });
});
