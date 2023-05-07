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

# Build new files
sleep .5
stack build
sleep .5
stack exec site clean
sleep .5
stack exec site build
sleep .5

npm ci
npm run build:prod

# Set up build directory
git init _site/
git -C _site/ config remote.origin.url >&- || git -C pkg/ remote add origin $(git ls-remote --get-url origin)
git -C _site/ checkout master || git -C pkg/ checkout --orphan master
git -C _site/ stash
git -C _site/ pull
git -C _site/ stash pop
git -C _site/ add .
git -C pkg/ commit -m "Publish - $(shell date "+%Y-%m-%d %H:%M:%S")"

read -p $'Enter Y to push\x0a' -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    [[ "$0" = "$BASH_SOURCE" ]] && exit 1 || return 1
fi

# Push
git -C pkg/ push --set-upstream origin master
