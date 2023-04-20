
// Function to get the value of a query parameter in the URL
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}


function viewJsonx(){
  newWindow = window.open("data:text/json," + encodeURIComponent(jsonData),"_blank");
}

var textareaVisible = false;
var jsonText;

function viewJson(button) {
  if (textareaVisible) {
    document.body.removeChild(jsonText);
    textareaVisible = false;
    return;
  }
  
  // Set flag to indicate that the textarea is visible
  textareaVisible = true;
  
  // Convert the JSON object to a JSON string
  var jsonString = JSON.stringify(jsonData, null, 2);
  
  // Create a new div element to contain the textarea and buttons
  jsonText = document.createElement("div");
  jsonText.style.position = "absolute";
  
  // Create a new textarea element
  var textarea = document.createElement("textarea");
  textarea.value = jsonString;
  jsonText.appendChild(textarea);
  
  // Create a copy button next to the close button
  var copyButton = document.createElement("button");
  copyButton.innerText = "Copy";
  copyButton.addEventListener("click", function() {
    // Copy the contents of the textarea to the clipboard
    textarea.select();
    document.execCommand('copy');
  });
  jsonText.appendChild(copyButton);
  
  // Create a close button next to the copy button
  var closeButton = document.createElement("button");
  closeButton.innerText = "Close";
  closeButton.addEventListener("click", function() {
    // Remove the container div from the DOM
    document.body.removeChild(jsonText);
    
    // Set flag to indicate that the textarea is no longer visible
    textareaVisible = false;
  });
  jsonText.appendChild(closeButton);
  
  // Set the position of the div to the location of the button clicked
  var buttonElement = document.getElementById(button.id);
  jsonText.style.left = buttonElement.offsetLeft + "px";
  jsonText.style.top = buttonElement.offsetTop + buttonElement.offsetHeight + "px";
  
  // Append the div to the body
  document.body.appendChild(jsonText);
}






async function uploadFile(filename) {
  var formData = new FormData();
  //var jsonData = document.getElementById("output-textarea").value;
  var data = new Blob([jsonData], {type: 'text/html'});
  var filename = jsonUrl;
  var filename = jsonUrl.substring(jsonUrl.lastIndexOf('/')+1);
  formData.append("filename", data, filename);
  await fetch(APIEndpoint, {
    method: "POST", 
    body: formData
  }).then(res => console.log(res));
}


async function save_from_form(formElement){
  let filename=document.getElementById(formElement).value;
  await uploadFile(filename);
}


async function load_from_form(formElement){
  let filename=document.getElementById(formElement).value;
  loadNewJson(filename);
}


// Function to load new JSON data based on the actionUrl parameter
function loadNewJson(actionUrl) {
  if (actionUrl) {
    // Update the URL with the new JSON data and reload the page
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('actionUrl', actionUrl);
    window.location.href = newUrl.toString();
  } else {
    console.log('No actionUrl parameter found.');
  }
}

  let jsonData;

function loadJson(file, callback) {
  // Replace ./data.json with your JSON feed
  fetch(file)
  .then((response) => {
    return response.json();
  })
  .then((data) => {
    // Work with JSON data here
    callback(data); // <- The callback function is called here
  })
  .catch((err) => {
    // Do something for an error here
    console.log("fetch error");
  });
}

function loadImages(jsonFile) {

  loadJson(jsonFile, function (fetchedData) {
    jsonData = fetchedData;

    jsonData.forEach(function (item) {
      var imageContainer = `
        <div class="col-md-4 draggable card-custom" data-uuid="${item.uuid}">
          <div class="card mb-4 box-shadow">
            <img class="card-img-top image-thumbnail" src="${item.url}" alt="${item.title}">
            <div class="card-body">
              <h5 class="card-title editable" contentEditable="true">${item.title}</h5>
              <p class="card-text editable" contentEditable="true">${item.description || ''}</p>
              <p class="card-text editable" contentEditable="true">${item.actionUrl || ''}</p>
              <div class="d-flex justify-content-between align-items-center">
              ${
                    item.actionUrl.endsWith('.json')
                    ? `<button onclick="loadNewJson('${item.actionUrl}')" class="btn btn-sm btn-outline-secondary">Load New JSON</button>`
                    : item.actionUrl.endsWith('.jpg') || item.actionUrl.endsWith('.png')
                    ? `<a href="${item.actionUrl}" class="btn btn-sm btn-outline-secondary">View</a>`
                    : ''
              }
              <small class="text-muted">${item.date || ''}</small>
              </div>
            </div>
          </div>
        </div>
      `;
      
      $('#image-grid').append(imageContainer);
    });
    $('.sortable').sortable({
      items: '.draggable',
      handle: '.card',
      opacity: 0.5,
      update: function (event, ui) {
        updateJsonOrder(jsonData);
      },
    });
    $("#image-grid").on("click", ".editable", function () {
      var element = $(this);
      var uuid = element.closest(".draggable").data("uuid");
      var field = element.hasClass("card-title") ? "title" : "description";
      var oldValue = element.text();
      
      element.hide();
      
      var input = $("<input>")
      .attr({
        "type": "text",
        "value": oldValue,
      })
      .css({
        "width": "100%",
      });
      
      input.insertAfter(element).focus();
      
      input.on("blur keyup", function (event) {
        if (event.type === "blur" || event.key === "Enter") {
          var newValue = input.val();
          if (newValue !== oldValue) {
            updateJsonObject(uuid, field, newValue);
            element.text(newValue);
          }
          input.remove();
          element.show();
        }
      });
    });

  });
}

function updateJsonObject(uuid, field, newValue) {
  var item = jsonData.find(function (item) {
    return item.uuid === uuid;
  });
  
  if (item) {
    item[field] = newValue;
  }
}

function updateJsonOrder(jsonData) {
  var orderedJsonData = [];
  
  $('.draggable').each(function () {
    var uuid = $(this).data('uuid');
    var item = jsonData.find(function (item) {
      return item.uuid === uuid;
    });
    
    if (item) {
      orderedJsonData.push(item);
    }
  });
  
  // Replace the original jsonData with the reordered version
  jsonData = orderedJsonData;
  console.log("update:", JSON.stringify(jsonData, null, 2));
}


function saveJson(jsonData, saveUrl) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open('POST', saveUrl, true);
  xmlhttp.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
  xmlhttp.send(JSON.stringify(jsonData,null,2));
}

