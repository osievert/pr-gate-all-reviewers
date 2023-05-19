import * as core from '@actions/core'
import * as github from '@actions/github'
import * as Webhooks from '@octokit/webhooks-types'
import {EOL} from 'os'
import {ReviewGatekeeper} from './review-gatekeeper'

async function run(): Promise<void> {
  try {
    const context = github.context
    if (
      context.eventName !== 'pull_request' &&
      context.eventName !== 'pull_request_review'
    ) {
      core.setFailed(
        `Invalid event: ${context.eventName}. This action should be triggered on pull_request and pull_request_review`
      )
      return
    }
    const payload = context.payload as
      | Webhooks.PullRequestEvent
      | Webhooks.PullRequestReviewEvent

    const token: string = core.getInput('token')
    const octokit = github.getOctokit(token)

    const requested_reviewers = await octokit.rest.pulls.listRequestedReviewers(
      {
        ...context.repo,
        pull_number: payload.pull_request.number
      }
    )

    const requested_users: Set<string> = new Set()
    for (const user of requested_reviewers.data.users) {
      requested_users.add(user.login)
    }

    const reviews = await octokit.rest.pulls.listReviews({
      ...context.repo,
      pull_number: payload.pull_request.number
    })

    const approved_users: Set<string> = new Set()
    for (const review of reviews.data) {
      if (review.state === `APPROVED` && review.user) {
        approved_users.add(review.user.login)
      }
    }

    // let state = "success"

    const review_gatekeeper = new ReviewGatekeeper(
      Array.from(requested_users),
      Array.from(approved_users)
    )

    const sha = payload.pull_request.head.sha
    // The workflow url can be obtained by combining several environment varialbes, as described below:
    // https://docs.github.com/en/actions/reference/environment-variables#default-environment-variables
    const workflow_url = `${process.env['GITHUB_SERVER_URL']}/${process.env['GITHUB_REPOSITORY']}/actions/runs/${process.env['GITHUB_RUN_ID']}`
    core.info(`Setting a status on commit (${sha})`)

    octokit.rest.repos.createCommitStatus({
      ...context.repo,
      sha,
      state: review_gatekeeper.satisfy() ? 'success' : 'failure',
      context: 'Review Gatekeeper Status',
      target_url: workflow_url,
      description: review_gatekeeper.satisfy()
        ? undefined
        : review_gatekeeper.getMessages().join(' ').substring(0, 140)
    })

    if (!review_gatekeeper.satisfy()) {
      core.setFailed(review_gatekeeper.getMessages().join(EOL))
      return
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    }
  }
}

run()
