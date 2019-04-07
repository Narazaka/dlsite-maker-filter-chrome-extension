// @ts-check

document.addEventListener("DOMContentLoaded", function () {
    const $save = document.querySelector("#save");
    $save.addEventListener("click", saveOptions);
    restoreOptions();
});

function saveOptions() {
    const $mode = /** @type {HTMLInputElement} */(document.querySelector('[name="mode"]:checked'));
    const $ignoreMakerNames = /** @type {HTMLTextAreaElement} */(document.querySelector("#ignoreMakerNames"));
    const setting = {
        mode: $mode.value,
        ignoreMakerNames: $ignoreMakerNames.value,
    };
    chrome.storage.local.set(setting, () => alert("保存しました"));
}

function restoreOptions() {
    chrome.storage.local.get({
        mode: "gray",
        ignoreMakerNames: "",
    }, (items) => {
        console.log(items);
        const $mode = /** @type {HTMLInputElement} */(document.querySelector(`[name="mode"][value="${items.mode}"]`));
        console.log($mode);
        $mode.checked = true;
        const $ignoreMakerNames = /** @type {HTMLTextAreaElement} */(document.querySelector("#ignoreMakerNames"));
        $ignoreMakerNames.value = items.ignoreMakerNames;
    });
}
