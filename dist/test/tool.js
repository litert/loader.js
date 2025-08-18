export function onClick(id, callback) {
    document.getElementById(id)?.addEventListener('click', () => {
        (async () => {
            await callback();
        })().catch(e => {
            console.error('[TEST][TOOL]', e);
        });
    });
}
const outputElement = document.getElementById('output');
export function output(msg) {
    outputElement?.insertAdjacentHTML('afterbegin', `<div>${msg}</div>`);
}
