document.getElementById("submitMessage").addEventListener("click", function () {
  const name = document.getElementById("nameInput").value;
  const message = document.getElementById("messageInput").value;

  // 名前とメッセージが入力されていない場合の処理
  if (!name || !message) {
    // エラーメッセージを画面に表示
    document.getElementById("errorMessage").style.display = 'block';
    return;  // 入力がない場合、処理を中止してカメラを更新させる
  }

  // 入力がある場合、ARメッセージを更新
  const arMessage = document.getElementById("arMessage");
  arMessage.setAttribute("text", `value: ${name}: ${message}`);
  
  // 送信後、フォームをクリア
  document.getElementById("nameInput").value = "";
  document.getElementById("messageInput").value = "";

  // エラーメッセージを非表示
  document.getElementById("errorMessage").style.display = 'none';
});
