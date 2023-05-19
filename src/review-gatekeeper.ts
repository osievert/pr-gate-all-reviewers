export class ReviewGatekeeper {
  private messages: string[]
  private meet_criteria: boolean

  constructor(requested_reviewers: string[], approved_reviewers: string[]) {
    this.messages = []
    this.meet_criteria = true

    for (const requested_reviewer of requested_reviewers) {
      if (!approved_reviewers.includes(requested_reviewer)) {
        this.meet_criteria = false
        this.messages.push('not all requested reviewers have approved')
      }
    }
  }

  satisfy(): boolean {
    return this.meet_criteria
  }

  getMessages(): string[] {
    return this.messages
  }
}
