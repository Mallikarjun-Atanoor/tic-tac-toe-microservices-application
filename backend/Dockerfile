FROM python:3.11-slim

WORKDIR /app

# Prevent python buffering
ENV PYTHONUNBUFFERED=1

# Create non-root user
RUN addgroup --system appgroup && adduser --system appuser --ingroup appgroup

# Install dependencies (layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy code
COPY . .
# Fix permissions
RUN chown -R appuser:appgroup /app
# Switch user
USER appuser

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]