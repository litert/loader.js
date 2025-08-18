export function onClick(id: string, callback: () => void | Promise<void>): void {
    document.getElementById(id)?.addEventListener('click', () => {
        (async () => {
            await callback();
        })().catch(e => {
            console.error('[TEST][TOOL]', e);
        });
    });
}

const outputElement = document.getElementById('output');
export function output(msg: string): void {
    outputElement?.insertAdjacentHTML('afterbegin', `<div>${msg}</div>`);
}
