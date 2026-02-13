/**
 * Welford's online algorithm for computing running mean and variance.
 *
 * Accepts values one at a time via {@link push} and maintains numerically
 * stable running statistics without storing the full dataset.
 */
export class WelfordStats {
  n = 0;
  mean = 0;
  min = Infinity;
  max = -Infinity;
  private m2 = 0;

  /** Add a new sample. */
  push(value: number): void {
    this.n++;
    const delta = value - this.mean;
    this.mean += delta / this.n;
    const delta2 = value - this.mean;
    this.m2 += delta * delta2;
    if (value < this.min) this.min = value;
    if (value > this.max) this.max = value;
  }

  /** Sample variance (Bessel-corrected). */
  get variance(): number {
    return this.n < 2 ? 0 : this.m2 / (this.n - 1);
  }

  /** Sample standard deviation. */
  get stddev(): number {
    return Math.sqrt(this.variance);
  }

  /** Reset all counters to their initial state. */
  reset(): void {
    this.n = 0;
    this.mean = 0;
    this.m2 = 0;
    this.min = Infinity;
    this.max = -Infinity;
  }
}
