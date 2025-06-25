FROM python:3.13.2

# Set working directory
WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend code
COPY . .

# Expose port 8000 for Django dev server
EXPOSE 8000

# Default command (can be overridden by docker-compose)
CMD ["python3", "manage.py", "runserver", "0.0.0.0:8000"]