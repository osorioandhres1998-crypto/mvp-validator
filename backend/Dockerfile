FROM python:3.11-slim

# Evita archivos .pyc y fuerza salida sin buffer (logs en tiempo real).
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Instalar dependencias primero para aprovechar la caché de capas.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el código de la aplicación.
COPY app ./app

EXPOSE 8000

# Arranque del servidor ASGI.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
