import { Probot, Context } from "probot";
import commands from "probot-commands";
import { extractLabels } from "./extractLabels";
import { healthcheck } from "healthchecks.io";
import { config } from "dotenv";
import { handlePullRequestChange } from "./handle-pull-request-change";

config(); // Read Camunda Cloudcredentials and healthcheck from .env file
const url = process.env.HEALTHCHECK_URL;
if (!!url) {
  healthcheck(url, 5);
}

process.on('uncaughtException', e => console.log('Uncaught exception', e))

module.exports = (app: Probot) => {
  // Inject Probot app into Zeebe controller, and get a ZBClient for use here
  const zbc = require("./zeebe")(app);

  app.log("Yay! The app was loaded!");

  if ((process.env.OCTOKIT_DEBUG || 'false').toUpperCase() === 'TRUE') {
    app.log.debug = console.debug;
  }

  app.webhooks.onAny(async (context) => {
    if ((process.env.DEBUG_LOG_REQUESTS || 'false').toUpperCase() === 'TRUE') {
      console.log("onAny", {
        event: context.name,
        context: context,
      });
    }
  });

  app.on([
    "pull_request.opened",
    "pull_request.edited",
    "pull_request.labeled",
    "pull_request.unlabeled",
    "pull_request.synchronize",
  ], context => handlePullRequestChange(app, context));

  app.on("check_run.rerequested", (event) => {
    console.log("Check run rerequested")
    console.log(event.payload)
  })

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
    const issue = context.issue()
    const labels = (await context.octokit.issues.listLabelsOnIssue(issue)).data
    if (labels.length == 0) {
      console.log('Issue opened', 'Adding triage label')
      return context.octokit.issues.addLabels({ ...issue, labels: ['triage'] });
    }
  });

  app.on("issues.labeled", async (context) => {
    const issue = context.issue()
    console.log('Issues labelled', issue)
    const labels = (await context.octokit.issues.listLabelsOnIssue(issue)).data
    const hasTriageLabel = labels.filter(l => l.name === 'triage').length > 0
    if (hasTriageLabel && labels.length > 1) {
      console.log('Issue labelled', 'Removing triage label')
      return context.octokit.issues.removeLabel({ ...issue, name: 'triage' });
    }
  })

  app.on("issue_comment.created", async (context) => {
    //gfg
    context.log.info("Issue comment created callback");
  });

  /** lm command processor */
  commands(
    app,
    "lm",
    (context: Context, command: ProbotCommand) => {
      const { labels, cmd } = extractLabels(command.arguments);
      if (labels.length === 0) {
        context.log("No labels specified. Received:", command.arguments);
        return;
      }

      if (cmd == "add") {
        context.log("Adding labels:", labels);
        return context.octokit.issues.addLabels(context.issue({ labels }));
      } else if (cmd == "remove") {
        const removeLabel = (name: string) =>
          context.octokit.issues.removeLabel(context.issue({ name }));
        labels.forEach(removeLabel);
      } else {
        //gfg
        var params = context.issue({
          body:
            "Improper command. Follow the syntax: /lm [add/remove] label1 label2 label3",
        });
        return context.octokit.issues.createComment(params);
      }
    }
  );
};

// For more information on building apps:
// https://probot.github.io/docs/

// To get your app running against GitHub, see:
// https://probot.github.io/docs/development/

interface ProbotCommand {
  arguments: string;
}
