# Computer Architecture: Multicore Performance and Parallel Computing

## Introduction to Multicore Processors

**Multicore processors** integrate multiple independent processing units, called **cores**, onto a single chip, enabling simultaneous execution of multiple threads for improved performance.[1][2] Each core acts like a separate CPU, sharing resources like caches and memory but with its own execution pipeline. This design addresses the limitations of single-core processors, where increasing clock speed hits power and heat walls.

> [!IMPORTANT]  
> Multicore shifts computing from faster single-thread performance to **parallel throughput**, fundamental for modern applications like AI training and scientific simulations.

### Key Components in Multicore Systems

- **Cores**: Independent units executing instructions in parallel.
- **Hyperthreading (SMT)**: Allows one physical core to handle multiple threads by duplicating registers, boosting utilization when threads stall (e.g., on memory access).[1]
- **Clock Speed**: Measured in GHz, dictates cycles per second; higher speeds mean faster execution but more power use.

## Memory Hierarchies in Multicore Designs

Multicore systems rely on **cache hierarchies** to minimize latency:

| Cache Level | Size/Speed | Scope |
|-------------|------------|-------|
| **L1** | Smallest, fastest | Per-core |
| **L2** | Moderate | Per-core or shared |
| **L3** | Larger, slower | Shared across cores |
| **Main Memory** | Largest, slowest | All cores |

Caches store frequently used data near cores, reducing access times from memory, which is critical as core counts grow and bandwidth saturates.[3]

## Shared vs. Distributed Memory Architectures

Multicore performance hinges on memory models:

- **Shared Memory**: Cores access unified memory; easy programming but prone to contention (locks, cache coherence overhead). Scales to ~100 cores.
- **Distributed Memory**: Each node has local memory; uses message passing (e.g., MPI). Scales to thousands but demands explicit communication.

<iframe src="multicore-memory-visualization.html" width="100%" height="450" frameborder="0"></iframe>

> [!NOTE]  
> Shared memory suits small-scale multicore; distributed excels in clusters, but overhead grows with node count.

## Amdahl's Law: Limits of Parallel Speedup

**Amdahl's Law** quantifies speedup limits from parallelization, named after Gene Amdahl (1967).[1][2][3][4] It shows sequential code fractions bottleneck even infinite processors.

The formula is:

$$ S(n) = \frac{1}{(1 - P) + \frac{P}{n}} $$

Where:
- $S(n)$: Speedup with $n$ processors
- $P$: Parallelizable fraction (0 to 1)
- $1 - P$: Sequential fraction

**Example**: $P = 0.9$ (90% parallel), $n = 4$:

$$ S(4) = \frac{1}{0.1 + \frac{0.9}{4}} = \frac{1}{0.325} \approx 3.08x $$

Maximum $S = \frac{1}{1-P} = 10x$ as $n \to \infty$.

<iframe src="amdahls-law-visualization.html" width="100%" height="450" frameborder="0"></iframe>

> [!IMPORTANT]  
> Optimize sequential parts first—Amdahl's Law proves adding cores alone won't overcome them.[2][5]

## Measuring Performance: FLOPs and Scaling

**FLOPs** (Floating-Point Operations Per Second) gauge compute power:

$$ \text{Peak FLOPs} = \text{Cores} \times \text{Clock (GHz)} \times 10^9 \times \text{FLOPs/cycle/core} $$

**Example**: 8 cores, 3.5 GHz, 8 FLOPs/cycle (AVX-512):

$$ 8 \times 3.5 \times 10^9 \times 8 = 224 \times 10^9 = 224 \, \text{GFLOPs/s} $$

Real efficiency: 20-60% of peak due to stalls.[6]

**Strong Scaling** tests fixed-problem speedup:

$$ \text{Efficiency} = \frac{S(n)}{n} = \frac{T_1}{n \cdot T_n} $$

Degrades from communication, imbalance, Amdahl effects. E.g., 64 cores might hit 78% efficiency (50x speedup).[1]

<iframe src="multicore-flops-calculator.html" width="100%" height="450" frameborder="0"></iframe>

## Real-World Constraints and Optimizations

- **Memory Bandwidth**: Bottlenecks multicore; doesn't scale linearly.
- **Power/Thermal Limits**: More cores raise consumption.
- **Software**: Parallelism adds sync costs; use divide-and-conquer, optimize serial code.[1][5]

**Mitigations**:
- Profile for serial fractions.
- Balance loads.
- Leverage SIMD (e.g., AVX) for FLOPs/cycle gains.

> [!NOTE]  
> Multicore shines in embarrassingly parallel tasks (e.g., matrix multiply); sequential apps see minimal gains.