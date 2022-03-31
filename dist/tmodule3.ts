console.log('Run tmodule3.');

let a = 1;

a += Math.floor(Math.random() * 10);

export function getNum(): number {
    return a;
}
