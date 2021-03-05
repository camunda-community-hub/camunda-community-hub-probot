import { Context, Probot } from "probot";

import { ZBClient } from "zeebe-node";
// import { config } from "dotenv";

// config(); // Read Camunda Cloudcredentials from .env file
const zbc = new ZBClient();

interface NewRepoProcessPayload {
  sender: string;
  repo: string;
}

interface LabelUpdate {
  color: string;
  description: string | undefined;
  name: string;
}

interface Label {
  id: number;
  node_id: string;
  url: string;
  name: string;
  description: string | null;
  color: string;
  default: boolean;
}

interface LabelDictionary {
  [name: string]: LabelUpdate;
}
/**
 *
 * @param {import('probot').Probot} app
 */
module.exports = (app: Probot) => {
  const { octokit } = ((): Pick<Context<any>, "octokit"> =>
    (app as any).state)();
  const owner = "camunda-community-hub";

  zbc
    .deployWorkflow("bpmn/new_repo_flow.bpmn")
    .then(console.log)
    .catch(console.error);

  zbc.createWorker<NewRepoProcessPayload>({
    taskType: "give-maintainer-permissions",
    taskHandler: async (job, complete) => {
      const { repo, sender } = job.variables;
      const req = {
        repo,
        username: sender,
        owner,
        permission: "admin" as const,
      };
      console.log("give-maintainer-permissions", req);
      const res = await octokit.repos.addCollaborator(req);
      complete.success({ maintainer_data: res });
    },
  });

  zbc.createWorker({
    taskType: "update-README",
    taskHandler: async (job, complete) => {
      const { repo, sender } = job.variables;
      // Create a PR to add this badge to the README:
      // https://img.shields.io/badge/Community%20Extension-An%20open%20source%20community%20maintained%20project-FF4700
      complete.success();
    },
  });

  zbc.createWorker({
    taskType: "add-labels",
    taskHandler: async (job, complete) => {
      const LABEL_REPO = "camunda-community-hub-probot";
      const { repo } = job.variables;

      const templateLabels = (
        await octokit.issues.listLabelsForRepo({
          repo: LABEL_REPO,
          owner,
        })
      ).data;

      const makeLabelDictionary = (
        prev: LabelDictionary,
        label: Label
      ): LabelDictionary => ({
        ...prev,
        [label.name]: {
          color: label.color,
          description: label.description || undefined,
          name: label.name,
        },
      });

      const templateDictionary: LabelDictionary = templateLabels.reduce(
        makeLabelDictionary,
        {}
      );

      const currentLabels = (
        await octokit.issues.listLabelsForRepo({
          repo,
          owner,
        })
      ).data;

      const currentLabelsDictionary: LabelDictionary = currentLabels.reduce(
        makeLabelDictionary,
        {}
      );

      const labelExists = (label: { name: string }) =>
        currentLabels.reduce(
          (prev, currentLabel) => currentLabel.name === label.name || prev,
          false
        );

      const missingLabels = templateLabels
        .filter((label) => !labelExists(label))
        .map((label) => ({
          ...label,
          description: label.description ?? undefined,
        }));

      const newLabelsCreated = await Promise.all(
        missingLabels.map((label) =>
          octokit.issues
            .createLabel({
              repo,
              owner,
              name: label.name,
              description: label.description,
            })
            .then((res) => res.data)
        )
      );

      const newLabelsDictionary: LabelDictionary = newLabelsCreated.reduce(
        makeLabelDictionary,
        {}
      );

      const removeBlank = (
        label: LabelUpdate | undefined
      ): label is LabelUpdate => label !== undefined;

      const updateLabels = templateLabels
        .map((label) =>
          newLabelsDictionary[label.name]
            ? undefined
            : currentLabelsDictionary[label.name]
            ? {
                name: label.name,
                description: templateDictionary[label.name].description,
                color: templateDictionary[label.name].color,
              }
            : undefined
        )
        .filter(removeBlank);

      Promise.all(
        updateLabels.map((label) =>
          octokit.issues.updateLabel({
            repo,
            owner,
            ...label,
          })
        )
      );
      complete.success({
        addLabels: `Added ${Object.keys(newLabelsDictionary).join(",")}.`,
      });
    },
  });

  zbc.createWorker({
    taskType: "add-topic",
    taskHandler: async (job, complete) => {
      const LABEL = "community-supported";
      const { repo } = job.variables;
      const topics = await octokit.repos.getAllTopics({
        owner,
        repo,
      });
      const alreadyHasLabel = topics.data.names.reduce(
        (prev, label) => label === LABEL || prev,
        false
      );
      if (!alreadyHasLabel) {
        const names = [...topics.data.names, LABEL];
        await octokit.repos.replaceAllTopics({
          names,
          owner,
          repo,
        });
      }
      complete.success({
        topics: alreadyHasLabel
          ? `Already has ${LABEL} topic`
          : `Added ${LABEL} topic`,
      });
    },
  });

  zbc.createWorker({
    taskType: "slack-message",
    taskHandler: async (job, complete) => {
      const { repo, sender } = job.variables;
      console.log(`${sender} transferred ${repo} into the Community Hub`);
      complete.success();
    },
  });

  return zbc;
};
