<img src="https://img.shields.io/badge/Lifecycle-Proof%20of%20Concept-blueviolet">

# camunda-community-hub-probot

## The Camunda Community Hub Probot allows you to quickly add labels to issues by commenting and typing a slash command.

Usage: To add a label to an open issue, in the 'Leave a Comment' space enter the following:

```
/lm add label1, label2, label3
```
Once your comment is posted, after a few moments, the bot should apply the label you specified. To see the list of labels available to you in the Camunda Community Hub, please review our [steps for issue triage and labelling](https://github.com/camunda-community-hub/community/blob/main/issue-triage.md). For more information on extension lifecycles and how to implement them, please [read the doumentation](https://github.com/camunda-community-hub/community/blob/main/extension-lifecycle.md).

## Setup

```sh
# Install dependencies
npm install

# Run the bot
npm start
```

## Docker

```sh
# 1. Build container
docker build -t camunda-community-hub-probot .

# 2. Start container
docker run -e APP_ID=<app-id> -e PRIVATE_KEY=<pem-value> camunda-community-hub-probot
```

## Contributing

If you have suggestions for how camunda-community-hub-probot could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[ISC](LICENSE) © 2021 Rin (they/them) <celanthe@users.noreply.github.com>
> A GitHub App built with [Probot](https://github.com/probot/probot) 
