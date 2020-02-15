#!/bin/bash

read -p $'Enter Y to proceed with deployment\x0a' -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    [[ "$0" = "$BASH_SOURCE" ]] && exit 1 || return 1
fi

# Temporarily store uncommited changes
git stash

# Verify correct branch
git checkout develop

mkdir assets/js

npm install

# Build new files
sleep .5
stack build
sleep .5
stack exec site clean
sleep .5
stack exec site build
sleep .5

npm run minify-css
sleep .5
npm run minify-js
sleep .5

# Get previous files
git fetch --all
git checkout -b publish --track origin/master
sleep .5


# Overwrite existing files with new files
cp -a _site/. .
sleep .5

# Commit
git add -A
git commit -m "publish."

read -p $'Enter Y to push\x0a' -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    [[ "$0" = "$BASH_SOURCE" ]] && exit 1 || return 1
fi

# Push
git push origin publish:master

# Restoration
git checkout develop
git branch -D publish
git stash pop
