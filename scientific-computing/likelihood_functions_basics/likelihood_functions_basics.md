# Understanding the Basics of Likelihood Functions

In the world of statistics, we often find ourselves with a set of observed data and a desire to understand the process that generated it. The **likelihood function** is the primary tool used to bridge the gap between observed data and the underlying statistical models. [^2]

## What is a Likelihood Function?

A likelihood function measures how well a specific statistical model explains observed data by calculating the probability of seeing that data under various parameter values. [^2] It allows us to estimate unknown parameters—like the average height of a population or the bias of a coin—based solely on the samples we have collected. [^1]

> [!IMPORTANT]
> The likelihood function is not the same as a probability distribution. While they look similar mathematically, they serve different purposes and have different properties.

---

## Probability vs. Likelihood

The distinction between probability and likelihood is subtle but crucial. It comes down to what you treat as **fixed** and what you treat as **variable**. [^4]

### 1. Probability
When we talk about probability, we assume the parameters of the model are known and fixed. We use these parameters to predict the chance of different outcomes.
- **Perspective:** $P(\text{data} \mid \text{parameters})$
- **Question:** "Given these parameters, what data are we likely to see?" [^3]

### 2. Likelihood
In likelihood, we reverse this perspective. We have already observed the data (it is now fixed), and we want to determine which parameter values are most plausible.
- **Perspective:** $L(\text{parameters} \mid \text{data}) \propto P(\text{data} \mid \text{parameters})$
- **Question:** "Given the data we observed, which parameters best explain it?" [^3]

> [!NOTE]
> A probability distribution must integrate or sum to $1$ across all possible outcomes. A likelihood function does **not** necessarily sum to $1$ across all possible parameter values. [^1][^8]

---

## The Mathematical Definition

To define the likelihood function, we substitute our observed data into a probability density function (PDF) or probability mass function (PMF) and treat the parameter as the variable. [^1]

If we have a set of independent and identically distributed (i.i.d.) observations $x = \{x_1, x_2, \dots, x_n\}$ and an unknown parameter $\theta$, the likelihood function is expressed as:

$$L(\theta \mid x) = \prod_{i=1}^n f(x_i; \theta)$$

Where:
- $L(\theta \mid x)$ is the likelihood of the parameter $\theta$ given data $x$. [^4]
- $f(x_i; \theta)$ is the probability of an individual observation $x_i$ given $\theta$.
- $\prod$ is the product operator, representing the multiplication of the individual probabilities for all observations. [^4]

---

## Example: Flipping a Coin

Imagine you flip a coin $10$ times and observe $7$ heads. You want to know the probability of heads ($\theta$) for this specific coin. [^4]

Using the binomial distribution, the likelihood function for observing exactly $7$ heads in $10$ trials is:

$$L(\theta) = \binom{10}{7} \cdot \theta^7 \cdot (1 - \theta)^{10-7}$$

By testing different values of $\theta$ (from $0$ to $1$), we can see which value makes our result ($7$ heads) most likely.

### Interactive Visualization: Coin Flip Likelihood
Use the dashboard below to simulate coin flips and see how the likelihood curve changes based on your results.

<iframe src="coin_flip_likelihood.html" width="100%" height="450" frameborder="0"></iframe>

---

## Maximum Likelihood Estimation (MLE)

The ultimate goal of using likelihood functions is often to find the **Maximum Likelihood Estimate (MLE)**. This is the specific value of the parameter $\theta$ that maximizes the likelihood function. [^4][^5]

In our coin flip example:
- If we evaluate $L(\theta)$ at $\theta = 0.5$, we get the likelihood of a fair coin.
- If we evaluate $L(\theta)$ at $\theta = 0.7$, we find the peak of the curve. [^4]

Through calculus (taking the derivative and setting it to zero), we can prove that for $7$ heads in $10$ flips, the MLE is:

$$\hat{\theta} = 0.7$$

This means that a coin with a $70\%$ chance of landing on heads is the most plausible explanation for the data we observed. [^4] MLE is a highly efficient method of estimation and is widely used in modern data science and machine learning. [^3]

---

## Sources
[^1]: [Statistics.com - Likelihood Function](https://www.statistics.com/glossary/likelihood-function/)
[^2]: [Wikipedia - Likelihood Function](https://en.wikipedia.org/wiki/Likelihood_function)
[^3]: [Statistics How To - Likelihood Function Definition](https://www.statisticshowto.com/likelihood-function-definition/)
[^4]: [GeeksforGeeks - Likelihood Function in Data Science](https://www.geeksforgeeks.org/data-science/likelihood-function/)
[^5]: [StatQuest - Probability vs Likelihood](https://www.youtube.com/watch?v=G2bhDen3pK0)
[^6]: [CERN EP News - Likelihood in Particle Physics](https://ep-news.web.cern.ch/what-likelihood-function-and-how-it-used-particle-physics)
[^7]: [Jake Tae - Study on Likelihood](https://jaketae.github.io/study/likelihood/)
[^8]: [Harvard Astrostatistics - Lecture Notes](https://hea-www.harvard.edu/astrostat/aas227_2016/lecture1_Robinson.pdf)

## References
[^1]: https://www.statistics.com/glossary/likelihood-function/
[^2]: https://en.wikipedia.org/wiki/Likelihood_function
[^3]: https://www.statisticshowto.com/likelihood-function-definition/
[^4]: https://www.geeksforgeeks.org/data-science/likelihood-function/
[^5]: https://www.youtube.com/watch?v=G2bhDen3pK0
[^6]: https://ep-news.web.cern.ch/what-likelihood-function-and-how-it-used-particle-physics
[^7]: https://jaketae.github.io/study/likelihood/
[^8]: https://hea-www.harvard.edu/astrostat/aas227_2016/lecture1_Robinson.pdf
