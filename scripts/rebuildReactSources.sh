cd ./frontend
yarn install 
npm run build_clean
cp -R build/* ../vendor_source
npm version patch
perl -i -pe 's/\b(\d+)(?=\D*$)/$1+1/e' ../lotteryfactory.php
