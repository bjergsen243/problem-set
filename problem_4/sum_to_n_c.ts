export function sum_to_n_c(n: number): number {
  if (n <= 1) return n;
  return n + sum_to_n_c(n - 1);
}
