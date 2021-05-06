// @ts-check

/** @type {MutationObserver[]} */
const observers = [];

/** @type {Options} */
let options;

function filterItems() {
    const $items = /** @type {NodeListOf<HTMLElement>} */(document.querySelectorAll(".n_worklist_item, .search_result_img_box_inner, .n_worklist tr, .push_list > li"));
    for (const $item of $items) {
        const $makerName = $item.querySelector(".maker_name a");
        if ($makerName) {
            const makerName = $makerName.textContent;
            const work = options.works.find(work => work.makerNamesMap[makerName]);
            const border = work && work.modes.border ? `2px solid ${work.borderColor}` : "";
            if ($item.style.border !== border) $item.style.border = border;
            const background = work && work.modes.background ? work.backgroundColor : "";
            if ($item.style.background !== background) $item.style.background = background;
            const opacity = work && work.modes.opacity ? "0.4" : "";
            if ($item.style.opacity !== opacity) $item.style.opacity = opacity;
            if (work && work.modes.hide) {
                if ($item.style.display !== "none") {
                    $item.dataset.dlsiteMakerFilterDisplay = $item.style.display;
                    $item.style.display = "none";
                }
            } else if ($item.style.display === "none") {
                $item.style.display = $item.dataset.dlsiteMakerFilterDisplay;
            }
        }
    }
}

async function loadSettings() {
    options = await loadOptions();
    options.works.forEach(work => {
        work.makerNamesMap = {};
        for (const makerName of work.makerNames.split("\n").filter(Boolean)) work.makerNamesMap[makerName] = true;
    });
    options.tags.forEach(tag => {
        tag.tagsMap = {};
        for (const t of tag.tags.split("\n").filter(Boolean)) tag.tagsMap[t] = true;
    });
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
    const observer = new MutationObserver(filterItems);
    observer.observe(element, mutationObserverInit);
    observers.push(observer);

    const elements = /** @type {NodeListOf<HTMLDivElement>} */(document.querySelectorAll(".work_push"));
    for (const element of elements) {
        const observer = new MutationObserver(filterItems);
        observer.observe(element, mutationObserverInit);
        observers.push(observer);
    }

    filterItems();
}

main();
