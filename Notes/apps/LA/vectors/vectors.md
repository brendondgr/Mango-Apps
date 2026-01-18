# Vectors in Linear Algebra

Vectors are the fundamental building blocks of Linear Algebra. They can be understood from three distinct perspectives: physics (arrows in space), computer science (ordered lists of numbers), and mathematics (objects that satisfy certain axioms).

---

## 1. What is a Vector?

In a geometric 2D space (like the $xy$-plane), a **vector** is often visualized as an arrow with a specific **length** (magnitude) and **direction**.

- **Tail**: The stating point of the arrow (often the origin $(0,0)$).
- **Head**: The tip of the arrow.

Algebraically, we represent a vector as a column of numbers:

$$
\mathbf{v} = \begin{bmatrix} v_1 \\ v_2 \end{bmatrix}
$$

where $v_1$ and $v_2$ are the **components** of the vector. For example, $\mathbf{v} = \begin{bmatrix} 2 \\ 1 \end{bmatrix}$ represents an arrow moving 2 units right and 1 unit up.

> [!NOTE]
> We typically write vectors in bold lowercase letters ($\mathbf{v}$) or with an arrow on top ($\vec{v}$).

---

## 2. Vector Operations

There are two fundamental operations defined for vectors: **Vector Addition** and **Scalar Multiplication**.

### Vector Addition

To add two vectors $\mathbf{u}$ and $\mathbf{v}$, we add their corresponding components:

$$
\begin{bmatrix} u_1 \\ u_2 \end{bmatrix} + \begin{bmatrix} v_1 \\ v_2 \end{bmatrix} = \begin{bmatrix} u_1 + v_1 \\ u_2 + v_2 \end{bmatrix}
$$

**Geometric Interpretation**: Place the tail of $\mathbf{v}$ at the head of $\mathbf{u}$. The result $\mathbf{u} + \mathbf{v}$ is the vector from the tail of $\mathbf{u}$ to the head of $\mathbf{v}$. This is known as the "Tip-to-Tail" rule.

### Scalar Multiplication

To multiply a vector $\mathbf{v}$ by a real number $c$ (called a **scalar**), we multiply each component by $c$:

$$
c \cdot \begin{bmatrix} v_1 \\ v_2 \end{bmatrix} = \begin{bmatrix} c \cdot v_1 \\ c \cdot v_2 \end{bmatrix}
$$

**Geometric Interpretation**:
- If $c > 1$, the vector stretches.
- If $0 < c < 1$, the vector shrinks.
- If $c < 0$, the vector reverses direction.

---


## 4. The Dot Product

The **dot product** is an algebraic operation that takes two vectors and returns a single number (a scalar).

$$
\mathbf{u} \cdot \mathbf{v} = u_1 v_1 + u_2 v_2 + \dots + u_n v_n
$$

### Geometric Definition

The dot product relates to the angle $\theta$ between vectors:

$$
\mathbf{u} \cdot \mathbf{v} = \|\mathbf{u}\| \|\mathbf{v}\| \cos(\theta)
$$

where $\|\mathbf{u}\|$ is the length (norm) of the vector.

> [!IMPORTANT]
> - If $\mathbf{u} \cdot \mathbf{v} = 0$, the vectors are **orthogonal** (perpendicular).
> - If $\mathbf{u} \cdot \mathbf{v} > 0$, the angle is acute.
> - If $\mathbf{u} \cdot \mathbf{v} < 0$, the angle is obtuse.

---

## 5. Linear Combinations

Combining addition and scalar multiplication gives us a **linear combination**:

$$
c_1 \mathbf{v}_1 + c_2 \mathbf{v}_2 + \dots + c_k \mathbf{v}_k
$$

The set of all possible linear combinations of a set of vectors is called the **span** of those vectors. This concept is crucial for understanding linear systems, subspaces, and dimensionality.


### Interactive Visualization

Visualizing vector addition and linear combinations is key to building intuition. Use the interactive tool below to add two vectors, $\mathbf{u}$ (Blue) and $\mathbf{v}$ (Red), or see how they combine.

<iframe src="vector_addition.html" width="100%" height="600" frameborder="0"></iframe>

