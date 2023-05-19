export class ReviewGatekeeper {
  private messages: string[]
  private meet_criteria: boolean

  constructor(requested_reviewers: string[], approved_reviewers: string[]) {
    this.messages = []
    this.meet_criteria = true

    for (const requested_reviewer of requested_reviewers) {
      if (!approved_reviewers.includes(requested_reviewer)) {
        if (this.meet_criteria) {
          this.messages.push(
            `not all requested reviewers have approved the pull request`
          )
        }
        this.meet_criteria = false
        this.messages.push(
          `requested reviewer ${requested_reviewer} has not approved the pull request`
        )
      }
    }

    this.messages.push(`requested_reviewers:${requested_reviewers}`)
    this.messages.push(`approved_reviewers:${approved_reviewers}`)
  }

  satisfy(): boolean {
    return this.meet_criteria
  }

  getMessages(): string[] {
    return this.messages
  }
}
