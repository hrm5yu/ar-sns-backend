// 位置情報を取得する
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition, showError);
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

function showPosition(position) {
  var lat = position.coords.latitude;  // 緯度
  var lon = position.coords.longitude; // 経度

  // 位置情報をARの座標に変換する（AR空間内の位置に反映）
  // ここでは、単純に緯度と経度を直接使って位置を設定しますが、通常はAR空間でのスケーリングを行う必要があります
  var x = lon / 1000;  // 経度に基づく座標（簡単なスケーリング）
  var z = lat / 1000;  // 緯度に基づく座標（簡単なスケーリング）
  
  // ボックスの位置を更新
  var marker = document.querySelector('#location-marker');
  marker.setAttribute('position', `${x} 1.5 ${z}`);
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
