
const testCases = [
    { input: 'add bug', output: 'bug'},
    { input: 'add bug,easy',output: 'bug easy'},
    { input: 'add bug,  easy',output: 'bug easy'},
    { input: 'add bug , easy',output: 'bug easy'},
    { input: 'add bug, easy,whatever', output: 'bug easy whatever'}
]

function extractLabels(commandline) {
    const split = commandline.split(" ")
    const command = split.slice(0,1)
    const labels = split.slice(1).flatmap(l => l.split(',').filter(e => !([',', ''].includes(e))))
    console.log({command, labels})
    return labels.join(' ')
}

const e = extractLabels

testCases.forEach(t => console.log(e(t.input) === t.output))