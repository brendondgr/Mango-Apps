# Eigenvalues and Eigenvectors: Foundations of Linear Algebra

Eigenvalues and **eigenvectors** are fundamental concepts in linear algebra. For a square matrix \(A\), an **eigenvalue** \(\lambda\) is a scalar and an **eigenvector** \(\mathbf{v}\) (nonzero vector) satisfies \(A\mathbf{v} = \lambda \mathbf{v}\), meaning the linear transformation scales \(\mathbf{v}\) by \(\lambda\) without altering its direction.

## Geometric Intuition: Directions That Stay the Same

Imagine a linear transformation \(T\) represented by matrix \(A\). Most vectors change direction under \(T\), but **eigenvectors** are special: they point along **invariant directions**. Applying \(T\) stretches, shrinks, or flips the eigenvector but keeps its direction intact.

- If \(|\lambda| > 1\), the vector stretches.
- If \(|\lambda| < 1\), it shrinks.
- If \(\lambda = 1\), it stays unchanged.
- If \(\lambda < 0\), it reverses direction.

> [!IMPORTANT]
> Eigenvectors reveal the "natural axes" of a transformation, like stretch axes in a shear or rotation.

<iframe src="eigenvalue_transformation.html" width="100%" height="450" frameborder="0"></iframe>

**Interactive Transformation**: Drag the blue vector \(\mathbf{v}\). The red vector \(A\mathbf{v}\) shows where it goes.
When they align (point in the same or opposite direction), you have found an **eigenvector**!

## Algebraic Definition and Computation

Formally, solve \(A\mathbf{v} = \lambda \mathbf{v}\), or equivalently, \((A - \lambda I)\mathbf{v} = \mathbf{0}\) where \(I\) is the identity matrix and \(\mathbf{v} \neq \mathbf{0}\).

### Characteristic Equation
We find eigenvalues by solving \(\det(A - \lambda I) = 0\). This equation forces the matrix \(A - \lambda I\) to be "singular" (squishing space), which is the only way to send a non-zero vector to zero.

<iframe src="eigenvalue_explorer.html" width="100%" height="500" frameborder="0"></iframe>

### Eigenvalue Calculator
Use this tool to solve for eigenvalues and eigenvectors step-by-step for 2x2 and 3x3 matrices.

<iframe src="eigenvalue_calculator.html" width="100%" height="600" frameborder="0"></iframe>

## Diagonalization: Simplifying Matrices

If \(A\) has \(n\) linearly independent eigenvectors, express \(A = PDP^{-1}\) where \(D\) is diagonal with eigenvalues, and \(P\) has eigenvectors as columns. Powers simplify: \(A^k = PD^k P^{-1}\), so \(A^k \mathbf{v} = \lambda^k \mathbf{v}\).

Distinct eigenvalues guarantee independent eigenvectors.

## Applications and Significance

- **Matrix Powers and Systems**: \(A^k \mathbf{v} = \lambda^k \mathbf{v}\) for exponentials, Markov chains.
- **Stability**: In dynamical systems, \(|\lambda| < 1\) implies convergence.
- **Principal Component Analysis (PCA)**: Eigenvectors of covariance matrices capture variance directions.
- **Differential Equations**: Solve via \(e^{At}\) using eigenvalues.

A unit circle under \(A\) becomes an ellipse with **eigenvectors** as major/minor axes, scaled by \(|\lambda|\).

## Key Properties

- Eigenvalues of \(A^k\) are \(\lambda^k\); of \(A^{-1}\) are \(1/\lambda\).
- Trace of \(A\) equals sum of eigenvalues; determinant equals product.
- Zero eigenvalue means \(\mathbf{v}\) is in the nullspace.

> [!IMPORTANT]
> Not all matrices are diagonalizable (e.g., repeated eigenvalues without full independent eigenvectors), but eigenvalues always exist for square matrices over \(\mathbb{C}\).