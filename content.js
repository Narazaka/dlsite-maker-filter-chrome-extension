// @ts-check

/** @type {MutationObserver[]} */
const observers = [];

/**
 * @typedef Setting
 * @property {"hide" | "opacity" | "gray"} mode
 * @property {{[name: string]: boolean}} ignoreMakerNamesMap
 */

/** @type {Setting} */
let setting;

function ignoreItems() {
    const $items = /** @type {NodeListOf<HTMLElement>} */(document.querySelectorAll(".n_worklist_item, .search_result_img_box_inner, .n_worklist tr, .push_list > li"));
    for (const $item of $items) {
        const $makerName = $item.querySelector(".maker_name a");
        const makerName = $makerName.textContent;
        if (setting.mode === "hide") {
            if (setting.ignoreMakerNamesMap[makerName] !== ($item.style.display === "none")) {
                if (setting.ignoreMakerNamesMap[makerName]) {
                    $item.dataset.dlsiteMakerFilterDisplay = $item.style.display;
                    $item.style.display = "none";
                } else if ($item.style.display === "none") {
                    $item.style.display = $item.dataset.dlsiteMakerFilterDisplay;
                }
            }
        } else if (setting.mode === "opacity") {
            if (setting.ignoreMakerNamesMap[makerName] !== ($item.style.opacity === "0.4")) {
                $item.style.opacity = setting.ignoreMakerNamesMap[makerName] ? "0.4" : "";
            }
        } else {
            if (setting.ignoreMakerNamesMap[makerName] !== ($item.style.background === "#bbb")) {
                $item.style.background = setting.ignoreMakerNamesMap[makerName] ? "#bbb" : "";
            }
        }
    }
}

async function loadSettings() {
    const settingSrc = await new Promise((resolve) => {
        chrome.storage.local.get({
            mode: "gray",
            ignoreMakerNames: "",
        }, (items) => {
            resolve(items);
        });
    });

    /** @type {{[name: string]: boolean}} */
    const ignoreMakerNamesMap = {};
    for (const ignoreName of settingSrc.ignoreMakerNames.split("\n").filter(Boolean)) ignoreMakerNamesMap[ignoreName] = true;

    setting = {
        mode: settingSrc.mode,
        ignoreMakerNamesMap,
    };
}

/**
 *
 * @param {number} ms
 */
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/** @type {MutationObserverInit} */
const mutationObserverInit = {
    childList: true,
    subtree: true,
};

async function main() {
    await loadSettings();

    /** @type {HTMLDivElement} */
    let element;
    let index = 0;
    while (index < 60) {
        await wait(1000);
        element = /** @type {HTMLDivElement} */(document.querySelector("#new_worklist, #search_result_list, #__workbox, #ana_work_wrapper"));
        if (element) break;
        index++;
    }
    if (!element) return; // elementが1分経っても見つからなければexit
    const observer = new MutationObserver(ignoreItems);
    observer.observe(element, mutationObserverInit);
    observers.push(observer);

    const elements = /** @type {NodeListOf<HTMLDivElement>} */(document.querySelectorAll(".work_push"));
    for (const element of elements) {
        const observer = new MutationObserver(ignoreItems);
        observer.observe(element, mutationObserverInit);
        observers.push(observer);
    }

    ignoreItems();
}

main();
