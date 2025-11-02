# Set Git user information
git config --global user.email "user@example.com"
git config --global user.name "GitHub Actions"

# Add all changes
git add .

# Commit changes
$commitMessage = "chore: update dependencies and fix build configuration"
git commit -m $commitMessage

# Push changes to main branch
git push origin main

Write-Host "Changes have been committed and pushed successfully!"
