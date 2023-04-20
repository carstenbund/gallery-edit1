
// Function to get the value of a query parameter in the URL
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
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


// Modify the loadImages function to use the actionUrl parameter if present
function loadImages() {
  const actionUrl = getQueryParam('actionUrl');
  const jsonFile = actionUrl || startUrl;

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

