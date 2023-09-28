function initMap() {
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 17,
    center: { lat: 28.719743728637695, lng: 77.06610870361328 } ,
  });

  const marker = new google.maps.Marker({
    position: { lat: 28.719743728637695, lng: 77.06610870361328 } ,
    map,
    title: "drag to move",
    draggable: true,
  });
    
  marker.addListener("dragend", (event) => {
    document.getElementById("lat").value=marker.getPosition().lat();
    document.getElementById("lng").value=marker.getPosition().lng();
  });
}
window.initMap = initMap;
