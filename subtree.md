What is a subtree? public_enrichments has a a directory which points to another repository (knative-enrichments) and pulls in the code from that repository. This is done using the git subtree command.

Subtree: knative-enrichments
Remote: git@github.com:metamaze/knative-enrichments.git
Remote branch: main

Steps to add a new enrichment in this repository using git subtree command:

// start on a new branch, to not mess up the main branch
`git checkout -b enrichment/XXX`

// fetch latest changes from the remote repository
`git fetch git@github.com:metamaze/knative-enrichments.git main:knative_main`

// checkout the knative_main branch (local copy op `main` from `knative-enrichments.git`)
`git checkout knative_main`

// only copy the directory of `knative-enrichments.git` you need (that are allowed to be public!)
// --prefix specifies the path the the directory you want to include in `public-enrichments.git`
`git subtree split --prefix=functions/ts_metamaze -b subtree_split_branch`

// jump back on `enrichment/XXX` branch
`git checkout -`

// add the subtree_split_branch (the branch that only contains the specified folder you need) to the public_enrichments repository
`git subtree add --prefix=functions/ts_metamaze subtree_split_branch`

9uQ\*Xg6KgGDU
