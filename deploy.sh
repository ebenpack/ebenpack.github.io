#!/bin/bash

read -p "Enter Y to proceed with deployment" -n 1 -r
echo    # (optional) move to a new line
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    [[ "$0" = "$BASH_SOURCE" ]] && exit 1 || return 1 # handle exits from shell or function but don't exit interactive shell
fi

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