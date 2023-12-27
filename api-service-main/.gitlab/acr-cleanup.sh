#!/bin/sh

# Run the Azure CLI command and store the output in a variable
# repo=uplist-dev/client-service-nextjs
ACR_MANIFEST=$(az acr manifest list-metadata --name $ACR_IMAGE --registry $ACR_REGISTRY)

# Count the lines that contain "digest"
ACR_DIGEST_COUNT=$(echo "$ACR_MANIFEST" | grep -c "digest")

# Check if count is zero or negative and exit if true
if [ $ACR_DIGEST_COUNT -le 0 ]; then
    echo "No manifest to delete. Exiting..."
    exit 0
fi

# Initialize a counter variable
i=1

# Loop to execute the delete command
while [ $i -le $ACR_DIGEST_COUNT ]; do
    ACR_DIGEST=$(echo "$ACR_MANIFEST" | grep "digest" | awk '{print $2}' | sed 's/,//g' | sed 's/"//g' | head -n $i | tail -n 1)
    echo "Deleting image with digest: $ACR_DIGEST"
    az acr repository delete --name $ACR_REGISTRY --image "$ACR_IMAGE@$ACR_DIGEST" --yes
    i=$(expr $i + 1)
done
