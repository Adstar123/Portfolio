"""Export the AverageStrategyNetwork from the PyTorch checkpoint to ONNX.

The network's forward() applies softmax, so we export using a wrapper that
returns raw logits. This gives the TypeScript side full control over masking
and softmax application.
"""
import torch
import torch.nn as nn
import sys
import numpy as np

sys.path.insert(0, "G:/OpenGTO")
from src.neural_network import AverageStrategyNetwork

# Load checkpoint
checkpoint = torch.load(
    "G:/OpenGTO/checkpoints_improved/gto_trainer_final.pt",
    map_location="cpu",
)

# Reconstruct network - detect architecture from state dict
# The checkpoint nests state dicts under "networks"
networks = checkpoint.get("networks", checkpoint)
state_dict = networks["avg_strategy_net"]

# Determine hidden sizes from weight shapes
hidden_sizes = []
i = 0
while f"hidden.{i * 4}.weight" in state_dict:
    hidden_sizes.append(state_dict[f"hidden.{i * 4}.weight"].shape[0])
    i += 1
print(f"Detected hidden sizes: {hidden_sizes}")

input_size = state_dict["hidden.0.weight"].shape[1]
num_actions = state_dict["output.weight"].shape[0]
print(f"Input size: {input_size}, Num actions: {num_actions}")

net = AverageStrategyNetwork(
    input_size=input_size,
    hidden_sizes=tuple(hidden_sizes),
    num_actions=num_actions,
    dropout=0.0,  # No dropout for inference
)
net.load_state_dict(state_dict)
net.eval()


# --- Check what the original forward() outputs ---
dummy_input = torch.randn(1, input_size)
with torch.no_grad():
    original_output = net(dummy_input)
print(f"\nOriginal forward() output (first sample):")
print(f"  Values: {original_output[0].numpy()}")
print(f"  Sum:    {original_output[0].sum().item():.6f}")
print(f"  Min:    {original_output[0].min().item():.6f}")
print(f"  Max:    {original_output[0].max().item():.6f}")
is_probabilities = abs(original_output[0].sum().item() - 1.0) < 0.01
print(f"  Looks like probabilities (sum ~1): {is_probabilities}")


# --- Create a logits-only wrapper for ONNX export ---
class LogitsWrapper(nn.Module):
    """Wrapper that returns raw logits (before softmax)."""

    def __init__(self, hidden, output):
        super().__init__()
        self.hidden = hidden
        self.output = output

    def forward(self, x):
        h = self.hidden(x)
        logits = self.output(h)
        return logits


wrapper = LogitsWrapper(net.hidden, net.output)
wrapper.eval()

# Verify the wrapper produces logits
with torch.no_grad():
    logits_output = wrapper(dummy_input)
print(f"\nLogits wrapper output (first sample):")
print(f"  Values: {logits_output[0].numpy()}")
print(f"  Sum:    {logits_output[0].sum().item():.6f}")
print(f"  Min:    {logits_output[0].min().item():.6f}")
print(f"  Max:    {logits_output[0].max().item():.6f}")

# Verify softmax of logits matches original output
import torch.nn.functional as F

with torch.no_grad():
    recomputed_probs = F.softmax(logits_output, dim=-1)
print(f"\nSoftmax(logits) matches original output: "
      f"{torch.allclose(original_output, recomputed_probs, atol=1e-6)}")

# --- Export to ONNX ---
output_path = "portfolio-site/public/models/opengto_model.onnx"
torch.onnx.export(
    wrapper,
    dummy_input,
    output_path,
    input_names=["features"],
    output_names=["logits"],
    dynamic_axes={"features": {0: "batch"}, "logits": {0: "batch"}},
    opset_version=17,
    do_constant_folding=True,
)
print(f"\nExported to {output_path}")

# Report file size
import os

size_bytes = os.path.getsize(output_path)
size_mb = size_bytes / (1024 * 1024)
print(f"File size: {size_bytes:,} bytes ({size_mb:.2f} MB)")
