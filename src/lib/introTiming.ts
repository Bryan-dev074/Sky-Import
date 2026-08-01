export const INTRO_TIMING = Object.freeze({
  slats: 12,
  curtainMs: 2700,
  staggerMs: 42,
  slatDurationMs: 620,
  settleMs: 80,
  get totalMs() {
    return (
      this.curtainMs +
      (this.slats - 1) * this.staggerMs +
      this.slatDurationMs +
      this.settleMs
    )
  },
})
