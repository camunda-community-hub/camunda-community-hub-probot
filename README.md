<img src="https://img.shields.io/badge/Lifecycle-Proof%20of%20Concept-blue">

# camunda-community-hub-probot

## Add labels automatically (or manually) to issues with a bot

Usage:

```
/lm add label[, label1, ... ]
```

> A GitHub App built with [Probot](https://github.com/probot/probot) that allows users to add issue labels to Camunda Community Hub extensions.

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
