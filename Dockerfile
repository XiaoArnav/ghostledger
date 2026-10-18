FROM python:3.9-slim

WORKDIR /app

# Copy dependency specifications and install
COPY requirements.txt setup.py ./
RUN pip install --no-cache-dir .

# Copy application source code
COPY privatereceipt/ ./privatereceipt/
COPY samples/ ./samples/

EXPOSE 8080

ENV PYTHONUNBUFFERED=1

CMD ["python", "-m", "privatereceipt.cli", "serve", "--port", "8080"]
