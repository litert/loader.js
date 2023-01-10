import sr from 'seedrandom';

const html = [];
let rng = sr('hello');
html.push(rng().toString());
html.push('<br>');
rng = sr();
html.push(rng().toString());

document.getElementById('result')!.innerHTML += '<br>' + html.join('');
