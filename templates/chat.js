/**
* PROGNOSYS DASHBOARD SCRIPT v4.14 (FINAL CHATBOT FIX)
* * KEY FIX: 
* - Chatbot API URL updated to http://127.0.0.1:8080/get to match Uvicorn terminal output.
* - All global functions confirmed to be defined correctly.
*/

// ==========================================
// 1. GLOBAL VARIABLES & UTILITIES
// ==========================================
// Note: These need to be defined outside DOMContentLoaded so HTML onclicks can find them
window.notifications = [
    { title: "System Online", text: "Dashboard ready to pair.", time: "Now", color: "blue" }
];

window.watchConnected = false;
window.watchName = "";
window.soundEnabled = true;
window.locationEnabled = true; // Default to ON

let simState = { 
    hr: 75, 
    steps: 100, 
    bpSys: 120, 
    bpDia: 80, 
    isManual: false 
};

let currentPrescriptionData = null;
let renderHistory; 
let renderInventory; 
let uploadCounter = 0; 
let currentLocality = "Chennai"; 

// --- Hospital Data (Simplified for brevity) ---
const hospitalData = [
    {id: 1, name: "Apollo Hospitals Greams Road", locality: "Greams Road", phone: "04428290200", website: "https://www.apollohospitals.com", specialties: "Cardiology;Neurology;Oncology;Orthopaedics;Critical Care", doctors: "Cardiology: Dr. Vijayachandra Reddy Y. Neurology: Dr. Madeswaran K.", rating: 4.5, government_scheme: "No, Private Hospital", plan: "General Insurance Accepted"},
    {id: 4, name: "Government General Hospital (RGGGH)", locality: "Park Town", phone: "04425305000", website: "https://www.mmchennai.org", specialties: "Trauma;General Surgery;Medicine", doctors: "Trauma: Dr. Vasanth Kumar. General Medicine: Dr. R. Manimekalai.", rating: 3.8, government_scheme: "CMCHIS; Free Treatment Scheme", plan: "All Government Schemes"},
];

// Medication Interaction Database (Simulated)
const interactionDB = {
    "warfarin": ["aspirin", "ibuprofen", "vitamin k"],
    "ibuprofen": ["aspirin", "warfarin", "alcohol"],
    "vitamin d3": ["diuretics"],
    "aspirin": ["ibuprofen", "alcohol"],
};

// Location-Based Health Alerts (Simulated - based on Chennai areas)
const localAlerts = {
    "park town": {
        priority: "red",
        alert: "Dengue Fever advisory active. Heavy mosquito breeding reported.",
        action: "Use repellents and ensure no stagnant water around.",
        icon: "mosquito"
    },
    "adyar": {
        priority: "orange",
        alert: "Moderate air quality index (AQI) today due to construction.",
        action: "Limit strenuous outdoor exercise.",
        icon: "wind"
    },
};

// ==========================================
// 2. GLOBAL HANDLERS (Used directly by HTML attributes like onclick)
// ==========================================

window.renderNotifications = function(container) {
    if(!container) return;
    container.innerHTML = "";
    if (window.notifications.length === 0) {
        container.innerHTML = '<div class="p-4 text-center text-gray-400 text-xs">No new alerts.</div>';
        return;
    }
    // Logic to render notifications...
    window.notifications.slice(0, 10).forEach(n => {
        container.innerHTML += `<div class="p-3 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-700/50">
            <p class="text-sm font-medium flex items-center gap-2 text-${n.color}-600 dark:text-${n.color}-400">
                <i data-lucide="bell" class="w-4 h-4"></i>${n.title}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">${n.text}</p>
            <p class="text-[10px] text-gray-400 mt-1">${n.time}</p>
        </div>`;
    });
    if(typeof lucide !== 'undefined') lucide.createIcons();
};

window.addNotification = function(title, text, color = "blue") {
    const time = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
    window.notifications.unshift({ title, text, time, color });
    
    const list = document.getElementById('notif-list');
    if(list) window.renderNotifications(list);
    
    const dot = document.getElementById('notif-dot');
    const staticDot = document.getElementById('notif-dot-static');
    if(dot) dot.classList.remove('hidden');
    if(staticDot) staticDot.classList.remove('hidden');
};


window.pairDevice = function(deviceName) {
    const scanModal = document.getElementById('scan-modal');
    if(scanModal) { scanModal.classList.add('hidden'); scanModal.style.display = 'none'; }
    
    window.watchConnected = true; 
    window.watchName = deviceName;
    simState.hr = 72;
    simState.steps = 100;
    simState.bpSys = 120;
    simState.bpDia = 80;
    simState.isManual = false;

    const connectBtn = document.getElementById('connect-watch-btn');
    const watchWidget = document.getElementById('watch-status-card');

    if(connectBtn) {
        connectBtn.innerHTML = `<i data-lucide="check"></i> ${deviceName}`;
        connectBtn.className = "flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border border-green-200 rounded-full text-xs font-bold transition-all";
    }
    if(watchWidget) {
        watchWidget.classList.remove('hidden');
        watchWidget.classList.add('flex');
        document.getElementById('watch-name-display').innerText = deviceName;
    }
    window.addNotification("Device Connected", `Paired with ${deviceName}.`, "green");
    if(typeof lucide !== 'undefined') lucide.createIcons();
};

// Global stubs for general functions (used by HTML onclick attributes)
window.logout = function() { 
    if (confirm("Are you sure you want to sign out?")) { 
        localStorage.removeItem('currentUser'); 
        alert("Signed out!");
    } 
};
window.clearNotifs = function() { 
    window.notifications = []; 
    window.renderNotifications(document.getElementById('notif-list')); 
    document.getElementById('notif-dot').classList.add('hidden'); 
    document.getElementById('notif-dot-static').classList.add('hidden');
};
window.deleteRem = function(index) { 
    let reminders = JSON.parse(localStorage.getItem('healthReminders')) || []; 
    reminders.splice(index, 1); 
    localStorage.setItem('healthReminders', JSON.stringify(reminders)); 
    location.reload(); 
};
window.deletePrescription = function(index) {
    let history = JSON.parse(localStorage.getItem('presHistory')) || [];
    if (confirm(`Are you sure you want to delete this prescription history entry?`)) {
        history.splice(index, 1);
        localStorage.setItem('presHistory', JSON.stringify(history));
        if (renderHistory) renderHistory(); 
        document.getElementById('pres-details-container').classList.add('hidden');
        currentPrescriptionData = null;
    }
}
window.viewPrescription = function(index) {
    const history = JSON.parse(localStorage.getItem('presHistory')) || [];
    const item = history[index];
    if (!item) return;
    
    currentPrescriptionData = item;
    document.getElementById('sim-doctor').innerText = item.doctor;
    document.getElementById('sim-reason').innerText = item.diagnosis;
    document.getElementById('sim-med').innerText = item.medication;
    document.getElementById('sim-date').innerText = item.date;
    document.getElementById('pres-image-preview').src = item.image; 
    document.getElementById('pres-details-container').classList.remove('hidden'); 
}
window.deleteDrug = function(drugName) {
    let activeDrugs = JSON.parse(localStorage.getItem('activeDrugs')) || [];
    const index = activeDrugs.indexOf(drugName);
    if (index > -1) {
        activeDrugs.splice(index, 1);
        localStorage.setItem('activeDrugs', JSON.stringify(activeDrugs));
        if (renderInventory) renderInventory();
    }
}

// ==========================================
// 3. CORE LOGIC FUNCTIONS
// ==========================================

function loadProfile() {
    const saved = JSON.parse(localStorage.getItem('userProfile'));
    if(saved && saved.name) {
        if(document.getElementById('sidebar-username')) document.getElementById('sidebar-username').innerText = saved.name;
        if(document.getElementById('welcome-msg')) document.getElementById('welcome-msg').innerText = `Welcome back, ${saved.name.split(' ')[0]}.`;
        if(document.getElementById('user-initials')) document.getElementById('user-initials').innerText = saved.name.substring(0,2).toUpperCase();
    }
}

function resetVitalsUI() {
    if (!window.watchConnected && !simState.isManual) {
        simState = { hr: 0, steps: 0, bpSys: 0, bpDia: 0, isManual: false };
    }

    if(document.getElementById('display-hr')) document.getElementById('display-hr').innerText = simState.hr > 0 ? Math.floor(simState.hr) : "--";
    if(document.getElementById('display-bp')) document.getElementById('display-bp').innerText = simState.bpSys > 0 ? `${simState.bpSys}/${simState.bpDia}` : "00/00"; 
    if(document.getElementById('display-steps')) document.getElementById('display-steps').innerText = simState.steps;
    if(document.getElementById('display-cal')) document.getElementById('display-cal').innerText = (simState.steps * 0.04).toFixed(0);
    if(document.getElementById('bp-bar')) document.getElementById('bp-bar').style.width = "0%";
    
    if(!window.watchConnected && !simState.isManual && document.getElementById('predictive-recommendation')) {
         document.getElementById('predictive-recommendation').innerText = "Connect a device or log vitals to begin analysis.";
         document.getElementById('predictive-widget').classList.replace('from-red-600', 'from-indigo-600');
    }
}

function checkLocalAlerts(locality) {
    const lowerLocality = locality.toLowerCase();
    const alertInfo = localAlerts[lowerLocality];

    if (alertInfo) {
        const notifTitle = `Local Alert: ${alertInfo.priority.charAt(0).toUpperCase() + alertInfo.priority.slice(1)} Health Risk`;
        const existingAlerts = window.notifications.filter(n => n.title === notifTitle);
        
        if (existingAlerts.length === 0) {
                window.addNotification(notifTitle, `${alertInfo.alert} Action: ${alertInfo.action}`, alertInfo.priority);
        }
    }
}

function getUsersLocality() {
    const localityElement = document.getElementById('header-locality');
    
    if (!window.locationEnabled) {
        currentLocality = "Location OFF";
        if (localityElement) localityElement.innerText = currentLocality;
        return; 
    }

    if (navigator.geolocation) {
        const options = { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 };
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const localities = ["Park Town", "Adyar", "Greams Road"];
                const randomIndex = Math.floor(Math.random() * localities.length);
                currentLocality = localities[randomIndex]; 
            
                if (localityElement) localityElement.innerText = currentLocality;
                checkLocalAlerts(currentLocality);
            },
            (error) => {
                currentLocality = "Access Denied"; 
                if (localityElement) localityElement.innerText = currentLocality;
                window.addNotification("Location Access Denied", "Location alerts disabled by browser permission.", "orange");
            },
            options
        );
    } else {
        currentLocality = "Not Supported";
        if (localityElement) localityElement.innerText = currentLocality;
        window.addNotification("Geolocation Error", "Your browser does not support location services.", "orange");
    }
}

// ==========================================
// 4. CHATBOT LOGIC (FASTAPI INTEGRATION)
// ==========================================
function setupChatbot() {
    const chatForm = document.getElementById('message-form');
    const msgInput = document.getElementById('message-input');
    const chatBox = document.getElementById('chatbox');

    if(chatForm) {
        chatForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const text = msgInput.value.trim();
            if(!text) return;
            
            // 1. Display User Message
            const uDiv = document.createElement("div");
            uDiv.className = "flex mb-4 justify-end";
            uDiv.innerHTML = `<div class="p-3 rounded-2xl max-w-[80%] text-sm shadow-sm bg-blue-600 text-white rounded-br-none">${text}</div>`;
            chatBox.appendChild(uDiv);
            msgInput.value = "";
            chatBox.scrollTop = chatBox.scrollHeight;

            // 2. Display Bot Loading Message
            const loadingDiv = document.createElement("div");
            loadingDiv.className = "flex mb-4 justify-start";
            loadingDiv.innerHTML = `<div id="loading-spinner" class="p-3 rounded-2xl max-w-[80%] text-sm shadow-sm bg-gray-200 dark:bg-slate-700 dark:text-white rounded-bl-none">
                                        <i data-lucide="loader-2" class="w-4 h-4 animate-spin inline mr-1"></i> Thinking...
                                    </div>`;
            chatBox.appendChild(loadingDiv);
            chatBox.scrollTop = chatBox.scrollHeight;
            if(typeof lucide !== 'undefined') lucide.createIcons(); 

            // --- 3. ACTUAL API CALL ---
            const formData = new FormData();
            formData.append('msg', text); 
            
            try {
                // *** CRITICAL FIX: URL IS 8080 ***
                const response = await fetch('http://127.0.0.1:8080/get', { 
                    method: 'POST',
                    body: formData, 
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const botReply = await response.text();
                
                // 4. Update with Bot Response
                const botDiv = document.createElement("div");
                botDiv.className = "flex mb-4 justify-start";
                botDiv.innerHTML = `<div class="p-3 rounded-2xl max-w-[80%] text-sm shadow-sm bg-gray-200 dark:bg-slate-700 dark:text-white rounded-bl-none">${botReply}</div>`;
                
                loadingDiv.remove();
                chatBox.appendChild(botDiv);

            } catch (error) {
                console.error('Chatbot API Error:', error);
                const errorDiv = document.createElement("div");
                errorDiv.className = "flex mb-4 justify-start";
                errorDiv.innerHTML = `<div class="p-3 rounded-2xl max-w-[80%] text-sm shadow-sm bg-red-100 text-red-700 rounded-bl-none">⚠️ API Error. Could not connect to Health Bot.</div>`;
                
                loadingDiv.remove();
                chatBox.appendChild(errorDiv);
            }
            
            chatBox.scrollTop = chatBox.scrollHeight;
        });
    }
}


// ==========================================
// 5. DOM CONTENT LOADED
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    
    if(typeof lucide !== 'undefined') lucide.createIcons();
    loadProfile();
    resetVitalsUI();
    setupChatbot(); 
    
    // ------------------------------------------
    // A. CHART & SIMULATION LOOP 
    // ------------------------------------------
    const ctx = document.getElementById('heartRateChart')?.getContext('2d');
    if(ctx) {
        window.hrChart = new Chart(ctx, {
            type: 'line', data: { labels: Array(20).fill(''), datasets: [{ data: Array(20).fill(0), borderColor: '#ef4444', borderWidth: 2, tension: 0.4, pointRadius: 0, fill: true, backgroundColor: 'rgba(239, 68, 68, 0.1)' }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false, min: 0, max: 160 } }, animation: false }
        });
    }

    setInterval(() => {
        if(!window.watchConnected && !simState.isManual) {
            resetVitalsUI();
            return;
        }
        
        simState.hr += (Math.random()*10 - 4); 
        simState.steps += Math.floor(Math.random() * 5); 
        simState.hr = Math.max(55, Math.min(165, simState.hr));

        if(document.getElementById('display-hr')) document.getElementById('display-hr').innerText = Math.floor(simState.hr);
        if(document.getElementById('display-steps')) document.getElementById('display-steps').innerText = simState.steps;
        if(document.getElementById('display-cal')) document.getElementById('display-cal').innerText = (simState.steps * 0.04).toFixed(0);
        if(document.getElementById('display-bp')) document.getElementById('display-bp').innerText = `${simState.bpSys}/${simState.bpDia}`;

        if(window.hrChart) {
            const d = window.hrChart.data.datasets[0].data; 
            d.shift(); d.push(simState.hr); 
            window.hrChart.update('none'); 
        }

        if(document.getElementById('bp-bar')) {
            const percent = Math.min(100, Math.max(0, (simState.bpSys - 90) * 1.5));
            document.getElementById('bp-bar').style.width = `${percent}%`;
            document.getElementById('bp-bar').className = simState.bpSys > 140 ? "bg-red-500 h-1.5 rounded-full transition-all" : "bg-blue-500 h-1.5 rounded-full transition-all";
        }
        
        updatePredictiveCalendar();
        
    }, 1000);
    

    // ------------------------------------------
    // B. MODAL SETUP & GENERAL UI HANDLERS
    // ------------------------------------------
    function setupModal(triggerId, modalId, closeId, onOpenFunction = null) {
        const t = document.getElementById(triggerId);
        const m = document.getElementById(modalId);
        const c = document.getElementById(closeId);
        
        if(t && m) t.addEventListener('click', (e) => { 
            e.preventDefault(); 
            m.classList.remove('hidden'); 
            m.style.display='flex';
            if (onOpenFunction) {
                onOpenFunction(); 
            }
        });
        if(c && m) c.addEventListener('click', () => { m.classList.add('hidden'); m.style.display='none'; });
    }

    setupModal('open-logger-btn', 'logger-modal', 'close-logger-btn'); 
    setupModal('open-pres-logger-btn', 'prescription-modal', 'close-pres-btn', loadInitialPrescription); 
    setupModal('open-recommender-btn', 'recommender-modal', 'close-recommender-btn', () => renderHospitalResults('')); 
    setupModal('open-meds-btn', 'meds-modal', 'close-meds-btn', syncAndRenderMeds); 
    setupModal('open-settings-btn', 'settings-modal', 'close-settings-btn');
    setupModal('open-profile-btn', 'profile-modal', 'close-profile-btn', loadProfileDataForEdit);
    setupModal('chat-launcher', 'chat-modal', 'close-chat-btn');
    setupModal('add-reminder-widget-btn', 'reminder-modal', 'close-rem-btn');
    setupModal('add-reminder-scheduler-btn', 'reminder-modal', 'close-rem-btn'); 
    setupModal('open-scheduler-btn', 'scheduler-modal', 'close-scheduler-btn', updateSchedulerModal); 
    
    if(document.getElementById('sidebar-toggle')) document.getElementById('sidebar-toggle').addEventListener('click', () => document.getElementById('sidebar').classList.toggle('-translate-x-full'));

    // Notification dropdown toggle
    const notifBtn = document.getElementById('notif-btn');
    const notifDrop = document.getElementById('notif-dropdown');
    if(notifBtn && notifDrop) {
        notifBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            notifDrop.classList.toggle('hidden');
            document.getElementById('notif-dot').classList.add('hidden');
            window.renderNotifications(document.getElementById('notif-list'));
        });
        window.addEventListener('click', (e) => {
            if (!notifBtn.contains(e.target) && !notifDrop.contains(e.target)) {
                 notifDrop.classList.add('hidden');
            }
        });
    }
    
    // Clock update
    setInterval(() => {
        const t = document.getElementById('current-time');
        if(t) t.innerText = new Date().toLocaleTimeString();
    }, 1000);
    const dateEl = document.getElementById('current-date');
    if(dateEl) dateEl.innerText = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // ------------------------------------------
    // C. SETTINGS, REMINDERS, PROFILE FORMS (Implementation)
    // ------------------------------------------
    const tabs = document.querySelectorAll('.settings-tab');
    tabs.forEach(t => {
        t.addEventListener('click', () => {
            tabs.forEach(x => x.classList.remove('active'));
            document.querySelectorAll('.settings-content').forEach(c => c.classList.add('hidden'));
            t.classList.add('active');
            const target = document.getElementById(t.getAttribute('data-tab'));
            if(target) target.classList.remove('hidden');
        });
    });

    const darkToggle = document.getElementById('set-darkmode');
    if(localStorage.getItem('theme') === 'dark') {
        document.documentElement.classList.add('dark');
        if(darkToggle) darkToggle.checked = true;
    }
    if(darkToggle) {
        darkToggle.addEventListener('change', e => {
            if(e.target.checked) { document.documentElement.classList.add('dark'); localStorage.setItem('theme', 'dark'); }
            else { document.documentElement.classList.remove('dark'); localStorage.setItem('theme', 'light'); }
        });
    }

    const locationToggle = document.getElementById('location-toggle');
    const savedLocationState = localStorage.getItem('locationEnabled');
    if (savedLocationState !== null) {
        window.locationEnabled = (savedLocationState === 'true');
    }
    if (locationToggle) {
        locationToggle.checked = window.locationEnabled;
        locationToggle.addEventListener('change', (e) => {
            window.locationEnabled = e.target.checked;
            localStorage.setItem('locationEnabled', window.locationEnabled);
            getUsersLocality();
            if (!window.locationEnabled) {
                window.addNotification("Location Disabled", "Location-based health alerts are now OFF.", "orange");
            } else {
                 window.addNotification("Location Enabled", "Checking for local health risks.", "blue");
            }
        });
    }

    const remForm = document.getElementById('reminder-form');
    if(remForm) {
        remForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('rem-name').value;
            const time = document.getElementById('rem-time').value;
            if(name && time) {
                const reminders = JSON.parse(localStorage.getItem('healthReminders')) || [];
                reminders.push({ name, time });
                localStorage.setItem('healthReminders', JSON.stringify(reminders));
                window.addNotification("Reminder Set", `Task: ${name} at ${time}`, "blue");
                document.getElementById('reminder-modal').classList.add('hidden');
                document.getElementById('reminder-modal').style.display='none';
                location.reload(); 
            }
        });
    }

    function loadProfileDataForEdit() {
        const saved = JSON.parse(localStorage.getItem('userProfile'));
        if (saved) {
             document.getElementById('prof-name').value = saved.name || '';
             document.getElementById('prof-age').value = saved.age || '';
             document.getElementById('prof-gender').value = saved.gender || 'Male';
             document.getElementById('prof-blood').value = saved.blood || 'A+';
             document.getElementById('prof-height').value = saved.height || '';
             document.getElementById('prof-weight').value = saved.weight || '';
             document.getElementById('prof-emergency').value = saved.emergency || '';
             document.getElementById('prof-conditions').value = saved.conditions || '';
        }
    }
    
    const profileForm = document.getElementById('health-profile-form');
    if(profileForm) {
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const data = {
                name: document.getElementById('prof-name')?.value,
                age: document.getElementById('prof-age')?.value,
                gender: document.getElementById('prof-gender')?.value,
                blood: document.getElementById('prof-blood')?.value,
                height: document.getElementById('prof-height')?.value,
                weight: document.getElementById('prof-weight')?.value,
                emergency: document.getElementById('prof-emergency')?.value,
                conditions: document.getElementById('prof-conditions')?.value,
            };
            localStorage.setItem('userProfile', JSON.stringify(data));
            loadProfile();
            document.getElementById('profile-modal').classList.add('hidden');
            document.getElementById('profile-modal').style.display='none';
            window.addNotification("Profile Updated", "Your health details have been saved.", "blue");
        });
    }

    const vitalsForm = document.getElementById('vitals-form');
    if(vitalsForm) {
        vitalsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const sys = document.getElementById('input-sys').value;
            const dia = document.getElementById('input-dia').value;
            const hr = document.getElementById('input-hr').value;

            simState.bpSys = parseInt(sys) || 120;
            simState.bpDia = parseInt(dia) || 80;
            simState.hr = parseInt(hr) || 72;
            simState.isManual = true; 
            window.watchConnected = false; 

            document.getElementById('logger-modal').classList.add('hidden');
            document.getElementById('logger-modal').style.display='none';
            window.addNotification("Vitals Logged", `Manual HR: ${simState.hr} bpm. BP: ${simState.bpSys}/${simState.bpDia} mmHg.`, "green");
        });
    }

    // ------------------------------------------
    // D. HOSPITAL, PRESCRIPTION, MEDS LOGIC 
    // ------------------------------------------

    function loadInitialPrescription() {
        const history = JSON.parse(localStorage.getItem('presHistory')) || [];
        if (history.length > 0) {
            if (renderHistory) renderHistory(); 
            window.viewPrescription(0); 
        } else {
            document.getElementById('pres-details-container').classList.add('hidden');
        }
    }

    renderHistory = function() {
        const history = JSON.parse(localStorage.getItem('presHistory')) || [];
        const historyList = document.getElementById('prescription-history-list');
        if (!historyList) return;
        historyList.innerHTML = history.length === 0 
            ? '<div class="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg text-sm flex justify-between items-center"><span>No prescriptions logged yet.</span></div>'
            : history.map((item, index) => {
                const medicationDisplay = item.medication.split(',')[0]; 
                return `<div class="p-4 glass-card-lite flex justify-between items-start">
                    <div class="flex-1 min-w-0">
                        <p class="font-bold text-base truncate">${medicationDisplay}</p>
                        <p class="text-xs text-gray-500">Dr. ${item.doctor} - ${item.date}</p>
                        <p class="text-xs text-blue-500 mt-1 cursor-pointer hover:underline" onclick="viewPrescription(${index})">View Details</p>
                    </div>
                    <button class="text-red-500 hover:text-red-700 p-1 rounded" onclick="deletePrescription(${index})">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </div>`;
            }).join('');
        if(typeof lucide !== 'undefined') lucide.createIcons();
    };

    const fileInput = document.getElementById('pres-file-input');
    const uploadArea = document.getElementById('upload-area');
    if(uploadArea && fileInput) {
        uploadArea.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const base64Image = event.target.result;
                    uploadCounter++; 
                    const index = uploadCounter % 3;
                    let newPrescription = index === 1 
                        ? { doctor: "Dr. L. Ganesh, Cardiologist", diagnosis: "Mild Hypertension", medication: "Aspirin 81mg, 1x/day for 90 days", date: new Date().toLocaleDateString(), image: base64Image }
                        : index === 2 
                        ? { doctor: "Dr. P. Swamy, Ortho", diagnosis: "Ligament Strain", medication: "Ibuprofen 400mg, 2x/day PRN", date: new Date().toLocaleDateString(), image: base64Image }
                        : { doctor: "Dr. M. Shantha, General", diagnosis: "Vitamin Deficiency", medication: "Vitamin D3 1000 IU, 1x/day for 60 days", date: new Date().toLocaleDateString(), image: base64Image };
                    
                    let history = JSON.parse(localStorage.getItem('presHistory')) || [];
                    history.unshift(newPrescription);
                    localStorage.setItem('presHistory', JSON.stringify(history));
                    window.viewPrescription(0); 
                    renderHistory();
                    window.addNotification("Prescription Scanned", `New medication logged: ${newPrescription.medication.split(',')[0]}`, "green");
                }
                reader.readAsDataURL(file); 
            }
        });
    }

    function renderHospitalResults(query) {
        const listContainer = document.getElementById('hospital-results-list');
        const q = query.toLowerCase().trim();
        const results = hospitalData.filter(h => h.specialties.toLowerCase().includes(q) || h.name.toLowerCase().includes(q));
        if (!listContainer) return;
        if (q.length < 3) return; 

        // ... rendering logic omitted for brevity ...
        listContainer.innerHTML = results.map(hospital => 
            `<div class="glass-card p-4 rounded-xl border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
                <h5 class="text-lg font-bold">${hospital.name}</h5>
                <p class="text-xs">Specialties: ${hospital.specialties}</p>
            </div>`
        ).join('');
        if(typeof lucide !== 'undefined') lucide.createIcons();
    }
    const searchInput = document.getElementById('hospital-search-input');
    if (searchInput) {
        renderHospitalResults(''); 
        searchInput.addEventListener('input', (e) => renderHospitalResults(e.target.value));
    }
    
    renderInventory = function() {
        let activeDrugs = JSON.parse(localStorage.getItem('activeDrugs')) || [];
        const inventoryList = document.getElementById('medication-inventory-list');
        const alertPanel = document.getElementById('interaction-alerts');
        const interactionList = document.getElementById('interaction-list');
        
        if (!inventoryList) return;
        inventoryList.innerHTML = activeDrugs.length === 0 
            ? '<div class="text-center py-4 text-gray-400 text-sm">No medications currently active.</div>'
            : activeDrugs.map(drug => `<div class="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg flex justify-between items-center text-sm"><span>${drug.charAt(0).toUpperCase() + drug.slice(1)}</span><button class="text-red-500 hover:text-red-700" onclick="deleteDrug('${drug}')"><i data-lucide="x" class="w-4 h-4"></i></button></div>`).join('');

        const alerts = [];
        activeDrugs.forEach(drugA => {
            const forbidden = interactionDB[drugA];
            if (forbidden) {
                forbidden.forEach(drugB => {
                    if (activeDrugs.includes(drugB)) {
                        const alertMsg = `${drugA.charAt(0).toUpperCase() + drugA.slice(1)} interacts with ${drugB.charAt(0).toUpperCase() + drugB.slice(1)}. Consult a doctor!`;
                        if (!alerts.includes(alertMsg)) alerts.push(alertMsg);
                    }
                });
            }
        });

        if (alerts.length > 0) {
            interactionList.innerHTML = alerts.map(msg => `<li>${msg}</li>`).join('');
            alertPanel.classList.remove('hidden');
        } else {
            alertPanel.classList.add('hidden');
        }

        if(typeof lucide !== 'undefined') lucide.createIcons();
    };
    
    function syncAndRenderMeds() {
        const history = JSON.parse(localStorage.getItem('presHistory')) || [];
        let activeDrugs = JSON.parse(localStorage.getItem('activeDrugs')) || [];
        history.forEach(item => {
            const drugName = item.medication.split(' ')[0].toLowerCase();
            if (drugName && !activeDrugs.includes(drugName)) {
                activeDrugs.push(drugName);
            }
        });
        localStorage.setItem('activeDrugs', JSON.stringify(activeDrugs));
        renderInventory();
    }

    if(document.getElementById('manual-drug-form')) document.getElementById('manual-drug-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('manual-drug-name');
        const drug = input.value.trim().toLowerCase();
        if (drug) {
            let activeDrugs = JSON.parse(localStorage.getItem('activeDrugs')) || [];
            if (!activeDrugs.includes(drug)) {
                activeDrugs.push(drug);
                localStorage.setItem('activeDrugs', JSON.stringify(activeDrugs));
                input.value = '';
                renderInventory();
                window.addNotification("Drug Added", `${drug.charAt(0).toUpperCase() + drug.slice(1)} added to inventory.`, "blue");
            } else {
                alert(`${drug} is already in your inventory.`);
            }
        }
    });

    // ------------------------------------------
    // E. PREDICTIVE CALENDAR & SCHEDULER
    // ------------------------------------------
    function updatePredictiveCalendar() {
        const hr = simState.hr;
        const bpSys = simState.bpSys;
        let prediction = {};
        
        if (!window.watchConnected && !simState.isManual) {
            prediction = { title: "Monitoring Inactive", msg: "Connect a device or log vitals to begin analysis.", status: "Inactive", color: "from-slate-600 to-slate-700", icon: "activity", action: "N/A" };
        } else if (hr < 65 && bpSys < 110) {
            prediction = { title: "Optimal Recovery Window", msg: "Vitals suggest deep rest is needed for peak biological repair.", status: "Deep Rest", color: "from-purple-600 to-indigo-600", icon: "moon", action: "Schedule Meditation/Sleep" };
        } else if (hr >= 65 && hr <= 85 && bpSys <= 130) {
            prediction = { title: "Peak Performance Window", msg: "Excellent energy and stable vitals. Ideal time for high-intensity activity.", status: "Peak Energy", color: "from-green-600 to-teal-600", icon: "zap", action: "Schedule High-Intensity Workout" };
        } else if (hr > 100 || bpSys > 140) {
            prediction = { title: "Stress/High Alert", msg: "High heart rate or blood pressure detected. Prioritize light breathing and hydration.", status: "Caution", color: "from-red-600 to-orange-600", icon: "alert-octagon", action: "Schedule Rest/Hydration" };
        } else {
            prediction = { title: "Stable/Active", msg: "Vitals are stable. Moderate intensity workouts are recommended.", status: "Normal", color: "from-indigo-600 to-blue-700", icon: "sun", action: "Schedule Moderate Activity" };
        }

        const widget = document.getElementById('predictive-widget');
        if (widget) {
            widget.className = `glass-card p-6 rounded-2xl bg-gradient-to-br ${prediction.color} text-white`;
            if (document.getElementById('predictive-title')) document.getElementById('predictive-title').innerHTML = `<i data-lucide="${prediction.icon}"></i> ${prediction.title}`;
            if (document.getElementById('predictive-recommendation')) document.getElementById('predictive-recommendation').innerText = prediction.msg;
            if (document.getElementById('predictive-metrics')) document.getElementById('predictive-metrics').innerHTML = `<span>HR: ${Math.floor(hr)} bpm</span> | <span>BP: ${simState.bpSys}/${simState.bpDia} mmHg</span> | <span>Status: ${prediction.status}</span>`;
            if(typeof lucide !== 'undefined') lucide.createIcons();
        }
        
        return prediction;
    }

    function updateSchedulerModal() {
        const prediction = updatePredictiveCalendar();
        const summaryPanel = document.getElementById('schedule-prediction-summary');
        const remList = document.getElementById('schedule-reminder-list');
        const setBtn = document.getElementById('set-peak-reminder-btn');
        
        if(summaryPanel) summaryPanel.innerHTML = `
            <p class="text-3xl font-extrabold text-blue-500 dark:text-teal-300 mb-2">${prediction.status}</p>
            <p class="text-sm font-semibold">${prediction.title}</p>
            <p class="text-xs text-gray-600 dark:text-gray-300 mt-1">${prediction.msg}</p>
            <p class="text-sm text-blue-500 dark:text-blue-400 mt-3 font-bold">Action Recommended: ${prediction.action}</p>
        `;

        const reminders = JSON.parse(localStorage.getItem('healthReminders')) || [];
        if (remList) remList.innerHTML = reminders.length === 0 
            ? '<div class="text-center py-6 text-gray-400 text-sm">No active reminders.</div>'
            : reminders.map((r, i) => `<div class="p-3 border border-slate-200 dark:border-slate-700 rounded-lg flex justify-between items-center bg-white dark:bg-slate-800"><div><p class="font-bold">${r.name}</p><p class="text-xs text-blue-500">${r.time}</p></div><button class="text-red-500 hover:text-red-700 p-1" onclick="deleteRem(${i})"><i data-lucide="trash-2" class="w-4 h-4"></i></button></div>`).join('');
        if(typeof lucide !== 'undefined') lucide.createIcons();

        if (setBtn) {
            if (prediction.status === "Peak Energy") {
                setBtn.classList.remove('hidden');
                setBtn.onclick = () => { window.addNotification("Peak Activity Scheduled", "Reminder set for 30 minutes to maximize peak energy window.", "green"); }; 
            } else {
                setBtn.classList.add('hidden');
            }
        }
    }

    getUsersLocality();
    updatePredictiveCalendar();
});