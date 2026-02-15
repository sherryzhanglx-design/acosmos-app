from PIL import Image
import numpy as np

# Load the clean (no sun) version
img = Image.open('/home/ubuntu/acosmos-app/apex_clean.png').convert('RGBA')
arr = np.array(img)

r, g, b, a = arr[:,:,0], arr[:,:,1], arr[:,:,2], arr[:,:,3]

# The background is cream/off-white: approximately R>240, G>235, B>220
# We want to make these pixels transparent
bg_mask = (
    (r.astype(float) > 230) & 
    (g.astype(float) > 225) & 
    (b.astype(float) > 210) &
    # Ensure it's actually background, not white shirt
    # Background has very similar R,G,B values (low saturation)
    (r.astype(float) - b.astype(float) < 30)
)

# Use flood fill approach from corners to be safer
from scipy import ndimage

# Create a seed mask from the corners/edges
seed = np.zeros_like(bg_mask)
# Top row, bottom row, left col, right col
seed[0, :] = True
seed[-1, :] = True
seed[:, 0] = True
seed[:, -1] = True

# Only keep seeds that are also background-colored
seed = seed & bg_mask

# Flood fill: expand from seeds through connected background pixels
labeled, _ = ndimage.label(bg_mask)
# Find which labels are connected to the edges
edge_labels = set(labeled[seed].flatten()) - {0}

# Create final mask: only background pixels connected to edges
final_bg = np.isin(labeled, list(edge_labels))

# Apply transparency with anti-aliasing at edges
# First, simple transparency
arr[final_bg, 3] = 0

# Feather the edges slightly for smooth blending
from scipy.ndimage import distance_transform_edt
dist = distance_transform_edt(~final_bg)
# Pixels within 2px of background get partial transparency
edge_zone = (dist > 0) & (dist < 3) & bg_mask
arr[edge_zone, 3] = (dist[edge_zone] / 3 * 255).astype(np.uint8)

result = Image.fromarray(arr)
result.save('/home/ubuntu/acosmos-app/apex_final_transparent.png')
print(f"Background pixels made transparent: {final_bg.sum()}")
print(f"Edge pixels feathered: {edge_zone.sum()}")
