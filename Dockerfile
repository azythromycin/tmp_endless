FROM python:3.11-slim

# OCR system dependencies commented out for faster deployment
# Uncomment when you need OCR:
# RUN apt-get update && apt-get install -y \
#     libgl1 \
#     libglib2.0-0 \
#     libsm6 \
#     libxext6 \
#     libxrender1 \
#     libgomp1 \
#     poppler-utils \
#     libopencv-dev \
#     && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Expose port
EXPOSE 8000

# Run the application (use shell form to expand $PORT)
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
