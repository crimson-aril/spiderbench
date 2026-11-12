# N8AO WebGPU node compatibility copy

This directory contains a reversed-depth compatibility copy of the
`N8AONode` implementation from `n8ao-webgpu` 0.1.0 (CC0-1.0). It imports the
package's configuration and sampling helpers. The local change uses the existing
`DepthType.Reverse` setting to identify the cleared depth value on this
project's reversed-depth WebGPU renderer. The AO sampling and denoising logic
otherwise follows the installed package.
