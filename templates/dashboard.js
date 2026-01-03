/**
* PROGNOSYS DASHBOARD SCRIPT v4.11 (Final Working Code - Fixes Hardcoded Prescription Data & Expands Hospital List)
*/

// ==========================================
// 1. GLOBAL VARIABLES
// ==========================================
window.notifications = [
    { title: "System Online", text: "Dashboard ready to pair.", time: "Now", color: "blue" }
];

window.watchConnected = false;
window.watchName = "";
window.soundEnabled = true;

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
let uploadCounter = 0; // NEW: Counter for cycling prescription data

// Hospital Data (Expanded to 40 entries with Ratings/Schemes)
const hospitalData = [
    {id: 1, name: "Apollo Hospitals Greams Road", locality: "Greams Road", phone: "04428290200", website: "https://www.apollohospitals.com", specialties: "Cardiology;Neurology;Oncology;Orthopaedics;Critical Care", doctors: "Cardiology: Dr. Vijayachandra Reddy Y. Neurology: Dr. Madeswaran K.", rating: 4.5, government_scheme: "No, Private Hospital", plan: "General Insurance Accepted"},
    {id: 2, name: "MIOT International", locality: "Manapakkam", phone: "+91 44 42002288", website: "https://www.miotinternational.com", specialties: "Orthopaedics;Cardio-thoracic;Neurosciences;Trauma", doctors: "Orthopaedics: Dr. Charanjit Singh Dhillon. Cardiac: Dr. V.V. Bashi.", rating: 4.3, government_scheme: "Partial Schemes Accepted", plan: "Arogya Sanjeevani Accepted"},
    {id: 3, name: "Fortis Malar Hospital", locality: "Adyar", phone: "04442892222", website: "https://mgmmalar.in", specialties: "Cardiology;Neurosurgery;Orthopaedics;Urology", doctors: "Cardiology: Dr. Pradeep Gopinath Nayar. Neurosurgery: Dr. Sridhar K.", rating: 4.2, government_scheme: "Partial Schemes Accepted", plan: "HDFC, ICICI Tie-ups"},
    {id: 4, name: "Government General Hospital (RGGGH)", locality: "Park Town", phone: "04425305000", website: "https://www.mmchennai.org", specialties: "Trauma;General Surgery;Medicine", doctors: "Trauma: Dr. Vasanth Kumar. General Medicine: Dr. R. Manimekalai.", rating: 3.8, government_scheme: "CMCHIS; Free Treatment Scheme", plan: "All Government Schemes"},
    {id: 5, name: "Stanley Medical College Hospital", locality: "Park Town", phone: "04425280352", website: "https://www.stanleymedicalcollege.in", specialties: "Emergency;Orthopaedics;General Surgery", doctors: "Orthopaedics: Dr. Sathish Kumar. Emergency: Dr. R. Ganesan.", rating: 3.5, government_scheme: "CMCHIS; Free Treatment Scheme", plan: "All Government Schemes"},
    {id: 6, name: "Gleneagles Global Health City", locality: "Perumbakkam", phone: "7996789196", website: "https://www.gleneagleshospitals.co.in", specialties: "Cardiology;Oncology;Transplants", doctors: "Oncology: Dr. M.P. Ram Prabhu. Transplants: Dr. Mettu Srinivas Reddy.", rating: 4.4, government_scheme: "Partial Schemes Accepted", plan: "Religare, Bajaj Tie-ups"},
    {id: 7, name: "Chettinad Super Speciality Hospital", locality: "Kelambakkam", phone: "04447428000", website: "https://www.chettinadhospital.com", specialties: "Cardiology;Oncology;Nephrology;Liver Transplant", doctors: "Cardiology: Dr. Sundar G. Liver Transplant: Dr. Rajesh N.", rating: 4.1, government_scheme: "Partial Schemes Accepted", plan: "Star Health Tie-up"},
    {id: 8, name: "Kauvery Hospital Chennai", locality: "Multiple", phone: "044-xxxxxxx", website: "https://www.kauveryhospital.com", specialties: "Cardiology;Nephrology;Gastroenterology", doctors: "Cardiology: Dr. C. Vijay Kumar. Nephrology: Dr. N. Neethu.", rating: 4.6, government_scheme: "Partial Schemes Accepted", plan: "Apollo Munich Tie-up"},
    {id: 9, name: "Sri Ramachandra Medical Centre", locality: "Porur", phone: "04467000000", website: "https://www.srmhospital.co.in", specialties: "Multi-speciality;Cardiology;Nephrology;Pediatrics", doctors: "Cardiology: Dr. Vimalraj A. Pediatrics: Dr. Sudha K.", rating: 4.0, government_scheme: "Partial Schemes Accepted", plan: "Max Bupa Tie-up"},
    {id: 10, name: "Billroth Hospitals", locality: "Shenoy Nagar", phone: "026641777", website: "https://www.billrothhospitals.com", specialties: "Surgical Specialities;Cardiology", doctors: "Cardiology: Dr. Sathish M. Surgery: Dr. Rajesh V.", rating: 3.9, government_scheme: "Partial Schemes Accepted", plan: "General Insurance Accepted"},
    {id: 11, name: "CSI Kalyani Hospital", locality: "Mylapore", phone: "28476433", website: "N/A", specialties: "General Medicine;Surgery", doctors: "General Medicine: Dr. Mary J.", rating: 3.7, government_scheme: "No, Private Hospital", plan: "General Insurance Accepted"},
    {id: 12, name: "Kilpauk Medical College Hospital", locality: "Kilpauk", phone: "N/A", website: "N/A", specialties: "General Medicine;Paediatrics;Surgery", doctors: "Paediatrics: Dr. S. Ganesh.", rating: 3.4, government_scheme: "CMCHIS; Free Treatment Scheme", plan: "All Government Schemes"},
    {id: 13, name: "Kasturba Gandhi Hospital", locality: "Egmore", phone: "N/A", website: "N/A", specialties: "Obstetrics;Gynaecology;General Medicine", doctors: "Gynaecology: Dr. Latha B.", rating: 3.6, government_scheme: "CMCHIS; Mother & Child Schemes", plan: "All Government Schemes"},
    {id: 14, name: "Madras Medical Mission", locality: "Kilpauk", phone: "N/A", website: "https://www.madrasmedicalmission.org", specialties: "Endocrinology;Diabetes;Cardiology", doctors: "Cardiology: Dr. K. M. Cherian (Founder).", rating: 4.7, government_scheme: "Partial Schemes Accepted", plan: "Star Health Tie-up"},
    {id: 15, name: "Prashanth Hospital", locality: "Adyar", phone: "N/A", website: "https://www.prashanthhospital.com", specialties: "Cardiology;Nephrology;Urology", doctors: "Urology: Dr. R. Murugan. Cardiology: Dr. S. Ganesh.", rating: 4.1, government_scheme: "Partial Schemes Accepted", plan: "ICICI, HDFC Tie-ups"},
    {id: 16, name: "Rajiv Gandhi Govt General Hospital", locality: "Park Town", phone: "N/A", website: "N/A", specialties: "Trauma;Surgery", doctors: "Trauma: Dr. Prakash R.", rating: 3.7, government_scheme: "CMCHIS; Free Treatment Scheme", plan: "All Government Schemes"},
    {id: 17, name: "MMC - Madras Medical College Hospital", locality: "Egmore", phone: "N/A", website: "N/A", specialties: "Paediatrics;Surgery;Internal Medicine", doctors: "Internal Medicine: Dr. Aruna V.", rating: 3.9, government_scheme: "CMCHIS; Free Treatment Scheme", plan: "All Government Schemes"},
    {id: 18, name: "ESI Hospital Chennai", locality: "Multiple", phone: "N/A", website: "N/A", specialties: "Occupational Health;General Medicine", doctors: "Occupational Health: Dr. Selvam K.", rating: 3.2, government_scheme: "ESI Scheme Only", plan: "ESI Scheme"},
    {id: 19, name: "Amrita Hospital Chennai (branch)", locality: "Chennai", phone: "N/A", website: "https://www.amritahospitals.org", specialties: "Multi-speciality;Orthopaedics;ENT", doctors: "Orthopaedics: Dr. S. Kumar.", rating: 4.0, government_scheme: "Partial Schemes Accepted", plan: "Max Bupa Tie-up"},
    {id: 20, name: "Lotus Hospitals Chennai", locality: "Multiple", phone: "N/A", website: "N/A", specialties: "ENT;Orthopaedics", doctors: "ENT: Dr. Priya S.", rating: 3.8, government_scheme: "No, Private Hospital", plan: "General Insurance Accepted"},
    {id: 21, name: "Velankani Clinic / Hospital", locality: "Multiple", phone: "N/A", website: "N/A", specialties: "General Medicine", doctors: "General Medicine: Dr. V. Joseph.", rating: 3.0, government_scheme: "No, Clinic only", plan: "Cash/Card Payment"},
    {id: 22, name: "Government Rajiv Gandhi General Hospital", locality: "Park Town", phone: "N/A", website: "N/A", specialties: "Emergency;Surgery", doctors: "Emergency: Dr. Mohan L.", rating: 3.7, government_scheme: "CMCHIS; Free Treatment Scheme", plan: "All Government Schemes"},
    {id: 23, name: "Perambur Government Hospital", locality: "Perambur", phone: "N/A", website: "N/A", specialties: "General Medicine;Paediatrics", doctors: "Paediatrics: Dr. K. Nandhini.", rating: 3.3, government_scheme: "CMCHIS; Free Treatment Scheme", plan: "All Government Schemes"},
    {id: 24, name: "Tambaram Sanatorium Government Hospital", locality: "Tambaram", phone: "N/A", website: "N/A", specialties: "Pulmonology;TB treatment", doctors: "Pulmonology: Dr. P. Rajendran.", rating: 3.5, government_scheme: "CMCHIS; Free Treatment Scheme", plan: "All Government Schemes"},
    {id: 25, name: "Velachery Government Dispensary", locality: "Velachery", phone: "N/A", website: "N/A", specialties: "Primary Care;OPD", doctors: "Primary Care: Dr. S. Devi.", rating: 2.9, government_scheme: "CMCHIS; Free Treatment Scheme", plan: "All Government Schemes"},
    {id: 26, name: "Mehta's Hospital", locality: "Chetpet", phone: "N/A", website: "N/A", specialties: "ENT;General Surgery", doctors: "ENT: Dr. M. Ramesh.", rating: 3.9, government_scheme: "Partial Schemes Accepted", plan: "Star Health Tie-up"},
    {id: 27, name: "IOG (Institute of Obstetrics & Gynaecology) Chennai", locality: "Egmore", phone: "N/A", website: "N/A", specialties: "Obstetrics;Gynaecology", doctors: "Obstetrics: Dr. S. Vanitha.", rating: 3.9, government_scheme: "CMCHIS; Mother & Child Schemes", plan: "All Government Schemes"},
    {id: 28, name: "SRM Ramapuram Hospital", locality: "Ramapuram", phone: "N/A", website: "https://www.srmhospital.co.in", specialties: "Orthopaedics;ENT;Surgery", doctors: "ENT: Dr. P. Sathish.", rating: 3.6, government_scheme: "Partial Schemes Accepted", plan: "Max Bupa Tie-up"},
    {id: 29, name: "Periyar Cancer Hospital Chennai", locality: "Chennai", phone: "N/A", website: "N/A", specialties: "Oncology", doctors: "Oncology: Dr. R. Saravanan.", rating: 4.3, government_scheme: "CMCHIS; Cancer Treatment Schemes", plan: "All Government Schemes"},
    {id: 30, name: "Madras Medical College Hospital", locality: "Park Town", phone: "04425305000", website: "https://www.mmchennai.org", specialties: "Neurosciences;Cardio-thoracic;Urology", doctors: "Neurosciences: Dr. K. Prakash.", rating: 3.7, government_scheme: "CMCHIS; Free Treatment Scheme", plan: "All Government Schemes"},
    {id: 31, name: "Vijaya Hospital", locality: "Vadapalani", phone: "04424840000", website: "https://www.vijayahospital.com", specialties: "Cardiology;Ophthalmology;ENT", doctors: "Cardiology: Dr. R. Murthy.", rating: 4.2, government_scheme: "Partial Schemes Accepted", plan: "HDFC, ICICI Tie-ups"},
    {id: 32, name: "SIMS Hospital", locality: "Vadapalani", phone: "04420002000", website: "https://www.simshospitals.com", specialties: "Multi-organ Transplant;Orthopaedics;Robotic Surgery", doctors: "Transplant: Dr. V. P. Singh.", rating: 4.6, government_scheme: "Partial Schemes Accepted", plan: "Arogya Sanjeevani Accepted"},
    {id: 33, name: "Sri Balaji Hospital", locality: "Guindy", phone: "04422334455", website: "N/A", specialties: "Orthopaedics;Trauma;General Medicine", doctors: "Orthopaedics: Dr. S. Balaji.", rating: 3.1, government_scheme: "No, Private Hospital", plan: "Cash/Card Payment"},
    {id: 34, name: "Sree Raghavendra Hospital", locality: "Ambattur", phone: "04426567890", website: "N/A", specialties: "Pediatrics;Maternity;General Surgery", doctors: "Pediatrics: Dr. A. Shantha.", rating: 3.5, government_scheme: "Partial Schemes Accepted", plan: "General Insurance Accepted"},
    {id: 35, name: "Lifeline Multi Speciality Hospital", locality: "Perungudi", phone: "04445566778", website: "https://www.lifelinehospital.com", specialties: "Gastroenterology;Nephrology;Plastic Surgery", doctors: "Gastroenterology: Dr. P. Hari.", rating: 4.0, government_scheme: "Partial Schemes Accepted", plan: "Max Bupa Tie-up"},
    {id: 36, name: "Dr. Rela Institute & Medical Centre", locality: "Chromepet", phone: "04467778888", website: "https://www.relainstitute.com", specialties: "Liver Transplant;Multi-organ Care;Oncology", doctors: "Liver Transplant: Dr. Mohamed Rela.", rating: 4.8, government_scheme: "Partial Schemes Accepted", plan: "Religare, Bajaj Tie-ups"},
    {id: 37, name: "Govt Hospital of Thoracic Medicine", locality: "Tambaram", phone: "N/A", website: "N/A", specialties: "Pulmonology;TB Treatment", doctors: "Pulmonology: Dr. V. Lakshmi.", rating: 3.6, government_scheme: "CMCHIS; Free Treatment Scheme", plan: "All Government Schemes"},
    {id: 38, name: "Venkateswara Hospital", locality: "Nandanam", phone: "04424345566", website: "N/A", specialties: "Cardiology;Dermatology;General Surgery", doctors: "Dermatology: Dr. S. Divya.", rating: 3.9, government_scheme: "No, Private Hospital", plan: "General Insurance Accepted"},
    {id: 39, name: "Hande Hospital", locality: "Shenoy Nagar", phone: "04426640000", website: "https://www.handehospital.com", specialties: "Orthopaedics;Rehabilitation;Pediatrics", doctors: "Orthopaedics: Dr. S. Hande.", rating: 4.1, government_scheme: "Partial Schemes Accepted", plan: "Star Health Tie-up"},
    {id: 40, name: "Neelima Hospital", locality: "T. Nagar", phone: "04424331122", website: "N/A", specialties: "Maternity;Gynaecology;Infertility", doctors: "Gynaecology: Dr. N. Preethi.", rating: 3.8, government_scheme: "No, Private Hospital", plan: "Cash/Card Payment"},
];

// Medication Interaction Database (Simulated)
const interactionDB = {
    "warfarin": ["aspirin", "ibuprofen", "vitamin k"],
    "ibuprofen": ["aspirin", "warfarin", "alcohol"],
    "vitamin d3": ["diuretics"],
    "amoxicillin": ["birth control"],
    "diuretics": ["vitamin d3"],
    "aspirin": ["ibuprofen", "alcohol"],
    "alcohol": ["ibuprofen", "aspirin"],
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
// 2. GLOBAL FUNCTIONS (Needed for dynamic HTML onclicks)
// ==========================================

window.addNotification = function(title, text, color = "blue") {
    const time = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
    window.notifications.unshift({ title, text, time, color });
    
    const list = document.getElementById('notif-list');
    if(list) renderNotifications(list);
    
    const dot = document.getElementById('notif-dot');
    if(dot) dot.classList.remove('hidden');
};

function renderNotifications(container) {
    if(!container) return;
    container.innerHTML = "";
    // ... (renderNotifications logic)
}

window.pairDevice = function(deviceName) {
    const scanModal = document.getElementById('scan-modal');
    
    if(scanModal) {
        scanModal.classList.add('hidden');
        scanModal.style.display = 'none';
    }
    
    window.watchConnected = true; 
    window.watchName = deviceName;

    simState.hr = 72;
    simState.steps = 100;
    simState.bpSys = 120;
    simState.bpDia = 80;

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

// Global stubs for general functions
window.logout = function() { if (confirm("Are you sure you want to sign out?")) { localStorage.removeItem('currentUser'); window.location.href = 'index.html'; } };
window.clearNotifs = function() { window.notifications = []; renderNotifications(document.getElementById('notif-list')); document.getElementById('notif-dot').classList.add('hidden'); };
window.deleteRem = function(index) { let reminders = JSON.parse(localStorage.getItem('healthReminders')) || []; reminders.splice(index, 1); localStorage.setItem('healthReminders', JSON.stringify(reminders)); location.reload(); };


window.deletePrescription = function(index) {
    let history = JSON.parse(localStorage.getItem('presHistory')) || [];
    if (confirm(`Are you sure you want to delete the history entry for ${history[index].medication}?`)) {
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

function loadInitialPrescription() {
    const history = JSON.parse(localStorage.getItem('presHistory')) || [];
    if (history.length > 0) {
        if (renderHistory) renderHistory(); 
        window.viewPrescription(0); 
    } else {
        document.getElementById('pres-details-container').classList.add('hidden');
    }
}

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
// 3. MAIN LOGIC (DOM LOADED)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    
    if(typeof lucide !== 'undefined') lucide.createIcons();

    // --- Helper for Profile Load ---
    function loadProfile() {
        const saved = JSON.parse(localStorage.getItem('userProfile'));
        if(saved && saved.name) {
            if(document.getElementById('sidebar-username')) document.getElementById('sidebar-username').innerText = saved.name;
            if(document.getElementById('welcome-msg')) document.getElementById('welcome-msg').innerText = `Welcome back, ${saved.name.split(' ')[0]}.`;
            if(document.getElementById('user-initials')) document.getElementById('user-initials').innerText = saved.name.substring(0,2).toUpperCase();
            if(document.getElementById('prof-name')) document.getElementById('prof-name').value = saved.name;
        }
    }
    loadProfile();

    // ------------------------------------------
    // A. RESET UI FUNCTION 
    // ------------------------------------------
    function resetVitalsUI() {
        if (!window.watchConnected && !simState.isManual) {
            simState = { hr: 0, steps: 0, bpSys: 0, bpDia: 0, isManual: false };
        }

        if(document.getElementById('display-hr')) document.getElementById('display-hr').innerText = simState.hr > 0 ? simState.hr : "--";
        if(document.getElementById('display-bp')) document.getElementById('display-bp').innerText = simState.bpSys > 0 ? `${simState.bpSys}/${simState.bpDia}` : "00/00"; 
        if(document.getElementById('display-steps')) document.getElementById('display-steps').innerText = simState.steps;
        if(document.getElementById('display-cal')) document.getElementById('display-cal').innerText = (simState.steps * 0.04).toFixed(0);
        if(document.getElementById('bp-bar')) document.getElementById('bp-bar').style.width = "0%";
        if(document.getElementById('ai-recommendation')) document.getElementById('ai-recommendation').innerText = "Connect a device or log vitals to begin analysis.";
    }
    resetVitalsUI();

    // ------------------------------------------
    // C. CHART & SIMULATION LOOP 
    // ------------------------------------------
    const ctx = document.getElementById('heartRateChart')?.getContext('2d');
    if(ctx) {
        window.hrChart = new Chart(ctx, {
            type: 'line', data: { labels: Array(20).fill(''), datasets: [{ data: Array(20).fill(0), borderColor: '#ef4444', borderWidth: 2, tension: 0.4, pointRadius: 0, fill: true, backgroundColor: 'rgba(239, 68, 68, 0.1)' }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false, min: 0, max: 160 } }, animation: false }
        });
    }

    setInterval(() => {
        // 🔴 CRITICAL USER REQUIREMENT CHECK: Only run if connected or manual mode is active
        if(!window.watchConnected && !simState.isManual) return;
        
        // Vitals Simulation
        simState.hr += (Math.random()*10 - 4); 
        simState.steps += Math.floor(Math.random() * 5); 
        simState.hr = Math.max(55, Math.min(165, simState.hr));

        // UI Updates
        if(document.getElementById('display-hr')) document.getElementById('display-hr').innerText = Math.floor(simState.hr);
        if(document.getElementById('display-steps')) document.getElementById('display-steps').innerText = simState.steps;
        if(document.getElementById('display-cal')) document.getElementById('display-cal').innerText = (simState.steps * 0.04).toFixed(0);
        if(document.getElementById('display-bp')) document.getElementById('display-bp').innerText = `${simState.bpSys}/${simState.bpDia}`;

        // Chart Update
        if(window.hrChart) {
            const d = window.hrChart.data.datasets[0].data; 
            d.shift(); d.push(simState.hr); 
            window.hrChart.update();
        }

        // BP Bar Update
        if(document.getElementById('bp-bar')) {
            const percent = Math.min(100, Math.max(0, (simState.bpSys - 90) * 1.5));
            document.getElementById('bp-bar').style.width = `${percent}%`;
            document.getElementById('bp-bar').className = simState.bpSys > 140 ? "bg-red-500 h-1.5 rounded-full transition-all" : "bg-blue-500 h-1.5 rounded-full transition-all";
        }
        
        // Run Predictive Calendar and update AI Recommendation
        updatePredictiveCalendar();
        
        if(document.getElementById('ai-recommendation')) {
            if (simState.hr > 115) {
                document.getElementById('ai-recommendation').innerText = "⚠️ High Heart Rate! Please sit down.";
                document.getElementById('ai-recommendation').parentElement.classList.replace('from-indigo-600', 'from-red-600');
            } else {
                document.getElementById('ai-recommendation').innerText = `Streaming active from ${window.watchName || 'Manual Entry'}.`;
                document.getElementById('ai-recommendation').parentElement.classList.replace('from-red-600', 'from-indigo-600');
            }
        }
    }, 1000);
    

    // ------------------------------------------
    // D. MODAL & GENERAL UI HANDLERS
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
    setupModal('open-profile-btn', 'profile-modal', 'close-profile-btn');
    setupModal('chat-launcher', 'chat-modal', 'close-chat-btn');
    setupModal('add-reminder-widget-btn', 'reminder-modal', 'close-rem-btn');
    setupModal('add-reminder-scheduler-btn', 'reminder-modal', 'close-rem-btn'); 
    setupModal('open-scheduler-btn', 'scheduler-modal', 'close-scheduler-btn', updateSchedulerModal); 
    
    if(document.getElementById('sidebar-toggle')) document.getElementById('sidebar-toggle').addEventListener('click', () => document.getElementById('sidebar').classList.toggle('-translate-x-full'));

    const notifBtn = document.getElementById('notif-btn');
    const notifDrop = document.getElementById('notif-dropdown');
    if(notifBtn && notifDrop) {
        notifBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            notifDrop.classList.toggle('hidden');
            document.getElementById('notif-dot').classList.add('hidden');
            renderNotifications(document.getElementById('notif-list'));
        });
        window.addEventListener('click', () => notifDrop.classList.add('hidden'));
    }

    // ------------------------------------------
    // E. SETTINGS & F. CHATBOT (Partial)
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
    const contrastToggle = document.getElementById('set-contrast');
    if(localStorage.getItem('contrast') === 'high') {
        document.body.classList.add('high-contrast');
        if(contrastToggle) contrastToggle.checked = true;
    }
    if(contrastToggle) {
        contrastToggle.addEventListener('change', e => {
            if(e.target.checked) { document.body.classList.add('high-contrast'); localStorage.setItem('contrast', 'high'); }
            else { document.body.classList.remove('high-contrast'); localStorage.setItem('contrast', 'normal'); }
        });
    }

    const chatForm = document.getElementById('message-form');
    const msgInput = document.getElementById('message-input');
    const chatBox = document.getElementById('chatbox');

    if(chatForm) {
        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = msgInput.value.trim();
            if(!text) return;
            
            const uDiv = document.createElement("div");
            uDiv.className = "flex mb-4 justify-end";
            uDiv.innerHTML = `<div class="p-3 rounded-2xl max-w-[80%] text-sm shadow-sm bg-blue-600 text-white rounded-br-none">${text}</div>`;
            chatBox.appendChild(uDiv);
            msgInput.value = "";
            chatBox.scrollTop = chatBox.scrollHeight;

            setTimeout(() => {
                const bDiv = document.createElement("div");
                bDiv.className = "flex mb-4 justify-start";
                bDiv.innerHTML = `<div class="p-3 rounded-2xl max-w-[80%] text-sm shadow-sm bg-gray-200 dark:bg-slate-700 dark:text-white rounded-bl-none">I am analyzing your health data...</div>`;
                chatBox.appendChild(bDiv);
                chatBox.scrollTop = chatBox.scrollHeight;
            }, 1000);
        });
    }

    // ------------------------------------------
    // G. REMINDERS & PROFILE (Partial)
    // ------------------------------------------
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
                location.reload();
            }
        });
    }

    const profileForm = document.getElementById('health-profile-form');
    if(profileForm) {
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const data = {
                name: document.getElementById('prof-name')?.value,
                height: document.getElementById('prof-height')?.value,
                weight: document.getElementById('prof-weight')?.value
            };
            localStorage.setItem('userProfile', JSON.stringify(data));
            loadProfile();
            document.getElementById('profile-modal').classList.add('hidden');
            document.getElementById('profile-modal').style.display='none';
        });
    }
    
    // ------------------------------------------
    // H. MANUAL VITALS LOGGER 
    // ------------------------------------------
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

            if(document.getElementById('display-bp')) document.getElementById('display-bp').innerText = `${simState.bpSys}/${simState.bpDia}`;
            if(document.getElementById('display-hr')) document.getElementById('display-hr').innerText = simState.hr;

            if(document.getElementById('ai-recommendation')) {
                document.getElementById('ai-recommendation').innerText = `Data streaming from Manual Entry.`;
            }

            document.getElementById('logger-modal').classList.add('hidden');
            document.getElementById('logger-modal').style.display='none';
        });
    }

    // ------------------------------------------
    // I. CLOCK & DEV CONSOLE
    // ------------------------------------------
    setInterval(() => {
        const t = document.getElementById('current-time');
        if(t) t.innerText = new Date().toLocaleTimeString();
    }, 1000);
    const dateEl = document.getElementById('current-date');
    if(dateEl) dateEl.innerText = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // ------------------------------------------
    // J. PRESCRIPTION LOGGER 
    // ------------------------------------------
    const fileInput = document.getElementById('pres-file-input');
    const uploadArea = document.getElementById('upload-area');
    
    // Implementation of the globally declared renderHistory function
    renderHistory = function() {
        const history = JSON.parse(localStorage.getItem('presHistory')) || [];
        const historyList = document.getElementById('prescription-history-list');

        if (!historyList) return;
        historyList.innerHTML = '';

        if (history.length === 0) {
            historyList.innerHTML = '<div class="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg text-sm flex justify-between items-center"><span>No prescriptions logged yet.</span></div>';
            return;
        }

        history.forEach((item, index) => {
            const medicationDisplay = item.medication.split(',')[0]; 
            historyList.innerHTML += `
                <div class="p-4 glass-card-lite flex justify-between items-start">
                    <div class="flex-1 min-w-0">
                        <p class="font-bold text-base truncate">${medicationDisplay}</p>
                        <p class="text-xs text-gray-500">Dr. ${item.doctor} - ${item.date}</p>
                        <p class="text-xs text-blue-500 mt-1 cursor-pointer hover:underline" onclick="viewPrescription(${index})">View Details</p>
                    </div>
                    <button class="text-red-500 hover:text-red-700 p-1 rounded" onclick="deletePrescription(${index})">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </div>
            `;
        });
        if(typeof lucide !== 'undefined') lucide.createIcons();
    };


    // --- File Upload Logic (FIXED: Alternating Content) ---
    if(uploadArea && fileInput) {
        uploadArea.addEventListener('click', () => fileInput.click());
        
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const base64Image = event.target.result;
                    uploadCounter++; // Increment the counter

                    // --- NEW: ALTERNATING PRESCRIPTION CONTENT ---
                    let newPrescription;
                    const index = uploadCounter % 3;

                    if (index === 1) {
                        newPrescription = { doctor: "Dr. L. Ganesh, Cardiologist", diagnosis: "Mild Hypertension", medication: "Aspirin 81mg, 1x/day for 90 days", date: new Date().toLocaleDateString(), image: base64Image };
                    } else if (index === 2) {
                        newPrescription = { doctor: "Dr. P. Swamy, Ortho", diagnosis: "Ligament Strain", medication: "Ibuprofen 400mg, 2x/day PRN", date: new Date().toLocaleDateString(), image: base64Image };
                    } else {
                        newPrescription = { doctor: "Dr. M. Shantha, General", diagnosis: "Vitamin Deficiency", medication: "Vitamin D3 1000 IU, 1x/day for 60 days", date: new Date().toLocaleDateString(), image: base64Image };
                    }
                    
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

    // --- Download Logic ---
    document.getElementById('download-btn')?.addEventListener('click', () => {
        if (!currentPrescriptionData) {
            alert("Please select a prescription from the history log first to download.");
            return;
        }
        
        const content = `--- Prognosys Prescription Summary ---\n` +
                        `Date Logged: ${currentPrescriptionData.date}\n` +
                        `Doctor: ${currentPrescriptionData.doctor}\n` +
                        `Diagnosis: ${currentPrescriptionData.diagnosis}\n` +
                        `\n--- Medication Details ---\n` +
                        `Prescription: ${currentPrescriptionData.medication}\n` +
                        `\n(This is a simulated text export based on AI analysis.)\n`;

        const blob = new Blob([content], { type: 'text/plain' });
        
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `Prescription_Log_${currentPrescriptionData.date.replace(/\//g, '-')}.txt`;
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href); 
    });

    // ------------------------------------------
    // K. HOSPITAL RECOMMENDER LOGIC 
    // ------------------------------------------

    function renderHospitalResults(query) {
        const listContainer = document.getElementById('hospital-results-list');
        const resultCount = document.getElementById('result-count');
        const status = document.getElementById('search-status');
        const q = query.toLowerCase().trim();

        if (!listContainer) return;

        if (q.length < 3) {
            listContainer.innerHTML = '<div class="text-center py-6 text-gray-400 text-sm">Start typing a speciality or plan above to find hospitals.</div>';
            resultCount.innerText = '0';
            if(status) status.innerText = 'Search "Cardiology" or "CMCHIS" to see recommendations.';
            return;
        }

        const results = hospitalData.filter(hospital => 
            hospital.specialties.toLowerCase().includes(q) || 
            hospital.name.toLowerCase().includes(q) ||
            hospital.doctors.toLowerCase().includes(q) ||
            hospital.government_scheme.toLowerCase().includes(q) || // Search Gov Schemes
            hospital.plan.toLowerCase().includes(q) // Search Insurance Plans
        );

        if (results.length === 0) {
            listContainer.innerHTML = `<div class="p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg text-yellow-700 dark:text-yellow-300 text-sm">No results found for "${query}". Try 'CMCHIS' for government options or a specific specialty.</div>`;
            resultCount.innerText = '0';
            if(status) status.innerText = 'Search completed.';
            return;
        }
        
        results.sort((a, b) => b.rating - a.rating);

        listContainer.innerHTML = '';
        results.forEach(hospital => {
            const phoneLink = hospital.phone.startsWith('+') ? hospital.phone : `+91${hospital.phone.replace(/\D/g, '')}`;
            const docInfo = hospital.doctors.split(';')[0]; 
            const docName = docInfo.split(': ')[1] ? docInfo.split(': ')[1].split(',')[0] : 'Consultant Available';
            const govStatusColor = hospital.government_scheme.includes('Free') || hospital.government_scheme.includes('CMCHIS') ? 'text-green-500' : 'text-orange-500';

            listContainer.innerHTML += `
                <div class="glass-card p-4 rounded-xl border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
                    <div class="flex justify-between items-center mb-1">
                        <h5 class="text-lg font-bold text-blue-600 dark:text-blue-400">${hospital.name}</h5>
                        <span class="text-xs text-gray-500 flex items-center gap-1"><i data-lucide="star" class="w-4 h-4 text-yellow-500 fill-yellow-500"></i> ${hospital.rating}/5.0</span>
                    </div>
                    <p class="text-sm text-gray-700 dark:text-gray-300">📍 ${hospital.locality}</p>
                    
                    <p class="text-xs mt-2 font-medium">Specialty Head: <span class="text-amber-500">${docName}</span></p>
                    <p class="text-xs mt-1 text-gray-500">Key Specialties: ${hospital.specialties.split(';').slice(0,3).join(', ')}</p>
                    
                    <p class="text-xs mt-1 font-bold ${govStatusColor}">Plan Status: ${hospital.government_scheme}</p>
                    <p class="text-xs text-gray-500">Insurance Accepted: ${hospital.plan}</p>

                    <div class="flex items-center gap-4 mt-2 text-xs">
                        <a href="tel:${phoneLink}" class="text-green-500 hover:underline"><i data-lucide="phone" class="w-3 h-3 inline mr-1"></i> Call</a>
                        <a href="${hospital.website}" target="_blank" class="text-indigo-500 hover:underline"><i data-lucide="globe" class="w-3 h-3 inline mr-1"></i> Website</a>
                    </div>
                </div>
            `;
        });

        resultCount.innerText = results.length;
        if(status) status.innerText = `Showing top ${results.length} recommendations, sorted by rating.`;
        if(typeof lucide !== 'undefined') lucide.createIcons();
    }
    
    const searchInput = document.getElementById('hospital-search-input');
    if (searchInput) {
        renderHospitalResults(''); // Show initial state
        searchInput.addEventListener('input', (e) => {
            renderHospitalResults(e.target.value);
        });
    }

    // ------------------------------------------
    // L. MEDICATION INVENTORY & INTERACTION CHECKER (Implementation)
    // ------------------------------------------
    renderInventory = function() {
        let activeDrugs = JSON.parse(localStorage.getItem('activeDrugs')) || [];
        const inventoryList = document.getElementById('medication-inventory-list');
        const alertPanel = document.getElementById('interaction-alerts');
        const interactionList = document.getElementById('interaction-list');
        const currentMeds = activeDrugs.map(d => d.toLowerCase());
        
        const alerts = [];
        inventoryList.innerHTML = '';

        if (currentMeds.length === 0) {
            inventoryList.innerHTML = '<div class="text-center py-4 text-gray-400 text-sm">No medications currently active.</div>';
            alertPanel.classList.add('hidden');
            return;
        }

        // 1. Render Inventory
        currentMeds.forEach(drug => {
            inventoryList.innerHTML += `
                <div class="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg flex justify-between items-center text-sm">
                    <span>${drug.charAt(0).toUpperCase() + drug.slice(1)}</span>
                    <button class="text-red-500 hover:text-red-700" onclick="deleteDrug('${drug}')">
                        <i data-lucide="x" class="w-4 h-4"></i>
                    </button>
                </div>
            `;
        });

        // 2. Run Interaction Check
        currentMeds.forEach(drugA => {
            const forbidden = interactionDB[drugA];
            if (forbidden) {
                forbidden.forEach(drugB => {
                    if (currentMeds.includes(drugB)) {
                        const alertMsg = `${drugA.charAt(0).toUpperCase() + drugA.slice(1)} interacts with ${drugB.charAt(0).toUpperCase() + drugB.slice(1)}. Consult a doctor!`;
                        if (!alerts.includes(alertMsg)) {
                            alerts.push(alertMsg);
                        }
                    }
                });
            }
        });

        // 3. Display Alerts
        interactionList.innerHTML = '';
        if (alerts.length > 0) {
            alerts.forEach(msg => {
                interactionList.innerHTML += `<li>${msg}</li>`;
            });
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
            } else {
                alert(`${drug} is already in your inventory.`);
            }
        }
    });
    
    // ------------------------------------------
    // M. PREDICTIVE CALENDAR & LOCATION ALERTS (NEW LOGIC)
    // ------------------------------------------

    function updatePredictiveCalendar() {
        const hr = simState.hr;
        const bpSys = simState.bpSys;
        
        let prediction = {};

        // 1. Prediction Logic (Based on Vitals)
        if (hr < 65 && bpSys < 110) {
            prediction = { title: "Optimal Recovery Window", msg: "Vitals suggest deep rest is needed for peak biological repair. Avoid heavy work.", status: "Deep Rest", color: "from-purple-600 to-indigo-600", icon: "moon", action: "Schedule Meditation/Sleep" };
        } else if (hr >= 65 && hr <= 85 && bpSys <= 130) {
            prediction = { title: "Peak Performance Window", msg: "Excellent energy and stable vitals. Ideal time for high-intensity activity.", status: "Peak Energy", color: "from-green-600 to-teal-600", icon: "zap", action: "Schedule High-Intensity Workout" };
        } else if (hr > 100 || bpSys > 140) {
            prediction = { title: "Stress/High Alert", msg: "High heart rate or blood pressure detected. Prioritize light breathing and hydration.", status: "Caution", color: "from-red-600 to-orange-600", icon: "alert-octagon", action: "Schedule Rest/Hydration" };
        } else {
            prediction = { title: "Stable/Active", msg: "Vitals are stable. Moderate intensity workouts are recommended.", status: "Normal", color: "from-indigo-600 to-blue-700", icon: "sun", action: "Schedule Moderate Activity" };
        }

        // 2. Apply UI Updates to Dashboard Widget
        const widget = document.getElementById('predictive-widget');
        if (widget) {
            widget.className = `glass-card p-6 rounded-2xl bg-gradient-to-br ${prediction.color} text-white`;
            if (document.getElementById('predictive-title')) document.getElementById('predictive-title').innerHTML = `<i data-lucide="${prediction.icon}"></i> ${prediction.title}`;
            if (document.getElementById('predictive-recommendation')) document.getElementById('predictive-recommendation').innerText = prediction.msg;
            if (document.getElementById('predictive-metrics')) document.getElementById('predictive-metrics').innerHTML = `
                <span>HR: ${Math.floor(hr)} bpm</span> | 
                <span>BP: ${bpSys}/${simState.bpDia} mmHg</span> |
                <span>Status: ${prediction.status}</span>
            `;
            if(typeof lucide !== 'undefined') lucide.createIcons();
        }
        
        // 3. Run Location-Based Alert Check
        const userLocality = "Park Town".toLowerCase(); // Simulate fetching locality from user profile
        const alertInfo = localAlerts[userLocality];

        if (alertInfo) {
            const notifTitle = `Local Alert: ${alertInfo.priority.charAt(0).toUpperCase() + alertInfo.priority.slice(1)} Health Risk`;
            const existingAlerts = window.notifications.filter(n => n.title === notifTitle);
            
            if (existingAlerts.length === 0) {
                 window.addNotification(notifTitle, alertInfo.alert, alertInfo.priority);
            }
        }
        
        return prediction;
    }

    /**
     * Updates the Scheduler Modal with the latest predictive data and reminders.
     */
    function updateSchedulerModal() {
        const prediction = updatePredictiveCalendar();
        
        const summaryPanel = document.getElementById('schedule-prediction-summary');
        const remList = document.getElementById('schedule-reminder-list');
        const setBtn = document.getElementById('set-peak-reminder-btn');
        
        // Populate Prediction Summary
        if(summaryPanel) summaryPanel.innerHTML = `
            <p class="text-3xl font-extrabold text-blue-500 dark:text-teal-300 mb-2">${prediction.status}</p>
            <p class="text-sm font-semibold">${prediction.title}</p>
            <p class="text-xs text-gray-600 dark:text-gray-300 mt-1">${prediction.msg}</p>
            <p class="text-sm text-blue-500 dark:text-blue-400 mt-3 font-bold">Action Recommended: ${prediction.action}</p>
        `;

        // Populate Reminders 
        const reminders = JSON.parse(localStorage.getItem('healthReminders')) || [];
        if (remList) remList.innerHTML = '';

        if (reminders.length === 0 && remList) {
             remList.innerHTML = '<div class="text-center py-6 text-gray-400 text-sm">No active reminders.</div>';
        } else if (remList) {
            reminders.forEach((r, i) => {
                remList.innerHTML += `
                    <div class="p-3 border border-slate-200 dark:border-slate-700 rounded-lg flex justify-between items-center bg-white dark:bg-slate-800">
                        <div>
                            <p class="font-bold">${r.name}</p>
                            <p class="text-xs text-blue-500">${r.time}</p>
                        </div>
                        <button class="text-red-500 hover:text-red-700 p-1" onclick="deleteRem(${i})"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                    </div>
                `;
            });
        }
        if(typeof lucide !== 'undefined') lucide.createIcons();

        // Show/Hide Peak Activity Button based on prediction
        if (setBtn) {
            if (prediction.status === "Peak Energy") {
                setBtn.classList.remove('hidden');
                setBtn.onclick = () => { alert("Simulated: Activity reminder set for 30 minutes from now."); }; 
            } else {
                setBtn.classList.add('hidden');
            }
        }
    }
    
    
    // Initial call to set up the predictive widget immediately
    updatePredictiveCalendar();


    // --- In your Global Variables section (Near the top of the script) ---
    let currentLocality = "Chennai"; 
    window.locationEnabled = true; // NEW: Default to ON

// --- In your Geolocation Functions section ---

/**
 * Attempts to get the user's location via Geolocation API, 
 * but only if locationEnabled is true.
 */
    function getUsersLocality() {
    // 🛑 Check if the feature is disabled by the user toggle
        if (!window.locationEnabled) {
            currentLocality = "Location OFF";
            const localityElement = document.getElementById('header-locality');
            if (localityElement) {
                localityElement.innerText = currentLocality;
            }
            return; 
        }

        if (navigator.geolocation) {
            const options = { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 };
        
            navigator.geolocation.getCurrentPosition(
                (position) => {
                // SUCCESS: Simulate Reverse Geocoding
                    const localities = ["Park Town", "Adyar", "Greams Road"];
                    const randomIndex = Math.floor(Math.random() * localities.length);
                    currentLocality = localities[randomIndex]; 
                
                    const localityElement = document.getElementById('header-locality');
                    if (localityElement) {
                        localityElement.innerText = currentLocality; // Update the header display
                    }

                    checkLocalAlerts(currentLocality);
                },
                (error) => {
                // ERROR: User denied permission, set state to disabled but keep toggle ON visually
                    currentLocality = "Access Denied"; 
                    if (document.getElementById('header-locality')) {
                         document.getElementById('header-locality').innerText = currentLocality;
                    }
                    console.warn(`[Geo] Access denied or failed: ${error.message}`);
                    window.addNotification("Location Access Denied", "Location alerts disabled by browser permission.", "orange");
                },
                options
            );
        } else {
        // Fallback for old browsers
            currentLocality = "Not Supported";
            window.addNotification("Geolocation Error", "Your browser does not support location services.", "orange");
        }
    }
    const connectBtn = document.getElementById('connect-watch-btn');
    const scanModal = document.getElementById('scan-modal');
    const closeScanBtn = document.getElementById('close-scan-btn');

    if(connectBtn) {
        connectBtn.addEventListener('click', async () => {
            // 1. Disconnect Logic (FIXED)
            if(window.watchConnected) {
                window.watchConnected = false;
                window.watchName = "";
                resetVitalsUI(); // CRITICAL: Reset UI elements
                
                // Reset Button UI
                connectBtn.innerHTML = `<i data-lucide="bluetooth"></i> <span>Connect Device</span>`;
                connectBtn.className = "flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full text-xs font-bold hover:shadow-lg hover:scale-105 transition-all";
                
                // Hide Widget
                const w = document.getElementById('watch-status-card');
                if(w) w.classList.add('hidden');
                alert("Device Disconnected.");
                if(typeof lucide !== 'undefined') lucide.createIcons();
                return;
            }

            // 2. Connection/Scanning Logic
            if (navigator.bluetooth) {
                try {
                    const device = await navigator.bluetooth.requestDevice({
                        filters: [{ services: ['heart_rate'] }]
                    });
                    window.pairDevice(device.name);
                    return;
                } catch (error) {
                    console.log("Bluetooth cancelled or failed, falling back to simulation modal.");
                }
            } 

            // 3. Fallback to Simulation Modal
            if(scanModal) {
                scanModal.classList.remove('hidden');
                scanModal.style.display = 'flex';
                document.getElementById('scan-title').innerText = "Scanning nearby...";
                document.getElementById('scan-animation').style.display = 'flex';
                document.getElementById('device-list').classList.add('hidden');
                
                setTimeout(() => {
                    document.getElementById('scan-title').innerText = "Devices Found";
                    document.getElementById('device-list').classList.remove('hidden');
                    document.getElementById('scan-animation').style.display = 'none';
                }, 1500);
            }
        });
    }

    if(closeScanBtn && scanModal) {
        closeScanBtn.addEventListener('click', () => {
            scanModal.classList.add('hidden');
            scanModal.style.display = 'none';
        });
    }


// --- Inside your DOMContentLoaded listener ---

// Find this area near the Dark Mode toggle logic
    const locationToggle = document.getElementById('location-toggle');

// 1. Load initial state
    const savedLocationState = localStorage.getItem('locationEnabled');
    if (savedLocationState !== null) {
        window.locationEnabled = (savedLocationState === 'true');
    }

// 2. Apply initial state to checkbox
    if (locationToggle) {
        locationToggle.checked = window.locationEnabled;
    }

// 3. Add change listener to the toggle
    if (locationToggle) {
        locationToggle.addEventListener('change', (e) => {
            window.locationEnabled = e.target.checked;
            localStorage.setItem('locationEnabled', window.locationEnabled);
        
            if (window.locationEnabled) {
            // Re-run the location check immediately when turned ON
                getUsersLocality();
            } else {
            // Clear display and stop trying to get location
                currentLocality = "Location OFF";
                if (document.getElementById('header-locality')) {
                    document.getElementById('header-locality').innerText = currentLocality;
                }
                window.addNotification("Location Disabled", "Location-based health alerts are now OFF.", "orange");
            }   
        });
    }
    


// 4. Initial run of Geolocation logic (MUST be placed after the event listeners are set up)
getUsersLocality();


    
});





