import { Context, Probot } from "probot";
import axios from "axios";

/**
 * 
 * When a PR is opened or updated, check to see if it has a label. 
 * If it has the triage label, or no label, fail the check.
 * 
 * This ensures that a PR has a label. 
 * 
 * The idea here is to enforce the release drafter workflow - every PR must have exactly one of the following labels:
 * 
 * feature
 * fix
 * chore
 * 
 * And must not have "triage" present.
 * 
 * This enables the release drafter GitHub Action to automatically draft a release.
 * 
 * This is opt-in. You opt-in by labelling the repo with "release-drafter".
 */
export async function handlePullRequestChange(app: Probot, context: Context<"pull_request">) { 
    const log = context.log;

    const requiredLabels = ["chore", "feature", "fix"];

    const { pull_request: pr, repository: repo } = context.payload;

    // Check if the repo has opted-in - does it have the label "release-drafter"
    const {data: {names: topics}} = await axios.get(`https://api.github.com/repos/camunda-community-hub/${repo.name}/topics`, {
        headers: {
            Accept: 'application/vnd.github.mercy-preview+json'
        }
    });

    const releaseDrafterEnabledForRepo = topics.includes('release-drafter');
    if (!releaseDrafterEnabledForRepo) { 
        log(`Release Drafter not enabled for repo ${repo.name}`);
        return;
    }

    log(`Release Drafter check for repo ${repo.name}`);

    // Check the labels on the PR
    // Is one of "feature", "fix", "chore" present on the PR? AND "triage" is not present?
    const labels = pr.labels;
    const hasTriageLabel = !!labels.find(l => l.name === "triage")
    const hasRequiredLabel = labels.filter(l => requiredLabels.includes(l.name.toLowerCase())).length === 1;

    log(`hasTriageLabel: ${hasTriageLabel}, hasRequiredLabel: ${hasRequiredLabel}`);

    if (hasTriageLabel || !hasRequiredLabel) {
        const intro = "You need to "
        const addRequiredLabelMsg = `add exactly one label of 'chore', 'feature', or 'fix' to this PR.`
        const removeTriageLabelMsg = `remove the 'triage' label from this PR`
        let helpMessage: string = ''
        if (hasTriageLabel) {
            helpMessage = `${intro} ${removeTriageLabelMsg}`
            if (!hasRequiredLabel) {
                helpMessage += ` and ${addRequiredLabelMsg}`
            }
        } else {
            helpMessage = `${intro} ${addRequiredLabelMsg}`
        }
        log(`Failed Release Drafter check:`);
        log(helpMessage);
        // fail check
        const checkOptions = {
            name: 'Community Probot',
            // head_branch: "", // workaround for https://github.com/octokit/rest.js/issues/874
            head_sha: pr.head.sha,
            status: "completed",
            conclusion: "failure",
            completed_at: new Date().toISOString(),
            output: {
                title: "Pull request incorrectly labelled",
                summary: helpMessage
            },
        }
        return context.octokit.checks.create(checkOptions);
    } else {
        // pass check
        const checkOptions = {
            name: 'Community Probot',
            // head_branch: "", // workaround for https://github.com/octokit/rest.js/issues/874
            head_sha: pr.head.sha,
            status: "completed",
            conclusion: "success",
            completed_at: new Date().toISOString(),
            output: {
                title: "Correctly labelled for Release Drafter",
                summary: "Congratulations, you correctly labelled this pull request for the Release Drafter to automatically add it to the Release Notes draft"
            },
        }
        log(`Passed Release Drafter check`);
        return context.octokit.checks.create(checkOptions);
    }
    
}
