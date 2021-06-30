<img src="https://img.shields.io/badge/Lifecycle-Proof%20of%20Concept-blueviolet">

# Camunda Community Hub Probot

## The Camunda Community Hub Probot allows you to quickly add labels to issues by commenting and typing a slash command, allows for maintainers to opt-in to automated release note drafting, and automatically applies a <code>triage</code> label to open issues or pull requests without any labels specified. 

### Issue Labeling with Probot:

To add a label to an open issue or pull request, in the 'Leave a Comment' space enter the following:

```
/lm add label1, label2, label3
```

Once your comment is posted, after a few moments, the bot should apply the label you specified. To see the list of labels available to you in the Camunda Community Hub, please review our [steps for issue triage and labelling](https://github.com/camunda-community-hub/community/blob/main/issue-triage.md). For more information on extension lifecycles and how to implement them, please [read the documentation](https://github.com/camunda-community-hub/community/blob/main/extension-lifecycle.md).

### Issue Triage 

If you open an issue without a label, Probot will automatically assign the 'triage' label to your issue. Once an issue label is added, the triage label will be removed. If your issue has labels applied to it before submitting the issue, the 'triage' label will not be applied.

### Automated Release Notes Drafting

If you would like to opt-in to using [Release Drafter](https://github.com/release-drafter/release-drafter) to automate drafting of your extension's release notes, you can do so by doing the following:

1. [Set a topic](https://docs.github.com/en/github/administering-a-repository/managing-repository-settings/classifying-your-repository-with-topics) in your repository to <code>release-drafter</code>.
2. Add a label to an issue or PR that adheres to the Release Drafter specifications. These are <code>feature</code>, <code>fix</code>, and <code>chore</code>
3. Once one of the above labels is added, the corresponding GitHub Action will run. When successful, you can click on 'Details' in the workflow to see the checks complete, or to debug any issues that arise.

<img src="https://github.com/camunda-community-hub/camunda-community-hub-probot/blob/main/assets/Release%20Drafter%20Checks.png">

To learn more about Release Drafter, we suggest [reading the official documentation](https://github.com/release-drafter/release-drafter).

4. Currently, if a check fails, it must be re-run manually. We hope to automate this in the future.
5. If you have no labels on a PR and you choose to merge it, it will not be included in the automated release notes.

### Troubleshooting

If you are running into issues with Probot, please [Open an Issue](https://github.com/camunda-community-hub/camunda-community-hub-probot/issues). If you see a bug, or something that you would like to fix or contribute to, please [open a pull request](https://github.com/camunda-community-hub/camunda-community-hub-probot/pulls) after reviewing our [contribution guidelines](https://github.com/camunda-community-hub/camunda-community-hub-probot/blob/main/CONTRIBUTING.md).

If a label is incorrectly applied, you can remove it by typing <code>/lm remove</code> along with the [name of the label](https://github.com/camunda-community-hub/camunda-community-hub-probot/labels)

### Setup

```sh
# Install dependencies
npm install

# Run the bot
npm start
```

### Docker

```sh
# 1. Build container
docker build -t camunda-community-hub-probot .

# 2. Start container
docker run -e APP_ID=<app-id> -e PRIVATE_KEY=<pem-value> camunda-community-hub-probot
```

### Contributing

If you have suggestions for how camunda-community-hub-probot could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

### License

[ISC](LICENSE) © 2021 Rin (they/them) <celanthe@users.noreply.github.com> & [@jwulf](https://github.com/jwulf).

> A Legendary GitHub App built with [Probot](https://github.com/probot/probot) 
