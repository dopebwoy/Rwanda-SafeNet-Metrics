/* =========================================================
   RWANDA SAFENET METRICS — ENUMERATOR PROTOTYPE
   Frontend-only / localStorage-first.

   IMPORTANT:
   - Do not put real government personal data in a public demo.
   - Replace the location API placeholders below only after obtaining
     an authorized/official API specification.
   - Backend + Supabase synchronization is intentionally NOT implemented yet.
   ========================================================= */

"use strict";

/* -----------------------------
   Configuration
------------------------------ */

const CONFIG = {
  storageKey: "rsnm_enumerator_households_v1",
  draftKey: "rsnm_enumerator_draft_v1",
  assignmentKey: "rsnm_enumerator_assignment_v1",
  profileKey: "rsnm_enumerator_profile_v1",

  // Publicly readable NISR village boundary FeatureServer; queries are read-only.
  locationApi: {
    featureLayer: "https://gh.space.gov.rw/server/rest/services/Admin_Boundaries/FeatureServer/4"
  },

  // Prototype map center: Rwanda. Village-specific coordinates come from GPS
  // or can later come from an official boundary/centroid API.
  defaultMapCenter: [-1.9441, 30.0619],
  defaultZoom: 9,
  maxRecent: 100
};

/* -----------------------------
   Demo location data fallback
   Used only if no live API endpoint is configured.
------------------------------ */

const DEMO_LOCATIONS = {
  provinces: [
    { id: "city-kigali", name: "Kigali City" },
    { id: "eastern", name: "Eastern Province" },
    { id: "northern", name: "Northern Province" },
    { id: "southern", name: "Southern Province" },
    { id: "western", name: "Western Province" }
  ],
  districts: {
    "city-kigali": [
      { id: "gasabo", name: "Gasabo" },
      { id: "kicukiro", name: "Kicukiro" },
      { id: "nyarugenge", name: "Nyarugenge" }
    ],
    eastern: [
      { id: "bugesera", name: "Bugesera" },
      { id: "rwamagana", name: "Rwamagana" },
      { id: "kayonza", name: "Kayonza" }
    ],
    northern: [
      { id: "musanze", name: "Musanze" },
      { id: "gicumbi", name: "Gicumbi" }
    ],
    southern: [
      { id: "huye", name: "Huye" },
      { id: "nyamagabe", name: "Nyamagabe" }
    ],
    western: [
      { id: "rubavu", name: "Rubavu" },
      { id: "rusizi", name: "Rusizi" }
    ]
  },
  sectors: {
    gasabo: [
      { id: "kimihurura", name: "Kimihurura" },
      { id: "remera", name: "Remera" },
      { id: "jabanan", name: "Jabana" }
    ],
    bugesera: [
      { id: "nyamata", name: "Nyamata" },
      { id: "juru", name: "Juru" },
      { id: "mayange", name: "Mayange" }
    ],
    musanze: [
      { id: "musanze", name: "Musanze" },
      { id: "muhoza", name: "Muhoza" }
    ],
    huye: [
      { id: "tumba", name: "Tumba" },
      { id: "ngoma", name: "Ngoma" }
    ],
    rubavu: [
      { id: "gisenyi", name: "Gisenyi" },
      { id: "nyundo", name: "Nyundo" }
    ]
  },
  cells: {
    nyamata: [
      { id: "nyamata-c1", name: "Nyamata Cell" },
      { id: "nyamata-c2", name: "Kanazi Cell" }
    ],
    juru: [
      { id: "juru-c1", name: "Juru Cell" },
      { id: "juru-c2", name: "Kabuye Cell" }
    ],
    mayange: [
      { id: "mayange-c1", name: "Mayange Cell" }
    ],
    kimihurura: [
      { id: "kim-c1", name: "Kimihurura Cell" }
    ],
    remera: [
      { id: "rem-c1", name: "Rukiri I Cell" },
      { id: "rem-c2", name: "Nyabisindu Cell" }
    ],
    jabanan: [
      { id: "jab-c1", name: "Jabana Cell" }
    ],
    musanze: [
      { id: "mus-c1", name: "Musanze Cell" }
    ],
    muhoza: [
      { id: "muh-c1", name: "Kigombe Cell" }
    ],
    tumba: [
      { id: "tumba-c1", name: "Tumba Cell" }
    ],
    ngoma: [
      { id: "ngoma-c1", name: "Ngoma Cell" }
    ],
    gisenyi: [
      { id: "gis-c1", name: "Gisenyi Cell" }
    ],
    nyundo: [
      { id: "nyu-c1", name: "Nyundo Cell" }
    ]
  },
  villages: {
    "nyamata-c1": [
      { id: "ny-v1", name: "Example Village 1" },
      { id: "ny-v2", name: "Example Village 2" }
    ],
    "nyamata-c2": [
      { id: "kan-v1", name: "Example Village 3" }
    ],
    "juru-c1": [
      { id: "ju-v1", name: "Example Village 4" }
    ],
    "rem-c1": [
      { id: "rem-v1", name: "Example Village 5" }
    ],
    "kim-c1": [
      { id: "kim-v1", name: "Example Village 6" }
    ],
    "mus-c1": [
      { id: "mus-v1", name: "Example Village 7" }
    ],
    "muh-c1": [
      { id: "muh-v1", name: "Example Village 8" }
    ],
    "tumba-c1": [
      { id: "tumba-v1", name: "Example Village 9" }
    ],
    "ngoma-c1": [
      { id: "ngoma-v1", name: "Example Village 10" }
    ],
    "gis-c1": [
      { id: "gis-v1", name: "Example Village 11" }
    ],
    "nyu-c1": [
      { id: "nyu-v1", name: "Example Village 12" }
    ],
    "mayange-c1": [
      { id: "may-v1", name: "Example Village 13" }
    ],
    "jab-c1": [
      { id: "jab-v1", name: "Example Village 14" }
    ]
  }
};

/* -----------------------------
   State
------------------------------ */

let assignment = loadJson(CONFIG.assignmentKey, null);
let households = loadJson(CONFIG.storageKey, []);
let editingHouseholdId = null;
let memberCounter = 0;

let map;
let villageBoundaryLayer = null;
let villageBoundaryRequest = 0;
let currentGpsMarker = null;
let gpsWatchId = null;
const householdMarkers = new Map();

/* -----------------------------
   DOM helpers
------------------------------ */

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function loadJson(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.error("localStorage read error:", error);
    return fallback;
  }
}

function saveJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function showToast(title, message, type = "success") {
  const toast = $("#toast");
  $("#toastTitle").textContent = title;
  $("#toastMessage").textContent = message;
  toast.classList.add("show");

  if (type === "error") {
    toast.style.background = "#8e2119";
  } else {
    toast.style.background = "#102018";
  }

  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 3500);
}

/* -----------------------------
   Navigation
------------------------------ */

function navigate(viewName) {
  $$(".view").forEach(view => view.classList.add("hidden"));
  const target = $(`#view-${viewName}`);
  if (target) target.classList.remove("hidden");

  $$(".nav-item").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.view === viewName);
  });

  if (viewName === "overview") {
    setTimeout(() => {
      if (map) map.invalidateSize();
    }, 80);
    renderRecentPreview();
    updateDashboard();
    renderMapHouseholds();
  }

  if (viewName === "recent") {
    renderRecentTable();
  }

  if (viewName === "storage") {
    updateStorageView();
  }
}

function setupNavigation() {
  $$(".nav-item").forEach(btn => {
    btn.addEventListener("click", () => navigate(btn.dataset.view));
  });

  $$("[data-view-target]").forEach(btn => {
    btn.addEventListener("click", () => navigate(btn.dataset.viewTarget));
  });

  $("#backOverviewBtn").addEventListener("click", () => navigate("overview"));
}

/* -----------------------------
   Enumerator profile
------------------------------ */

function loadProfile() {
  const profile = loadJson(CONFIG.profileKey, {
    name: "Enumerator",
    id: "DEMO-001"
  });

  $("#enumeratorName").textContent = profile.name;
  $("#enumeratorId").textContent = `Enumerator ID: ${profile.id}`;
  $("#avatarInitials").textContent = getInitials(profile.name);
}

function getInitials(name) {
  return String(name || "EN")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(word => word[0]?.toUpperCase() || "")
    .join("") || "EN";
}

/* -----------------------------
   Assignment / location data
------------------------------ */

function setSelectOptions(select, items, placeholder = "Select") {
  select.innerHTML = `<option value="">${escapeHtml(placeholder)}</option>`;
  (items || []).forEach(item => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = item.name;
    select.appendChild(option);
  });
  select.disabled = !(items && items.length);
}

async function fetchJson(url) {
  const response = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" }
  });

  if (!response.ok) {
    throw new Error(`Location API returned ${response.status}`);
  }

  return response.json();
}

async function getLocationLevel(level, parentId = "") {
  const fields = {
    provinces: ["province", "province_id", ""],
    districts: ["district", "district_id", "province_id"],
    sectors: ["sector", "sector_id", "district_id"],
    cells: ["cell", "cell_id", "sector_id"],
    villages: ["village", "village_id", "cell_id"]
  };
  const [nameField, idField, parentField] = fields[level] || [];
  if (CONFIG.locationApi.featureLayer && nameField) {
    const params = new URLSearchParams({
      f: "json",
      where: parentField && parentId ? `${parentField}='${String(parentId).replace(/'/g, "''")}'` : "1=1",
      outFields: `${nameField},${idField}`,
      returnGeometry: "false",
      returnDistinctValues: "true",
      orderByFields: nameField
    });
    const data = await fetchJson(`${CONFIG.locationApi.featureLayer}/query?${params}`);
    if (data.error) throw new Error(data.error.message || "NISR location query failed");
    return (data.features || []).map(feature => ({
      id: String(feature.attributes?.[idField] ?? ""),
      name: String(feature.attributes?.[nameField] ?? "")
    })).filter(item => item.id && item.name);
  }

  // Local prototype fallback.
  if (level === "provinces") return DEMO_LOCATIONS.provinces;
  if (level === "districts") return DEMO_LOCATIONS.districts[parentId] || [];
  if (level === "sectors") return DEMO_LOCATIONS.sectors[parentId] || [];
  if (level === "cells") return DEMO_LOCATIONS.cells[parentId] || [];
  if (level === "villages") return DEMO_LOCATIONS.villages[parentId] || [];

  return [];
}

async function populateProvinceSelect() {
  const province = $("#province");
  try {
    const items = await getLocationLevel("provinces");
    setSelectOptions(province, items, "Select province");
  } catch (error) {
    console.warn(error);
    setSelectOptions(province, [], "NISR locations unavailable");
    showToast("NISR locations unavailable", "Check your internet connection and try opening the assignment editor again.", "error");
  }
}

async function cascadeSelect(sourceId, targetId, targetLevel) {
  const source = $(`#${sourceId}`);
  const target = $(`#${targetId}`);

  const parentId = source.value;
  if (!parentId) {
    setSelectOptions(target, [], `Select ${targetLevel.replace("s", "")}`);
    return;
  }

  try {
    const items = await getLocationLevel(targetLevel, parentId);
    setSelectOptions(target, items, `Select ${targetLevel.replace("s", "")}`);
  } catch (error) {
    console.warn(error);
    setSelectOptions(target, [], "Location unavailable");
    showToast("Location lookup failed", "Check the official API endpoint configuration later.", "error");
  }
}

function bindAssignmentCascade() {
  $("#province").addEventListener("change", async () => {
    $("#sector").innerHTML = `<option value="">Select sector</option>`;
    $("#cell").innerHTML = `<option value="">Select cell</option>`;
    $("#village").innerHTML = `<option value="">Select village</option>`;
    $("#sector").disabled = true;
    $("#cell").disabled = true;
    $("#village").disabled = true;
    await cascadeSelect("province", "district", "districts");
  });

  $("#district").addEventListener("change", async () => {
    $("#cell").innerHTML = `<option value="">Select cell</option>`;
    $("#village").innerHTML = `<option value="">Select village</option>`;
    $("#cell").disabled = true;
    $("#village").disabled = true;
    await cascadeSelect("district", "sector", "sectors");
  });

  $("#sector").addEventListener("change", async () => {
    $("#village").innerHTML = `<option value="">Select village</option>`;
    $("#village").disabled = true;
    await cascadeSelect("sector", "cell", "cells");
  });

  $("#cell").addEventListener("change", async () => {
    await cascadeSelect("cell", "village", "villages");
  });
}

async function openAssignmentEditor() {
  $("#assignmentForm").classList.remove("hidden");
  await populateProvinceSelect();

  if (assignment?.provinceId) {
    $("#province").value = assignment.provinceId;
    await cascadeSelect("province", "district", "districts");
    $("#district").value = assignment.districtId || "";
    await cascadeSelect("district", "sector", "sectors");
    $("#sector").value = assignment.sectorId || "";
    await cascadeSelect("sector", "cell", "cells");
    $("#cell").value = assignment.cellId || "";
    await cascadeSelect("cell", "village", "villages");
    $("#village").value = assignment.villageId || "";
  }
}

function getSelectedText(id) {
  const element = $(`#${id}`);
  return element?.selectedOptions?.[0]?.textContent?.trim() || "";
}

function renderAssignment() {
  const summary = $("#assignmentSummary");
  const banner = $("#inheritedLocationBanner");

  if (!assignment) {
    summary.innerHTML = `<div class="muted">No village assignment saved. Use “Edit assignment” to configure this enumerator.</div>`;
    banner.innerHTML = `<strong>Assignment required:</strong> configure the Province → District → Sector → Cell → Village hierarchy first.`;
    $("#sidebarVillage").textContent = "Not configured";
    $("#sidebarAddress").textContent = "Set your assignment below.";
    $("#statQuota").textContent = "—";
    return;
  }

  const parts = [
    ["Province", assignment.province],
    ["District", assignment.district],
    ["Sector", assignment.sector],
    ["Cell", assignment.cell],
    ["Village", assignment.village]
  ];

  summary.innerHTML = parts.map(([label, value]) => `
    <div class="location-chip">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </div>
  `).join("");

  banner.innerHTML = `
    <strong>Inherited address:</strong>
    ${escapeHtml(assignment.province)} → ${escapeHtml(assignment.district)} →
    ${escapeHtml(assignment.sector)} → ${escapeHtml(assignment.cell)} →
    ${escapeHtml(assignment.village)}
  `;

  $("#sidebarVillage").textContent = assignment.village;
  $("#sidebarAddress").textContent = `${assignment.cell}, ${assignment.sector}`;
  updateDashboard();
  updateMapCoverage();
}

function createAssignmentFromForm() {
  return {
    provinceId: $("#province").value,
    districtId: $("#district").value,
    sectorId: $("#sector").value,
    cellId: $("#cell").value,
    villageId: $("#village").value,
    province: getSelectedText("province"),
    district: getSelectedText("district"),
    sector: getSelectedText("sector"),
    cell: getSelectedText("cell"),
    village: getSelectedText("village"),
    updatedAt: new Date().toISOString()
  };
}

function validateAssignment(data) {
  const values = [data.provinceId, data.districtId, data.sectorId, data.cellId, data.villageId];
  return values.every(Boolean);
}

/* -----------------------------
   Map
------------------------------ */

function initMap() {
  if (!window.L) {
    $("#map").innerHTML = `
      <div style="padding:20px;color:#647380">
        Map library could not load. Check internet connection or run through a local web server.
      </div>
    `;
    return;
  }

  map = L.map("map", {
    zoomControl: true,
    preferCanvas: true
  }).setView(CONFIG.defaultMapCenter, CONFIG.defaultZoom);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors | Village boundaries &copy; NISR'
  }).addTo(map);

  updateMapCoverage();
}

function updateMapCoverage() {
  if (!map) return;
  const requestId = ++villageBoundaryRequest;
  if (villageBoundaryLayer) {
    map.removeLayer(villageBoundaryLayer);
    villageBoundaryLayer = null;
  }
  if (!assignment?.villageId) {
    $("#mapCenterStatus").textContent = "Select a village to show its official boundary";
    return;
  }
  $("#mapCenterStatus").textContent = "Loading NISR village boundary…";
  const params = new URLSearchParams({
    f: "geojson",
    where: `village_id='${String(assignment.villageId).replace(/'/g, "''")}'`,
    outFields: "province,district,sector,cell,village,village_id",
    returnGeometry: "true"
  });
  fetchJson(`${CONFIG.locationApi.featureLayer}/query?${params}`).then(data => {
    if (requestId !== villageBoundaryRequest) return;
    if (!data.features?.length) throw new Error("No boundary found for the selected village.");
    villageBoundaryLayer = L.geoJSON(data, {
      style: { color: "#006b3f", weight: 2, fillColor: "#006b3f", fillOpacity: 0.12 }
    }).addTo(map);
    villageBoundaryLayer.bindPopup(`<strong>${escapeHtml(assignment.village)}</strong><br>NISR village boundary`);
    map.fitBounds(villageBoundaryLayer.getBounds(), { padding: [20, 20] });
    $("#mapCenterStatus").textContent = "Official NISR village boundary loaded";
  }).catch(error => {
    if (requestId !== villageBoundaryRequest) return;
    console.warn("NISR village boundary unavailable:", error);
    $("#mapCenterStatus").textContent = "NISR boundary unavailable; map still shows GPS and households";
  });
}

function makeGreenIcon() {
  return L.divIcon({
    className: "rsnm-house-icon",
    html: `<span style="
      display:block;width:14px;height:14px;border-radius:50%;
      background:#006b3f;border:3px solid #fff;
      box-shadow:0 2px 8px rgba(0,0,0,.28);"></span>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -7]
  });
}

function makeBlueIcon() {
  return L.divIcon({
    className: "rsnm-gps-icon",
    html: `<span style="
      display:block;width:16px;height:16px;border-radius:50%;
      background:#1f6feb;border:4px solid #fff;
      box-shadow:0 2px 8px rgba(0,0,0,.25);"></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });
}

function renderMapHouseholds() {
  if (!map) return;

  householdMarkers.forEach(marker => map.removeLayer(marker));
  householdMarkers.clear();

  const records = getAssignedHouseholds();

  records.forEach(record => {
    const lat = Number(record.gps?.lat);
    const lng = Number(record.gps?.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

    const marker = L.marker([lat, lng], {
      icon: makeGreenIcon()
    }).addTo(map);

    marker.bindPopup(`
      <strong>${escapeHtml(record.householdCode)}</strong><br>
      ${escapeHtml(record.headName)}<br>
      ${escapeHtml(record.address || "No locality description")}<br>
      ${record.members?.length || 0} member(s)
    `);

    householdMarkers.set(record.id, marker);
  });
}

function locateCurrentGps() {
  if (!navigator.geolocation) {
    showToast("GPS unavailable", "This browser does not provide geolocation.", "error");
    return;
  }

  if (gpsWatchId !== null) {
    navigator.geolocation.clearWatch(gpsWatchId);
    gpsWatchId = null;
    $("#locateBtn").textContent = "⌖ Start live GPS";
    $("#gpsStatus").textContent = "GPS: live tracking paused";
    return;
  }

  $("#gpsStatus").textContent = "GPS: starting live location…";
  $("#locateBtn").textContent = "Pause live GPS";
  gpsWatchId = navigator.geolocation.watchPosition(
    position => {
      const { latitude, longitude, accuracy } = position.coords;

      if (map) {
        const firstFix = !currentGpsMarker;
        if (currentGpsMarker) currentGpsMarker.setLatLng([latitude, longitude]);
        else currentGpsMarker = L.marker([latitude, longitude], { icon: makeBlueIcon() }).addTo(map);
        currentGpsMarker.bindPopup(`<strong>Enumerator live GPS</strong><br>Accuracy: ±${Math.round(accuracy)} m`);
        if (firstFix || !map.getBounds().contains([latitude, longitude])) map.panTo([latitude, longitude]);
      }

      $("#gpsStatus").textContent = `GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)} ±${Math.round(accuracy)}m`;
    },
    error => {
      const message = {
        1: "Location permission was denied.",
        2: "Current position is unavailable.",
        3: "GPS request timed out."
      }[error.code] || "Unable to get current location.";

      $("#gpsStatus").textContent = "GPS: not captured";
      $("#locateBtn").textContent = "⌖ Start live GPS";
      gpsWatchId = null;
      showToast("GPS error", message, "error");
    },
    {
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: 15000
    }
  );
}

function captureGpsIntoForm() {
  if (!navigator.geolocation) {
    showToast("GPS unavailable", "Your browser does not support geolocation.", "error");
    return;
  }

  $("#captureGpsBtn").disabled = true;
  $("#captureGpsBtn").textContent = "Capturing…";

  navigator.geolocation.getCurrentPosition(
    position => {
      $("#gpsLat").value = position.coords.latitude.toFixed(8);
      $("#gpsLng").value = position.coords.longitude.toFixed(8);
      $("#gpsAccuracy").value = Number(position.coords.accuracy || 0).toFixed(1);

      updateFormProgress();
      updateDashboard();
      showToast("GPS captured", `Accuracy ±${Math.round(position.coords.accuracy)} metres.`);
    },
    error => {
      const message = {
        1: "Location permission was denied.",
        2: "Current position is unavailable.",
        3: "GPS request timed out."
      }[error.code] || "Unable to get current location.";

      showToast("GPS error", message, "error");
    },
    {
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: 15000
    }
  );

  setTimeout(() => {
    $("#captureGpsBtn").disabled = false;
    $("#captureGpsBtn").textContent = "⌖ Capture GPS";
  }, 1000);
}

/* -----------------------------
   Household codes & form
------------------------------ */

function nextHouseholdCode() {
  const date = new Date();
  const stamp = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("");
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `RSNM-${stamp}-${random}`;
}

function initializeNewForm() {
  editingHouseholdId = null;
  $("#formTitle").textContent = "Register a new household";
  $("#householdForm").reset();
  $("#membersContainer").innerHTML = "";
  $("#householdCode").value = nextHouseholdCode();
  $("#interviewDate").value = new Date().toISOString().slice(0, 10);
  addMember();

  renderAssignment();
  updateFormProgress();
  hideValidationSummary();
}

function openEditHousehold(id) {
  const record = households.find(item => item.id === id);
  if (!record) {
    showToast("Record not found", "That local household no longer exists.", "error");
    return;
  }

  editingHouseholdId = id;
  $("#formTitle").textContent = `Edit ${record.householdCode}`;

  fillHouseholdForm(record);
  navigate("newHousehold");
}

function addMember(data = {}) {
  memberCounter += 1;
  const id = memberCounter;

  const wrapper = document.createElement("div");
  wrapper.className = "member-card";
  wrapper.dataset.memberId = id;

  wrapper.innerHTML = `
    <div class="member-head">
      <strong>Member ${id}</strong>
      <button type="button" class="member-remove" data-remove-member="${id}">Remove</button>
    </div>
    <div class="member-grid">
      <label>
        Full name
        <input type="text" data-member="fullName" required value="${escapeHtml(data.fullName || "")}" />
      </label>
      <label>
        Age
        <input type="number" min="0" max="120" step="1" required data-member="age" value="${escapeHtml(data.age ?? "")}" />
      </label>
      <label>
        Gender
        <select data-member="gender">
          <option value="">Select</option>
          <option ${data.gender === "Female" ? "selected" : ""}>Female</option>
          <option ${data.gender === "Male" ? "selected" : ""}>Male</option>
          <option ${data.gender === "Other" ? "selected" : ""}>Other</option>
          <option ${data.gender === "Not known" ? "selected" : ""}>Not known</option>
        </select>
      </label>
      <label>
        Relationship
        <select data-member="relationship">
          <option value="">Select</option>
          <option ${data.relationship === "Head" ? "selected" : ""}>Head</option>
          <option ${data.relationship === "Spouse/partner" ? "selected" : ""}>Spouse/partner</option>
          <option ${data.relationship === "Child" ? "selected" : ""}>Child</option>
          <option ${data.relationship === "Parent" ? "selected" : ""}>Parent</option>
          <option ${data.relationship === "Other relative" ? "selected" : ""}>Other relative</option>
          <option ${data.relationship === "Non-relative" ? "selected" : ""}>Non-relative</option>
        </select>
      </label>
      <label>
        Civil status
        <select data-member="civilStatus">
          <option value="">Select</option>
          <option ${data.civilStatus === "Single" ? "selected" : ""}>Single</option>
          <option ${data.civilStatus === "Married" ? "selected" : ""}>Married</option>
          <option ${data.civilStatus === "Separated" ? "selected" : ""}>Separated</option>
          <option ${data.civilStatus === "Divorced" ? "selected" : ""}>Divorced</option>
          <option ${data.civilStatus === "Widowed" ? "selected" : ""}>Widowed</option>
          <option ${data.civilStatus === "Not applicable" ? "selected" : ""}>Not applicable</option>
          <option ${data.civilStatus === "Not known" ? "selected" : ""}>Not known</option>
        </select>
      </label>
      <label>
        Education
        <select data-member="educationLevel">
          <option value="">Select</option>
          <option ${data.educationLevel === "None" ? "selected" : ""}>None</option>
          <option ${data.educationLevel === "Primary" ? "selected" : ""}>Primary</option>
          <option ${data.educationLevel === "O-Level" ? "selected" : ""}>O-Level</option>
          <option ${data.educationLevel === "A-Level" ? "selected" : ""}>A-Level</option>
          <option ${data.educationLevel === "TVET" ? "selected" : ""}>TVET</option>
          <option ${data.educationLevel === "University" ? "selected" : ""}>University</option>
          <option ${data.educationLevel === "Other" ? "selected" : ""}>Other</option>
        </select>
      </label>
      <label>
        School attendance
        <select data-member="schoolAttendance">
          <option value="">Select</option>
          <option ${data.schoolAttendance === "Attending" ? "selected" : ""}>Attending</option>
          <option ${data.schoolAttendance === "Not attending" ? "selected" : ""}>Not attending</option>
          <option ${data.schoolAttendance === "Not school-aged" ? "selected" : ""}>Not school-aged</option>
          <option ${data.schoolAttendance === "Not known" ? "selected" : ""}>Not known</option>
        </select>
      </label>
      <label>
        Health insurance
        <select data-member="healthInsurance">
          <option value="">Select</option>
          <option ${data.healthInsurance === "Mutuelle de Santé" ? "selected" : ""}>Mutuelle de Santé</option>
          <option ${data.healthInsurance === "Other" ? "selected" : ""}>Other</option>
          <option ${data.healthInsurance === "None" ? "selected" : ""}>None</option>
          <option ${data.healthInsurance === "Not known" ? "selected" : ""}>Not known</option>
        </select>
      </label>
      <label>
        Disability status
        <select data-member="disabilityStatus">
          <option value="">Select</option>
          <option ${data.disabilityStatus === "None reported" ? "selected" : ""}>None reported</option>
          <option ${data.disabilityStatus === "Physical" ? "selected" : ""}>Physical</option>
          <option ${data.disabilityStatus === "Sensory" ? "selected" : ""}>Sensory</option>
          <option ${data.disabilityStatus === "Mental/intellectual" ? "selected" : ""}>Mental/intellectual</option>
          <option ${data.disabilityStatus === "Multiple" ? "selected" : ""}>Multiple</option>
          <option ${data.disabilityStatus === "Not known" ? "selected" : ""}>Not known</option>
        </select>
      </label>
      <label>
        Chronic illness
        <select data-member="chronicIllness">
          <option value="">Select</option>
          <option ${data.chronicIllness === "No known" ? "selected" : ""}>No known</option>
          <option ${data.chronicIllness === "Yes" ? "selected" : ""}>Yes</option>
          <option ${data.chronicIllness === "Not known" ? "selected" : ""}>Not known</option>
        </select>
      </label>
      <label>
        Adult National ID (prototype)
        <input
          type="text"
          inputmode="numeric"
          data-member="nationalId"
          value="${escapeHtml(data.nationalId || "")}"
          placeholder="Do not use a real ID in demo"
        />
      </label>
      <label>
        Active phone
        <input
          type="tel"
          inputmode="tel"
          data-member="phone"
          value="${escapeHtml(data.phone || "")}"
          placeholder="+250..."
        />
      </label>
    </div>
  `;

  $("#membersContainer").appendChild(wrapper);

  wrapper.querySelector("[data-remove-member]").addEventListener("click", () => {
    const members = $$(".member-card", $("#membersContainer"));
    if (members.length <= 1) {
      showToast("At least one member", "A household needs at least one roster entry.", "error");
      return;
    }

    wrapper.remove();
    renumberMembers();
    updateFormProgress();
  });

  $$("input, select, textarea", wrapper).forEach(control => {
    control.addEventListener("input", updateFormProgress);
    control.addEventListener("change", updateFormProgress);
  });
}

function renumberMembers() {
  $$(".member-card", $("#membersContainer")).forEach((card, index) => {
    const title = $(".member-head strong", card);
    if (title) title.textContent = `Member ${index + 1}`;
  });
}

function collectMembers() {
  return $$(".member-card", $("#membersContainer")).map(card => {
    const get = key => $(`[data-member="${key}"]`, card)?.value?.trim() || "";
    return {
      fullName: get("fullName"),
      age: get("age") === "" ? null : Number(get("age")),
      gender: get("gender"),
      relationship: get("relationship"),
      civilStatus: get("civilStatus"),
      educationLevel: get("educationLevel"),
      schoolAttendance: get("schoolAttendance"),
      healthInsurance: get("healthInsurance"),
      disabilityStatus: get("disabilityStatus"),
      chronicIllness: get("chronicIllness"),
      nationalId: get("nationalId"),
      phone: get("phone")
    };
  });
}

function formToObject() {
  const form = $("#householdForm");
  const fd = new FormData(form);
  const obj = {};

  for (const [key, value] of fd.entries()) {
    if (value instanceof File) continue;
    obj[key] = value;
  }

  const checkboxIds = [
    "ownsRadio", "ownsTV", "ownsMotorbike", "ownsPhone",
    "hasMobileMoney", "mtnMoney", "airtelMoney",
    "hasSacco", "hasIbimina", "hasBank", "hasLoan",
    "supportVup", "supportGirinka", "supportNutrition", "supportOther",
    "interviewAcknowledgement"
  ];

  checkboxIds.forEach(id => {
    obj[id] = $(`#${id}`).checked;
  });

  [
    "gpsLat", "gpsLng", "gpsAccuracy", "disabilityCount", "householdRooms",
    "landSize", "cattle", "goats", "sheep", "pigs", "poultry", "rabbits"
  ].forEach(id => {
    const value = $(`#${id}`)?.value;
    obj[id] = value === "" ? null : Number(value);
  });

  obj.members = collectMembers();
  obj.assignment = assignment ? structuredClone(assignment) : null;

  return obj;
}

function fillHouseholdForm(record) {
  const scalarFields = [
    "householdCode", "interviewDate", "headName", "respondentName", "respondentRelation",
    "householdPhone", "householdNotes", "gpsLat", "gpsLng", "gpsAccuracy", "houseAddress",
    "schoolAttendance", "healthCoverage", "chronicIllness", "disabilityCount",
    "roofMaterial", "wallMaterial", "floorMaterial", "waterSource", "toiletType",
    "lightingSource", "cookingFuel", "householdRooms",
    "employmentStatus", "primaryActivity", "monthlyIncomeBand", "landSize", "landUse",
    "cattle", "goats", "sheep", "pigs", "poultry", "rabbits",
    "creditNotes", "mealsPerDay", "foodShortage", "communitySupport", "vulnerabilityLevel",
    "supportStatus", "supportNotes"
  ];

  scalarFields.forEach(id => {
    const input = $(`#${id}`);
    if (input) input.value = record.data?.[id] ?? record[id] ?? "";
  });

  [
    "ownsRadio", "ownsTV", "ownsMotorbike", "ownsPhone",
    "hasMobileMoney", "mtnMoney", "airtelMoney",
    "hasSacco", "hasIbimina", "hasBank", "hasLoan",
    "supportVup", "supportGirinka", "supportNutrition", "supportOther",
    "interviewAcknowledgement"
  ].forEach(id => {
    const input = $(`#${id}`);
    if (input) input.checked = Boolean(record.data?.[id] ?? record[id]);
  });

  $("#membersContainer").innerHTML = "";
  memberCounter = 0;
  const members = record.data?.members || record.members || [];
  (members.length ? members : [{}]).forEach(addMember);

  hideValidationSummary();
  updateFormProgress();
}

function validateHousehold(data) {
  const errors = [];

  // Check every control explicitly marked required in the form, including added household members.
  $$("#householdForm [required]").forEach(control => {
    if (!control.checkValidity()) {
      const label = control.closest("label")?.childNodes?.[0]?.textContent?.trim()
        || $("label[for='" + control.id + "']")?.textContent?.replace("*", "").trim()
        || control.name || "A required field";
      errors.push(`${label} is required or invalid.`);
    }
  });

  if (!assignment || !assignment.villageId) {
    errors.push("Enumerator assignment is not configured.");
  }

  if (!data.headName) errors.push("Head of household is required.");
  if (!data.interviewDate) errors.push("Interview date is required.");
  else if (data.interviewDate > new Date().toISOString().slice(0, 10)) errors.push("Interview date cannot be in the future.");

  if (!Number.isFinite(data.gpsLat) || !Number.isFinite(data.gpsLng)) {
    errors.push("Valid household GPS latitude and longitude are required.");
  } else if (data.gpsLat < -90 || data.gpsLat > 90 || data.gpsLng < -180 || data.gpsLng > 180) {
    errors.push("GPS coordinates are outside the valid latitude/longitude range.");
  }

  if (Number.isFinite(data.gpsAccuracy) && data.gpsAccuracy > 100) {
    errors.push("GPS accuracy is greater than 100 m. Capture a better fix or confirm the location.");
  }

  if (!Array.isArray(data.members) || data.members.length < 1) {
    errors.push("At least one household member is required.");
  }

  data.members.forEach((member, index) => {
    if (!member.fullName) errors.push(`Member ${index + 1}: full name is required.`);
    if (!Number.isFinite(member.age) || member.age < 0 || member.age > 120) {
      errors.push(`Member ${index + 1}: age must be between 0 and 120.`);
    }
  });

  if (!data.interviewAcknowledgement) {
    errors.push("The review acknowledgement must be checked before local submission.");
  }

  return errors;
}

function showValidationSummary(errors) {
  const box = $("#validationSummary");
  box.classList.remove("hidden");
  box.innerHTML = `
    <strong>Please correct these items:</strong>
    <ul>${errors.map(error => `<li>${escapeHtml(error)}</li>`).join("")}</ul>
  `;
  box.scrollIntoView({ behavior: "smooth", block: "center" });
}

function hideValidationSummary() {
  $("#validationSummary").classList.add("hidden");
  $("#validationSummary").innerHTML = "";
}

function updateFormProgress() {
  const requiredControls = $$("#householdForm [required]");
  const checks = [Boolean(assignment?.villageId), ...requiredControls.map(control => control.checkValidity())];

  const percent = Math.round((checks.filter(Boolean).length / checks.length) * 100);
  $("#formProgressText").textContent = `${percent}%`;
  $("#formProgressBar").style.width = `${percent}%`;

  return percent;
}

/* -----------------------------
   Draft storage
------------------------------ */

function saveDraft() {
  const data = formToObject();

  const draft = {
    savedAt: new Date().toISOString(),
    editingHouseholdId,
    data
  };

  saveJson(CONFIG.draftKey, draft);
  updateDraftView();
  updateStorageView();
  showToast("Draft saved", "Your current form is stored in this browser.");
}

function updateDraftView() {
  const card = $("#savedDraftCard");
  const detail = $("#savedDraftDetail");
  if (!card || !detail) return;
  const draft = loadJson(CONFIG.draftKey, null);
  card.classList.toggle("hidden", !draft?.data);
  if (draft?.data) {
    const when = draft.savedAt ? new Date(draft.savedAt).toLocaleString() : "time unknown";
    detail.textContent = `${draft.data.headName || "Unnamed household"} · saved ${when}`;
  }
}

function restoreSavedDraft() {
  const draft = loadJson(CONFIG.draftKey, null);
  if (!draft?.data) return;
  editingHouseholdId = draft.editingHouseholdId || null;
  $("#formTitle").textContent = editingHouseholdId ? "Edit local draft" : "Continue saved household draft";
  fillHouseholdForm({ data: draft.data });
  navigate("newHousehold");
  showToast("Draft restored", "Your saved work is ready to continue.");
}

/* -----------------------------
   Saving households
------------------------------ */

function saveHouseholdLocally(data) {
  const now = new Date().toISOString();

  if (editingHouseholdId) {
    const index = households.findIndex(item => item.id === editingHouseholdId);

    if (index === -1) {
      showToast("Save failed", "The household record could not be found.", "error");
      return;
    }

    households[index] = {
      ...households[index],
      data,
      headName: data.headName,
      address: data.houseAddress,
      members: data.members,
      gps: { lat: data.gpsLat, lng: data.gpsLng, accuracy: data.gpsAccuracy },
      updatedAt: now,
      status: "pending_sync"
    };
  } else {
    households.push({
      id: crypto.randomUUID ? crypto.randomUUID() : `local-${Date.now()}-${Math.random()}`,
      householdCode: data.householdCode || nextHouseholdCode(),
      headName: data.headName,
      address: data.houseAddress,
      province: assignment?.province || "",
      district: assignment?.district || "",
      sector: assignment?.sector || "",
      cell: assignment?.cell || "",
      village: assignment?.village || "",
      members: data.members,
      gps: {
        lat: data.gpsLat,
        lng: data.gpsLng,
        accuracy: data.gpsAccuracy
      },
      createdAt: now,
      updatedAt: now,
      status: "pending_sync",
      data
    });
  }

  // Keep recent records locally. In a true offline-first design, a production
  // app should use IndexedDB rather than localStorage for larger datasets.
  households.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  households = households.slice(0, CONFIG.maxRecent);

  saveJson(CONFIG.storageKey, households);
  localStorage.removeItem(CONFIG.draftKey);
  updateDraftView();
  updateStorageView();
  updateDashboard();
  updateStorageView();
  renderRecentPreview();
  renderRecentTable();
  renderMapHouseholds();

  showToast(
    editingHouseholdId ? "Household updated" : "Household saved",
    "The record is stored locally and marked pending sync."
  );

  initializeNewForm();
  navigate("recent");
}

function getAssignedHouseholds() {
  if (!assignment?.villageId) return [];
  return households.filter(record =>
    record.village === assignment.village && record.cell === assignment.cell
  );
}

/* -----------------------------
   Tables / dashboard
------------------------------ */

function maskPhone(phone) {
  const value = String(phone || "");
  if (value.length < 5) return value ? "••••" : "—";
  return `${value.slice(0, 4)}•••${value.slice(-2)}`;
}

function maskId(id) {
  const value = String(id || "");
  if (value.length < 5) return value ? "••••" : "—";
  return `••••${value.slice(-3)}`;
}

function statusHtml(status) {
  if (status === "pending_sync") {
    return `<span class="status-badge pending">Pending sync</span>`;
  }
  if (status === "draft") {
    return `<span class="status-badge draft">Draft</span>`;
  }
  return `<span class="status-badge success">Local reviewed</span>`;
}

function renderRecentPreview() {
  const tbody = $("#recentPreviewBody");
  const records = getAssignedHouseholds().slice(0, 10);

  if (!records.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="muted">No households collected for this village yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = records.map(record => `
    <tr>
      <td><strong>${escapeHtml(record.householdCode)}</strong></td>
      <td>${escapeHtml(record.headName || "—")}</td>
      <td>${record.members?.length || 0}</td>
      <td>${escapeHtml(record.address || `${record.cell || ""}, ${record.village || ""}`)}</td>
      <td>${Number.isFinite(Number(record.gps?.lat)) ? "Captured" : "Missing"}</td>
      <td>${statusHtml(record.status)}</td>
    </tr>
  `).join("");
}

function renderRecentTable() {
  const tbody = $("#recentTableBody");
  const query = $("#recentSearch").value.trim().toLowerCase();
  const filter = $("#recentStatusFilter").value;

  let records = getAssignedHouseholds();

  if (query) {
    records = records.filter(record => {
      const source = [
        record.householdCode,
        record.headName,
        record.address,
        record.village,
        record.cell
      ].join(" ").toLowerCase();
      return source.includes(query);
    });
  }

  if (filter !== "all") {
    records = records.filter(record => record.status === filter);
  }

  records = records.slice(0, CONFIG.maxRecent);

  if (!records.length) {
    tbody.innerHTML = `<tr><td colspan="8" class="muted">No matching records.</td></tr>`;
    return;
  }

  tbody.innerHTML = records.map(record => {
    const lat = Number(record.gps?.lat);
    const lng = Number(record.gps?.lng);
    const gpsText = Number.isFinite(lat) && Number.isFinite(lng)
      ? `${lat.toFixed(4)}, ${lng.toFixed(4)}`
      : "Missing";

    return `
      <tr>
        <td><strong>${escapeHtml(record.householdCode)}</strong></td>
        <td>
          ${escapeHtml(record.headName || "—")}
          <small style="display:block;color:#647380">
            ${escapeHtml(maskPhone(record.data?.householdPhone || ""))}
          </small>
        </td>
        <td>${record.members?.length || 0}</td>
        <td>
          ${escapeHtml(record.address || "—")}
          <small style="display:block;color:#647380">
            ${escapeHtml(record.cell || "")} · ${escapeHtml(record.village || "")}
          </small>
        </td>
        <td>${escapeHtml(gpsText)}</td>
        <td>${formatDate(record.updatedAt)}</td>
        <td>${statusHtml(record.status)}</td>
        <td>
          <div class="table-actions">
            <button data-edit="${escapeHtml(record.id)}">Edit</button>
            <button data-focus-map="${escapeHtml(record.id)}">Map</button>
          </div>
        </td>
      </tr>
    `;
  }).join("");

  $$("[data-edit]", tbody).forEach(btn => {
    btn.addEventListener("click", () => openEditHousehold(btn.dataset.edit));
  });

  $$("[data-focus-map]", tbody).forEach(btn => {
    btn.addEventListener("click", () => focusHouseholdOnMap(btn.dataset.focusMap));
  });
}

function focusHouseholdOnMap(id) {
  const record = households.find(item => item.id === id);
  if (!record || !Number.isFinite(Number(record.gps?.lat))) {
    showToast("No GPS", "This household does not have a valid location.", "error");
    return;
  }

  navigate("overview");
  setTimeout(() => {
    const marker = householdMarkers.get(id);
    if (marker && map) {
      map.setView(marker.getLatLng(), 18);
      marker.openPopup();
    }
  }, 120);
}

function updateDashboard() {
  const records = getAssignedHouseholds();
  const pending = records.filter(r => r.status === "pending_sync").length;
  const gpsCount = records.filter(r => Number.isFinite(Number(r.gps?.lat))).length;

  $("#statHouseholds").textContent = records.length;
  $("#statPending").textContent = pending;
  $("#statGps").textContent = gpsCount;
  $("#statQuota").textContent = "—";
}

function updateStorageView() {
  const drafts = loadJson(CONFIG.draftKey, null)?.data ? 1 : 0;
  const pending = households.filter(r => r.status === "pending_sync").length;
  const json = JSON.stringify(households);

  $("#storageRecords").textContent = households.length;
  $("#storageDrafts").textContent = drafts;
  $("#storagePending").textContent = pending;
  $("#storageSize").textContent = `${(new Blob([json]).size / 1024).toFixed(1)} KB`;
}

function formatDate(dateString) {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-RW", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

/* -----------------------------
   Event bindings
------------------------------ */

function bindFormEvents() {
  $("#addMemberBtn").addEventListener("click", () => {
    addMember();
    updateFormProgress();
  });

  $("#captureGpsBtn").addEventListener("click", captureGpsIntoForm);
  $("#saveDraftBtn").addEventListener("click", saveDraft);
  $("#saveDraftTopBtn").addEventListener("click", saveDraft);
  $("#openSavedDraftBtn")?.addEventListener("click", restoreSavedDraft);

  $("#resetFormBtn").addEventListener("click", () => {
    const confirmReset = window.confirm("Reset this form and discard current unsaved entries?");
    if (!confirmReset) return;

    localStorage.removeItem(CONFIG.draftKey);
    updateDraftView();
    updateStorageView();
    initializeNewForm();
    showToast("Form reset", "Unsaved form values were cleared.");
  });

  $("#householdForm").addEventListener("input", updateFormProgress);
  $("#householdForm").addEventListener("change", updateFormProgress);

  $("#householdForm").addEventListener("submit", event => {
    event.preventDefault();

    const data = formToObject();
    const errors = validateHousehold(data);

    if (errors.length) {
      showValidationSummary(errors);
      showToast("Validation needed", `${errors.length} item(s) need attention.`, "error");
      return;
    }

    hideValidationSummary();
    saveHouseholdLocally(data);
  });
}

function bindAssignmentEvents() {
  $("#editAssignmentBtn").addEventListener("click", openAssignmentEditor);

  $("#cancelAssignmentBtn").addEventListener("click", () => {
    $("#assignmentForm").classList.add("hidden");
  });

  $("#assignmentForm").addEventListener("submit", event => {
    event.preventDefault();

    const newAssignment = createAssignmentFromForm();

    if (!validateAssignment(newAssignment)) {
      showToast("Assignment incomplete", "Select Province, District, Sector, Cell and Village.", "error");
      return;
    }

    assignment = newAssignment;
    saveJson(CONFIG.assignmentKey, assignment);

    $("#assignmentForm").classList.add("hidden");
    renderAssignment();
    initializeNewForm();
    renderRecentPreview();
    renderRecentTable();
    renderMapHouseholds();

    showToast("Assignment saved", `Enumerator assigned to ${assignment.village}.`);
  });
}

function bindSearch() {
  $("#recentSearch").addEventListener("input", renderRecentTable);
  $("#recentStatusFilter").addEventListener("change", renderRecentTable);
}

function bindUtilityEvents() {
  $("#locateBtn").addEventListener("click", locateCurrentGps);

  $("#helpBtn").addEventListener("click", () => {
    $("#helpModal").classList.remove("hidden");
    $("#helpModal").setAttribute("aria-hidden", "false");
  });

  $$("[data-close-modal]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.closeModal;
      $(`#${id}`)?.classList.add("hidden");
      $(`#${id}`)?.setAttribute("aria-hidden", "true");
    });
  });

  $("#exportJsonBtn").addEventListener("click", exportJsonBackup);

  $("#clearLocalBtn").addEventListener("click", () => {
    const confirmed = window.confirm(
      "This will permanently remove all households stored in this browser. Continue?"
    );

    if (!confirmed) return;

    households = [];
    localStorage.removeItem(CONFIG.storageKey);
    localStorage.removeItem(CONFIG.draftKey);

    updateDraftView();
    updateStorageView();
    updateDashboard();
    updateStorageView();
    renderRecentPreview();
    renderRecentTable();
    renderMapHouseholds();

    showToast("Local records cleared", "All stored household records were removed.");
  });
}

function exportJsonBackup() {
  const payload = {
    exportedAt: new Date().toISOString(),
    application: "Rwanda SafeNet Metrics",
    prototype: true,
    assignment,
    households
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `rsnm-households-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);

  showToast("Backup exported", "A JSON copy of the local prototype data was created.");
}

/* -----------------------------
   Keep recent 100 only
------------------------------ */

function enforceRecentLimit() {
  households.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  households = households.slice(0, CONFIG.maxRecent);
  saveJson(CONFIG.storageKey, households);
}

/* -----------------------------
   Initialization
------------------------------ */

document.addEventListener("DOMContentLoaded", async () => {
  loadProfile();
  enforceRecentLimit();
  initMap();
  bindAssignmentCascade();
  bindAssignmentEvents();
  bindFormEvents();
  bindSearch();
  bindUtilityEvents();
  setupNavigation();

  renderAssignment();
  initializeNewForm();
  updateDashboard();
  updateStorageView();
  updateDraftView();
  renderRecentPreview();
  renderRecentTable();
  renderMapHouseholds();

});
