// @ts-check

/** @type {MutationObserver[]} */
const observers = [];

/** @type {Options} */
let options;

/**
 * 
 * @param {ModeType} modeType 
 */
function genApplyStyles(modeType) {
    const borderProp = joinTagMode(modeType, "border");
    const borderColorProp = joinTagColorProperty(modeType, "borderColor");
    const backgroundProp = joinTagMode(modeType, "background");
    const backgroundColorProp = joinTagColorProperty(modeType, "backgroundColor");
    const opacityProp = joinTagMode(modeType, "opacity");
    const hideProp = joinTagMode(modeType, "hide");
    /**
     * 
     * @param {HTMLElement} $item 
     * @param {Work | Tag} [wt]
     */
    function applyStyles($item, wt) {
        const border = wt && wt.modes[borderProp] ? `2px solid ${wt[borderColorProp]}` : "";
        if ($item.style.border !== border) $item.style.border = border;
        const background = wt && wt.modes[backgroundProp] ? wt[backgroundColorProp] : "";
        if ($item.style.background !== background) $item.style.background = background;
        const opacity = wt && wt.modes[opacityProp] ? "0.4" : "";
        if ($item.style.opacity !== opacity) $item.style.opacity = opacity;
        if (wt && wt.modes[hideProp]) {
            if ($item.style.display !== "none") {
                $item.dataset.dlsiteMakerFilterDisplay = $item.style.display;
                $item.style.display = "none";
            }
        } else if ($item.style.display === "none") {
            $item.style.display = $item.dataset.dlsiteMakerFilterDisplay;
        }
    }
    return applyStyles;
}

function filterItems() {
    const $items = /** @type {NodeListOf<HTMLElement>} */(document.querySelectorAll(".n_worklist_item, .search_result_img_box_inner, .n_worklist tr, .push_list > li"));
    const applyStylesForWork = genApplyStyles("");
    const applyStylesForTag = genApplyStyles("");
    const applyStylesForTagWork = genApplyStyles("work");
    const applyStylesForTagNoWork = genApplyStyles("noWork");
    
    for (const $item of $items) {
        const $makerName = $item.querySelector(".maker_name a");
        const $searchTags = /** @type {NodeListOf<HTMLElement>} */($item.querySelectorAll(".search_tag a"));
        if ($makerName) {
            const makerName = $makerName.textContent;
            const work = options.works.find(work => work.makerNamesMap[makerName]);
            applyStylesForWork($item, work);
        }
        if ($searchTags) {
            const tagNames = [];
            for (const $searchTag of $searchTags) {
                const tagName = $searchTag.textContent.trim();
                tagNames.push(tagName);
                const tag = options.tags.find(tag => tag.tagsMap[tagName] && tag.modeTypes[""]);
                applyStylesForTag($searchTag, tag);
            }
            const noWorkTag = options.tags.find(tag => tag.modeTypes["noWork"] && tagNames.every(tagName => !tag.tagsMap[tagName]));
            applyStylesForTagNoWork($item, noWorkTag);
            const workTag = options.tags.find(tag => tag.modeTypes["work"] && tagNames.some(tagName => tag.tagsMap[tagName]));
            if (!noWorkTag || workTag) applyStylesForTagWork($item, workTag);
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
