document.getElementById("submitMessage").addEventListener("click", function () {
  const name = document.getElementById("nameInput").value;
  const message = document.getElementById("messageInput").value;

  // 名前とメッセージが入力されているか確認
  if (name && message) {
    const arMessage = document.getElementById("arMessage");
    arMessage.setAttribute("text", `value: ${name}: ${message}`);
    // 送信後、フォームをクリア
    document.getElementById("nameInput").value = "";
    document.getElementById("messageInput").value = "";
  } else {
    alert("名前とメッセージを入力してください！");
    return;
  }
});
