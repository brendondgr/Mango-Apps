git add apps/
git commit -m "Message"
git subtree push --prefix=apps app_tree main
git fetch app_tree main
git subtree pull --prefix=apps app_tree main