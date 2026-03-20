//const BASE_URL = "http://192.168.100.178:8080/KanpurDashboard/Kanpur";
//  const BASE_URL = `${BASE_URL_All}:8980/Kanpur`;
const GEOSERVER_BASE_URL = "http://localhost:8080/geoserver/KNN_Summary";
const GEOSERVER_BASE_URL1 = "http://localhost:8080/geoserver/Lko_Summary";
ol.proj.useGeographic();

//const url =`http://127.0.0.1:5506/kanpur_chainage.html?project_id=11937&user_id=1&title=Zone-2
//`
//  `kanpur_chain.html?project_id=${projectId}&user_id=${userId}&title=Zone-${zoneNo}`;

//window.location.href = url;

//---------------------- header section start --------------------------//

// Grouped event listeners for similar functionality
function hideElements(elementIds) {
  elementIds.forEach(id => {
    const element = document.getElementById(id);
    if (element) { element.style.display = 'none' }
  });
}

function showElements(elementIds) {
  elementIds.forEach(id => {
    const element = document.getElementById(id);
    if (element) { element.style.display = 'block'; }
  });
}


//------------------------------------ summary tables show and hide elements -------------------------


var map, geojson, featureOverlay, overlays, style;
var selected, features, layer_name, layerControl;
var content, draw;
var selectedFeature;
// const london = fromLonLat([-0.12755, 51.507222]);

var view = new ol.View({
  projection: "EPSG:4326",
  center: [80.34265472151804, 26.43371408707257],
  zoom: 12.5,
});

var base_maps = new ol.layer.Group({
  title: "Base maps",
  layers: [
    new ol.layer.Tile({
      title: "OSM",
      type: "base",
      visible: false,
      source: new ol.source.OSM(),

    }),
    new ol.layer.Tile({
      title: "CartoDB Positron",
      type: "base",
      visible: false,
      source: new ol.source.XYZ({
        url: "https://{1-4}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
        attributions:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        crossOrigin: "anonymous"
      }),
    }),
    new ol.layer.Tile({
      source: new ol.source.TileJSON({
        attributions: "@MapTiler",
        url: "https://api.maptiler.com/maps/toner-v2/tiles.json?key=iVy8qXSX5hN7aJhQp2Na",
        crossOrigin: "anonymous"
      }),
      title: "Toner",
      type: "base",
      visible: false,
    }),

    new ol.layer.Tile({
      source: new ol.source.TileJSON({
        attributions: "@MapTiler",
        url: "https://api.maptiler.com/maps/topo-v2/tiles.json?key=iVy8qXSX5hN7aJhQp2Na",
        crossOrigin: "anonymous"
      }),
      title: "Topo",
      type: "base",
      visible: false,
      maxZoom: 23,
    }),

    new ol.layer.Tile({
      source: new ol.source.TileJSON({
        attributions: "@MapTiler",
        url: "https://api.maptiler.com/maps/backdrop/tiles.json?key=iVy8qXSX5hN7aJhQp2Na",
        crossOrigin: "anonymous"
      }),
      title: "Backdrop",
      type: "base",
      visible: false,
    }),

    new ol.layer.Tile({
      source: new ol.source.TileJSON({
        attributions: "@MapTiler",
        url: "https://api.maptiler.com/maps/outdoor-v2/tiles.json?key=iVy8qXSX5hN7aJhQp2Na",
        crossOrigin: "anonymous",
      }),
      title: "Outdoor",
      type: "base",
      visible: false,
    }),
    new ol.layer.Tile({
      title: "Satellite",
      type: "base",
      visible: true,
      source: new ol.source.XYZ({
        //  attributions: ['Powered by Esri',
        //      'Source: Esri, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community'
        //  ],
        attributionsCollapsible: false,
        url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        crossOrigin: "anonymous",
        maxZoom: 23,
      }),
    }),
  ],
});

var overlays = new ol.layer.Group({
  title: "Overlays",
  layers: [],
});

map = new ol.Map({
  target: "map",
  view: view,
  // overlays: [overlay]
});
window.olMap = map;
map.addLayer(base_maps);
map.addLayer(overlays);

var OSM = new ol.layer.Tile({
  source: new ol.source.OSM(),
  type: "base",
  title: "OSM",
});

layerSwitcher = new ol.control.LayerSwitcher({
  activationMode: "click",
  startActive: false,
  tipLabel: "Layers", // Optional label for button
  groupSelectStyle: "children", // Can be 'children' [default], 'group' or 'none'
  collapseTipLabel: "Collapse layers",
});

map.addControl(layerSwitcher);

layerSwitcher.renderPanel();
var mouse_position = new ol.control.MousePosition({
  coordinateFormat: ol.coordinate.createStringXY(4),
  projection: 'EPSG:4326'
});

map.addControl(mouse_position);
var scale_line = new ol.control.ScaleLine({
  units: 'metric',
  bar: true,
  steps: 6,
  text: true,
  minWidth: 140,
  target: 'scale_bar'
});

map.addControl(scale_line);

//---------------------Humburger menu code (can be enabled if sidebar functionality is needed in the future)------------------//

// const hamburger = document.querySelector(".hamburger");
// const sidebar = document.querySelector(".sidebar");
// const cancelIcon = document.querySelector(".cancel-icon");

// hamburger.addEventListener("click", () => {
//   sidebar.classList.toggle("show");

// });

// cancelIcon.addEventListener("click", () => {
//   sidebar.classList.remove("show");
// });

//-----------------------------------Boundaries------------------------------------//
var zone_boundary = new ol.layer.Image({
  title: "Kanpur Zone Boundary",
  //  extent: [-180, -90, -180, 90],
  source: new ol.source.ImageWMS({
    url: `${GEOSERVER_BASE_URL}/wms?`,
    crossOrigin: "anonymous", //  REQUIRED
    params: {
      LAYERS: "KNN_Summary:kanpur_zone__boundary",
    },
    ratio: 1,
    serverType: "geoserver",
  }),
});
//overlays.getLayers().push(LNN_Boundary);
map.addLayer(zone_boundary);

var ward_boundary = new ol.layer.Image({
  title: "Kanpur Ward Boundary",
  //  extent: [-180, -90, -180, 90],
  source: new ol.source.ImageWMS({
    url: `${GEOSERVER_BASE_URL}/wms?`,
    crossOrigin: "anonymous", //  REQUIRED
    params: {
      LAYERS: "KNN_Summary:kanpur_ward_boundary",
    },
    ratio: 1,
    serverType: "geoserver",
  }),
});

map.addLayer(ward_boundary);
var knp_road = new ol.layer.Image({
  title: "Road Zone 2",
  visible: false,   // 👈 START HIDDEN
  source: new ol.source.ImageWMS({
    url: `${GEOSERVER_BASE_URL1}/wms?`,
    crossOrigin: "anonymous", //  REQUIRED
    params: {
      LAYERS: "Lko_Summary:segmentszone2roads",
    },
    ratio: 1,
    serverType: "geoserver",
  }),
});

map.addLayer(knp_road);

var knp_chain = new ol.layer.Image({
  title: "Chainage Zone 2",
  visible: false,   // 👈 START HIDDEN
  source: new ol.source.ImageWMS({
    url: `${GEOSERVER_BASE_URL1}/wms?`,
    crossOrigin: "anonymous", //  REQUIRED
    params: {
      LAYERS: "Lko_Summary:interpolatedpoints",
    },
    ratio: 1,
    serverType: "geoserver",
  }),
});
;
map.addLayer(knp_chain);


// Assuming knp_road is the road layer you want to toggle visibility for
// Add event listener for the button to toggle road visibility
document.getElementById("ShowRoads").addEventListener("click", function () {
  // Check if the road layer is currently visible or not
  const isVisible = knp_road.getVisible();

  // Toggle visibility based on current state
  knp_road.setVisible(!isVisible); // If visible, set it to false, and vice versa

  // Optional: Update the button appearance or title based on visibility
  if (isVisible) {
    this.title = "Show Roads"; // Update title when road is hidden
    this.style.backgroundColor = ""; // You can change the button color to indicate off
  } else {
    this.title = "Hide Roads"; // Update title when road is shown
    this.style.backgroundColor = "#d3d3d3"; // Example: change button color to indicate on
  }
});





//----------------Session code-----------------------//


const urlParams = new URLSearchParams(window.location.search);
const projectIdFromUrl = urlParams.get("project_id");
const userIdFromUrl = urlParams.get("user_id");
const titleFromUrl = urlParams.get("title"); // "Zone-4"


//------------------------------------------- Chainage Functionality -------------------------//
const patchSource = new ol.source.Vector();

const patchLayer = new ol.layer.Vector({
  source: patchSource,
  style: new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: "#FF0000",
      width: 4
    })
  }),
  visible: false
});

map.addLayer(patchLayer);

//---------------function for cancel btn----------------//
const closeUniqueIdPanel1 = document.getElementById("closeUniqueIdPanel")

function openUniqueIdPanel() {
  document.getElementById("uniqueIdPanel").classList.remove("hidden");

}
//---------------close all panels and reset UI----------------//
function closeUniqueIdPanel() {
  document.getElementById("uniqueIdPanel").classList.add("hidden");

  document.getElementById("startPoint").innerHTML = "";
  document.getElementById("endPoint").innerHTML = "";

  selectedRoadId = null;
  selectedRoadName = null;
  selectedZone1 = null;
  selectedWard1 = null;

  hideChainageForRoad();
  patchSource.clear();
  patchLayer.setVisible(false);

  hidePatchTable();
  document.getElementById("viewChainageSection").classList.add("hidden");
document.getElementById("viewpatch-select").classList.add("hidden");
  document.getElementById("downloadBtn").classList.add("hidden");
}

// function closeChainage() {
//   section.classList.add("hidden");
// }
closeUniqueIdPanel1.addEventListener("click", () => {
  closeUniqueIdPanel();
 // closeChainage();
  resetRoadSelectionUI();
  
});
//--------------------------- Road Click Handling with zoom-------------------------//
async function zoomToRoadExtent(roadId) {
  const view = map.getView();
  const projection = view.getProjection().getCode();

  const wfsUrl =
    `${GEOSERVER_BASE_URL1}/ows?` +
    new URLSearchParams({
      service: "WFS",
      version: "2.0.0",
      request: "GetFeature",
      typeName: "Lko_Summary:segmentszone2roads",
      outputFormat: "application/json",
      srsName: projection,
      cql_filter: `road_id='${roadId}'`
    });

  try {
    const res = await fetch(wfsUrl);
    const geojson = await res.json();

    if (!geojson.features || geojson.features.length === 0) return;

    const format = new ol.format.GeoJSON();
    let extent = ol.extent.createEmpty();

    geojson.features.forEach(f => {
      const geom = format.readGeometry(f.geometry);
      ol.extent.extend(extent, geom.getExtent());
    });

    view.fit(extent, {
      padding: [80, 80, 80, 80],
      duration: 700,
      maxZoom: 18
    });

  } catch (err) {
    console.error("Zoom to road extent failed:", err);
  }
}
// Map click handler to handle feature selection
map.on("singleclick", async function (evt) {
  // Check visibility of required layers and if the "Show Roads" button is toggled on
  if (
    !zone_boundary.getVisible() ||
    !ward_boundary.getVisible() ||
    !knp_road.getVisible() // Check if roads are visible before performing any action
  ) {
    return;
  }

  // Reset the road selection UI before processing the new selection
  resetRoadSelectionUI();

  // Get the current map view for resolution and projection
  const view = map.getView();
  const resolution = view.getResolution();
  const projection = view.getProjection().getCode();

  // Build the URL for querying the road feature information
  const url = knp_road.getSource().getFeatureInfoUrl(
    evt.coordinate,  // Coordinates of the click event
    resolution,
    projection,
    {
      INFO_FORMAT: "application/json",
      QUERY_LAYERS: "Lko_Summary:segmentszone2roads",
      FEATURE_COUNT: 1  // Only fetch 1 feature
    }
  );

  if (!url) return;  // If no URL is returned, exit early

  try {
    // Fetch the feature info using the URL
    const res = await fetch(url);
    const data = await res.json();

    // Check if features are available in the response
    if (!data.features || data.features.length === 0) {
      return;  // No features, so nothing to do
    }

    // Extract road details from the feature properties
    const feature = data.features[0];
    selectedRoadId = feature.properties.road_id || feature.properties.gid;
    selectedRoadName = feature.properties.road_name || feature.properties.gid;
    selectedZone1 = feature.properties.zone_no || feature.properties.gid;
    selectedWard1 = feature.properties.ward_no || feature.properties.gid;

    // Perform actions after the road is selected
    zoomToRoadExtent(selectedRoadId);  // Zoom to the extent of the selected road
    checkRoadInPatchTable(selectedRoadId);  // Check if the road exists in the patch table

    // Optional: Display road information (can be enabled if needed)
    // document.getElementById("roadIdDisplay").innerText = `Road ID: ${selectedRoadId}`;
    // document.getElementById("roadNameDisplay").innerText = `Road Name: ${selectedRoadName}`;

    // Show chainage information for the selected road
    showChainageForSelectedRoad(selectedRoadId);

    // Open the panel with the unique road ID
    openUniqueIdPanel();

    // Load additional distance data from the database for the selected road
    loadDistancesFromDB(selectedRoadId);

  } catch (err) {
    console.error("Road click error:", err);  // Log errors if any
  }
});



//--------------- Reset UI function to clear filters and hide elements ----------------//
function resetRoadFilterUI() {
  const source = RoadLayer.getSource();
  source.updateParams({
    CQL_FILTER: null
  });
  source.updateParams({
    STYLES: "CUS-SLD"
  });
  //  FORCE WMS REFRESH
  source.changed();
  ClassSelect.value = "";
  ValueSelect.style.display = "none";
  ValueSelect.disabled = true;
  ValueSelect.innerHTML = `<option value="">-- Select Value --</option>`;
}
//------------------- Chainage display handling -------------------------//
function showChainageForSelectedRoad(roadId) {
  const source = knp_chain.getSource();
  source.updateParams({
    CQL_FILTER: `road_id = '${roadId}'`,
    STYLES: "knp_chain_label"   //  labels ON
  });
  knp_chain.setVisible(true);
  source.changed();
}
function hideChainageForRoad() {
  const source = knp_chain.getSource();
  source.updateParams({
    CQL_FILTER: null,
    STYLES: "knp_chain_plain"   // labels OFF
  });
  knp_chain.setVisible(false);
}
//-------------------- Load distances for dropdowns from DB -------------------------//
async function loadDistancesFromDB(roadId) {
  const startSelect = document.getElementById("startPoint");
  const endSelect = document.getElementById("endPoint");
  startSelect.innerHTML = `<option value="">-Select Start-</option>`;
  endSelect.innerHTML = `<option value="">-Select End-</option>`;
  try {
    const res = await fetch(`http://localhost:8800/Kanpur/chainage/${roadId}`);
    const data = await res.json();
    if (!data || data.length === 0) {
      alert("No chainage data found for this road");
      return;
    }
    const startLabel = document.createElement("option");
    startLabel.value = 0;
    startLabel.textContent = "Start";
    startSelect.appendChild(startLabel);
    data.forEach(row => {
      const opt1 = document.createElement("option");
      opt1.value = row.distance;
      opt1.textContent = row.distance;
      const opt2 = opt1.cloneNode(true);
      startSelect.appendChild(opt1);
      endSelect.appendChild(opt2);
    });
    const lastDistance = Number(data[data.length - 1].distance);
    const endLabel = document.createElement("option");
    endLabel.value = lastDistance + 10;
    endLabel.textContent = "End";
    endSelect.appendChild(endLabel);
  } catch (err) {
    console.error("Error loading distances:", err);
  }
}
//--
function getSessionId() {
  let sessionId = sessionStorage.getItem("patch_session_id");

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem("patch_session_id", sessionId);
  }

  return sessionId;
}

/*document.getElementById("submitUniqueId").addEventListener("click", async () => {
  const startSelect = document.getElementById("startPoint");
  const endSelect = document.getElementById("endPoint");
  const startPoint = startSelect.value;
  const endPoint = endSelect.value;

  if (!startPoint || !endPoint) {
    alert("Select start and end points");
    return;
  }

  // Generate or retrieve session ID (use your existing method to get session ID)
  const session_id = getSessionId();

  const payload = {
    road_id: selectedRoadId,
    startPoint,
    endPoint,
    project_id: projectIdFromUrl,
    user_id: userIdFromUrl,
    session_id
  };

  console.log("PATCH PAYLOAD:", payload); // Log the payload before making the request

  try {
    // Step 1: Create patch via POST request
    const res = await fetch("http://localhost:8800/Kanpur/create-patch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error);

    alert(
      `Patch created!\nPatch ID: ${data.patch_id}\nSegments: ${data.segments_inserted}`
    );

    // Step 2: Extract values from response
    const roadId = selectedRoadId;  // Assuming selectedRoadId is already defined
    const patchId = data.patch_id;  // From the response
    const segments = data.segments_inserted; // Assuming segments inserted data is returned
    const projectId = projectIdFromUrl; // From the URL

    // Log the extracted data for demonstration purposes
    console.log("Extracted Data:", { roadId, patchId, segments, projectId });

    // Step 3: Send the data to the demo URL
    const demoUrl = "https://httpbin.org/post"; // Replace with the demo URL
    //const demoUrl = "https://kmc.igilesolutions.com/api/v1/writedata"; // Replace with the demo URL

    const demoPayload = {
      road_id: roadId,
      patch_id: patchId,
      segment_id: segments,
      project_id: projectId
    };

    const demoRes = await fetch(demoUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(demoPayload)
    });

    const demoData = await demoRes.json();

    if (demoRes.ok) {
      console.log("Data sent to demo URL successfully:", demoData);
      alert("Patch data sent to demo URL successfully!");
    } else {
      throw new Error(demoData.error || "Error sending data to demo URL");
    }

    // Fetch session data after patch creation (optional)
    const sessionRes = await fetch(
      `http://localhost:8800/Kanpur/session-patches-grouped?project_id=${projectIdFromUrl}&session_id=${session_id}`
    );

    const sessionData = await sessionRes.json();
    console.log("SESSION PATCH DATA:", sessionData.patches);

  } catch (err) {
    console.error(err);
    alert("Patch creation or demo URL data sending failed");
  }
});*/


// Event listener for creating patch and session URL
document.getElementById("submitUniqueId").addEventListener("click", async () => {
  const startSelect = document.getElementById("startPoint");
  const endSelect = document.getElementById("endPoint");
  const startPoint = startSelect.value;
  const endPoint = endSelect.value;

  if (!startPoint || !endPoint) {
    alert("Select start and end points");
    return;
  }

  // Generate or retrieve session ID (use your existing method to get session ID)
  const session_id = getSessionId();

  const payload = {
    road_id: selectedRoadId,
    startPoint,
    endPoint,
    project_id: projectIdFromUrl,
    user_id: userIdFromUrl,
    session_id
  };

  console.log("PATCH PAYLOAD:", payload); // Log the payload before making the request

  try {
    // Step 1: Create patch via POST request
    const res = await fetch("http://localhost:8800/Kanpur/create-patch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error);

    alert(
      `Patch created!\nPatch ID: ${data.patch_id}\nSegments: ${data.segments_inserted}\n Click on Chainage Road to view Patchs`
    );

    // Store extracted data for sending to demo URL later
    const roadId = selectedRoadId;  // Assuming selectedRoadId is already defined
    const patchId = data.patch_id;  // From the response
    const segments = data.segments_inserted; // Assuming segments inserted data is returned
    const projectId = projectIdFromUrl; // From the URL

    // Log the extracted data for demonstration purposes
    console.log("Extracted Data:", { roadId, patchId, segments, projectId });

    // Store the data for the demo URL sending
    window.demoData = { roadId, patchId, segments, projectId };

    // Fetch session data after patch creation (optional)
    const sessionRes = await fetch(
      `http://localhost:8800/Kanpur/session-patches-grouped?project_id=${projectIdFromUrl}&session_id=${session_id}`
    );

    const sessionData = await sessionRes.json();
    console.log("SESSION PATCH DATA:", sessionData.patches);

  } catch (err) {
    console.error(err);
    alert("Patch creation failed");
  }
});



async function elementToPNGBlob(element) {
  const canvas = await html2canvas(element, {
    useCORS: true,
    backgroundColor: "#ffffff",
    scale: 1
  });

  return new Promise(resolve => {
    canvas.toBlob(blob => resolve(blob), "image/png");
  });
}





/*
document.getElementById("submitUniqueId").addEventListener("click", async () => {
  const startSelect = document.getElementById("startPoint");
  const endSelect = document.getElementById("endPoint");
  const startPoint = startSelect.value;
  const endPoint = endSelect.value;

  if (!startPoint || !endPoint) {
    alert("Select start and end points");
    return;
  }

  // Generate or retrieve session ID (use your existing method to get session ID)
  const session_id = getSessionId();

  const payload = {
    road_id: selectedRoadId,
    startPoint,
    endPoint,
    project_id: projectIdFromUrl,
    user_id: userIdFromUrl,
    session_id
  };

  console.log("PATCH PAYLOAD:", payload); // Log the payload before making the request

  try {
    // Step 1: Create patch via POST request to your backend
    const res = await fetch("http://localhost:8800/Kanpur/create-patch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error);

    alert(
      `Patch created!\nPatch ID: ${data.patch_id}\nSegments: ${data.segments_inserted}`
    );

    // Step 2: Extract values from the response
    const roadId = selectedRoadId;  // Assuming selectedRoadId is already defined
    const patchId = data.patch_id;  // From the response
    const segments = data.segments_inserted; // Assuming segments inserted data is returned
    const projectId = projectIdFromUrl; // From the URL

    // Log the extracted data for demonstration purposes
    console.log("Extracted Data:", { roadId, patchId, segments, projectId });

    // Step 3: Send the data to the demo URL
    const demoUrl = "https://kmc.igilesolutions.com/api/v1/writedata";  // Replace with the demo URL

    const demoPayload = {
      name: "raghav",  // Example name
      payload: `Road ID: ${roadId}, Patch ID: ${patchId}, Segments: ${segments}, projectId:${projectId}`  // Example payload data
    };

    // Send the data to the demo URL with API Key
    const demoRes = await fetch(demoUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": "pk_QBbEyU3Pl8ItwsIzpqAgLVGiVnA3dyAHL2qkkWs2mMkvsv7l"  // Your API Key
      },
      body: JSON.stringify(demoPayload)
    });

    const demoData = await demoRes.json();

    if (demoRes.ok) {
      console.log("Data sent to demo URL successfully:", demoData);
      alert("Patch data sent to demo URL successfully!");
    } else {
      throw new Error(demoData.error || "Error sending data to demo URL");
    }

    // Fetch session data after patch creation (optional)
    const sessionRes = await fetch(
      `http://localhost:8800/Kanpur/session-patches-grouped?project_id=${projectIdFromUrl}&session_id=${session_id}`
    );

    const sessionData = await sessionRes.json();
    console.log("SESSION PATCH DATA:", sessionData.patches);

  } catch (err) {
    console.error(err);
    alert("Patch creation or demo URL data sending failed");
  }
});
*/

async function checkRoadInPatchTable(roadId) {
  try {
    const res = await fetch(`http://localhost:8800/Kanpur/check-road-patch/${roadId}`);
    const data = await res.json();
    const section = document.getElementById("viewChainageSection");
    if (data.exists) {
      section.classList.remove("hidden");
    } else {
      section.classList.add("hidden");
    }
  } catch (err) {
    console.error("Patch check failed:", err);
  }
}



// document.querySelectorAll('input[name="viewChainage"]').forEach(radio => {
//   radio.addEventListener("change", async (e) => {

//     if (!selectedRoadId) return;

//     if (e.target.value === "yes") {
//       hideChainageForRoad();

//       const res = await fetch(
//         `http://localhost:8800/Kanpur/patch/geometry/${selectedRoadId}`
//       );
//       const geojson = await res.json();

//       const format = new ol.format.GeoJSON();
//       const features = format.readFeatures(geojson, {
//         featureProjection: map.getView().getProjection()
//       });

//       patchSource.clear();
//       patchSource.addFeatures(features);
//       patchLayer.setVisible(true);

//       showPatchTable(selectedRoadId);

//     } else {
//       patchSource.clear();
//       patchLayer.setVisible(false);
//       showChainageForSelectedRoad(selectedRoadId);
//       hidePatchTable();
//     }
//   });
// });

//--------- Updated event listener to check if a road is selected before proceeding with chainage display logic ---------//
document.querySelectorAll('input[name="viewChainage"]').forEach(radio => {
  radio.addEventListener("change", async (e) => {
    if (e.target.value === "yes") {
      // hideChainageForRoad(selectedRoadId);
      showPatchTable(selectedRoadId);
      loadPatchesByRoad(selectedRoadId);
      const res = await fetch(`http://localhost:8800/Kanpur/patch/geometry/${selectedRoadId}`);
      const geojson = await res.json();
      const format = new ol.format.GeoJSON();

      allPatchFeatures = format.readFeatures(geojson, {
        featureProjection: map.getView().getProjection()
      });
      patchSource.clear();
      patchSource.addFeatures(allPatchFeatures);
      patchLayer.setVisible(true);
    } else {
      hidePatchTable();
      hidepatchselect();
      showChainageForSelectedRoad(selectedRoadId);
      patchSource.clear();
      patchLayer.setVisible(false);
      allPatchFeatures = [];
      closeUpdatePatchPanel();
    }
  });
});

async function showPatchTable(roadId, patchId = null) {
  const tableDiv = document.getElementById("ChainageTable");
  tableDiv.style.display = "block";
  const url = patchId ? `http://localhost:8800/Kanpur/segments-by-road/${roadId}?patchId=${patchId}` : `http://localhost:8800/Kanpur/segments-by-road/${roadId}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.length) {
    tableDiv.innerHTML = "<p>No data</p>";
    return;
  }
  const cols = Object.keys(data[0]);
  let html = "<table border='1'><thead><tr>";
  cols.forEach(c => html += `<th>${c}</th>`);
  html += "</tr></thead><tbody>";
  data.forEach(row => {
    html += "<tr>";
    cols.forEach(c => html += `<td>${row[c]}</td>`);
    html += "</tr>";
  });
  html += "</tbody></table>";
  tableDiv.innerHTML = html;
  //disablePatchTableEdit();

}

function showpatchselect() {
  document.getElementById("viewpatch-select").classList.remove("hidden");
}
function hidepatchselect() {
  document.getElementById("viewpatch-select").classList.add("hidden");
}
async function loadPatchesByRoad(roadId) {
  const panel = document.getElementById("viewpatch-select");
  // Reset panel
  panel.innerHTML = "";
  panel.innerHTML = `<div style="text-align:center">Select Patch<div> <hr>`;
  panel.classList.remove("hidden");
  if (!roadId) return;
  try {
    const response = await fetch(`http://localhost:8800/Kanpur/patches-by-road/${roadId}`);
    const patches = await response.json();
    if (patches.length === 0) {
      panel.innerHTML = "<em>No patches found</em>";
      return;
    }
    const allLabel = document.createElement("label");
    allLabel.className = "patch-option";
    const allRadio = document.createElement("input");
    allRadio.type = "radio";
    allRadio.checked = true; // default
    allRadio.addEventListener("change", () => {
      showPatchTable(selectedRoadId);
      showAllPatches();
      // closeUpdatePatchPanel();
    });
    allLabel.appendChild(allRadio);
    allLabel.append(" All");
    allRadio.name = "patchRadio";
    allRadio.value = "__all__";
    panel.appendChild(allLabel);
    patches.forEach(p => {
      const label = document.createElement("label");
      label.className = "patch-option";
      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = "patchRadio";
      radio.value = p.patch_id;
      radio.addEventListener("change", () => {
        showSinglePatch(p.patch_id);
        showPatchTable(selectedRoadId, p.patch_id);
        openUpdatePatchPanel();
      });
      label.appendChild(radio);
      label.append(" " + p.patch_id);
      panel.appendChild(label);
    });
  } catch (err) {
    console.error("Failed to load patches:", err);
  }
}
function resetPatchPanel() {
  const panel = document.getElementById("viewpatch-select");
  panel.innerHTML = "";
  panel.classList.add("hidden");
  // reset patch radios
  document.querySelectorAll('input[name="viewChainage"]').forEach(r => {
    r.checked = false;
  });
}
function showAllPatches() {
  patchSource.clear();
  patchSource.addFeatures(allPatchFeatures);
  patchLayer.setVisible(true);
}
function showSinglePatch(patchId) {
  patchSource.clear();
  const filtered = allPatchFeatures.filter(f =>
    f.get("patch_id") === patchId
  );
  patchSource.addFeatures(filtered);
  patchLayer.setVisible(true);
}

function openUpdatePatchPanel() {
  document.getElementById("updatePatchPanel").classList.remove("hidden");
  document.querySelectorAll('input[name="updatePatchChoice"]').forEach(r => r.checked = false);
}
function closeUpdatePatchPanel() {
  document.getElementById("updatePatchPanel").classList.add("hidden");
}
// document.querySelectorAll('input[name="updatePatchChoice"]').forEach(radio => {radio.addEventListener("change", e => {
//       if (e.target.value === "yes") {
//         console.log("User chose YES → update patch");
//         //  open update form
//       }
//       if (e.target.value === "no") {
//         closeUpdatePatchPanel();
//       }
//     });
//   });

const NON_EDITABLE_COLUMNS = ["segment_id", "road_id", "geom"];
let patchTableDirty = false;


document.querySelectorAll('input[name="updatePatchChoice"]').forEach(radio => {
  radio.addEventListener("change", e => {

    if (e.target.value === "yes") {
      console.log("User chose YES → update patch");
      const selectedPatch = document.querySelector('input[name="patchRadio"]:checked')?.value;
      openPatchUpdateForm(selectedRoadId, selectedPatch);
      // enablePatchTableEdit();     // 🔓 activate table
      // closeUpdatePatchPanel();    // hide choice panel
    }

    if (e.target.value === "no") {
      // disablePatchTableEdit();    // 🔒 keep table locked
      closeUpdatePatchPanel();
      closeUpdatePatchForm();
    }

  });
});
async function openPatchUpdateForm(roadId, patchId) {
  const form = document.getElementById("updatePatchForm");
  const grid = document.getElementById("patchSegmentGrid");

  form.classList.remove("hidden");
  grid.innerHTML = "Loading...";

  try {
    const res = await fetch(
      `http://localhost:8800/Kanpur/segments/${roadId}/${patchId}`
    );

    if (!res.ok) {
      throw new Error("HTTP error " + res.status);
    }

    const result = await res.json();

    // 🔑 backend returns { exists, data }
    if (!result.exists || !Array.isArray(result.data) || result.data.length === 0) {
      grid.innerHTML = "<em>No segments found for this patch</em>";
      return;
    }

    const data = result.data;
    const columns = Object.keys(data[0]);

    const table = document.createElement("table");


    // ---------- HEADER ----------
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    columns.forEach(col => {
      const th = document.createElement("th");
      th.textContent = col;

      headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // ---------- BODY ----------
    const tbody = document.createElement("tbody");

    data.forEach(row => {
      const tr = document.createElement("tr");

      columns.forEach(col => {
        const td = document.createElement("td");
        td.style.border = "1px solid #ccc";
        td.style.padding = "4px";

        if (col === "segment_id") {
          td.innerHTML = `<strong>${row[col]}</strong>`;
        } else {
          const input = document.createElement("input");
          input.type = "text";
          input.value = row[col] ?? "";
          input.style.width = "100px";

          // future update support
          input.dataset.segmentId = row.segment_id;
          input.dataset.field = col;

          td.appendChild(input);
        }

        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });

    table.appendChild(tbody);

    grid.innerHTML = "";
    grid.appendChild(table);

  } catch (err) {
    console.error("Failed to load patch segments:", err);
    grid.innerHTML = "<em>Error loading patch segments</em>";
  }
}
document.getElementById("cancelPatchUpdate").addEventListener("click", () => {
  const form = document.getElementById("updatePatchForm");
  const grid = document.getElementById("patchSegmentGrid");

  // hide form
  form.classList.add("hidden");

  // clear grid to avoid stale data
  grid.innerHTML = "";

  // OPTIONAL: remove any selection / highlight on map
  // clearHighlightedSegments();
});

function closeUpdatePatchForm() {
  document.getElementById("updatePatchForm").classList.add("hidden");
}





// function enablePatchTableEdit() {
//   const table = document.querySelector("#ChainageTable table");
//   if (!table) return;
// patchTableDirty = false; // reset on entering edit mode
//   const headers = Array.from(table.querySelectorAll("thead th"))
//     .map(th => th.innerText.trim().toLowerCase());

//   table.querySelectorAll("tbody tr").forEach(tr => {
//     Array.from(tr.children).forEach((td, index) => {
//       const columnName = headers[index];

//       if (NON_EDITABLE_COLUMNS.includes(columnName)) {
//         td.contentEditable = "false";
//         td.classList.add("locked-cell");
//        // td.classList.remove("editable-cell");
//       } else {
//         td.contentEditable = "true";
//         td.classList.add("editable-cell");
//        // td.classList.remove("locked-cell");
//          td.addEventListener("input", () => {
//           patchTableDirty = true;
//         td.style.backgroundColor = "#ffe8e8";
//         })
//       }
//     });
//   });
// }


// function disablePatchTableEdit() {
//   const table = document.querySelector("#ChainageTable table");
//   if (!table) return;

//   table.querySelectorAll("tbody td").forEach(td => {
//     td.contentEditable = "false";
//     td.classList.remove("editable-cell", "locked-cell");
//   });
// }


// document.getElementById("savePatchBtn").addEventListener("click", async () => {

//   const ok = confirm(
//     "Are you sure you want to save these changes?\nThis will update patch data."
//   );

//   if (!ok) return;   // user cancelled

//   const table = document.querySelector("#ChainageTable table");
//   if (!table) return;

//   const headers = Array.from(table.querySelectorAll("thead th"))
//     .map(th => th.innerText);

//   const rows = Array.from(table.querySelectorAll("tbody tr"));

//   const updatedData = rows.map(tr => {
//     const rowObj = {};
//     Array.from(tr.children).forEach((td, i) => {
//       rowObj[headers[i]] = td.innerText.trim();
//     });
//     return rowObj;
//   });

//   console.log("Saving patch data:", updatedData);

//   // 🔁 send to backend
//   await savePatchData(updatedData);

// });
// async function savePatchData(data) {
//   try {
//     const res = await fetch("http://localhost:8800/Kanpur/update-patch", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify(data)
//     });

//     if (!res.ok) throw new Error("Save failed");

//     alert("Patch updated successfully");

//     disablePatchTableEdit();
//     document.getElementById("savePatchBtn").classList.add("hidden");

//   } catch (err) {
//     alert("Failed to save patch data");
//     console.error(err);
//   }
// }





// async function showPatchTable(roadId) {
//   const tableDiv = document.getElementById("ChainageTable");
//   tableDiv.style.display = "block";
//   const res = await fetch(`http://localhost:8800/Kanpur/segments-by-road/${roadId}`);
//   const data = await res.json();
//   if (!data.length) {
//     tableDiv.innerHTML = "<p>No data</p>";
//     return;
//   }
//   const cols = Object.keys(data[0]);
//   let html = "<table border='1'><thead><tr>";
//   cols.forEach(c => html += `<th>${c}</th>`);
//   html += "</tr></thead><tbody>";
//   data.forEach(row => {
//     html += "<tr>";
//     cols.forEach(c => html += `<td>${row[c]}</td>`);
//     html += "</tr>";
//   });
//   html += "</tbody></table>";
//   tableDiv.innerHTML = html;
// }
function hidePatchTable() {
  const tableDiv = document.getElementById("ChainageTable");
  if (!tableDiv) return;   // 👈 prevents crash
  tableDiv.style.display = "none";
  tableDiv.innerHTML = "";
}

function resetRoadSelectionUI() {
  hidePatchTable();
  document.querySelectorAll('input[name="viewChainage"]').forEach(r => {
    r.checked = false;
  });
  // Hide patch geometry
  patchSource.clear();
  patchLayer.setVisible(false);
}






document.addEventListener("DOMContentLoaded", function() {
    const viewChainageSection = document.getElementById("viewChainageSection");
    const downloadBtnContainer = document.getElementById("downloadBtnContainer");
    const downloadBtn = document.getElementById("downloadBtn");
    const confirmationModal = document.getElementById("confirmationModal");
    const confirmDownloadBtn = document.getElementById("confirmDownloadBtn");
    const cancelDownloadBtn = document.getElementById("cancelDownloadBtn");

    // When "Yes" is selected, show the download button
    const radioYes = document.querySelector('input[name="viewChainage"][value="yes"]');
    radioYes.addEventListener("change", function() {
        if (this.checked) {
            downloadBtnContainer.style.display = "block"; // Show the download button
        }
    });

    // When "Download" button is clicked, show the confirmation modal
    downloadBtn.addEventListener("click", function() {
        confirmationModal.style.display = "flex";
    });

    // When "Yes" is clicked in the modal, trigger the download action (replace with actual download logic)
    confirmDownloadBtn.addEventListener("click", function() {
        alert("Downloading image...");

        // Hide the modal
        confirmationModal.style.display = "none";
    });

    // When "No" is clicked in the modal, hide the modal
    cancelDownloadBtn.addEventListener("click", function() {
        confirmationModal.style.display = "none";
    });
});












const hoverInfo = document.getElementById("hoverInfo");
let hoverThrottle = 0;

map.on("pointermove", async function (evt) {
  if (evt.dragging) return;

  // throttle: GeoServer safety
  const now = Date.now();
  if (now - hoverThrottle < 150) return;
  hoverThrottle = now;

  if (
    !knp_road.getVisible() ||
    !ShowRoads.checked
  ) {
    hoverInfo.style.display = "none";
    return;
  }

  const view = map.getView();
  const resolution = view.getResolution();
  const projection = view.getProjection().getCode();

  const url = knp_road.getSource().getFeatureInfoUrl(
    evt.coordinate,
    resolution,
    projection,
    {
      INFO_FORMAT: "application/json",
      QUERY_LAYERS: "Lko_Summary:segmentszone2roads",
      FEATURE_COUNT: 1
    }
  );

  if (!url) {
    hoverInfo.style.display = "none";
    return;
  }

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!data.features || data.features.length === 0) {
      hoverInfo.style.display = "none";
      return;
    }

    const p = data.features[0].properties;

    hoverInfo.innerHTML = `
    <h5><b><center>Road Information</center></b></h5>
      <b style=color: blue>Segment ID:</b> ${p.segment_id ?? "-"}<br>
      <b>Road ID:</b> ${p.road_id ?? "-"}<br>
      <b>Road Name:</b> ${p.road_name ?? "-"}<br>
      <b>Zone No.:</b> ${p.zone_no ?? "-"}<br>
       <b>Zone Name:</b> ${p.zone_name ?? "-"}<br>
        <b>Ward No.:</b> ${p.ward_no ?? "-"}<br>
         <b>Ward Name:</b> ${p.ward_name ?? "-"}<br>
          <b>Condition:</b> ${p.condition ?? "-"}<br>
           <b>Material:</b> ${p.material ?? "-"}<br>
            <b>Ownership:</b> ${p.ownership ?? "-"}<br>
             <b>Category:</b> ${p.category ?? "-"}<br>
      <b>CUS:</b> ${p.cus ?? "-"}<br>
      <b>Year of Construction:</b> ${p.yoc ?? "-"}<br>
      <b>Length:</b> ${p.length_km ?? "-"} m
    `;

    hoverInfo.style.display = "block";
  } catch (e) {
    hoverInfo.style.display = "none";
  }
});

resetRoadSelectionUI();



//----------------------Map Export Functionallity-----------------------//

async function exportVisibleMap1() {
  const map = window.olMap;

  if (!map) {
    alert("Map not initialized");
    return;
  }

  // Force render
  map.renderSync();

  setTimeout(() => {
    const viewport = map.getViewport();
    const canvases = viewport.querySelectorAll("canvas");

    if (!canvases.length) {
      alert("No map canvas found");
      return;
    }

    const size = map.getSize();
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = size[0];
    exportCanvas.height = size[1];

    const ctx = exportCanvas.getContext("2d");

    try {
      canvases.forEach((canvas) => {
        if (canvas.width === 0 || canvas.height === 0) return;

        const parentOpacity = canvas.parentNode?.style?.opacity;
        ctx.globalAlpha = parentOpacity ? Number(parentOpacity) : 1;

        ctx.drawImage(canvas, 0, 0);
      });

      ctx.globalAlpha = 1;

      // === INFO BOX (TOP RIGHT) ===
      if (window.selectedRoadId && window.selectedRoadName) {
        const padding = 15;
        const lineHeight = 24;
        const boxPadding = 10;

        ctx.font = "bold 22px Arial, sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";

        const lines = [
          `Road ID: ${selectedRoadId}`,
          `Name: ${selectedRoadName}`,
          `Zone: ${selectedZone1}`,
          `Ward: ${selectedWard1}`
        ];

        const widths = lines.map(t => ctx.measureText(t).width);
        const boxWidth = Math.max(...widths) + boxPadding * 2;
        const boxHeight = lines.length * lineHeight + boxPadding * 2;

        const x = size[0] - boxWidth - padding;
        const y = padding;

        ctx.fillStyle = "rgba(0,0,0,0.65)";
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 2;

        ctx.fillRect(x, y, boxWidth, boxHeight);
        ctx.strokeRect(x, y, boxWidth, boxHeight);

        ctx.fillStyle = "#FFFFFF";
        lines.forEach((line, i) => {
          ctx.fillText(line, x + boxPadding, y + boxPadding + i * lineHeight);
        });
      }

      // === DOWNLOAD ===

      exportCanvas.toBlob(async (blob) => {
        try {
          const formData = new FormData();
          formData.append("file", blob, "kanpur_map.png");
          formData.append("road_id", selectedRoadId);
          formData.append("road_name", selectedRoadName);
          formData.append("zone", selectedZone1);
          formData.append("ward", selectedWard1);

          await fetch(
            "https://webhook.site/87167e81-950f-462a-977a-afad0a13d858",
            {
              method: "POST",
              mode: "no-cors", //  required for webhook.site
              body: formData //  browser sets headers automatically
            }
          );

          console.log(" PNG sent successfully");
        } catch (err) {
          console.error(" Failed to send PNG", err);
        }
      }, "image/png");
      // document.body.removeChild(link);

      console.log(" Map export successful");

    } catch (err) {
      console.error(" Map export failed:", err);
      alert(
        "Map export failed.\n\n" +
        "Most likely reason:\n" +
        "• WMS layer without CORS headers\n" +
        "• crossOrigin not enabled\n\n" +
        "Check console for details."
      );
    }

    map.renderSync();
  }, 150);
}

// Button binding
document
  .getElementById("downloadBtn")
  .addEventListener("click", exportVisibleMap1);


/*
async function exportVisibleMap1() {
  const map = window.olMap;

  if (!map) {
    alert("Map not initialized");
    return;
  }

  // Force render
  map.renderSync();

  setTimeout(() => {
    const viewport = map.getViewport();
    const canvases = viewport.querySelectorAll("canvas");

    if (!canvases.length) {
      alert("No map canvas found");
      return;
    }

    const size = map.getSize();
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = size[0];
    exportCanvas.height = size[1];

    const ctx = exportCanvas.getContext("2d");

    try {
      canvases.forEach((canvas) => {
        if (canvas.width === 0 || canvas.height === 0) return;

        const parentOpacity = canvas.parentNode?.style?.opacity;
        ctx.globalAlpha = parentOpacity ? Number(parentOpacity) : 1;

        ctx.drawImage(canvas, 0, 0);
      });

      ctx.globalAlpha = 1;

      // === INFO BOX (TOP RIGHT) ===
      if (window.selectedRoadId && window.selectedRoadName) {
        const padding = 15;
        const lineHeight = 24;
        const boxPadding = 10;

        ctx.font = "bold 22px Arial, sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";

        const lines = [
          `Road ID: ${selectedRoadId}`,
          `Name: ${selectedRoadName}`,
          `Zone: ${selectedZone1}`,
          `Ward: ${selectedWard1}`
        ];

        const widths = lines.map(t => ctx.measureText(t).width);
        const boxWidth = Math.max(...widths) + boxPadding * 2;
        const boxHeight = lines.length * lineHeight + boxPadding * 2;

        const x = size[0] - boxWidth - padding;
        const y = padding;

        ctx.fillStyle = "rgba(0,0,0,0.65)";
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 2;

        ctx.fillRect(x, y, boxWidth, boxHeight);
        ctx.strokeRect(x, y, boxWidth, boxHeight);

        ctx.fillStyle = "#FFFFFF";
        lines.forEach((line, i) => {
          ctx.fillText(line, x + boxPadding, y + boxPadding + i * lineHeight);
        });
      }

      // === DOWNLOAD ===

      exportCanvas.toBlob(async (blob) => {
        try {
          const formData = new FormData();
          formData.append("file", blob, "kanpur_map.png");
          formData.append("road_id", selectedRoadId);
          formData.append("road_name", selectedRoadName);
          formData.append("zone", selectedZone1);
          formData.append("ward", selectedWard1);

          // Send the image and form data to the server with headers
          const response = await fetch(
            "https://kmc.igilesolutions.com/api/v1/writedata",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-API-KEY": "pk_QBbEyU3Pl8ItwsIzpqAgLVGiVnA3dyAHL2qkkWs2mMkvsv7l",  // Your API Key
              },
              body: JSON.stringify({
                // Replace the below with the data you want to send
                road_id: selectedRoadId,
                road_name: selectedRoadName,
                zone: selectedZone1,
                ward: selectedWard1,
                file: blob
              })
            }
          );

          if (response.ok) {
            console.log("PNG sent successfully");
          } else {
            console.error("Failed to send PNG", response.statusText);
          }
        } catch (err) {
          console.error("Failed to send PNG", err);
        }
      }, "image/png");

      console.log("Map export successful");

    } catch (err) {
      console.error("Map export failed:", err);
      alert(
        "Map export failed.\n\n" +
        "Most likely reason:\n" +
        "• WMS layer without CORS headers\n" +
        "• crossOrigin not enabled\n\n" +
        "Check console for details."
      );
    }

    map.renderSync();
  }, 150);
}
*/
