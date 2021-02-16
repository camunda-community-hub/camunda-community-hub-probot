/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Probot} app
 */
const commands = require('probot-commands')

module.exports = (app) => {
  // Your code here
  const commands = require('probot-commands')

  module.exports = robot => {
    // Type `/label foo, bar` in a comment box for an Issue or Pull Request
    commands(robot, 'label', (context, command) => {
      const labels = command.arguments.split(/, */);
      return context.github.issues.addLabels(context.issue({labels}));
    });
  }
  app.log("Yay! The app was loaded!");
  app.webhooks.onAny(async (context) => {
    // context.log.info({ event: context.name, action: context.payload.action, context: context });
  });
  
  app.on("issues.opened", async context => {
    const params = context.issue({ body: "Hello World!" });
    return context.github.issues.createComment(params);
  });
  app.on("issue_comment.created", async context => { //gfg
    context.log.info( "hello world!" );
    commands(app, "lm", (context, command) => {
      const labelvals = command.arguments.split(/, */);
      // var labelipjson = JSON.stringify(labelvals);
      var label_len = labelvals.length;
      context.log('label_len ' + label_len);
      var labels = labelvals.slice(1, label_len);
      
      context.log(labels); //gfg

      if (labelvals[0] == "add") {
        // var labels = labelvals.slice(1, label_len);
        context.log(labels);
        return context.github.issues.addLabels(context.issue({ labels }));
      } 
      else if (labelvals[0] == "remove") {
      for (var i = 0; i < label_len; i++) {
        // context.log(labels);
        return context.github.issues.removeLabel(
          context.issue({ name: labels[i] })
        );
      }
      }else { //gfg
        var params = context.issue({
          body:
            "improper command. follow the syntax: /lm [add/remove] label1 label2 label3"
        });
        return context.github.issues.createcomment(params);
        }
      });
    });
  };
  class Command {
    constructor (name, callback) {
      this.name = name
      this.callback = callback
    }
  
    get matcher () {
      return /^\/([\w]+)\b *(.*)?$/m
    }
  
    listener (context) {
      const { comment, issue, pull_request: pr } = context.payload
  
      const command = (comment || issue || pr).body.match(this.matcher)
  
      if (command && this.name === command[1]) {
        return this.callback(context, { name: command[1], arguments: command[2] })
      }
    }
  }
  
  /**
   * Probot extension to abstract pattern for receiving slash commands in comments.
   *
   * @example
   *
   * // Type `/label foo, bar` in a comment box to add labels
   * commands(robot, 'label', (context, command) => {
   *   const labels = command.arguments.split(/, *\/);
   *   context.github.issues.addLabels(context.issue({labels}));
   * });
   */
  module.exports = (robot, name, callback) => {
    const command = new Command(name, callback)
    const events = ['issue_comment.created', 'issues.opened', 'pull_request.opened']
    robot.on(events, command.listener.bind(command))
  }
  
  module.exports.Command = Command
  
  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
