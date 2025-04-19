// 位置情報を取得する
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition, showError);
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

function showPosition(position) {
  var lat = position.coords.latitude;
  var lon = position.coords.longitude;

  // 緯度経度をARの座標に変換する処理を書くことができます。
  // 例えば、緯度と経度をもとにAR内での位置を決定するために、適切なスケーリングを行います。

  console.log("Latitude: " + lat + " Longitude: " + lon);

  // 位置情報を元にAR内で表示する要素を動的に追加します
  const marker = document.querySelector('#location-marker');
  marker.setAttribute('position', `${lat} 1.5 ${lon}`);
}

function showError(error) {
  switch(error.code) {
    case error.PERMISSION_DENIED:
      alert("User denied the request for Geolocation.");
      break;
    case error.POSITION_UNAVAILABLE:
      alert("Location information is unavailable.");
      break;
    case error.TIMEOUT:
      alert("The request to get user location timed out.");
      break;
    case error.UNKNOWN_ERROR:
      alert("An unknown error occurred.");
      break;
  }
}
