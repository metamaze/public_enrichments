What is a subtree? public_enrichments has a a directory which points to another repository (knative-enrichments) and pulls in the code from that repository. This is done using the git subtree command.

Subtree: knative-enrichments
Remote: git@github.com:metamaze/knative-enrichments.git
Remote branch: main

Steps to add a new enrichment in this repository using git subtree command:

// fetch latest changes from the remote repository
`git fetch git@github.com:metamaze/knative-enrichments.git main:knative_main`

// start on a new branch, to not mess up the main branch
`git checkout -b enrichment/XXX`

// checkout the knative_main branch (local copy op `main` from `knative-enrichments.git`)
`git checkout knative_main`

// only copy the directory of `knative-enrichments.git` you need (that are allowed to be public!)
// --prefix specifies the path the the directory you want to include in `public-enrichments.git`
`git subtree split --prefix=functions/KNATIVE_DIRECTORY -b subtree_split_branch`

// jump back on `enrichment/XXX` branch
`git checkout -`

// add the subtree_split_branch (the branch that only contains the specified folder you need) to the public_enrichments repository
// LOCAL_FOLDER = folder on public-enrichments where the imported code from knative should come
`git subtree add --prefix=LOCAL_FOLDER subtree_split_branch --squash`

// delete the temporary branch
`git branch -D subtree_split_branch`

Last step = Open a PR to merge the changes to the main branch: `main` <- `enrichment/XXX`
