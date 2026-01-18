# Understanding First-Order Linear Differential Equations

A **differential equation** (DE) is a mathematical equation that relates one or more unknown functions to their derivatives. In essence, these equations model how a physical quantity changes relative to another variable, such as time or distance [^1][^2]. Among the various types of DEs, the **First-Order Linear Differential Equation** is one of the most fundamental and widely used in science and engineering.

---

## The Standard Form

A first-order differential equation is considered **linear** if it can be written in the following standard form:

$$\frac{dy}{dx} + P(x)y = Q(x)$$

In this equation:
- $y$ is the dependent variable.
- $x$ is the independent variable.
- $P(x)$ and $Q(x)$ are continuous functions of $x$ [^1][^3][^7].

> [!IMPORTANT]
> To be "linear," the dependent variable $y$ and its derivative $\frac{dy}{dx}$ must appear to the first power. They cannot be multiplied together or be part of a nonlinear function (like $\sin(y)$ or $e^y$).

### Homogeneous vs. Inhomogeneous
- **Homogeneous:** If $Q(x) = 0$, the equation simplifies to $\frac{dy}{dx} + P(x)y = 0$ [^1].
- **Inhomogeneous:** If $Q(x) \neq 0$, the equation is considered inhomogeneous [^1].

---

## The Method of Integrating Factors

The most common technique for solving these equations is the **Integrating Factor Method**. The goal is to transform the left side of the equation into the derivative of a single product using the product rule.

### 1. Find the Integrating Factor
We define the integrating factor, $\mu(x)$, as:
$$\mu(x) = e^{\int P(x) \, dx}$$

### 2. Why does this work?
By construction, the derivative of $\mu(x)$ is $\mu'(x) = P(x)\mu(x)$. If we multiply the entire standard form equation by $\mu(x)$, we get:
$$\mu(x) \frac{dy}{dx} + P(x) \mu(x) y = \mu(x) Q(x)$$

The left side is now exactly the result of the product rule: $\frac{d}{dx} [\mu(x)y]$. Therefore:
$$\frac{d}{dx} [\mu(x) y] = \mu(x) Q(x)$$

### 3. Integrate and Solve
Integrating both sides with respect to $x$ gives:
$$\mu(x) y = \int \mu(x) Q(x) \, dx + C$$

Finally, solve for $y$:
$$y = \frac{1}{\mu(x)} \left( \int \mu(x) Q(x) \, dx + C \right)$$
Where $C$ is the constant of integration [^7][^8].

---

## Interactive ODE Explorer
Use the tool below to visualize how different $P(x)$ and $Q(x)$ functions change the solution curve.

<iframe src="ode_step_solver.html" width="100%" height="450" frameborder="0"></iframe>

---

## Step-by-Step Examples

### Example 1: The Homogeneous Case
**Problem:** Solve $\frac{dy}{dx} + 2y = 0$ with the initial condition $y(0) = 1$.

1. **Identify $P(x)$:** Here, $P(x) = 2$.
2. **Calculate $\mu(x)$:** 
   $$\mu(x) = e^{\int 2 \, dx} = e^{2x}$$
3. **Multiply and Rewrite:** 
   $$\frac{d}{dx}(e^{2x}y) = 0$$
4. **Integrate:** 
   $$e^{2x}y = C \implies y = Ce^{-2x}$$
5. **Apply Initial Condition:** 
   $1 = Ce^{0} \implies C = 1$.
   **Final Solution:** $y = e^{-2x}$ [^4].

### Example 2: Inhomogeneous with Integration by Parts
**Problem:** Solve $\frac{dy}{dx} + y = x$, with $y(0) = 1$.

1. **Identify $P(x)$:** $P(x) = 1$.
2. **Calculate $\mu(x)$:** 
   $$\mu(x) = e^{\int 1 \, dx} = e^x$$
3. **Rewrite and Integrate:** 
   $$e^x y = \int x e^x \, dx$$
   Using integration by parts ($\int u \, dv = uv - \int v \, du$), let $u = x$ and $dv = e^x dx$:
   $$\int x e^x \, dx = x e^x - e^x + C$$
4. **Solve for $y$:** 
   $$y = \frac{xe^x - e^x + C}{e^x} = x - 1 + Ce^{-x}$$
5. **Apply Initial Condition:** 
   $1 = (0 - 1) + C \implies C = 2$.
   **Final Solution:** $y = x - 1 + 2e^{-x}$ [^7][^8].

### Example 3: Variable Coefficient $P(x)$
**Problem:** Solve $\frac{dy}{dx} + \frac{1}{x}y = x$ for $x > 0$, with $y(1) = 0$.

1. **Identify $P(x)$:** $P(x) = \frac{1}{x}$.
2. **Calculate $\mu(x)$:** 
   $$\mu(x) = e^{\int \frac{1}{x} \, dx} = e^{\ln x} = x$$
3. **Rewrite and Integrate:** 
   $$\frac{d}{dx}(xy) = x(x) = x^2$$
   $$xy = \int x^2 \, dx = \frac{x^3}{3} + C$$
4. **Solve for $y$:** 
   $$y = \frac{x^2}{3} + \frac{C}{x}$$
5. **Apply Initial Condition:** 
   $0 = \frac{1}{3} + C \implies C = -\frac{1}{3}$.
   **Final Solution:** $y = \frac{x^2}{3} - \frac{1}{3x}$ [^7].

---

## Real-World Applications

First-order linear differential equations are critical for modeling dynamic systems [^2][^3]:
*   **Physics:** Mixing problems (calculating salt concentration in a tank over time).
*   **Biology:** Population growth and decay models, such as $\frac{dm}{dt} = km$.
*   **Finance:** Calculating interest rates and investment growth.

> [!NOTE]
> When solving these equations, always remember to add the constant $C$ **before** dividing by the integrating factor. Distributing the division to the constant is essential for the correct general solution.

---

### Sources
[^1]: [Wikipedia: Differential Equation](https://en.wikipedia.org/wiki/Differential_equation)
[^2]: [Cuemath: Differential Equation](https://www.cuemath.com/calculus/differential-equation/)
[^3]: [BYJU'S: Differential Equation](https://byjus.com/maths/differential-equation/)
[^4]: [University of Toronto: B44 Notes](https://www.math.toronto.edu/selick/B44.pdf)
[^5]: [Paul's Online Notes: Definitions](https://tutorial.math.lamar.edu/classes/de/definitions.aspx)
[^6]: [LibreTexts: Basics of Differential Equations](https://math.libretexts.org/Courses/Monroe_Community_College/MTH_211_Calculus_II/Chapter_8:_Introduction_to_Differential_Equations/8.1:_Basics_of_Differential_Equations)
[^7]: [eCampusOntario: Differential Equations Chapter 1](https://ecampusontario.pressbooks.pub/diffeq/chapter/chapter-1/)
[^8]: [Math Insight: ODE Introduction](https://mathinsight.org/ordinary_differential_equation_introduction)

## References
[^1]: https://en.wikipedia.org/wiki/Differential_equation
[^2]: https://www.cuemath.com/calculus/differential-equation/
[^3]: https://byjus.com/maths/differential-equation/
[^4]: https://www.math.toronto.edu/selick/B44.pdf
[^5]: https://tutorial.math.lamar.edu/classes/de/definitions.aspx
[^6]: https://math.libretexts.org/Courses/Monroe_Community_College/MTH_211_Calculus_II/Chapter_8:_Introduction_to_Differential_Equations/8.1:_Basics_of_Differential_Equations
[^7]: https://ecampusontario.pressbooks.pub/diffeq/chapter/chapter-1/
[^8]: https://mathinsight.org/ordinary_differential_equation_introduction
[^9]: https://www.youtube.com/watch?v=-_POEWfygmU
[^10]: https://www.khanacademy.org/math/ap-calculus-ab/ab-differential-equations-new/ab-7-1/v/differential-equation-introduction
