from PIL import Image
import numpy as np

# Load the image
img = Image.open('/home/ubuntu/acosmos-app/apex_original.jpg')
arr = np.array(img)

# The sun is in the upper-left area behind the head
# It's orange/yellow colored. The background is off-white/cream.
# Strategy: identify sun pixels (high R, medium-high G, low B) and replace with background

# Background color (cream/off-white from the image corners)
bg_color = np.array([252, 249, 240])

# Create mask for sun-like pixels (orange/yellow)
# Sun has: R > 220, G > 150, B < 100 (orange-yellow range)
# Also include the rays which are more orange: R > 200, G > 130, B < 80
r, g, b = arr[:,:,0], arr[:,:,1], arr[:,:,2]

# Sun body and rays mask
sun_mask = (
    (r > 200) & (g > 100) & (g < 220) & (b < 100) &
    # Exclude skin tones which have higher B values and different ratios
    ((r.astype(float) - b.astype(float)) > 120)
)

# Only apply in the upper-left region where the sun is (roughly top-left quadrant)
# Sun is approximately in the area x: 0-400, y: 0-700
region_mask = np.zeros_like(sun_mask)
region_mask[:750, :450] = True

final_mask = sun_mask & region_mask

# Replace sun pixels with background
arr[final_mask] = bg_color

# Save result
result = Image.fromarray(arr)
result.save('/home/ubuntu/acosmos-app/apex_no_sun.png')
print(f"Sun pixels removed: {final_mask.sum()}")
print("Saved to apex_no_sun.png")
