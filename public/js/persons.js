window.onload = function () {
    let filterCheckboxes = document.querySelectorAll("input[type=checkbox]");
    for (let filterCheckbox of filterCheckboxes) {
        filterCheckbox.addEventListener("click", clickFilterCheckbox);
    }
    let categoryElt = document.getElementById("category");
    categoryElt.addEventListener("click", clickCategory);

    let buttonReset = document.getElementById("button-reset");
    buttonReset.addEventListener("click", clickButtonReset);
}

function clickFilterCheckbox() {
    let buttonFilter = document.getElementById("button-filter");
    buttonFilter.click();
}

function clickCategory() {
    let filterCheckboxes = document.getElementById("filterCheckboxes");
    if (filterCheckboxes.style.display == "block") {
        filterCheckboxes.style.display = "none";
    } else {
        filterCheckboxes.style.display = "block";
    }
}

function clickButtonReset() {
    let checkboxes = document.querySelectorAll("input[type='checkbox']");
    for (let checkbox of checkboxes) {
        checkbox.checked = false;
    }
}