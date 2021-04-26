const { ipcRenderer } = require("electron");

ipcRenderer.on("set-stored-data", (_, args) => {
  const {
    clientId,
    title,
    desc,
    timestampType,
    timestamp,
    imageName,
    imageDesc,
    smallImageName,
    smallImageDesc,
    button1Name,
    button1URL,
    button2Name,
    button2URL,
  } = args[0];

  console.log(args[0]);

  document.getElementById("clientid").value = clientId || "";

  document.getElementById("title").value = title || "";
  document.getElementById("desc").value = desc || "";

  document.getElementById("imagename").value = imageName || "";
  document.getElementById("imagedesc").value = imageDesc || "";

  document.getElementById("time" + timestampType || "off").checked = true;
  document.getElementById("timestamp").value = timestamp || "";

  document.getElementById("smallimagename").value = smallImageName || "";
  document.getElementById("smallimagedesc").value = smallImageDesc || "";

  document.getElementById("button1name").value = button1Name || "";
  document.getElementById("button1url").value = button1URL || "";

  document.getElementById("button2name").value = button2Name || "";
  document.getElementById("button2url").value = button2URL || "";
});

document.getElementById("cleartimestamp").addEventListener("click", (e) => {
  e.preventDefault();

  document.getElementById("timestamp").value = "";
});

function getTimestampType() {
  if (document.getElementById("timeoff").checked) return "off";
  else if (document.getElementById("timestart").checked) return "start";
  else return "end";
}

document.getElementById("values").addEventListener("submit", async (e) => {
  e.preventDefault();

  let clientId = document.getElementById("clientid").value;

  let title = document.getElementById("title").value;
  let desc = document.getElementById("desc").value;

  let imageName = document.getElementById("imagename").value;
  let imageDesc = document.getElementById("imagedesc").value;

  let timestampType = getTimestampType();
  let timestamp = document.getElementById("timestamp").value;

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
    {
      clientId,
      title,
      desc,
      timestampType,
      timestamp,
      imageName,
      imageDesc,
      smallImageName,
      smallImageDesc,
      button1Name,
      button1URL,
      button2Name,
      button2URL,
    },
  ]);

  resultText.innerHTML = res.message;
  resultText.style.color = res.success ? "greenyellow" : "lightcoral";
  submitButton.disabled = false;
});
