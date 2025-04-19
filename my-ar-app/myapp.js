// 位置情報の取得（まだ表示には使わないけど準備！）
navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      console.log("現在地:", lat, lon);
    },
    (err) => {
      console.error("位置情報エラー:", err);
    }
  );
  