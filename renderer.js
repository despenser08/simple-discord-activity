const { ipcRenderer } = require("electron");

document.getElementById("values").addEventListener("submit", async (e) => {
  e.preventDefault();

  let clientId = document.getElementById("clientid").value;

  let title = document.getElementById("title").value;
  let desc = document.getElementById("desc").value;
  let timestamp = document.getElementById("timestamp").checked;

  let imageName = document.getElementById("imagename").value;
  let imageDesc = document.getElementById("imagedesc").value;

  let smallImageName = document.getElementById("smallimagename").value;
  let smallImageDesc = document.getElementById("smallimagedesc").value;

  let button1Name = document.getElementById("button1name").value;
  let button1URL = document.getElementById("button1url").value;

  let button2Name = document.getElementById("button2name").value;
  let button2URL = document.getElementById("button2url").value;

  let resultText = document.getElementById("result");
  let submitButton = document.getElementById("submitbtn");

  submitButton.disabled = true;
  resultText.innerHTML = "Updating...";
  resultText.style.color = "yellow";

  const res = await ipcRenderer.invoke("update-activity", [
    clientId,
    { title, desc, timestamp },
    { imageName, imageDesc },
    { smallImageName, smallImageDesc },
    { button1Name, button1URL },
    { button2Name, button2URL },
  ]);

  resultText.innerHTML = res.message;
  resultText.style.color = res.success ? "green" : "red";
  submitButton.disabled = false;
});
