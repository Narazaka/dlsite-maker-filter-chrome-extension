// @ts-check

/**
 * @typedef {"" | "work" | "noWork"} ModeType
 */

/**
 * @typedef  {"border" | "background" | "opacity" | "hide"} Mode
 */

/** @type {Mode[]} */
const modes = ["border", "background", "opacity", "hide"];

/**
 * @typedef  {`work_${Mode}`} TagWorkMode
 */

const tagWorkModes = /** @type {TagWorkMode[]} */(modes.map(mode => `work_${mode}`));

/**
 * @typedef  {`noWork_${Mode}`} TagNoWorkMode
 */

const tagNoWorkModes = /** @type {TagNoWorkMode[]} */(modes.map(mode => `noWork_${mode}`));

/**
 * @typedef  {Mode | TagWorkMode | TagNoWorkMode} TagMode
 */

/** @type {TagMode[]} */
const tagModes = [...modes, ...tagWorkModes, ...tagNoWorkModes];

/**
 * 
 * @param {TagMode} tagMode 
 */
function separateTagMode(tagMode) {
    return /** @type {[ModeType, Mode]} */(tagMode.includes("_") ? tagMode.split("_") : ["", tagMode]);
}

/**
 * 
 * @param {ModeType} modeType 
 * @param {Mode} mode 
 */
function joinTagMode(modeType, mode) {
    return /** @type {TagMode} */(modeType ? `${modeType}_${mode}` : mode);
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
    return /** @type {[ModeType, ColorProperty]} */(tagColorProperty.includes("_") ? tagColorProperty.split("_") : ["", tagColorProperty]);
}

/**
 * 
 * @param {ModeType} modeType 
 * @param {ColorProperty} colorProperty 
 */
function joinTagColorProperty(modeType, colorProperty) {
    return /** @type {TagColorProperty} */(modeType ? `${modeType}_${colorProperty}` : colorProperty);
}

/**
 * @typedef {{modes: {[M in Mode]?: boolean}; makerNames: string; makerNamesMap?: {[name: string]: boolean}} & {[K in ColorProperty]: string}} Work
 */

/**
 * @typedef {{modes: {[M in TagMode]?: boolean}; tags: string; tagsMap?: {[name: string]: boolean}; modeTypes?: {[M in ModeType]: boolean}} & {[K in TagColorProperty]: string}} Tag
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
                            borderColor: "#bbbbbb",
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
