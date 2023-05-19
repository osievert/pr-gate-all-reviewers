# pr-gate-all-reviewers
A github action that ensures all requested reviewers have reviewed a pull request.

## Motivation

When working with github in a team setting, a lot of pull requests have a single reviewer.
As soon as that reviewer approves, it is common to merge the pull request. That makes sense.
But when multiple reviewers have been selected, sometimes teams find that pull requests are
merged after a single reviewer has approved but another reviewer is still in the middle of
reviewing.

This is mostly a coordination problem, but sometimes tooling is the best way to coordinate.

Github [branch protection rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches#about-branch-protection-settings)
today allow pull requests to have a sepcified number of
approvals before being merged. That can be set to "1" to ensure a review has happened. Branch
protection rules can be used to ensure a second (or third, or fourth) reviewer gets a chance
to complete their review, but then every pull request in that repo would require
two/three/four reviews, and a lot of pull requests only really need one review.

Github does not have a solution for this problem. They assume that every pull request requires
exactly the same number of reviewers. Unfortunately, the world just doesn't work that way.
Most of the time, code changes are small and only need a small review. Occasionally, code
changes are substantial, and require more attention by more people. The world needs tools that
accommodate both situations, and punish neither.

That is where this custom action comes in. What it does is simple: it does not complete successfully
until all requested reviewers have approved the pull request.

This action can be combined with github branch protection rules to require that all pull
requests have at least one review approval, which works great for the majority of pull
requests. But with this action in place, you can at the same time ensure that complicated pull
requests are not merged before every requested reviewer has had a chance to review. This means
that review requirements can be scaled appropriately to the size/scope/impact of the code
change, which in turn means that simple changes flow simply and easily through review, and
complex changes get the attention they deserve from all of the people whose review was
requested.

## Usage

Requires a github token with repo-read privileges, to make a call to the github API to fetch the
requested reviewers and match that against the completed reviews. One of these tokens is provided
to all job runs automatically as a secret.

Example workflow:

```yaml
name: 'review gatekeeper'

on:
  pull_request:
    types:
      [
        assigned,
        unassigned,
        opened,
        reopened,
        synchronize,
        review_requested,
        review_request_removed
      ]
  pull_request_review:

jobs:
  review-gatekeeper:
    name: Review Gatekeeper
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: osievert/pr-gate-all-reviewers@v1.0
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
```

## Kudos

Implementation inspired by https://github.com/octodemo/pr-gatekeeper
