const targetLat = 35.6614144;   // 渋谷スクランブルの緯度
const targetLon = 139.8603776;  // 渋谷スクランブルの経度

function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // 地球の半径（メートル）
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

navigator.geolocation.getCurrentPosition(
  (position) => {
    const userLat = position.coords.latitude;
    const userLon = position.coords.longitude;

    const distance = getDistanceFromLatLonInMeters(userLat, userLon, targetLat, targetLon);
    console.log("現在地との距離（m）:", distance);

    if (distance < 50) { // 50m以内なら表示！
      // メッセージを表示する
      const text = document.createElement('a-text');
      text.setAttribute('value', 'ここが例の場所！');
      text.setAttribute('position', '0 0 -1');
      text.setAttribute('color', 'blue');
      text.setAttribute('look-at', '[camera]');
      document.querySelector('a-scene').appendChild(text);
    } else {
      console.log("遠すぎるため表示されません");
    }
  },
  (err) => {
    console.error("位置情報エラー:", err);
  }
);
