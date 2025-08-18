export function onClick(id, callback) {
    var _a;
    (_a = document.getElementById(id)) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => {
        (async () => {
            await callback();
        })().catch(e => {
            console.error('[TEST][TOOL]', e);
        });
    });
}
const outputElement = document.getElementById('output');
export function output(msg) {
    outputElement === null || outputElement === void 0 ? void 0 : outputElement.insertAdjacentHTML('afterbegin', `<div>${msg}</div>`);
}
