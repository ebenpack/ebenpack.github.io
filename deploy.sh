#!/bin/bash

# Temporarily store uncommited changes
git stash

# Verify correct branch
git checkout develop

# Build new files
stack exec site clean
stack exec site build

# Get previous files
git fetch --all
git checkout -b publish --track origin/master

# Overwrite existing files with new files
cp -a _site/. .

# Commit
git add -A
git commit -m "publish."

# Push
git push origin publish:master

# Restoration
git checkout develop
git branch -D publish
git stash pop