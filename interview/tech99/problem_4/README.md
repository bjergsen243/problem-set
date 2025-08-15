# Problem 4 - Sum to N in TypeScript

Link: https://s5tech.notion.site/Problem-4-Three-ways-to-sum-to-n-c2b6eb21aa054b399951e2a6feda99aa

This project demonstrates **three unique implementations** of a function that calculates the summation from `1` to `n` (inclusive), i.e.,

```
sum_to_n(5) = 1 + 2 + 3 + 4 + 5 = 15
```

> Assumption: `n` is a non-negative integer such that the result is always less than `Number.MAX_SAFE_INTEGER`.

---

## Files

- `sum_to_n_a.ts` – Uses the **mathematical formula**.
- `sum_to_n_b.ts` – Uses a **for loop**.
- `sum_to_n_c.ts` – Uses **recursion**.

---

## Implementations

### sum_to_n_a

```ts
function sum_to_n_a(n: number): number {
  return (n * (n + 1)) / 2;
}
```

- **Time Complexity**: O(1)
- **Space Complexity**: O(1)
- **Comment**: Fastest and most efficient. Uses the arithmetic summation formula.

---

### sum_to_n_b

```ts
function sum_to_n_b(n: number): number {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
}
```

- **Time Complexity**: O(n)
- **Space Complexity**: O(1)
- **Comment**: Simple and easy to understand. Not ideal for very large `n`.

---

### sum_to_n_c

```ts
function sum_to_n_c(n: number): number {
  if (n <= 1) return n;
  return n + sum_to_n_c(n - 1);
}
```

- **Time Complexity**: O(n)
- **Space Complexity**: O(n) – due to call stack
- **Comment**: Elegant recursive version, but can cause stack overflows for large `n`.

---

## Example Usage

```ts
console.log(sum_to_n_a(5)); // 15
console.log(sum_to_n_b(5)); // 15
console.log(sum_to_n_c(5)); // 15
```

---

## Requirements

- Node.js >= 14
- TypeScript >= 4.x

Install dependencies (if you have a build/test setup):

```bash
npm install
```

Test:

```bash
npm test
```
