# Key Probability Distributions: Graphs, Properties, and PDFs

Probability distributions describe how probabilities are distributed over possible values of a random variable. This guide covers essential discrete and continuous distributions, focusing on their graphs, key properties, and formulas (PMF/PDF).

> [!IMPORTANT]
>
> - **PMF** gives exact probabilities for discrete variables: \( P(X = k) \).
> - **PDF** gives densities for continuous variables; probabilities are areas under the curve.

## Interactive Explorer

The tool below allows you to investigate the behavior of fundamental distributions by adjusting their parameters in real-time. Use the **Generate Samples** button to see how empirical data (histograms) aligns with the theoretical PDF/PMF.

<iframe src="probability_distributions_explorer.html" width="100%" height="450" frameborder="0"></iframe>

## Discrete Distributions

Discrete distributions model countable outcomes, visualized as bar graphs.

### Bernoulli Distribution

Single binary trial (success probability **p**). Mean = **p**, Variance = \( p(1-p) \).

### Poisson Distribution

Counts of rare events in fixed interval (rate **λ**). Mean = Variance = **λ**.

## Continuous Distributions

Continuous distributions use smooth PDF curves.

### Normal (Gaussian) Distribution

Symmetric bell curve (location **μ**, scale **σ**). Foundation of the Central Limit Theorem.

### Exponential Distribution

Time between independent events (rate **λ**). Mean = \( 1/\lambda \).

### Gamma Distribution

Sums of exponential waiting times (shape **α**, scale **β**). Mean = αβ.

### Chi-Squared Distribution

Sum of k squared standard normals (degrees of freedom **k**). Mean = **k**, Variance = 2k.

### Log-Normal Distribution

If ln(X) ~ Normal, X is log-normal. Used for multiplicative processes like stock prices.

---

> [!NOTE]
> Use the interactive explorer above to verify these properties: adjust parameters and observe how graphs, means, and variances change in real-time.
