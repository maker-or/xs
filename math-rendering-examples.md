# Mathematical Equation Rendering Examples

This file demonstrates the enhanced mathematical equation rendering capabilities.

## Basic Superscripts and Subscripts

### Before Enhancement (what users might type naturally):
- a^n (power notation)
- x_i (subscript notation)  
- a^2 + b^2 = c^2
- x_1, x_2, x_3, ..., x_n

### After Enhancement (properly rendered):
- $a^n$ (power notation)
- $x_i$ (subscript notation)
- $a^2 + b^2 = c^2$
- $x_1, x_2, x_3, \ldots, x_n$

## Complex Expressions

### Fractions:
- Simple: $\frac{1}{2}$, $\frac{3}{4}$
- Complex: $\frac{a+b}{c+d}$
- Derivatives: $\frac{d}{dx}f(x)$, $\frac{\partial f}{\partial x}$

### Roots and Powers:
- Square root: $\sqrt{x}$, $\sqrt{a^2 + b^2}$
- nth root: $\sqrt[3]{x}$, $\sqrt[n]{x}$
- Powers: $x^{n+1}$, $e^{-x^2}$

### Summations and Products:
- $\sum_{i=1}^{n} x_i$
- $\prod_{i=1}^{n} a_i$
- $\int_{0}^{\infty} e^{-x} dx$

### Limits:
- $\lim_{x \to 0} \frac{\sin x}{x} = 1$
- $\lim_{n \to \infty} \left(1 + \frac{1}{n}\right)^n = e$

## Advanced Mathematical Notation

### Matrices:
$$\begin{pmatrix}
a & b \\
c & d
\end{pmatrix}$$

$$\begin{bmatrix}
1 & 0 & 0 \\
0 & 1 & 0 \\
0 & 0 & 1
\end{bmatrix}$$

### Set Theory:
- $x \in \mathbb{R}$
- $A \subset B$
- $A \cup B$, $A \cap B$
- $\emptyset$ (empty set)

### Logic:
- $\forall x \in \mathbb{R}$
- $\exists y$ such that $y > x$
- $P \implies Q$
- $P \iff Q$

### Probability and Statistics:
- $\Pr(X = x)$
- $\E[X]$ (expected value)
- $\Var(X)$ (variance)
- $\Cov(X,Y)$ (covariance)

### Complex Analysis:
- $\Re(z)$ (real part)
- $\Im(z)$ (imaginary part)
- $|z|$ (absolute value)

### Linear Algebra:
- $\det(A)$ (determinant)
- $\tr(A)$ (trace)
- $\rank(A)$ (rank)
- $\|v\|$ (norm)

## Natural Language Math Input

The enhanced renderer now supports more natural mathematical input:

### Input Examples:
```
x^2 + y^2 = r^2
f(x) = x^n
sqrt(x^2 + y^2)
|x - y|
sum(i, 1, n) of x_i
lim(x -> 0) of sin(x)/x
matrix(1,2; 3,4)
```

### Rendered Output:
- $x^2 + y^2 = r^2$
- $f(x) = x^n$  
- $\sqrt{x^2 + y^2}$
- $\left|x - y\right|$
- $\sum_{i=1}^{n} x_i$
- $\lim_{x \to 0} \frac{\sin x}{x}$
- $\begin{pmatrix} 1 & 2 \\ 3 & 4 \end{pmatrix}$

## Greek Letters

Both lowercase and uppercase Greek letters are supported:

### Lowercase:
$\alpha, \beta, \gamma, \delta, \epsilon, \zeta, \eta, \theta, \iota, \kappa, \lambda, \mu, \nu, \xi, \pi, \rho, \sigma, \tau, \upsilon, \phi, \chi, \psi, \omega$

### Uppercase:
$\Gamma, \Delta, \Theta, \Lambda, \Xi, \Pi, \Sigma, \Upsilon, \Phi, \Psi, \Omega$

## Mathematical Constants and Functions

### Constants:
- Euler's number: $\mathrm{e}$
- Pi: $\pi$
- Infinity: $\infty$

### Trigonometric Functions:
- $\sin(x), \cos(x), \tan(x)$
- $\sec(x), \csc(x), \cot(x)$
- $\arcsin(x), \arccos(x), \arctan(x)$

### Logarithmic Functions:
- $\log(x), \ln(x), \exp(x)$

## Special Operators

### Inequalities:
- $a \leq b$, $a \geq b$
- $a \neq b$
- $a \approx b$
- $a \equiv b$

### Plus/Minus:
- $a \pm b$
- $a \mp b$

### Dots:
- $a \cdot b$ (multiplication)
- $a, b, c, \ldots, z$ (ellipsis)

This enhanced mathematical rendering provides a much more comprehensive and user-friendly experience for mathematical content!
