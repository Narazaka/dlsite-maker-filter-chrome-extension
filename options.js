// @ts-check

document.addEventListener("DOMContentLoaded", function () {
    let workSlot = getWorkSlot();
    let tagSlot = getTagSlot();

    const $save = document.querySelector("#save");
    $save.addEventListener("click", () => saveSlotOptions(workSlot, tagSlot));
    /** @type {NodeListOf<HTMLInputElement>} */(document.querySelectorAll(`[name="work_slot"]`)).forEach($slot => $slot.addEventListener("click", async () => {
        await saveSlotOptions(workSlot, tagSlot);
        workSlot = getWorkSlot();
        await restoreOptions();
    }));
    /** @type {NodeListOf<HTMLInputElement>} */(document.querySelectorAll(`[name="tag_slot"]`)).forEach($slot => $slot.addEventListener("click", async () => {
        await saveSlotOptions(workSlot, tagSlot);
        tagSlot = getTagSlot();
        await restoreOptions();
    }));

    function selectTab() {
        const tab = /** @type {HTMLInputElement} */(document.querySelector(`[name="tab"]:checked`)).value;
        (/** @type {NodeListOf<HTMLDivElement>} */(document.querySelectorAll(".tab"))).forEach(
            $tab => $tab.style.display = $tab.id === `tab_${tab}` ? "block" : "none"
        );
    }
    const $tabs = /** @type {NodeListOf<HTMLInputElement>} */(document.querySelectorAll(`[name="tab"]`));
    $tabs.forEach($tab => $tab.addEventListener("click", selectTab));
    selectTab();

    restoreOptions();
});

function getWorkSlot() {
    return Number(/** @type {HTMLInputElement} */(document.querySelector(`[name="work_slot"]:checked`)).value);
}

function getTagSlot() {
    return Number(/** @type {HTMLInputElement} */(document.querySelector(`[name="tag_slot"]:checked`)).value);
}

/**
 * 
 * @param {number} workSlot 
 * @param {number} tagSlot 
 */
async function saveSlotOptions(workSlot, tagSlot) {
    const options = await loadOptions();

    if (!options.works[workSlot]) {
        options.works[workSlot] = /** @type {Work} */({modes: {}, makerNames: ""});
    }
    const work = options.works[workSlot];
    const $work_modes = /** @type {NodeListOf<HTMLInputElement>} */(document.querySelectorAll(`[name="work_mode"]`));
    work.modes = Array.from($work_modes).filter($mode => $mode.checked).reduce((modes, $mode) => ({...modes, [/** @type {Mode} */($mode.value.slice(5))]: true }), {});
    const $makerNames = /** @type {HTMLTextAreaElement} */(document.querySelector(`#makerNames`));
    work.makerNames = $makerNames.value;
    colorProperties.forEach(prop => work[prop] = /** @type {HTMLInputElement} */(document.querySelector(`[name="work_${prop}"]`)).value);

    if (!options.tags[tagSlot]) {
        options.tags[tagSlot] = /** @type {Tag} */({modes: {}, tags: ""});
    }
    const tag = options.tags[tagSlot];
    const $tag_modes = /** @type {NodeListOf<HTMLInputElement>} */(document.querySelectorAll(`[name="tag_mode"]`));
    tag.modes = Array.from($tag_modes).filter($mode => $mode.checked).reduce((modes, $mode) => ({...modes, [/** @type {TagMode} */($mode.value.slice(4))]: true}), {});
    const $tags = /** @type {HTMLTextAreaElement} */(document.querySelector(`#tags`));
    tag.tags = $tags.value;
    tagColorProperties.forEach(prop => tag[prop] = /** @type {HTMLInputElement} */(document.querySelector(`[name="tag_${prop}"]`)).value);

    /** @type {RawOptions} */
    const rawOptions = {
        options: JSON.stringify(options),
        mode: undefined,
        ignoreMakerNames: undefined,
    };

    return new Promise((resolve) => {
        chrome.storage.local.set(rawOptions, () => {
            document.querySelector("#notification").textContent = "保存しました";
            setTimeout(() => {
                document.querySelector("#notification").textContent = "";
            }, 1500);
            resolve();
        });
    })
}

async function restoreOptions() {
    const options = await loadOptions();

    const workSlot = Number(/** @type {HTMLInputElement} */(document.querySelector(`[name="work_slot"]:checked`)).value);
    const work = options.works[workSlot] || {modes: {}, makerNames: ""};
    const $work_modes = /** @type {NodeListOf<HTMLInputElement>} */(document.querySelectorAll(`[name="work_mode"]`));
    $work_modes.forEach($mode => $mode.checked = work.modes[/** @type {Mode} */($mode.value.slice(5))]);
    const $makerNames = /** @type {HTMLTextAreaElement} */(document.querySelector(`#makerNames`));
    $makerNames.value = work.makerNames;
    colorProperties.forEach(prop => /** @type {HTMLInputElement} */(document.querySelector(`[name="work_${prop}"]`)).value = work[prop] || "#bbbbbb");

    const tagSlot = Number(/** @type {HTMLInputElement} */(document.querySelector(`[name="tag_slot"]:checked`)).value);
    const tag = options.tags[tagSlot] || {modes: {}, tags: ""};
    const $tag_modes = /** @type {NodeListOf<HTMLInputElement>} */(document.querySelectorAll(`[name="tag_mode"]`));
    $tag_modes.forEach($mode => $mode.checked = tag.modes[/** @type {TagMode} */($mode.value.slice(4))]);
    const $tags = /** @type {HTMLTextAreaElement} */(document.querySelector(`#tags`));
    $tags.value = tag.tags;
    tagColorProperties.forEach(prop => /** @type {HTMLInputElement} */(document.querySelector(`[name="tag_${prop}"]`)).value = tag[prop] || "#bbbbbb");
}
