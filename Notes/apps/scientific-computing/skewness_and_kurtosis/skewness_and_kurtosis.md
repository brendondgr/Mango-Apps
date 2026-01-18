# Understanding Data Shape: Skewness and Kurtosis

When analyzing data, measures of central tendency (mean, median, and mode) and measures of dispersion (variance and standard deviation) only tell part of the story. To truly understand the behavior of a dataset, we must examine its **shape**.

Skewness and kurtosis are two essential statistical measures used to describe the distribution of data relative to a standard normal distribution. [^1][^2][^5]

---

## 1. Skewness: Measuring Asymmetry

**Skewness** quantifies the degree of asymmetry in a probability distribution around its mean. [^1][^2] While a perfectly symmetric distribution looks the same on both sides of the center, skewed data "stretches" toward one of the tails. [^1][^7]

### Types of Skewness

*   **Positive Skewness (Right-Skewed):** The right tail of the distribution is longer or thicker. Most data points are clustered on the left, but extreme high values pull the mean toward the right. [^1][^2]
    *   **Relationship:** $$Mean > Median > Mode$$
*   **Negative Skewness (Left-Skewed):** The left tail is longer or thicker. Most data points cluster on the right, but extreme low values pull the mean toward the left. [^1][^2]
    *   **Relationship:** $$Mean < Median < Mode$$
*   **Zero Skewness:** The distribution is perfectly symmetric. [^1][^3]
    *   **Relationship:** $$Mean = Median = Mode$$

### Interpreting Skewness Values
How skewed is "too" skewed? Statisticians generally use the following thresholds for the absolute value of skewness: [^4]

| Skewness Value (Absolute) | Interpretation |
| :--- | :--- |
| Near $0$ | Approximately symmetric |
| Between $0.5$ and $1.0$ | Moderately skewed |
| Greater than $1.0$ | Highly skewed |

---

## 2. Interactive Distribution Simulator

Use the sliders below to adjust the Skewness and Kurtosis of the distribution. Observe how the mean, median, and mode shift in relation to one another as the shape changes.

<iframe src="skewness_kurtosis_simulator.html" width="100%" height="450" frameborder="0"></iframe>

---

## 3. Kurtosis: Measuring Tails and Peaks

**Kurtosis** measures the "peakedness" of a distribution and the weight of its tails relative to a normal distribution. [^1][^5] While skewness focuses on the location of the tails, kurtosis focuses on the **extremity** of the tails. [^5]

> [!IMPORTANT]
> Although kurtosis is often described by the "sharpness" of the peak, its primary statistical significance lies in **tail weight**. High kurtosis indicates that the data contains frequent outliers (heavy tails). [^5]

### The Normal Distribution Reference
For a standard normal distribution, the kurtosis is exactly $3$. [^1][^5] To make interpretation easier, statisticians often use **Excess Kurtosis**: [^3][^5]

$$Excess\ Kurtosis = Kurtosis - 3$$

### The Three Categories of Kurtosis

1.  **Leptokurtic (Excess $> 0$):**
    *   Characterized by a **sharp, thin peak** and **heavy tails**. [^1][^2][^5]
    *   This indicates a higher concentration of data near the mean and a higher likelihood of extreme outliers. [^5]
2.  **Mesokurtic (Excess $\approx 0$):**
    *   Matches the shape of a normal distribution. [^1][^5][^6]
    *   It has moderate peakedness and tail weight.
3.  **Platykurtic (Excess $< 0$):**
    *   Characterized by a **flat peak** and **light tails**. [^1][^2][^5]
    *   The data is more evenly spread, with fewer extreme outliers compared to a normal distribution. [^5]

> [!NOTE]
> Similar to skewness, values of excess kurtosis near $0$ suggest normality. Generally, an absolute excess kurtosis value greater than $2$ is considered a significant deviation from normality. [^3]

---

## 4. Summary Comparison

The following table summarizes the key differences between these two measures: [^1][^2][^5]

| Measure | Focus | Normal Distribution Value | Effect of High/Positive Values |
| :--- | :--- | :--- | :--- |
| **Skewness** | Asymmetry of tails | $0$ | Right tail is longer; $Mean > Median$ |
| **Kurtosis** | Tail weight & Peakedness | $3$ (Excess = $0$) | Sharper peak; heavier tails; more outliers |

---

### Sources
[^1]: [GeeksforGeeks: Difference between Skewness and Kurtosis](https://www.geeksforgeeks.org/data-science/difference-between-skewness-and-kurtosis/)
[^2]: [DataCamp: Understanding Skewness and Kurtosis](https://www.datacamp.com/tutorial/understanding-skewness-and-kurtosis)
[^3]: [SmartPLS: Excess Kurtosis and Skewness](https://www.smartpls.com/documentation/functionalities/excess-kurtosis-and-skewness/)
[^4]: [Simplilearn: Skewness and Kurtosis Tutorial](https://www.simplilearn.com/tutorials/statistics-tutorial/skewness-and-kurtosis)
[^5]: [SPC for Excel: Are Skewness and Kurtosis Useful Statistics?](https://www.spcforexcel.com/knowledge/basic-statistics/are-skewness-and-kurtosis-useful-statistics/)
[^6]: [YouTube: Statistics Explained](https://www.youtube.com/watch?v=EWuR4EGc9EY)
[^7]: [NIST Handbook: Skewness](https://www.itl.nist.gov/div898/handbook/eda/section3/eda35b.htm)

## References
[^1]: https://www.geeksforgeeks.org/data-science/difference-between-skewness-and-kurtosis/
[^2]: https://www.datacamp.com/tutorial/understanding-skewness-and-kurtosis
[^3]: https://www.smartpls.com/documentation/functionalities/excess-kurtosis-and-skewness/
[^4]: https://www.simplilearn.com/tutorials/statistics-tutorial/skewness-and-kurtosis
[^5]: https://www.spcforexcel.com/knowledge/basic-statistics/are-skewness-and-kurtosis-useful-statistics/
[^6]: https://www.youtube.com/watch?v=EWuR4EGc9EY
[^7]: https://www.itl.nist.gov/div898/handbook/eda/section3/eda35b.htm
