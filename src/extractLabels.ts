export function extractLabels(commandline: string) {
  const split = commandline.split(" ");
  const cmd = split.shift();
  const labels = split.flatMap((l) =>
    l.split(",").filter((e) => ![",", ""].includes(e))
  );
  return { labels, cmd };
}

function test() {
  const testCases = [
    { input: "add bug", output: "bug" },
    { input: "add bug,easy", output: "bug easy" },
    { input: "add bug,  easy", output: "bug easy" },
    { input: "add bug , easy", output: "bug easy" },
    { input: "add bug, easy,whatever", output: "bug easy whatever" },
  ];

  testCases.forEach((t, i) =>
    console.log(
      `Test case ${i} passes:`,
      extractLabels(t.input).labels.join(" ") === t.output
    )
  );
}

// To test: Uncomment line below and run `node extractLabels.js`
// test()
