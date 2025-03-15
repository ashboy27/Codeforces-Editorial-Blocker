
function hideContestMaterials() {
    let sections = document.querySelectorAll(".roundbox"); 
  
    sections.forEach(section => {
      if (section.innerText.toLowerCase().includes("contest materials")) {
        section.style.display = "none"; 
      }
    });
  }
  
  
chrome.storage.sync.get("enabled", function (data) {
    if (data.enabled) {
      hideContestMaterials();
    }
});
  