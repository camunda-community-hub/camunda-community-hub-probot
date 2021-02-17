/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Probot} app
 */
const commands = require('probot-commands')
const extractLabels = require('./extractLabels')

module.exports = (app) => {

  app.log("Yay! The app was loaded!");
  app.webhooks.onAny(async (context) => {
    // context.log.info({ event: context.name, action: context.payload.action, context: context });
  });

  app.on("issues.opened", async context => {
    const params = context.issue({ body: "Hello World!" });
    return context.github.issues.createComment(params);
  });
  app.on("issue_comment.created", async context => { //gfg
    context.log.info("Issue comment created callback");

  });
  /** lm command processor */
  commands(app, "lm", (context, command) => {
    const { labels, cmd } = extractLabels(command.arguments);
    if (labels.length === 0) {
      context.log('No labels specified. Received:', command.arguments)
      return
    }

    if (cmd == "add") {
      context.log('Adding labels:', labels);
      return context.github.issues.addLabels(context.issue({ labels }));
    }
    else if (cmd == "remove") {
      const removeLabel = name => context.github.issues.removeLabel(context.issue({ name }))
      labels.forEach(removeLabel)
    } else { //gfg
      var params = context.issue({
        body:
          "Improper command. Follow the syntax: /lm [add/remove] label1 label2 label3"
      });
      return context.github.issues.createcomment(params);
    }
  });
};


  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
