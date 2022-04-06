This is an example data enrichment for the Metamaze Intelligent Document Processing platform. This enrichment uses a simple Flask API in Python, with data sourced from Airtable.

Airtable provides a convenient spreadsheet editor for your data, and exposes that data via an authenticated API automatically making it well suited for configurable data enrichments that can change over time.

For this example, we have created an Airtable that matches names to genders. You can inspect the raw example data using [this link](https://airtable.com/shr9NDCDRAGs6IMw5).

After creating a new Airtable, go to https://airtable.com/api and select your API docs. 

## Testing in Kubernetes
You can also find a [Dockerfile](./Dockerfile) and base helm template to serve this example on a kubernetes cluster using `gunicorn`.
You should adapt the [values.yaml](./helm-airtable-enrichment/values.yaml) with the necessary fields according to your case.
Build the docker image and push it to your container registry and then `helm install` to deploy your enrichment.


## Feedback
If you have any issues or comments, feel free to open a GitHub issue or contact us at support@metamaze.eu

www.metamaze.eu
Manage more
