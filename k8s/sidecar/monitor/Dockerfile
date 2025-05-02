FROM python:3.9-slim

WORKDIR /app

COPY main.py .

RUN pip install --no-cache-dir psutil requests

CMD ["python", "main.py"]
