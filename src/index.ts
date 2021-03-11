import { Probot } from "probot";
import commands from "probot-commands";
import { extractLabels } from "./extractLabels";

module.exports = (app: Probot) => {
  // Inject Probot app into Zeebe controller, and get a ZBClient for use here
  const zbc = require("./zeebe")(app);

  app.log("Yay! The app was loaded!");

  app.webhooks.onAny(async (context) => {
    // console.log("onAny", {
    //   event: context.name,
    //   action: context.payload.action,
    //   context: context,
    // });
  });

  app.on("installation_repositories", (context) => {
    if (context.payload.action === "added") {
      // How do we discriminate between a transfer and a straight-up new repo?
      const { payload } = context;
      const repositories_added: { name: string }[] = payload.repositories_added;
      const sender = payload.sender;
      const repolist = repositories_added.map((repo) => repo.name).join(",");
      context.log.info(`${sender!.login} just created ${repolist}`);
      repositories_added.forEach((repo) =>
        zbc.createWorkflowInstance("new-repo-flow", {
          sender: sender!.login,
          repo: repo.name,
        })
      );
    } else if (context.payload.action === "removed") {
      const { payload } = context;
      const repositories_removed: { name: string }[] =
        payload.repositories_removed;
      const { sender } = payload;
      const repolist = repositories_removed.map((repo) => repo.name).join(",");
      context.log.info(`${sender!.login} just removed ${repolist}`);
      repositories_removed.forEach((repo) =>
        zbc.publishMessage({
          correlationKey: repo,
          name: "repo-removed",
          timeToLive: 0,
        })
      );
    }
  });

  app.on("issues.opened", async (context) => {
    // const params = context.issue({ body: "Hello World!" });
    // return context.octokit.issues.createComment(params);
  });

  app.on("issue_comment.created", async (context) => {
    //gfg
    context.log.info("Issue comment created callback");
  });

  /** lm command processor */
  commands(
    app,
    "lm",
    (context: ProbotCommandContext, command: ProbotCommand) => {
      const { labels, cmd } = extractLabels(command.arguments);
      if (labels.length === 0) {
        context.log("No labels specified. Received:", command.arguments);
        return;
      }

      if (cmd == "add") {
        context.log("Adding labels:", labels);
        return context.github.issues.addLabels(context.issue({ labels }));
      } else if (cmd == "remove") {
        const removeLabel = (name: string) =>
          context.github.issues.removeLabel(context.issue({ name }));
        labels.forEach(removeLabel);
      } else {
        //gfg
        var params = context.issue({
          body:
            "Improper command. Follow the syntax: /lm [add/remove] label1 label2 label3",
        });
        return context.github.issues.createcomment(params);
      }
    }
  );
};

// For more information on building apps:
// https://probot.github.io/docs/

// To get your app running against GitHub, see:
// https://probot.github.io/docs/development/

interface ProbotCommandContext {
  github: any;
  issue: any;
  log: (message: string, ...messages: any[]) => void;
}

interface ProbotCommand {
  arguments: string;
}
