// GENERAL
// AOS.init();

window.onload = function () {
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
        const name = item.querySelector(".activity__name").textContent;
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
        collapse.collapse("hide");
        // delete all selected class
        var selected = document.querySelectorAll(".selected");
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
  var list = document.getElementById("drop-items");
  var item = document.createElement("div");
  item.className = "activity__entity row g-0 my-2";
  item.setAttribute("add", "");
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
  list.appendChild(item);
  update();

  setTimeout(() => {
    item.removeAttribute("add");
  }, 500);

  // get latest event and click show bs modal
  const editBtn = item.querySelector(".edit");
  editBtn.click();
}

// update id and time
function update() {
  var items = document.querySelectorAll(".activity__entity");
  var current = document.getElementById("start_duration").value;
  current = convertToMinuteFormat(current);
  var index = 0;
  items.forEach((item) => {
    // set the attribute
    item.setAttribute("data-index", index);
    var ended =
      parseInt(current) +
      parseInt(item.getElementsByClassName("activity__duration")[0].innerHTML);
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

    // update
    if (document.getElementsByClassName("activity__empty").length > 0) {
      document.getElementsByClassName("activity__empty")[0].remove();
    }
    index++;
  });
}

// delete an activity
function deleteActivity(id) {
  var item = document.querySelector(`[data-index="${id}"]`);
  item.setAttribute("delete", "");
  setTimeout(() => {
    item.remove();
    update();
    if (document.getElementById("drop-items").childElementCount == 0) {
      document.getElementById("drop-items").innerHTML =
        '<div class="activity__empty text-center text-secondary px-3 py-2 border border-secondary rounded-4" style="border-style: dashed !important;">No schedule created</div>';
      setTimeout(() => {document.querySelector(".activity__empty").style.opacity = 1;}, 100);
    }
  }, 200);
}

// add attribute class edit mode
// when there is class edit mode, then css selected not show
function openEdit(id) {
  // remove all selected class
  var selected = document.querySelectorAll(".selected");
  selected.forEach((item) => {
    item.classList.remove("selected");
  });

  // auto focus show input
  var input = document.querySelector("#collapse-" + id + " .edit-name");
  var len = input.value.length;
  input.focus();
  input.select();
}

// edit an activity
function editEvent(id) {
  // get the value
  const card = document
    .querySelector(`[data-index="${id}"]`)
    .querySelector(".activity__card");
  const name = card.querySelector(".edit-name").value;
  var duration = card.querySelector(".edit-duration").value;
  if (duration < 0) {
    card.querySelector(".edit-duration").value = 0;
    duration = 0;
  }

  // update the value
  const item = document.querySelector(`[data-index="${id}"]`);
  item.querySelector(".activity__name").textContent = name;
  item.querySelector(".activity__duration").textContent = duration + " minutes";

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
