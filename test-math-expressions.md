# Test Mathematical Expressions

This file tests the specific mathematical expressions from your screenshot to ensure they render properly.

## Euler's Theorem Example

This matches Euler's Theorem's prediction that 3^{4} ≡ 1 mod 10

## Another Example

Let's try n = 15 and a = 2:

1. Compute φ(15):
   • 15 = 3 × 5
   • φ(15) = φ(3) × φ(5) = (3-1)(5-1) = 2 × 4 = 8
   • Numbers coprime with 15: 1, 2, 4, 7, 8, 11, 13, 14

2. Compute 2^φ(15) = 2^{8} = 256

3. Calculate 256 mod 15:

## Additional Test Cases

### Basic Superscripts
- a^n should render as mathematical notation
- x^2 + y^2 = z^2
- 2^8 = 256
- 3^{4} ≡ 1 mod 10

### Function Notation
- φ(15) = 8
- sin(x) = 0.5
- log(100) = 2

### Complex Expressions
- 2^φ(15) = 2^{8}
- a^{n+1} = a × a^n
- x^{2k} = (x^2)^k

### Modular Arithmetic
- 256 mod 15
- a ≡ b mod n
- 3^{4} ≡ 1 mod 10

### Greek Letters
- φ(n) (Euler's totient function)
- π ≈ 3.14159
- α^2 + β^2 = γ^2

### Mixed Expressions
- If a^φ(n) ≡ 1 mod n, then...
- For n = 15: φ(15) = 8
- Therefore: 2^8 = 256
- And: 256 ≡ 1 mod 15

### Specific Test Case (from screenshot)
The problematic expression that should now work:
- a^φ(n) ≡ 1 mod n

This should now properly render all mathematical expressions with KaTeX!
