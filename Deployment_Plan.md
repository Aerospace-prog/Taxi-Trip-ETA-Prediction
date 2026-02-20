#  **PRODUCTION DEPLOYMENT PLAN**

### **Taxi Trip Duration Prediction – Public Production Deployment**

---

## **1. Deployment Architecture (Final Production Design)**

### **Architecture Overview**

```text
Public Users
  ↓
Domain (Optional: custom domain)
  ↓
Nginx (Reverse Proxy)
  ↓
Docker Containers on EC2
```

- Frontend (React build served via Nginx)
- Backend (FastAPI + Uvicorn)
- PostgreSQL (Internal container)

> All running on a **Single AWS EC2 instance**.

---

## **2. Infrastructure Setup**

### **Step 1: Create AWS EC2 Instance**

**Recommended:**

- **Instance Type:** t3.medium (or t3.small minimum)
- **OS:** Ubuntu 22.04 LTS
- **Storage:** 30–40 GB (gp3)
- **Security Group:**
  - Port 22 (SSH)
  - Port 80 (HTTP)
  - Port 443 (HTTPS)
  - Optional 8000 (Internal testing only)

### **Step 2: Install Base Dependencies**

_On EC2:_

```bash
sudo apt update
sudo apt install docker.io docker-compose nginx certbot python3-certbot-nginx -y
```

_Enable Docker:_

```bash
sudo systemctl enable docker
sudo usermod -aG docker ubuntu
```

---

## **3. Dockerization Strategy**

### **Backend Dockerfile (FastAPI)**

```dockerfile
FROM python:3.10

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### **Frontend Dockerfile (React)**

**Build stage:**

```dockerfile
FROM node:18 as build
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npm run build
```

**Production stage:**

```dockerfile
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
```

### **Docker Compose**

```yaml
version: "3.9"

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    env_file:
      - .env
    depends_on:
      - db

  frontend:
    build: ./frontend
    ports:
      - "3000:80"

  db:
    image: postgres:14
    environment:
      POSTGRES_USER: taxi
      POSTGRES_PASSWORD: securepass
      POSTGRES_DB: taxi_eta
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

---

## **4. Reverse Proxy Setup (Production-Grade)**

### **Why Nginx?**

- Serve frontend
- Route API requests
- Enable HTTPS
- Hide internal ports
- Improve security

### **Example Nginx Config**

```nginx
server {
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
    }

    location /api/ {
        proxy_pass http://localhost:8000/;
    }
}
```

---

## **5. Enable HTTPS (Public Production Ready)**

Use Let's Encrypt:

```bash
sudo certbot --nginx -d yourdomain.com
```

_Auto-renew enabled._

---

## **6. Environment Variables & Security**

Create `.env` file:

```env
DATABASE_URL=postgresql://taxi:securepass@db:5432/taxi_eta
SECRET_KEY=your_super_secret_key
MODEL_PATH=/models/active_model.pkl
```

> ⚠️ **Never hardcode secrets.**

---

## **7. Database Production Configuration**

### **Migrations**

Use **Alembic** (recommended).  
Run:

```bash
alembic upgrade head
```

### **Backup Strategy**

Daily backup cron job:

```bash
pg_dump taxi_eta > backup.sql
```

_Optional: Upload backup to S3._

---

## **8. Model Deployment Strategy**

### **On Startup**

Backend loads:

```python
model = joblib.load("active_model.pkl")
```

Model stored in:  
`/models/active_model.pkl`

### **Retraining**

Admin retrains:

1. New model saved as `candidate_model.pkl`
2. Metrics evaluated
3. If promoted:
   - Overwrite `active_model.pkl`
   - Reload model in memory

**Hot-reload approach:**

- Restart backend container  
  _OR_
- Implement reload endpoint

---

## **9. Logging & Monitoring**

### **Application Logs**

Configure FastAPI logging.  
Store logs in:  
`/var/log/taxi_eta.log`

### **Monitoring**

Basic level (for OJT):

- Uptime monitoring via:
  - UptimeRobot
  - AWS CloudWatch basic metrics

Track:

- CPU
- Memory
- Disk usage

---

## **10. Performance Optimization**

To meet **API latency < 500 ms**, implement:

- Model loaded in memory
- Avoid per-request loading
- DB indexes:
  - `trip_predictions.timestamp`
  - `model_metadata.version`
- Use connection pooling

---

## **11. Final Public Deployment Checklist**

Before submission:

- [ ] HTTPS enabled
- [ ] Swagger docs accessible at `/docs`
- [ ] Prediction endpoint working
- [ ] Retrain working
- [ ] Model metadata updating
- [ ] DB persistence verified
- [ ] Docker containers restart automatically
- [ ] No hardcoded secrets
- [ ] Latency tested (100 sequential requests)

---

## **12. Public Demo URL Structure**

- **Frontend:**  
  `https://yourdomain.com`

- **Backend API:**  
  `https://yourdomain.com/api/predict`

- **Swagger Docs:**  
  `https://yourdomain.com/docs`
