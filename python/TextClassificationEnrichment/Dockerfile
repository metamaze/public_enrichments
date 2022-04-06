from python:3.9

ENV DIR=/app

COPY ./requirements.txt ${DIR}/

RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r ${DIR}/requirements.txt

RUN python -m laserembeddings download-models

COPY ./ ${DIR}/

EXPOSE 5000
WORKDIR ${DIR}

CMD ["gunicorn", "--worker-class", "gthread", "--workers", "4", "--bind", "0.0.0.0:5000",  "--preload", "--threads", "4", "--timeout", "90", "--graceful-timeout", "100", "server:create_app()"]
