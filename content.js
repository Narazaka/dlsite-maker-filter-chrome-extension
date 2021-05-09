// @ts-check

/** @type {MutationObserver[]} */
const observers = [];

/** @type {Options} */
let options;

/**
 * 
 * @param {HTMLElement} $item 
 * @param {[ModeType, Work | Tag][]} wts
 */
function applyStyles($item, wts) {
    let border = "";
    for (const [modeType, wt] of wts) {
        const borderProp = joinTagMode(modeType, "border");
        if (wt && wt.modes[borderProp]) {
            const borderColorProp = joinTagColorProperty(modeType, "borderColor");
            border = `2px solid ${wt[borderColorProp]}`;
            break;
        }
    }
    if ($item.style.border !== border) $item.style.border = border;

    let background = "";
    for (const [modeType, wt] of wts) {
        const backgroundProp = joinTagMode(modeType, "background");
        if (wt && wt.modes[backgroundProp]) {
            const backgroundColorProp = joinTagColorProperty(modeType, "backgroundColor");
            background = wt[backgroundColorProp];
            break;
        }
    }
    if ($item.style.background !== background) $item.style.background = background;

    let opacity;
    for (const [modeType, wt] of wts) {
        const opacityProp = joinTagMode(modeType, "opacity");
        if (wt && wt.modes[opacityProp]) {
            opacity = "0.4";
            break;
        }
    }
    if ($item.style.opacity !== opacity) $item.style.opacity = opacity;

    let displayNone;
    for (const [modeType, wt] of wts) {
        const hideProp = joinTagMode(modeType, "hide");
        if (wt && wt.modes[hideProp]) {
            displayNone = true;
            break;
        }
    }
    if (displayNone) {
        if ($item.style.display !== "none") {
            $item.dataset.dlsiteMakerFilterDisplay = $item.style.display;
            $item.style.display = "none";
        }
    } else if ($item.style.display === "none") {
        $item.style.display = $item.dataset.dlsiteMakerFilterDisplay;
    }
}

function filterItems() {
    const $items = /** @type {NodeListOf<HTMLElement>} */(document.querySelectorAll(".n_worklist_item, .search_result_img_box_inner, .n_worklist tr, .push_list > li"));

    for (const $item of $items) {
        const $makerName = $item.querySelector(".maker_name a");
        const $searchTags = /** @type {NodeListOf<HTMLElement>} */($item.querySelectorAll(".search_tag a"));
        let work;
        let noWorkTag;
        let workTag;
        if ($makerName) {
            const makerName = $makerName.textContent;
            work = options.works.find(work => work.makerNamesMap[makerName]);
        }
        if ($searchTags) {
            const tagNames = [];
            for (const $searchTag of $searchTags) {
                const tagName = $searchTag.textContent.trim();
                tagNames.push(tagName);
                const tag = options.tags.find(tag => tag.tagsMap[tagName] && tag.modeTypes[""]);
                applyStyles($searchTag, [["", tag]]);
            }
            noWorkTag = options.tags.find(tag => tag.modeTypes["noWork"] && tagNames.every(tagName => !tag.tagsMap[tagName]));
            workTag = options.tags.find(tag => tag.modeTypes["work"] && tagNames.some(tagName => tag.tagsMap[tagName]));
        }
        applyStyles($item, [["", work], ["work", workTag], ["noWork", noWorkTag]]);
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
        tag.modeTypes = {
            "": modes.some(mode => tag.modes[mode]),
            "work": tagWorkModes.some(mode => tag.modes[mode]),
            "noWork": tagNoWorkModes.some(mode => tag.modes[mode]),
        };
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
