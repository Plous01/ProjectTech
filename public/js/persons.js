window.onload = function() {
    let filterCheckboxes = document.querySelectorAll("input[type=checkbox]");
        for(let filterCheckbox of filterCheckboxes) {
        filterCheckbox.addEventListener("click",clickFilterCheckbox);
    }
}

function clickFilterCheckbox() {
    let buttonFilter = document.getElementById("button-filter");
    buttonFilter.click();
}