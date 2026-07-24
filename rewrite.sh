#!/bin/sh

git filter-branch --env-filter '
OLD_EMAIL="Alan-varghese@users.noreply.github.com"
CORRECT_NAME="Alan Varghese"
CORRECT_EMAIL="99276146+alan-varghese-git@users.noreply.github.com"
if [ "$GIT_COMMITTER_EMAIL" = "$OLD_EMAIL" ] || [ "$GIT_AUTHOR_NAME" = "Alan-varghese" ] || [ "$GIT_AUTHOR_NAME" = "ALAN VARGHESE" ]; then
    export GIT_COMMITTER_NAME="$CORRECT_NAME"
    export GIT_COMMITTER_EMAIL="$CORRECT_EMAIL"
    export GIT_AUTHOR_NAME="$CORRECT_NAME"
    export GIT_AUTHOR_EMAIL="$CORRECT_EMAIL"
fi
' --tag-name-filter cat -- --branches --tags
