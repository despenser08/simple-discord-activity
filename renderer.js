const { ipcRenderer } = require("electron");

document.getElementById("values").addEventListener("submit", async (e) => {
  e.preventDefault();

  let clientId = document.getElementById("clientid").value;
  let title = document.getElementById("title").value;
  let desc = document.getElementById("desc").value;
  let timestamp = document.getElementById("timestamp").checked;
  let imageName = document.getElementById("imagename").value;
  let imageDesc = document.getElementById("imagedesc").value;

  const res = await ipcRenderer.invoke("change-activity", [
    clientId,
    title,
    desc,
    timestamp,
    imageName,
    imageDesc,
  ]);

  let resultText = document.getElementById("result");
  resultText.innerHTML = res.message;
  resultText.style.color = res.success ? "green" : "red";
});
