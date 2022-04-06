This is an example data enrichment to classify free-form text into specific predefined classes for the Metamaze Intelligent Document Processing platform. This enrichment uses a simple Flask API in Python, with data sourced from api call.

Simple api request contains list of entities with their free-form text and languages. Enrichment returns specific predefined classes in the order of provided entities.  

**An example for the body of a request**

```
{"entities": [
    {"text": "This is the first entity for this enrichment.", "language": "en"},
    {"text": "This is the second entity for this enrichment.", "language": "en"}
]}
```

## Testing in Kubernetes
You can also find a [Dockerfile](./Dockerfile) and base helm template to serve this example on a kubernetes cluster using `gunicorn`.
You should adapt the [values.yaml](helm-text-classification-enrichment/values.yaml) with the necessary fields according to your case.
Build the docker image and push it to your container registry and then `helm install` to deploy your enrichment.


## Feedback
If you have any issues or comments, feel free to open a GitHub issue or contact us at support@metamaze.eu

www.metamaze.eu
Manage more
