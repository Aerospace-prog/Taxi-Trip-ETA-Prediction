FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Create models directory for .pkl files and download the active model
RUN mkdir -p /app/models && \
    apt-get update && apt-get install -y curl && \
    curl -L -o /app/models/active_model.pkl https://raw.githubusercontent.com/Aerospace-prog/Taxi-Trip-ETA-Prediction/main/backend/models/active_model.pkl && \
    apt-get purge -y --auto-remove curl && \
    rm -rf /var/lib/apt/lists/*

EXPOSE 7860

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-7860} --workers 2"]
