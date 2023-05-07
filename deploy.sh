#!/bin/bash

read -p $'Enter Y to proceed with deployment\x0a' -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    [[ "$0" = "$BASH_SOURCE" ]] && exit 1 || return 1
fi

# Setup stack and start from a clean slate
sleep .5
stack build
sleep .5
stack exec site clean

# Set up build directory
mkdir _site/
git -C _site/ init
git -C _site/ config remote.origin.url >&- || git -C _site/ remote add origin $(git ls-remote --get-url origin)
git -C _site/ fetch
git -C _site/ checkout master || git -C _site/ checkout --orphan master
git -C _site/ stash
git -C _site/ stash pop
sleep .5

# Build new files
stack exec site build
sleep .5

yarn install --frozen-lockfile
yarn build:prod

# git -C _site/ add .
# git -C _site/ commit -m "Publish - $(date "+%Y-%m-%d %H:%M:%S")"

read -p $'Enter Y to push\x0a' -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    [[ "$0" = "$BASH_SOURCE" ]] && exit 1 || return 1
fi

# Push
git -C _site/ push --set-upstream origin master
