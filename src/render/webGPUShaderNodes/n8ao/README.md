# N8AO WebGPU node compatibility copy

This directory contains a reversed-depth compatibility copy of the
`N8AONode` implementation from `n8ao-webgpu` 0.1.0 (CC0-1.0). It imports the
package's configuration and sampling helpers. The local changes support the
renderer-selected standard or reversed depth mode for cleared-depth checks,
perspective and orthographic depth linearization, and denoising background
checks.
