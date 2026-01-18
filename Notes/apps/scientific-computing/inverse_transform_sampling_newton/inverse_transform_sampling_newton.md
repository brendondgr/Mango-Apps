# Inverse Transform Sampling via Newton's Method

Inverse Transform Sampling (ITS) is a powerful technique to generate random samples from any target probability distribution using uniform random variables on [0,1] by applying the **inverse cumulative distribution function (CDF)**.[^1][^3][^5] When the inverse CDF lacks a closed form—like for the normal distribution—**Newton's method** numerically solves for the inverse by finding roots of \(F(x) - U = 0\), where \(U \sim \text{Unif}(0,1)\).[^3][^5]

## Understanding PDFs and CDFs: The Foundation of ITS

The **probability density function (PDF)**, \(f(x)\) or \(p(x)\), describes the probability density at each point \(x\) for continuous distributions.[^1][^3][^5] The **CDF**, \(F(x) = P(X \leq x)\), is the integral:
$$
F(x) = \int_{-\infty}^x f(t) \, dt
$$
This makes \(F(x)\) non-decreasing, continuous, and mapping the support of \(X\) to [0,1]. Its (generalized) inverse is:
$$
F^{-1}(y) = \inf\{x : F(x) \geq y\}
$$
which maps [0,1] back to the target support.[^1][^3][^5]

> [!IMPORTANT]
> If \(U \sim \text{Unif}(0,1)\), then \(X = F^{-1}(U)\) follows the target distribution: \(P(X \leq x) = P(F^{-1}(U) \leq x) = P(U \leq F(x)) = F(x)\).[^1][^3][^5]

**Example: Exponential Distribution** (rate \(\lambda = 2\))  
PDF: \(p(y) = 2e^{-2y}\) for \(y > 0\)  
CDF: \(F_Y(x) = 1 - e^{-2x}\)  
Inverse: \(F_Y^{-1}(y) = -\frac{\ln(1-y)}{2}\)[^1]

Here, the inverse has a closed form, so direct computation works. But for others (e.g., normal), we need numerical methods.

<iframe src="inverse-transform-newton.html" width="100%" height="450" frameborder="0"></iframe>

> [!NOTE]
> The interactive visualization above shows ITS for an exponential CDF: drag the slider for \(U\) (left plot) and watch Newton's method converge (right plot) by drawing tangents using the PDF slope.[Visualization 1]

## Why Newton's Method? When Closed-Form Inverses Fail

Most distributions lack analytical inverses, requiring numerical root-finding for \(F(x) - U = 0\).[^1][^3][^5] Newton's method excels here: it iteratively refines an initial guess \(x_0\) using the update:
$$
x_{n+1} = x_n - \frac{F(x_n) - U}{f(x_n)}
$$
Since \(f(x) = F'(x)\), this leverages the PDF as the derivative for quadratic convergence near the root.[^3][^5][^1]

ITS with Newton's method boasts **100% acceptance rate** (unlike rejection sampling) if \(F\) and \(f\) are evaluable quickly.[^1][^2][^3][^5] It works best for strictly increasing CDFs, ensuring a unique inverse.

## Step-by-Step Implementation

Follow these steps to generate samples:

1. **Generate** \(U \sim \text{Unif}(0,1)\).
2. **Initialize** \(x_0\) (e.g., distribution mean, median, or bisection bracket for safety).[^3][^5]
3. **Iterate** Newton's update until convergence:
   $$
   x_{n+1} = x_n - \frac{F(x_n) - U}{f(x_n)}
   $$
   Stop when \(|F(x_{n+1}) - U| < \epsilon\) (e.g., \(\epsilon = 10^{-6}\)) or max iterations hit.
4. **Output** \(X = x_{n+1}\).
5. **Repeat** for desired sample size.

> [!IMPORTANT]
> Choose \(x_0\) wisely—poor starts may diverge. Hybrid methods (bisection + Newton) add robustness.[^3]

## Example: Sampling from a Normal Distribution

Normal CDF \(F(x)\) has no closed inverse. Define:
- PDF: \(f(x) = \frac{1}{\sqrt{2\pi}} e^{-x^2/2}\) (standard normal)
- CDF: \(F(x)\) via numerical integration or approximation

Start with \(x_0 = 0\), generate \(U = 0.7\):
- Iteration 1: Compute \(F(x_0) - U\), divide by \(f(x_0)\), update.
- Converges in ~5-10 steps to \(x \approx 0.524\).

This scales to thousands of samples efficiently.[^5]

## Advantages, Limitations, and Extensions

| Aspect | Inverse Transform Sampling w/ Newton |
|--------|--------------------------------------|
| **Efficiency** | 100% acceptance; quadratic convergence[^1][^2][^3][^5] |
| **Requirements** | Evaluable \(F, f\); good initial guess |
| **Limitations** | Slow if \(F\) needs quadrature each time[^1]; non-monotonic CDFs tricky |
| **Extensions** | Discrete: step CDF, find smallest \(x_i\) where cum. prob. > \(U\)[^1]; Multidimensional: conditionals or approximations[^3] |

For heavy-tailed or complex distributions, combine with Chebyshev approximations for faster \(F\) evaluation.[^3]

## Practice in Code (Python Sketch)

## References
[^1]: https://stephens999.github.io/fiveMinuteStats/inverse_transform_sampling.html
[^2]: https://www.youtube.com/watch?v=rnBbYsysPaU
[^3]: https://www.scratchapixel.com/lessons/mathematics-physics-for-computer-graphics/monte-carlo-methods-mathematical-foundations/inverse-transform-sampling-method.html
[^4]: https://www.youtube.com/watch?v=xmR0uvAxWAo
[^5]: https://www.ttested.com/generating-normal-random-variables-part-1/
[^6]: http://www.columbia.edu/~ks20/4404-Sigman/4404-Notes-ITM.pdf
[^7]: https://rpubs.com/binhho660/902552
