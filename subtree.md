What is a subtree? public_enrichments has a a directory which points to another repository (knative-enrichments) and pulls in the code from that repository. This is done using the git subtree command.

Subtree: knative-enrichments
Remote: git@github.com:metamaze/knative-enrichments.git
Remote branch: main

Initially (You can skip this! Only needed for the first time):

- - git fetch git@github.com:metamaze/knative-enrichments.git main:knative_main // fetch the knative repo and rename the `main` branch to `knative_main`

Steps to add a new enrichment in this repository using git subtree command:

- git checkout knative_main
- git subtree split --prefix=functions/ts_metamaze -b subtree_split_branch
- git checkout -
- git subtree add --prefix=functions/ts_metamaze subtree_split_branch
