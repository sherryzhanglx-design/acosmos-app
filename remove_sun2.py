from PIL import Image
import numpy as np

# Load the original image
img = Image.open('/home/ubuntu/acosmos-app/apex_original.jpg')
arr = np.array(img).copy()

# Background color (cream/off-white)
bg_color = np.array([252, 249, 240])

r, g, b = arr[:,:,0].astype(float), arr[:,:,1].astype(float), arr[:,:,2].astype(float)

# Region where the sun is (upper-left area)
region_mask = np.zeros(arr.shape[:2], dtype=bool)
region_mask[:750, :500] = True

# 1. Sun body: orange/yellow fill
sun_body = (
    (r > 180) & (g > 80) & (g < 230) & (b < 120) &
    ((r - b) > 80)
) & region_mask

# 2. Sun outline and rays: lighter orange strokes
sun_outline = (
    (r > 200) & (g > 150) & (b < 150) &
    ((r - b) > 60) &
    # Exclude skin tones (skin has higher B relative to G)
    (g < 210)
) & region_mask

# 3. Very light orange remnants (faint rays)
faint_rays = (
    (r > 220) & (g > 180) & (b < 180) &
    ((r - b) > 50) &
    (b < 160) &
    (g < 220)
) & region_mask

# Combine all masks
full_mask = sun_body | sun_outline | faint_rays

# But we need to exclude the character's skin and hair
# Skin is more uniform peach: R~240, G~200, B~170 (higher B than sun)
# The character's body starts around x=200 roughly
# Let's be more careful: exclude pixels where the character is drawn
# Character area is roughly center-right, we mainly want to clean the left side

# Additional: clean up the area between sun and neck more aggressively
neck_area = np.zeros(arr.shape[:2], dtype=bool)
neck_area[500:700, 100:350] = True
neck_sun = (
    (r > 200) & (g > 130) & (b < 100) &
    ((r - b) > 100)
) & neck_area

full_mask = full_mask | neck_sun

# Apply replacement
arr[full_mask] = bg_color

# Save
result = Image.fromarray(arr)
result.save('/home/ubuntu/acosmos-app/apex_no_sun2.png')
print(f"Total sun pixels removed: {full_mask.sum()}")
