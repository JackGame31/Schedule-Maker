// GENERAL
window.onload = function () {
  updateActiveActivity();
  // Call the updateActiveActivity function periodically (e.g., every minute)
  setInterval(updateActiveActivity, 1000); // Update every minute

  // update index id of items to the latest
  update();

  // for modal
  const summaryModal = document.getElementById("summaryModal");
  if (summaryModal) {
    summaryModal.addEventListener("show.bs.modal", (event) => {
      // Update the modal's content
      const text = summaryModal.querySelector("#summary_text");
      text.value = "";

      // get current date
      const today = new Date();
      const date =
        today.getDate() +
        "-" +
        (today.getMonth() + 1) +
        "-" +
        today.getFullYear();
      text.value += `== Schedule ${date} ==`;

      // get all items, start and end time
      const items = document.querySelectorAll(".activity__entity");
      items.forEach((item) => {
        const name = item.dataset.name;
        const time = item.querySelector(".activity__time").textContent;
        text.value += `\n${time} ${name}`;
      });
    });
  }

  // for notification floating
  const toastTrigger = document.getElementById("toastClipboardBtn");
  const toastLiveExample = document.getElementById("toastClipboard");

  if (toastTrigger) {
    const toastBootstrap =
      bootstrap.Toast.getOrCreateInstance(toastLiveExample);
    toastTrigger.addEventListener("click", () => {
      toastBootstrap.show();
    });
  }

  // for dissmiss edit mode
  window.addEventListener("click", function (e) {
    var collapse = $(".show");

    // if click outside collapse
    if (!collapse.is(e.target) && collapse.has(e.target).length === 0) {
      // dismiss all collapse
      if (collapse.length > 0) {
        // hide collapse and delete all selected class
        collapse.collapse("hide");
        var selected = document.querySelectorAll(".selected");
        selected.forEach((item) => {
          item.classList.remove("selected");
        });
      }
    }
  });
};

// DRAG AND DROP
const dropItems = document.getElementById("drop-items");
new Sortable.create(dropItems, {
  // for animation
  animation: 350,
  ghostClass: "sortable-ghost", // Class name for the drop placeholder
  chosenClass: "sortable-chosen", // Class name for the chosen item
  dragClass: "sortable-drag", // Class name for the dragging item

  // for multi drag
  selectedClass: "selected",
  multiDrag: true,
  fallbackTolerance: 3,
  handle: ".handle",
  delay: 100,

  // if data changed
  onEnd: function (evt) {
    update();
  },
});

// OTHERS
function addEvent() {
  // get list of items
  var list = document.getElementById("drop-items");

  // create entity
  var item = document.createElement("div");
  item.className = "activity__entity row g-0 my-2";
  item.setAttribute("data-duration", "60");
  item.setAttribute("data-name", "New Task");
  item.innerHTML = `
    <div class="activity__time col-3 p-2">
      05:00 - 06:00
    </div>

    <div class="activity__card col-9 shadow border rounded-4">
      <div class="handle row px-3 py-2">
        <div class="col-8 d-flex flex-column d-flex justify-content-center">
          <span class="activity__name">New Task</span>
          <span class="activity__duration text-secondary">60 minutes</span>
        </div>

        <div class="col-4 d-flex align-items-center justify-content-end">
          <button class="btn btn-warning mx-1 rounded-5 edit" data-bs-toggle="collapse"
            data-bs-target="#collapse-0" onclick="openEdit(0)"><i class='bx bx-pencil'></i></button>
          <button class="btn btn-danger mx-1 rounded-5 delete"><i class='bx bx-trash'></i></button>
        </div>  
      </div>

      <div class="collapse border-top" id="collapse-0">
        <!-- name -->
        <div class="px-3 pt-2">
          <label class="col-form-label pt-0">Activity Name</label>
          <input type="text" class="form-control edit-name rounded-5" value="New Task" onchange="editEvent(0)">
        </div>

        <!-- duration -->
        <div class="px-3 pb-3">
          <label class="col-form-label">Duration (minutes)</label>
          <input type="number" class="form-control edit-duration rounded-5" value="60" min="0" onchange="editEvent(0)"/>
        </div>
      </div>
    </div>
  `;

  // append and update data
  list.appendChild(item);
  update();

  // give add animation
  item.setAttribute("add", "");
  setTimeout(() => {
    item.removeAttribute("add");
  }, 500);

  // immediately open edit mode
  const editBtn = item.querySelector(".edit");
  editBtn.click();
}

// update id and time
function update() {
  // get current time
  var current = document.getElementById("start_duration").value;
  current = parseInt(convertToMinuteFormat(current));

  // get all entitiy and check all
  var items = document.querySelectorAll(".activity__entity");
  var index = 0;
  items.forEach((item) => {
    // update the time
    item.setAttribute("data-index", index);
    item.setAttribute("data-start", current);
    var ended = current + parseInt(item.dataset.duration);
    item.querySelector(".activity__time").textContent =
      convertToTimeFormat(current) + " - " + convertToTimeFormat(ended);
    current = ended;

    // edit and delete button
    var deleteBtn = item.querySelector(".delete");
    var editBtn = item.querySelector(".edit");
    deleteBtn.setAttribute("onclick", "deleteActivity(" + index + ")");
    editBtn.setAttribute("data-bs-target", "#collapse-" + index);
    editBtn.setAttribute("onclick", "openEdit(" + index + ")");

    // change all attributes that connected with id
    var collapse = item.querySelector(".collapse");
    collapse.setAttribute("id", "collapse-" + index);

    // input update
    var name = item.querySelector(".edit-name");
    var duration = item.querySelector(".edit-duration");
    name.setAttribute("onchange", "editEvent(" + index + ")");
    duration.setAttribute("onchange", "editEvent(" + index + ")");

    // remove placeholder if exist
    if (document.getElementsByClassName("activity__empty").length > 0) {
      document.getElementsByClassName("activity__empty")[0].remove();
    }

    // update to the next index
    index++;
  });
}

// delete an activity
function deleteActivity(id) {
  // get the item
  var item = document.querySelector(`[data-index="${id}"]`);

  // create animation
  item.setAttribute("delete", "");
  setTimeout(() => {
    // remove when animation finished
    item.remove();
    update();

    // if there is no item, then create placeholder
    if (document.getElementById("drop-items").childElementCount == 0) {
      document.getElementById("drop-items").innerHTML =
        '<div class="activity__empty text-center text-secondary px-3 py-2 border border-secondary rounded-4" style="border-style: dashed !important;">No schedule created</div>';
    }
  }, 200);
}

// function to open edit mode of selected activity
function openEdit(id) {
  // remove all selected class for sortable list
  var selected = document.querySelectorAll(".selected");
  selected.forEach((item) => {
    item.classList.remove("selected");
  });

  // auto focus show input
  var inputName = document.querySelector("#collapse-" + id + " .edit-name");
  inputName.focus();
  inputName.select();

  // add event listener enter button clicked
  inputName.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      // change to next input
      inputDuration = $(inputName).closest(".collapse").find("input")[1];
      inputDuration.focus();
      inputDuration.select();

      // when the last input is finished by clicking enter
      inputDuration.addEventListener("keypress", function (e) {
        // close all show collapse
        var collapse = $(".show").collapse("hide");
      });
    }
  });
}

// edit an activity
function editEvent(id) {
  // get the value
  var entity = document.querySelector(`[data-index="${id}"]`);
  var name = entity.querySelector(".edit-name").value;
  var duration = entity.getElementsByClassName("edit-duration")[0].value;
  if (duration < 0) {
    duration = 0;
  }

  // update the value
  entity.setAttribute("data-name", name);
  entity.querySelector(".activity__name").textContent = name;
  entity.setAttribute("data-duration", duration);
  entity.querySelector(".activity__duration").textContent = duration + " minutes";

  update();
}

// convert to time format (from minutes)
function convertToTimeFormat(inputTime) {
  // Extract the numeric value from the input string
  const numericValue = parseInt(inputTime, 10);

  // find minutes and hours
  const minutes = numericValue % 60;
  const hours = (numericValue - minutes) / 60;

  // format string with format hh:mm
  const timeOnly = `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;

  return timeOnly;
}

// convert to minute format (from time)
function convertToMinuteFormat(inputTime) {
  // Extract the numeric value from the input string
  if (inputTime == "") {
    return 0;
  }
  const time = inputTime.split(":");
  const hours = parseInt(time[0], 10);
  const minutes = parseInt(time[1], 10);

  // convert to minutes
  const minutesOnly = hours * 60 + minutes;

  return minutesOnly;
}

// for copy clipboard
function copyClipboard() {
  const text = document.getElementById("summary_text");
  text.select();
  text.setSelectionRange(0, 99999);
  document.execCommand("copy");
}

// function for check current active activity every second
function updateActiveActivity() {
  // get current time
  const currentTime = new Date();
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

  // get all activities
  const activities = document.querySelectorAll(".activity__entity");
  var activeExist = false;

  // check all activities to find the active one
  activities.forEach((item) => {
    // get current activity start and end
    var activityStart = parseInt(item.dataset.start);
    var activityEnd = activityStart + parseInt(item.dataset.duration);

    if (currentMinutes >= activityStart && currentMinutes < activityEnd) {
      // set attribute active
      item.querySelector(".activity__card").classList.add("active");
      document.querySelector(".active__container").classList.add("active");

      // The current activity is active
      const remainingTime = activityEnd - currentMinutes;
      const remainingHour = Math.floor(remainingTime / 60);
      const remainingMinute = remainingTime % 60;
      const activeActivity = item.dataset.name;

      // Update the display with active activity and remaining time
      document.getElementById("activeActivity").innerText = activeActivity;
      var remainingText = "";

      // format remaining text time
      // if hour and minute exist
      if (remainingHour > 0) {
        remainingText = remainingText + remainingHour + " hour";
        if (remainingHour > 1) {
          remainingText = remainingText + "s";
        }

        // if minute exist
        if (remainingMinute % 60 > 0) {
          remainingText = remainingText + " " + remainingMinute + " minute";
          if (remainingMinute > 1) {
            remainingText = remainingText + "s";
          }
        }
      } else {
        // if hour not exist and minute exist
        if (remainingMinute % 60 > 1) {
          remainingText = remainingText + " " + remainingMinute + " minute";
          if (remainingMinute > 1) {
            remainingText = remainingText + "s";
          }
        } else {
          // if it's less than a minute
          const remainingSecond = currentTime.getSeconds();
          remainingText =
            remainingText + " " + (60 - remainingSecond) + " second";
          if (remainingSecond > 1) {
            remainingText = remainingText + "s";
          }
        }
      }

      // set the remaining text
      var remainingText = remainingText + " remaining";
      document.querySelector("#remainingTime").innerHTML = remainingText;

      // flag active exist
      activeExist = true;
    } else {
      item.querySelector(".activity__card").classList.remove("active");
    }
  });

  // if not active exist
  if (!activeExist) {
    // reset remaining text
    document.querySelector(".active__container").classList.remove("active");
    document.getElementById("activeActivity").innerText = "Current Active : ";
    document.getElementById("remainingTime").innerHTML =
      "No activity in this time yet...";
  }
}
