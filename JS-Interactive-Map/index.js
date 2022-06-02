//Obtain User's current Location
async function myCoords() {
  let pos = await new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
  return [pos.coords.latitude, pos.coords.longitude];
}

//Map Object
let interactiveMap = {
  coordinates: [],
  businesses: [],
  map: {},
  markers: {},

  //Build map with user coords
  buildMap() {
    this.map = L.map("map", {
      center: this.coordinates,
      zoom: 15,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      minZoom: "12",
    }).addTo(this.map);
    //Mark User Location
    let marker = L.marker(this.coordinates);
    marker
      .addTo(this.map)
      .bindPopup("<p1><b>Here you are king!</b><br></p1>")
      .openPopup();
  },
  //Add the markers for each business category
  pinMarkers() {
    for (var i = 0; i < this.businesses.length; i++) {
      this.markers = L.marker([this.businesses[i].lat, this.businesses[i].long])
        .bindPopup(`<p1>${this.businesses[i].name}</p1>`)
        .addTo(this.map);
    }
  },
};

//Allow the user to select a business type from a list and map the five nearest locations on the map using Foursquare API
async function fSquare(business) {
  const options = {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: "fsq3/DBadOfzwAbr4ISR1Yi9kJJH9E6yfgbGUs2LDEjyoxQ=",
    },
  };
  let response = await fetch(
    "https://api.foursquare.com/v3/places/search?&ll=35.6286464%2C-78.8430848&limit=5&query=" +
      business.toString(),
    options
  );
  let data = await response.text();
  let parsedData = JSON.parse(data);
  let businesses = parsedData.results;
  return businesses;
}
//ForSquare array for map
function getBusinesses(data) {
  let businesses = data.map((element) => {
    let location = {
      name: element.name,
      lat: element.geocodes.main.latitude,
      long: element.geocodes.main.longitude,
    };
    return location;
  });
  return businesses;
}
//On Load -> coords
window.onload = async () => {
  const coords = await myCoords();
  interactiveMap.coordinates = coords;
  interactiveMap.buildMap();
};

//Category Button
document.getElementById("submit").addEventListener("click", async (event) => {
  event.preventDefault();
  let business = document.getElementById("business").value;
  let data = await fSquare(business);
  interactiveMap.businesses = getBusinesses(data);
  interactiveMap.pinMarkers();
});
