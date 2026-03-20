//const BASE_URL = "http://192.168.100.178:8080/KanpurDashboard/Kanpur";
const BASE_URL = `${BASE_URL_All}:8060/Kanpur`;
const GEOSERVER_BASE_URL = "http://103.15.81.74:8080/geoserver/KNN_Summary";



ol.proj.useGeographic();


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
    zoom: 12,
    minZoom: 10,
    maxZoom: 19,
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



const hamburger = document.querySelector(".hamburger");
const sidebar = document.querySelector(".sidebar");
const cancelIcon = document.querySelector(".cancel-icon");

hamburger.addEventListener("click", () => {
    sidebar.classList.toggle("show");

    //  document.getElementById('road-filter').style.display = 'none';
    //   document.getElementById('drain-filter').style.display = 'none';
});

cancelIcon.addEventListener("click", () => {
    sidebar.classList.remove("show");
});

//-----------------------------------Boundaries------------------------------------//
var zone_boundary = new ol.layer.Image({
    title: "Kanpur Zone Boundary",
    //  extent: [-180, -90, -180, 90],
    source: new ol.source.ImageWMS({
        url: `${GEOSERVER_BASE_URL}/wms?`,
        params: {
            LAYERS: "KNN_Summary:kanpur_zone_boundary",
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
        params: {
            LAYERS: "KNN_Summary:kanpur_ward_boundary",
        },
        ratio: 1,
        serverType: "geoserver",
    }),
});
//overlays.getLayers().push(LNN_Boundary);
map.addLayer(ward_boundary);
var knp_road = new ol.layer.Image({
    title: "Road Zone 2",
    visible: false,   // 👈 START HIDDEN
    source: new ol.source.ImageWMS({
        url: `${GEOSERVER_BASE_URL}/wms?`,
        params: {
            LAYERS: "KNN_Summary:segmentszone2roads",
        },
        ratio: 1,
        serverType: "geoserver",
    }),
});
//GNN_Road_popup();
//overlays.getLayers().push(LNN_Boundary);
map.addLayer(knp_road);

var knp_chain = new ol.layer.Image({
    title: "Chainage Zone 2",
    visible: false,   // 👈 START HIDDEN
    source: new ol.source.ImageWMS({
        url: `${GEOSERVER_BASE_URL}/wms?`,
        params: {
            LAYERS: "KNN_Summary:interpolatedpoints",
        },
        ratio: 1,
        serverType: "geoserver",
    }),
});
//GNN_Road_popup();
//overlays.getLayers().push(LNN_Boundary);
map.addLayer(knp_chain);

document.getElementById("ShowRoads").addEventListener("change", function () {
    const checked = this.checked;
    // zone2_Chainage.setVisible(checked);
    knp_road.setVisible(checked);
});
document.getElementById("ShowChainage").addEventListener("change", function () {
    const checked = this.checked;
    knp_chain.setVisible(checked);
    //  knp_road.setVisible(checked);
});
/*----------------------------------------- javascript for navbar in table---------------------------------------- */
// function updateNavBarWithFunctionName(functionName) {
//     console.log("Updating navbar with function name:", functionName);
//     // document.getElementById('featureName').textContent = functionName;

//     document.querySelectorAll('.feature_name1').forEach(element => {
//         element.textContent = functionName;
//     });
// }

// function minimize1() {

//     const topnav = document.getElementById('tableContainer_summary');

//     const navElements = document.querySelectorAll('.feature_nav');
//     navElements.forEach(nav => {
//         nav.style.bottom = '3%'; // Reduced width when minimized
//         }); 
//     topnav.style.height = '0%'; // Reduced height when minimized

//     const legendIds = ['Priority_legend', 'type_legend', 'Condition_legend','Material_legend','Ownership_legend'];

//     // Loop through each legend and hide it
//     legendIds.forEach(function(legendId) {
//         const legendBtn = document.getElementById(legendId);
//         if (legendBtn) {  // Check if the element exists before manipulating it
//             legendBtn.style.display = 'none';
//         }
//     });


// }
// function maximize1() {
//     const topnav = document.getElementById('tableContainer_summary');
//     const navElements = document.querySelectorAll('.feature_nav');
//     navElements.forEach(nav => {
//         nav.style.bottom = '29%'; // Reduced width when minimized
//     });

//     topnav.style.height = '29%'; // Reduced height when minimized

// }

// //------------------------------------- MULTILINESTRING feature to the map from WKT format
// function addMultilinestringFeatureFromWKT_General(wktString, color = 'black', width = 3) {
//     const format = new ol.format.WKT();
//     const feature = format.readFeature(wktString, {
//         dataProjection: 'EPSG:4326',
//         featureProjection: 'EPSG:4326'
//     });

//     const vectorSource = new ol.source.Vector({
//         features: [feature]
//     });

//     const vectorLayer = new ol.layer.Vector({
//         source: vectorSource,
//         style: new ol.style.Style({
//             stroke: new ol.style.Stroke({
//                 color: color,
//                 width: width
//             })
//         })
//     });

//     const featureId = `feature-${Math.random().toString(36).substr(2, 9)}`;
//     feature.setId(featureId);

//     map.addLayer(vectorLayer);
//     return feature;
// }

// function addMultilinestringFeatureFromWKT(wktString) {
//     return addMultilinestringFeatureFromWKT_General(wktString, '#EB5406', 3);
// }
// function addMultilinestringFeatureFromWKT_parkRoad(wktString) {
//     return addMultilinestringFeatureFromWKT_General(wktString, '#04af70', 3);
// }
// function addMultilinestringFeatureFromWKT_EduRoad(wktString) {
//     return addMultilinestringFeatureFromWKT_General(wktString, '#5c62d6', 3);
// }
// function addMultilinestringFeatureFromWKT_HospitalRoad(wktString) {
//     return addMultilinestringFeatureFromWKT_General(wktString, 'cyan', 3);
// }
// function addMultilinestringFeatureFromWKT_HotelRoad(wktString) {
//     return addMultilinestringFeatureFromWKT_General(wktString, 'darkblue', 3);
// }
// function addMultilinestringFeatureFromWKT_Ward(wktString) {
//     return addMultilinestringFeatureFromWKT_General(wktString, 'red', 3);
// }


// //-------------------------------------------All Roads-------------------------//
// ShowRoads.addEventListener('click', function () {
//     updateNavBarWithFunctionName("All Roads");
//     map.getLayers().getArray().slice().forEach(layer => {
//         if (layer instanceof ol.layer.Vector
//             // && !isLayerInPreservedList(layer)
//         ) {
//             map.removeLayer(layer);
//         }
//     });
//     map.getOverlays().clear();
//     fetch(`${BASE_URL}/getAlltypeName`, {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//             // Add any request body if required
//         })
//     })
//         .then(response => {
//             if (!response.ok) {
//                 throw new Error('Network response was not ok');
//             }
//             return response.json();
//         })
//         .then(responseData => {
//             console.log('Received data:', responseData);
//             console.log('getting all data');
//             // Clear existing table rows
//             dataTableBody.innerHTML = '';
//             // Check if 'data' is an array before iterating
//             if (Array.isArray(responseData.data)) {
//                 responseData.data.forEach(item => {
//                     const row = document.createElement('tr');
//              row.innerHTML = `
//                                <td>${item.gis_id}</td>
//                                <td>${item.zone_no}</td>
//                                <td>${item.zone_name}</td>
//                                <td>${item.ward_no}</td>
//                             <td>${item.ward_name}</td>
//                             <td>${item.ownership}</td>
//                             <td>${item.type}</td>
//                              <td>${item.category}</td>
//                             <td>${item.road_name}</td>
//                          <td>${item.row_meter}</td>
//                             <td>${item.row_as_per}</td>
//                             <td>${item.carriage_w}</td>
//                             <td>${item.carriage_m}</td>
//                             <td>${item.length_km}</td>
//                                <td>${item.condition}</td>
//                             <td>${item.year_of_co}</td>
//                             <td>${item.cus}</td>`;
//                     dataTableBody.appendChild(row);
//                     // Check if the item has a geom_wkt property
//                     if (item.geom_wkt) {
//                         addMultilinestringFeatureFromWKT(item.geom_wkt);
//                     }
//                 });
//             } else {
//                 console.error('Expected array but received:', responseData.data);
//                 // Handle non-array data if needed
//             }
//         })
//         .catch(error => {
//             console.error('Error fetching data:', error);
//             // Handle error condition if needed
//         })
// });
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


const closeUniqueIdPanel1 = document.getElementById("closeUniqueIdPanel")

function openUniqueIdPanel() {
    document.getElementById("uniqueIdPanel").classList.remove("hidden");

}
function closeUniqueIdPanel() {
    document.getElementById("uniqueIdPanel").classList.add("hidden");

    document.getElementById("startPoint").innerHTML = "";
    document.getElementById("endPoint").innerHTML = "";

    selectedRoadId = null;
    selectedRoadName = null;

    hideChainageForRoad();
    patchSource.clear();
    patchLayer.setVisible(false);

    hidePatchTable();
    document.getElementById("viewChainageSection").style.display = "none";
}

function closeChainage() {
    section.classList.add("hidden");
}
map.on("singleclick", async function (evt) {
    if (
        !zone_boundary.getVisible() || !ward_boundary.getVisible() ||
        !knp_road.getVisible() ||
        !ShowRoads.checked
    ) {
        return;
    }
    resetRoadSelectionUI();
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
    if (!url) return;
    try {
        const res = await fetch(url);
        const data = await res.json();
        if (!data.features || data.features.length === 0) return;
        const feature = data.features[0];
        //  extract road_id
        selectedRoadId = feature.properties.road_id || feature.properties.gid;
        selectedRoadName = feature.properties.road_name || feature.properties.gid;
        checkRoadInPatchTable(selectedRoadId);
        // document.getElementById("roadIdDisplay").innerText =
        //   `Road ID : ${selectedRoadId}`;
        //   document.getElementById("roadNameDisplay").innerText =
        //   `Road Name : ${selectedRoadName}`;
        showChainageForSelectedRoad(selectedRoadId);
        openUniqueIdPanel();
        loadDistancesFromDB(selectedRoadId);
    } catch (err) {
        console.error("Road click error:", err);
    }
});
closeUniqueIdPanel1.addEventListener("click", () => {
    closeUniqueIdPanel();
    closeChainage();
    resetRoadSelectionUI();
});
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
async function loadDistancesFromDB(roadId) {
    const startSelect = document.getElementById("startPoint");
    const endSelect = document.getElementById("endPoint");
    startSelect.innerHTML = `<option value="">-Select Start-</option>`;
    endSelect.innerHTML = `<option value="">-Select End-</option>`;
    try {
        const res = await fetch(`http://103.15.81.74:8060/Kanpur/chainage/${roadId}`);
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
document.getElementById("submitUniqueId").addEventListener("click", async () => {
    document.getElementById("viewChainageSection").style.display = "block";
    const startSelect = document.getElementById("startPoint");
    const endSelect = document.getElementById("endPoint");
    const startPoint = startSelect.value;
    const endPoint = endSelect.value;
    if (!startPoint || !endPoint) {
        alert("Select start and end points");
        return;
    }
    const payload = {
        road_id: selectedRoadId,
        startPoint,
        endPoint
    };
    try {
        const res = await fetch("http://103.15.81.74:8060/Kanpur/create-patch", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        alert(
            `Patch created!\nPatch ID: ${data.patch_id}\nSegments: ${data.segments_inserted}`
        );
    } catch (err) {
        console.error(err);
        alert("Patch creation failed");
    }
});
async function checkRoadInPatchTable(roadId) {
    try {
        const res = await fetch(`http://103.15.81.74:8060/Kanpur/check-road-patch/${roadId}`);
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
}/*
document.querySelectorAll('input[name="viewChainage"]').forEach(radio => {
  radio.addEventListener("change", async (e) => {

    if (!selectedRoadId) return;

    if (e.target.value === "yes") {
      hideChainageForRoad();

      const res = await fetch(
        `http://103.15.81.74:8060/Kanpur/patch/geometry/${selectedRoadId}`
      );
      const geojson = await res.json();

      const format = new ol.format.GeoJSON();
      const features = format.readFeatures(geojson, {
        featureProjection: map.getView().getProjection()
      });

      patchSource.clear();
      patchSource.addFeatures(features);
      patchLayer.setVisible(true);

      showPatchTable(selectedRoadId);

    } else {
      patchSource.clear();
      patchLayer.setVisible(false);
      showChainageForSelectedRoad(selectedRoadId);
      hidePatchTable();
    }
  });
});

async function showPatchTable(roadId) {
  const tableDiv = document.getElementById("dataTable");
  tableDiv.style.display = "block";
  const res = await fetch(`http://103.15.81.74:8060/Kanpur/segments-by-road/${roadId}`);
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
}*/
document.querySelectorAll('input[name="viewChainage"]').forEach(radio => {
    radio.addEventListener("change", async (e) => {
        if (e.target.value === "yes") {
            // hideChainageForRoad(selectedRoadId);
            showPatchTable(selectedRoadId);
            loadPatchesByRoad(selectedRoadId);
            const res = await fetch(`http://103.15.81.74:8060/Kanpur/patch/geometry/${selectedRoadId}`);
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
            //  closeUpdatePatchPanel();
        }
    });
});

async function showPatchTable(roadId, patchId = null) {
    const tableDiv = document.getElementById("dataTable");
    tableDiv.style.display = "block";
    const url = patchId ? `http://103.15.81.74:8060/Kanpur/segments-by-road/${roadId}?patchId=${patchId}` : `http://103.15.81.74:8060/Kanpur/segments-by-road/${roadId}`;
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
}
function hidePatchTable() {
    const tableDiv = document.getElementById("dataTable");
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
    panel.innerHTML = `<div style="text-align:center">Select Patch:<div> `;
    panel.classList.remove("hidden");
    if (!roadId) return;
    try {
        const response = await fetch(`http://103.15.81.74:8060/Kanpur/patches-by-road/${roadId}`);
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
                //   openUpdatePatchPanel();
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


const NON_EDITABLE_COLUMNS = ["segment_id", "road_id", "geom"];
let patchTableDirty = false;

document.querySelectorAll('input[name="updatePatchChoice"]').forEach(radio => {
    radio.addEventListener("change", e => {

        if (e.target.value === "yes") {
            console.log("User chose YES → update patch");
            const selectedPatch = document.querySelector('input[name="patchRadio"]:checked')?.value;
            openPatchUpdateForm(selectedRoadId, selectedPatch);
            // enablePatchTableEdit();     //  activate table
            // closeUpdatePatchPanel();    // hide choice panel
        }

        if (e.target.value === "no") {
            // disablePatchTableEdit();    //  keep table locked
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
            `http://103.15.81.74:8060/Kanpur/segments/${roadId}/${patchId}`
        );

        if (!res.ok) {
            throw new Error("HTTP error " + res.status);
        }

        const result = await res.json();

        //  backend returns { exists, data }
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
            QUERY_LAYERS: "KNN_Summary:segmentszone2roads",
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

