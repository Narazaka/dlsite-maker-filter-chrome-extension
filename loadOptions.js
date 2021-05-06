// @ts-check

/**
 * @typedef  {"border" | "background" | "opacity" | "hide"} Mode
 */

/** @type {Mode[]} */
const modes = ["border", "background", "opacity", "hide"];

/**
 * @typedef  {`${"" | "work_" | "noWork_"}${Mode}`} TagMode
 */

const tagModes = /** @type {TagMode[]} */(modes).concat(["work_border", "work_background", "work_opacity", "work_hide", "noWork_border", "noWork_background", "noWork_opacity", "noWork_hide"]);

/**
 * 
 * @param {TagMode} tagMode 
 */
function separateTagMode(tagMode) {
    return /** @type {["" | "work" | "noWork", Mode]} */(tagMode.includes("_") ? tagMode.split("_") : ["", tagMode]);
}

/** @typedef {"borderColor" | "backgroundColor"} ColorProperty */
/** @type {ColorProperty[]} */
const colorProperties = ["borderColor", "backgroundColor"];

/** @typedef {`${"" | "work_" | "noWork_"}${ColorProperty}`} TagColorProperty */
/** @type {TagColorProperty[]} */
const tagColorProperties = ["borderColor", "backgroundColor", "work_borderColor", "work_backgroundColor", "noWork_borderColor", "noWork_backgroundColor"];

/**
 * 
 * @param {TagColorProperty} tagColorProperty 
 */
 function separateTagColorProperty(tagColorProperty) {
    return /** @type {["" | "work" | "noWork", ColorProperty]} */(tagColorProperty.includes("_") ? tagColorProperty.split("_") : ["", tagColorProperty]);
}

/**
 * @typedef {{modes: {[M in Mode]?: boolean}; makerNames: string; makerNamesMap?: {[name: string]: boolean}} & {[K in ColorProperty]: string}} Work
 */

/**
 * @typedef {{modes: {[M in TagMode]?: boolean}; tags: string; tagsMap?: {[name: string]: boolean}} & {[K in TagColorProperty]: string}} Tag
 */

/**
 * @typedef Options
 * @property {Work[]} works
 * @property {Tag[]} tags
 */

/**
 * @typedef RawOptions
 * @property {string} options
 * @property {"gray" | "opacity" | "hide" | undefined} mode
 * @property {string | undefined} ignoreMakerNames
 */

/**
 * 
 * @returns {Promise<Options>}
 */
async function loadOptions() {
    return new Promise((resolve) => {
        chrome.storage.local.get({
            // mode: "gray",
            // ignoreMakerNames: "aaa",
            options: '{"works":[],"tags":[]}',
        }, 
        (rawOptionsArg) => {
            const rawOptions = /** @type {RawOptions} */(rawOptionsArg);
            let options = /** @type {Options} */(JSON.parse(rawOptions.options || '{"works":[],"tags":[]}'));
            if (rawOptions.ignoreMakerNames) {
                // legacy
                options = {
                    works: [
                        {
                            makerNames: rawOptions.ignoreMakerNames,
                            modes: rawOptions.mode === "gray" ? {background: true} : {[rawOptions.mode]: true},
                            borderColor: "",
                            backgroundColor: "#bbbbbb",
                        },
                    ],
                    tags: [],
                };
                // console.log(items);
                // const $mode = /** @type {HTMLInputElement} */(document.querySelector(`[name="mode"][value="${items.mode}"]`));
                // console.log($mode);
                // $mode.checked = true;
                // const $ignoreMakerNames = /** @type {HTMLTextAreaElement} */(document.querySelector("#ignoreMakerNames"));
                // $ignoreMakerNames.value = items.ignoreMakerNames;
                // return;
            }
            if (!options.works) options.works = [];
            if (!options.tags) options.tags = [];
            resolve(options);
        });
    });
}
