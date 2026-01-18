# Markdown & LaTeX Test Suite

This topic serves as a comprehensive test of the renderer's capabilities, including **Markdown formatting**, **LaTeX mathematics**, and **visualizations**.

---

## 1. Text Formatting

We support standard formatting options:
- **Bold text** implies importance.
- *Italic text* adds emphasis.
- ***Bold and Italic*** combines both.
- ~~Strikethrough~~ indicates removed content.
- <u>Underlined text</u> (via HTML).
- `Inline code` for technical terms.

> **Note:** Blockquotes are useful for calling out important information or tips.

---

## 2. Lists

### Unordered List
- Item 1
- Item 2
  - Nested Item 2.1
  - Nested Item 2.2
- Item 3

### Ordered List
1. First Step
2. Second Step
   1. Sub-step A
   2. Sub-step B
3. Third Step

---

## 3. Tables

Tables should render cleanly with striped rows or borders.

| Feature | Support | Notes |
|:--------|:-------:|:------|
| Markdown | ✅ | Standard CommonMark |
| LaTeX | ✅ | MathJax / KaTeX |
| Images | ✅ | Stored in media folder |
| HTML | ✅ | Via iframes |

---

## 4. Media & Images

Images are served from the `media` subdirectory.

![Test Image Caption](media/test.jpeg)
*Figure 1: Verify this image loads correctly from apps/example/media/test.jpeg*

---

## 5. Embedded Visualization

Below is an interactive HTML app embedded directly into this note.

<iframe src="example.html" width="100%" height="650" frameborder="0"></iframe>

---

## 6. LaTeX Mathematics

Mathematical rendering is powered by MathJax.

### Inline Math
The quadratic formula is defined as $x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$.

### Display Math
Maxwell's Equations in differential form:

$$
\begin{aligned}
\nabla \cdot \mathbf{E} &= \frac{\rho}{\varepsilon_0} \\
\nabla \cdot \mathbf{B} &= 0 \\
\nabla \times \mathbf{E} &= -\frac{\partial \mathbf{B}}{\partial t} \\
\nabla \times \mathbf{B} &= \mu_0\mathbf{J} + \mu_0\varepsilon_0\frac{\partial \mathbf{E}}{\partial t}
\end{aligned}
$$

### Complex Matrix
$$
A = \begin{bmatrix} 
\alpha & \beta & \gamma \\
1 & 0 & -1 \\
e^{i\pi} & 0 & 1
\end{bmatrix}
$$

---

## 7. Code Blocks

Syntax highlighting for code snippets.

```python
def fibonacci(n):
    """Return the n-th Fibonacci number."""
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# Calculate first 10
print([fibonacci(i) for i in range(10)])
```

---

## 8. Interactive Elements (Spoilers / Details)

<details>
<summary><strong>👉 Click to reveal spoiler/answer</strong></summary>

Here is the hidden content! This is useful for:
- Practice problem solutions
- Hints
- lengthy derivation steps
</details>
