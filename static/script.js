function sendMessage() {
  const input = document.getElementById("user-input");
  const message = input.value;
  if (!message) return;

  addMessage("أنت", message, "user");
  input.value = "";

  fetch("/chat", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({message})
  })
  .then(res => res.json())
  .then(data => {
    addMessage("Mind", data.reply, "bot");
  });
}

function addMessage(sender, text, cls) {
  const box = document.getElementById("chat-box");
  const div = document.createElement("div");
  div.className = "message " + cls;
  div.innerHTML = `<b>${sender}:</b> ${text}`;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}
