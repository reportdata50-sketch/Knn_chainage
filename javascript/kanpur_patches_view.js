
const BASE_URL = `${BASE_URL_All}:8880/Kanpur`;

const GEOSERVER_BASE_URL = "http://localhost:8080/geoserver/KNN_Summary";
const GEOSERVER_BASE_URL1 = "http://localhost:8080/geoserver/Lko_Summary";
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




let selectedRoadId = null;

//-----------------------------------Boundaries------------------------------------//
var zone_boundary = new ol.layer.Image({
  title: "Kanpur Zone Boundary",
  //  extent: [-180, -90, -180, 90],
  source: new ol.source.ImageWMS({
    url: `${GEOSERVER_BASE_URL}/wms?`,
    crossOrigin: "anonymous", //  REQUIRED
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
  //visible: false,   // 👈 START HIDDEN
  source: new ol.source.ImageWMS({
    url: `${GEOSERVER_BASE_URL1}/wms?`,
    crossOrigin: "anonymous", //  REQUIRED
    params: {
      LAYERS: "Lko_Summary:segmentszone2roads",
   //   STYLES: "zone2_road_style"   // 👈 important
    },
    ratio: 1,
    serverType: "geoserver",
  }),
});

map.addLayer(knp_road);



// const knp_road = new ol.layer.Vector({
//   source: new ol.source.Vector({
//     format: new ol.format.GeoJSON({
//       dataProjection: 'EPSG:4326',
//       featureProjection: 'EPSG:4326'
//     }),
//     url: "http://localhost:8080/geoserver/wfs?service=WFS&version=1.0.0&request=GetFeature&typeName=Lko_Summary:segmentszone2roads&outputFormat=application/json"
//   }),
// });
// knp_road.setStyle(new ol.style.Style({
//   stroke: new ol.style.Stroke({
//     color: '#ff0000',
//     width: 3
//   })
// }));
// map.addLayer(knp_road);



/*
const patchSource = new ol.source.Vector();

const patchLayer = new ol.layer.Vector({
  source: patchSource,
  style: new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: "#c8eb2d",
      width: 4
    })
  }),
  visible: false
});

map.addLayer(patchLayer);




//--------search project id from URL and load patches------------------//

function getProjectIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("project_id");
}


async function loadProjectPatchesFromURL() {

  const projectId = getProjectIdFromURL();

  if (!projectId) {
    console.log("No project_id in URL");
    return;
  }

  try {

    // Call external API
    const formData = new FormData();
    formData.append("project_id", projectId);

    const apiRes = await fetch(
      "https://kmc.igilesolutions.com/api/v1/getdata",
      {
        method: "POST",
        headers: {
          "X-API-KEY": "pk_pn7yHi33jKu5szrtbiiBzbkRy71Uu9eyB66XAJWsp53H4VZ4"
        },
        body: formData
      }
    );

    const apiData = await apiRes.json();

    console.log("Project API response:", apiData);

    if (!apiData.success || !apiData.data || !apiData.data.patches) {
      console.warn("No patches in API response");
      return;
    }

    const patches = apiData.data.patches;

    console.log("Patches from API:", patches);

    drawProjectPatchesOnMap(patches, apiData.data);

  } catch (err) {
    console.error("Project load failed:", err);
  }
}



async function drawProjectPatchesOnMap(patches, projectData) {

  try {

    const patchIds = patches.map(p => {
      if (typeof p === "string") return p;
      return p.patch_id || p.patch;
    }).filter(Boolean);

    console.log("Extracted patch IDs:", patchIds);

    const res = await fetch(`${BASE_URL}/patch/geometries-by-ids`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ patch_ids: patchIds })
    });

    const geojson = await res.json();
    console.log("Patch GeoJSON:", geojson);

    const format = new ol.format.GeoJSON();
    let allFeatures = [];

    geojson.data.forEach(row => {

      if (!row.geometry) return;

      const geomObj = JSON.parse(row.geometry);

      const features = format.readFeatures({
        type: "Feature",
        geometry: geomObj
      }, {
        featureProjection: map.getView().getProjection()
      });

      allFeatures.push(...features);
    });

    if (!patchSource || !patchLayer) {
      console.error("patchSource or patchLayer not initialized");
      return;
    }

    patchSource.clear();
    patchSource.addFeatures(allFeatures);
    patchLayer.setVisible(true);

    const extent = patchSource.getExtent();

    if (
      extent &&
      !isNaN(extent[0]) &&
      extent[0] !== Infinity &&
      extent[2] !== -Infinity
    ) {
      map.getView().fit(extent, {
        padding: [20, 20, 20, 20],
        duration: 600,
        maxZoom: 20
      });
    } else {
      console.warn("Invalid or empty extent");
    }

    if (projectData) {
      //renderProjectApiTable([projectData]);
      renderProjectPopup(projectData);
    }

  } catch (err) {
    console.error("Patch geometry load failed:", err);
  }
}


document.addEventListener("DOMContentLoaded", () => {
  loadProjectPatchesFromURL();
});

//--------------------popup code---------------------------//
function renderProjectPopup(data) {

  const popup = document.getElementById("projectPopup");
  const content = document.getElementById("projectPopupContent");

  if (!data) {
    popup.style.display = "none";
    return;
  }

  let html = "";

  Object.keys(data).forEach(key => {

    let value = data[key];

    if (key.toLowerCase().includes("image") && value) {

      let links = Array.isArray(value) ? value : String(value).split(",");

      const images = links.map(item => {

        const text = String(item).trim();

        const fileMatch = text.match(/([a-zA-Z0-9-_]+\.(jpg|jpeg|png|webp))/i);

        if (!fileMatch) return "";

        const fileName = fileMatch[1];

        const url = `https://kmc.igile.in/uploads/site_images/${fileName}`;

        return `<a class="popup-image" href="${url}" target="_blank">View Image</a>`;

      }).join("");

      html += `
<div class="popup-row">
<div class="popup-key">${key.replaceAll("_", " ").toUpperCase()}</div>
<div class="popup-value">${images}</div>
</div>
`;

    } else {

      html += `
<div class="popup-row">
<div class="popup-key">${key.replaceAll("_", " ").toUpperCase()}</div>
<div class="popup-value">${value ?? ""}</div>
</div>
`;

    }

  });

  content.innerHTML = html;
  popup.style.display = "block";
}

document
  .getElementById("closeProjectPopup")
  .onclick = () => {

    document.getElementById("projectPopup").style.display = "none";

  };

renderProjectPopup(projectData);





*/







//------------------------------table-----------------------
/*
function renderProjectApiTable(data) {
  const tableDiv = document.getElementById("dataTable");
  tableDiv.style.display = "block";
  // document.getElementById("map").style.height = "calc(100vh - 310px)";
  //   map.updateSize();
  if (!data || data.length === 0) {
    tableDiv.innerHTML = "<p>No project data found</p>";
    return;
  }

  // If API returns single object convert to array
  if (!Array.isArray(data)) {
    data = [data];
  }

  const keys = Object.keys(data[0]);

  let html = "<table border='1'><thead><tr>";

  // Headers
  keys.forEach(k => {
    html += `<th>${k.replaceAll("_", " ").toUpperCase()}</th>`;
  });

  html += "</tr></thead><tbody>";



  data.forEach(row => {
    html += "<tr>";

    keys.forEach(k => {
      let value = row[k];

      if (k.toLowerCase().includes("image") && value) {

        let links = [];

        if (Array.isArray(value)) {
          links = value;
        } else {
          links = String(value).split(",");
        }

        const clickableLinks = links.map(item => {

          const text = String(item).trim();

          // Extract filename if present
          const fileMatch = text.match(/([a-zA-Z0-9-_]+\.(jpg|jpeg|png|webp))/i);

          if (!fileMatch) return "";

          const fileName = fileMatch[1];

          const correctUrl = `https://kmc.igile.in/uploads/site_images/${fileName}`;

          return `<a href="${correctUrl}" target="_blank">${correctUrl}</a>`;

        }).join("<br>");

        html += `<td>${clickableLinks}</td>`;
      } else {
        html += `<td>${value ?? ""}</td>`;
      }
    });
    html += "</tr>";
  });

  html += "</tbody></table>";

  tableDiv.innerHTML = html;
}
*/


































/*

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


// Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
const projectIdFromUrl = urlParams.get("project_id");
const userIdFromUrl = urlParams.get("user_id");
const zoneNumber = urlParams.get("zone");
const wardNo = urlParams.get("ward");

// Extract zone number from title (Zone-2 → 2)
// const zoneMatch = titleFromUrl ? titleFromUrl.match(/\d+/) : null;
// const zoneNumber = zoneMatch ? zoneMatch[0] : null;

const latFromUrl = urlParams.get("lat");
const lonFromUrl = urlParams.get("lon");

console.log("Lat:", latFromUrl);
console.log("Lon:", lonFromUrl);
console.log("Zone:", zoneNumber);
console.log("Ward:", wardNo);

// ---------- Build Dynamic CQL Filter ----------

var knp_road = null;
let baseFilter = null;
let cqlFilter = baseFilter;

if (zoneNumber && wardNo) {
  cqlFilter = `zone_no='${zoneNumber}' AND ward_no=${wardNo}`;
}
else if (zoneNumber) {
  cqlFilter = `zone_no='${zoneNumber}'`;
}
else if (wardNo) {
  cqlFilter = `ward_no=${wardNo}`;
}
else {
  console.warn("Neither zone nor ward provided.");
}

// ---------- If filter exists, create layer ----------
if (cqlFilter) {

  // Create WMS Layer
  knp_road = new ol.layer.Image({
    title: "Filtered Roads",
    visible: true,
    source: new ol.source.ImageWMS({
      url: `${GEOSERVER_BASE_URL1}/wms`,
      crossOrigin: "anonymous",
      params: {
        LAYERS: "Lko_Summary:segmentszone2roads",
        CQL_FILTER: cqlFilter
      },
      ratio: 1,
      serverType: "geoserver",
    }),
  });

  map.addLayer(knp_road);


  // if (latFromUrl && lonFromUrl) {
  //   const lat = parseFloat(latFromUrl);
  //   const lon = parseFloat(lonFromUrl);

  //   // Since map projection is EPSG:4326
  //   const coords = [lon, lat];

  //   map.getView().animate({
  //     center: coords,
  //     zoom: 18,
  //     duration: 800
  //   });
  // }
  if (latFromUrl && lonFromUrl) {

    const lat = parseFloat(latFromUrl);
    const lon = parseFloat(lonFromUrl);

    const coords = [lon, lat];   // EPSG:4326 uses lon,lat

    // Move map to location
    map.getView().animate({
      center: coords,
      zoom: 18,
      duration: 800
    });

    // Create marker feature
    const marker = new ol.Feature({
      geometry: new ol.geom.Point(coords)
    });

    // Marker style
    marker.setStyle(
      new ol.style.Style({
        image: new ol.style.Icon({
          src: "./logo/bus/current_location.png",
          anchor: [0.5, 1],
          scale: 0.2
        })
      })
    );

    // Vector layer for marker
    const markerLayer = new ol.layer.Vector({
      source: new ol.source.Vector({
        features: [marker]
      })
    });

    map.addLayer(markerLayer);
  }
  else {
    // ---------- Zoom using WFS ----------
    const wfsUrl =
      `${GEOSERVER_BASE_URL1}/wfs?service=WFS&version=1.1.0&request=GetFeature` +
      `&typeName=Lko_Summary:segmentszone2roads` +
      `&outputFormat=application/json` +
      `&CQL_FILTER=${encodeURIComponent(cqlFilter)}`;

    fetch(wfsUrl)
      .then(res => res.json())
      .then(data => {

        if (!data.features || data.features.length === 0) {
          console.log("No features found for zoom");
          return;
        }

        const features = new ol.format.GeoJSON().readFeatures(data, {
          featureProjection: map.getView().getProjection()
        });

        const vectorSource = new ol.source.Vector({
          features: features
        });

        const extent = vectorSource.getExtent();

        if (extent && !ol.extent.isEmpty(extent)) {
          map.getView().fit(extent, {
            padding: [50, 50, 50, 50],
            duration: 800
          });
        }


      })
      .catch(err => console.error("Zoom fetch error:", err));
  }
} else {
  console.warn("No filter applied.");
}




const searchInput = document.getElementById("roadSearch");
const suggestionBox = document.getElementById("roadSuggestions");

let debounceTimer;

// 🔹 Typing listener (for dropdown suggestions)
searchInput.addEventListener("keyup", function (e) {

  const value = this.value.trim();

  clearTimeout(debounceTimer);

  if (value.length < 2) {
    suggestionBox.innerHTML = "";
    return;
  }

  debounceTimer = setTimeout(() => {
    fetchSuggestions(value);
  }, 300);

});

// 🔹 Enter key listener (for direct search)
searchInput.addEventListener("keydown", function (e) {

  if (e.key === "Enter") {

    const value = this.value.trim();

    if (!value) return;

    selectRoad(value);
    suggestionBox.innerHTML = "";

  }

});

function fetchSuggestions(text) {

  text = text.replace(/'/g, "''");

  const nameFilter = `road_name ILIKE '${text}%'`;

  let combinedFilter = nameFilter;

  if (cqlFilter) {
    combinedFilter = `(${cqlFilter}) AND (${nameFilter})`;
  }

  const wfsUrl =
    `${GEOSERVER_BASE_URL1}/wfs?service=WFS&version=1.1.0&request=GetFeature` +
    `&typeName=Lko_Summary:segmentszone2roads` +
    `&outputFormat=application/json` +
    `&maxFeatures=30` +
    `&CQL_FILTER=${encodeURIComponent(combinedFilter)}`;

  fetch(wfsUrl)
    .then(res => res.json())
    .then(data => {

      suggestionBox.innerHTML = "";

      if (!data.features) return;

      const uniqueNames = new Set();

      data.features.forEach(f => {
        const name = f.properties.road_name;
        if (name && !uniqueNames.has(name)) {
          uniqueNames.add(name);

          const div = document.createElement("div");
          div.className = "suggestion-item";
          div.innerText = name;

          div.onclick = () => selectRoad(name);

          suggestionBox.appendChild(div);
        }
      });

    })
    .catch(err => console.error("Suggestion error:", err));
}

function selectRoad(name) {

  suggestionBox.innerHTML = "";
  searchInput.value = name;

  //const filter = `road_name='${name.replace(/'/g, "''")}'`;
  const filter = `road_name ILIKE '%${name.replace(/'/g, "''")}%'`;

  let finalFilter = filter;

  if (cqlFilter) {
    finalFilter = `(${cqlFilter}) AND (${filter})`;
  }

  // Update WMS
  if (knp_road) {
    knp_road.getSource().updateParams({
      CQL_FILTER: finalFilter
    });
  }

  // Zoom via WFS
  const wfsUrl =
    `${GEOSERVER_BASE_URL1}/wfs?service=WFS&version=1.1.0&request=GetFeature` +
    `&typeName=Lko_Summary:segmentszone2roads` +
    `&outputFormat=application/json` +
    `&CQL_FILTER=${encodeURIComponent(finalFilter)}`;

  fetch(wfsUrl)
    .then(res => res.json())
    .then(data => {

      // if (!data.features || data.features.length === 0) return;
      if (!data.features || data.features.length === 0) {

        suggestionBox.innerHTML = "";

        const div = document.createElement("div");
        div.className = "suggestion-item";
        div.innerHTML = "<h6>Road not available in selected area</h6>";
        div.style.color = "red";
        div.style.cursor = "default";

        suggestionBox.appendChild(div);

        return;
      }

      const features = new ol.format.GeoJSON().readFeatures(data, {
        featureProjection: map.getView().getProjection()
      });

      const source = new ol.source.Vector({ features });

      const extent = source.getExtent();

      if (extent && !ol.extent.isEmpty(extent)) {

        // Save current view before zooming
        const view = map.getView();
        previousViewState = {
          center: view.getCenter(),
          zoom: view.getZoom()
        };

        view.fit(extent, {
          padding: [40, 40, 40, 40],
          duration: 800
        });
      }

    });
}
const clearBtn = document.getElementById("clearSearch");

searchInput.addEventListener("input", function () {
  clearBtn.style.display = this.value.length > 0 ? "block" : "none";
});

clearBtn.addEventListener("click", function () {

  searchInput.value = "";
  suggestionBox.innerHTML = "";
  clearBtn.style.display = "none";

  // Reset WMS filter
  if (knp_road && cqlFilter) {
    knp_road.getSource().updateParams({
      CQL_FILTER: cqlFilter
    });
  }

  // Restore previous zoom
  if (previousViewState) {
    map.getView().animate({
      center: previousViewState.center,
      zoom: previousViewState.zoom,
      duration: 800
    });

    previousViewState = null;  // reset after restore
  }

});



 

//------------------------------------------- Chainage Functionality -------------------------//
const patchSource = new ol.source.Vector();

const patchLayer = new ol.layer.Vector({
  source: patchSource,
  style: new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: "#c8eb2d",
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

  const panel = document.getElementById("uniqueIdPanel");
  panel.style.display = 'block';  // Show the panel

  // Populate the panel with the selected road's road ID
  document.getElementById("road").value = selectedRoadId;
  document.getElementById("zoneNo").value = selectedZone1;
  document.getElementById("wardNo").value = selectedWard1;
  document.getElementById("RoadName").value = selectedRoadName;

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
  document.getElementById("senddata").classList.add("hidden");
  document.getElementById("previewBtn").classList.add("hidden");
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
  loadPatchesByRoad();
  document.getElementById("viewpatch-select").classList.add("hidden");
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

    // Show chainage information for the selected road
    showChainageForSelectedRoad(selectedRoadId);

    // Open the panel with the unique road ID
    openUniqueIdPanel();

    // Load additional distance data from the database for the selected road
    loadDistancesFromDB(selectedRoadId);
    //updateProjectPanelRoad(selectedRoadId);
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
    const res = await fetch(`${BASE_URL}/chainage/${roadId}`);
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


document.getElementById("submitUniqueId").addEventListener("click", async () => {
  const startSelect = document.getElementById("startPoint");
  const endSelect = document.getElementById("endPoint");
  const startPoint = startSelect.value;
  const endPoint = endSelect.value;


  //document.getElementById("viewChainageSection").style.display = "block";
  if (!startPoint || !endPoint) {
    alert("Select start and end points");
    return;
  }

  // const session_id = getSessionId();
  const payload = {
    roadId: selectedRoadId,
    startPoint: Number(startPoint),
    endPoint: Number(endPoint)
  };


  try {
    const res = await fetch("${BASE_URL}/create-patch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error);

    alert(
      `Patch created!\nPatch ID: ${data.patch_id}\nSegments: ${data.segments_inserted}\n Click on Chainage Road to view Patchs`
    );

    await checkRoadInPatchTable(selectedRoadId);
    const chainageYes = document.querySelector('input[name="viewChainage"][value="yes"]');

    if (chainageYes && chainageYes.checked) {

      // reload patch list
      await loadPatchesByRoad(selectedRoadId);

      // reload geometry
      const resGeo = await fetch(`http://localhost:8060/Kanpur/patch/geometry/${selectedRoadId}`);
      const geojson = await resGeo.json();

      const format = new ol.format.GeoJSON();
      allPatchFeatures = format.readFeatures(geojson, {
        featureProjection: map.getView().getProjection()
      });

      patchSource.clear();
      patchSource.addFeatures(allPatchFeatures);


      // Update markers when patches change


      patchLayer.setVisible(true);

      // refresh table
      showPatchTable(selectedRoadId);
    }

  } catch (err) {
    console.error(err);
    alert("Patch creation failed");
  }
});



async function generateMapImage() {
  return new Promise((resolve, reject) => {

    const map = window.olMap;
    if (!map) return reject("Map not initialized");

    map.renderSync();

    setTimeout(() => {
      const viewport = map.getViewport();
      const canvases = viewport.querySelectorAll("canvas");

      if (!canvases.length) return reject("No map canvas found");

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

        exportCanvas.toBlob((blob) => {
          const base64 = exportCanvas.toDataURL("image/png");
          resolve({ blob, base64 });
        }, "image/png");

      } catch (err) {
        reject(err);
      }

    }, 300); // slightly safer delay
  });
}









document.addEventListener("DOMContentLoaded", function () {

  const sendBtn = document.getElementById("senddata");
  const modal = document.getElementById("previewModal");
  const previewDetails = document.getElementById("previewDetails");
  const previewImage = document.getElementById("previewImage");

  const confirmBtn = document.getElementById("confirmSendBtn");
  const cancelBtn = document.getElementById("cancelSendBtn");

  let finalPayload = null;   // store payload globally for confirm step
  let finalImageBlob = null;

  sendBtn.addEventListener("click", async function () {

    try {

      const params = new URLSearchParams(window.location.search);
      const project_id = params.get("project_id");
      const user_id = params.get("user_id");

      const selectedPatchIds = Array.from(
        document.querySelectorAll(".patchCheckbox:checked")
      ).map(cb => cb.value);

      if (selectedPatchIds.length === 0) {
        alert("Please select at least one patch");
        return;
      }

      // 1️⃣ Map patches
      const mapResponse = await fetch(
        "http://localhost:8060/Kanpur/map-project-patches",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId: Number(project_id),
            userId: Number(user_id),
            patchIds: selectedPatchIds
          })
        }
      );

      if (!mapResponse.ok) {
        throw new Error(await mapResponse.text());
      }

      // 2️⃣ Fetch grouped data
      const response = await fetch(
        "http://localhost:8060/Kanpur/grouped-patches-by-selection",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId: Number(project_id),
            patchIds: selectedPatchIds
          })
        }
      );

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const groupedData = await response.json();

      if (!groupedData.patches || groupedData.patches.length === 0) {
        alert("No patches found");
        return;
      }

      // 3️⃣ Generate Map Image
      const { blob, base64 } = await generateMapImage();

      finalImageBlob = blob;

      // 4️⃣ Prepare payload
      finalPayload = {
        project_id,
        user_id,
        total_patches: groupedData.total_patches,
        patches: groupedData.patches
      };

      // 5️⃣ Fill Preview
      const roadId = groupedData.patches.length > 0
        ? groupedData.patches[0].roadId
        : "N/A";

      const patchIds = groupedData.patches
        .map(p => p.patchId)
        .join(", ");

      previewDetails.innerHTML = `
  <div class="preview-row">
    <span class="preview-label">Project ID</span>
    <span class="preview-value">${project_id}</span>
  </div>

  <div class="preview-row">
    <span class="preview-label">User ID</span>
    <span class="preview-value">${user_id}</span>
  </div>

  <div class="preview-row">
    <span class="preview-label">Road ID</span>
    <span class="preview-value">${roadId}</span>
  </div>

  <div class="preview-row">
    <span class="preview-label">Patch ID</span>
    <span class="preview-value">[${patchIds}]</span>
  </div>
`;


      previewImage.src = base64;

      // 6️⃣ Show Modal
      modal.style.display = "flex";

    } catch (err) {
      console.error("Process failed:", err);
      alert("Something went wrong");
    }

  });

  // YES → Send
  confirmBtn.addEventListener("click", async function () {

    modal.style.display = "none";

    try {

      // Send JSON
      await fetch("https://eowpkbwc2pvgxw5.m.pipedream.net", {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalPayload)
      });

      // Send Image
      const formData = new FormData();
      formData.append("file", finalImageBlob, "kanpur_map.png");

      await fetch("https://eowpkbwc2pvgxw5.m.pipedream.net", {
        method: "POST",
        mode: "no-cors",
        body: formData
      });
      console.log("Data + Image sent successfully", finalImageBlob.type);
      console.log("Data sent:", finalPayload);

    } catch (err) {
      console.error("Send failed:", err);
    }

  });

  // CANCEL
  cancelBtn.addEventListener("click", function () {
    modal.style.display = "none";
  });

});





async function checkRoadInPatchTable(roadId) {
  try {
    const res = await fetch(`http://localhost:8060/Kanpur/check-road-patch/${roadId}`);
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



//--------- Updated event listener to check if a road is selected before proceeding with chainage display logic ---------//
document.querySelectorAll('input[name="viewChainage"]').forEach(radio => {
  radio.addEventListener("change", async (e) => {
    if (e.target.value === "yes") {
      // hideChainageForRoad(selectedRoadId);
      document.getElementById("senddata").style.display = "block";
      document.getElementById("previewBtn").style.display = "block";
      showPatchTable(selectedRoadId);
      loadPatchesByRoad(selectedRoadId);
      const res = await fetch(`http://localhost:8060/Kanpur/patch/geometry/${selectedRoadId}`);
      const geojson = await res.json();
      const format = new ol.format.GeoJSON();

      allPatchFeatures = format.readFeatures(geojson, {
        featureProjection: map.getView().getProjection()
      });
      patchSource.clear();
      patchSource.addFeatures(allPatchFeatures);
      /*patchSource.on('change', function () {
        startMarkerSource.clear();
        endMarkerSource.clear();

        var features = patchSource.getFeatures();
        if (!features || features.length === 0) return;

        features.forEach(function (f) {
          var geom = f.getGeometry();
          if (!geom) return;

          var startCoord = null;
          var endCoord = null;

          if (geom.getType() === 'LineString') {
            var coords = geom.getCoordinates();
            startCoord = coords[0];
            endCoord = coords[coords.length - 1];
          } else if (geom.getType() === 'MultiLineString') {
            var segments = geom.getCoordinates();
            if (segments.length > 0) {
              startCoord = segments[0][0];
              endCoord = segments[segments.length - 1][segments[segments.length - 1].length - 1];
            }
          }

          if (startCoord) startMarkerSource.addFeature(new ol.Feature(new ol.geom.Point(startCoord)));
          if (endCoord) endMarkerSource.addFeature(new ol.Feature(new ol.geom.Point(endCoord)));
        });
     //   });     ///
      patchSource.on('change', function () {

  startMarkerSource.clear();
  endMarkerSource.clear();

  const features = patchSource.getFeatures();
  if (!features || features.length === 0) return;

  const patchGroups = {};

  // Group features by patch id
  features.forEach(function (f) {

    const patchId = f.get("patch_id"); // change if your field name is different

    if (!patchGroups[patchId]) {
      patchGroups[patchId] = [];
    }

    patchGroups[patchId].push(f);

  });



  Object.values(patchGroups).forEach(function (patchFeatures) {

    const startCandidates = {};
    const endCandidates = {};

    patchFeatures.forEach(function (f) {

      const geom = f.getGeometry();
      if (!geom) return;

      if (geom.getType() === "LineString") {

        const coords = geom.getCoordinates();
        const start = coords[0].join(",");
        const end = coords[coords.length - 1].join(",");

        startCandidates[start] = (startCandidates[start] || 0) + 1;
        endCandidates[end] = (endCandidates[end] || 0) + 1;

      }

      else if (geom.getType() === "MultiLineString") {

        const segments = geom.getCoordinates();

        segments.forEach(function (seg) {

          const start = seg[0].join(",");
          const end = seg[seg.length - 1].join(",");

          startCandidates[start] = (startCandidates[start] || 0) + 1;
          endCandidates[end] = (endCandidates[end] || 0) + 1;

        });

      }

    });

    let startCoord = null;
    let endCoord = null;

    Object.keys(startCandidates).forEach(function (coord) {
      if (!endCandidates[coord]) {
        startCoord = coord.split(",").map(Number);
      }
    });

    Object.keys(endCandidates).forEach(function (coord) {
      if (!startCandidates[coord]) {
        endCoord = coord.split(",").map(Number);
      }
    });

    if (startCoord) {
      startMarkerSource.addFeature(
        new ol.Feature({
          geometry: new ol.geom.Point(startCoord)
        })
      );
    }

    if (endCoord) {
      endMarkerSource.addFeature(
        new ol.Feature({
          geometry: new ol.geom.Point(endCoord)
        })
      );
    }

  });

});
      patchLayer.setVisible(true);
    } else {
      hidePatchTable();
      hidepatchselect();
      showChainageForSelectedRoad(selectedRoadId);
      patchSource.clear();
      patchLayer.setVisible(false);
      allPatchFeatures = [];
      // closeUpdatePatchPanel();
    }
  });
});

// async function showPatchTable(roadId, patchId = null) {
//   const tableDiv = document.getElementById("ChainageTable");
//   tableDiv.style.display = "block";
//   const url = patchId ? `http://localhost:8060/Kanpur/segments-by-road/${roadId}?patchId=${patchId}` : `http://localhost:8060/Kanpur/segments-by-road/${roadId}`;
//   const res = await fetch(url);
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
//   //disablePatchTableEdit();

// }

async function showPatchTable(roadId, patchId = null) {
  const tableDiv = document.getElementById("ChainageTable");
  tableDiv.style.display = "block";

  let url = `http://localhost:8060/Kanpur/segments-by-road/${roadId}`;

  if (patchId && Array.isArray(patchId) && patchId.length > 0) {
    url += `?patchId=${patchId.join(",")}`;
  }

  const res = await fetch(url);
  const data = await res.json();

  if (!data.length) {
    tableDiv.innerHTML = "<p>No data</p>";
    return;
  }

  const cols = Object.keys(data[0]);



  const formatHeader = str => str.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");

  let html = "<table class='chainage-table'><thead><tr>";

  cols.forEach(c => html += `<th>${formatHeader(c)}</th>`);
  html += "</tr></thead><tbody>";

  data.forEach(row => {
    html += "<tr>";
    cols.forEach(c => html += `<td>${row[c] ?? ""}</td>`);
    html += "</tr>";
  });

  html += "</tbody></table>";
  tableDiv.innerHTML = html;
}

function showpatchselect() {
  document.getElementById("viewpatch-select").classList.remove("hidden");
}
function hidepatchselect() {
  document.getElementById("viewpatch-select").classList.add("hidden");
}




async function loadPatchesByRoad(roadId) {
  const panel = document.getElementById("viewpatch-select");  //--show patch selection panel

  panel.innerHTML = "<strong>Select Patch:</strong><br>";
  panel.classList.remove("hidden");

  if (!roadId) return;

  try {
    const response = await fetch(`http://localhost:8060/Kanpur/patches-by-road/${roadId}`);
    const patches = await response.json();

    if (!patches.length) {
      panel.innerHTML += "<em>No patches found</em>";
      return;
    }

    //  ALL option (Radio)
    const allLabel = document.createElement("label");
    const allRadio = document.createElement("input");

    allRadio.type = "radio";
    allRadio.name = "patchAllRadio";
    allRadio.checked = true;

    allRadio.addEventListener("change", () => {
      // Uncheck all checkboxes
      document.querySelectorAll(".patchCheckbox").forEach(cb => cb.checked = false);

      showAllPatches();
      showPatchTable(selectedRoadId);
    });

    allLabel.appendChild(allRadio);
    allLabel.append(" All");
    panel.appendChild(allLabel);
    panel.appendChild(document.createElement("br"));

    //  Patch checkboxes
    patches.forEach(p => {

      const label = document.createElement("label");

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = p.patch_id;
      checkbox.className = "patchCheckbox";

      checkbox.addEventListener("change", updateSelectedPatches);

      label.appendChild(checkbox);
      label.append(" " + p.patch_id);

      panel.appendChild(label);
      panel.appendChild(document.createElement("br"));
    });

  } catch (err) {
    console.error("Failed to load patches:", err);
  }
}


function updateSelectedPatches() {

  const selectedIds = Array.from(
    document.querySelectorAll(".patchCheckbox:checked")
  ).map(cb => cb.value);

  const allRadio = document.querySelector('input[name="patchAllRadio"]');

  // If any checkbox selected → uncheck ALL
  if (selectedIds.length > 0 && allRadio) {
    allRadio.checked = false;
  }

  patchSource.clear();

  if (selectedIds.length === 0) {
    patchLayer.setVisible(false);
    hidePatchTable();
    return;
  }

  const filtered = allPatchFeatures.filter(f =>
    selectedIds.includes(String(f.get("patch_id")))
  );

  patchSource.addFeatures(filtered);
  patchLayer.setVisible(true);

  const extent = patchSource.getExtent();
  if (extent && !isNaN(extent[0])) {
    map.getView().fit(extent, {
      padding: [80, 80, 80, 80],
      duration: 600,
      maxZoom: 20
    });
  }


  showPatchTable(selectedRoadId, selectedIds);


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





*/

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("projectReportBtn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    window.open(
      "https://lookerstudio.google.com/reporting/f5e7018a-ed45-4cb2-8eae-bf1e01cc8eb8",
      "_blank"
    );
  });
});

