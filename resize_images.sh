# small helper script to resize images

# go to our source folder
cd ./logos-src/
# execute the sips command to resize images
sips -Z 64 *
# move all the images from logos-src to logos
mv * ../logos/
