# 🚀 Frontend Access Guide

**Status**: ✅ LIVE & RUNNING  
**Date**: December 24, 2024  
**Server**: Running on 0.0.0.0:4000 (all interfaces)

---

## ✅ Server Status

The Next.js development server is running and accessible!

- **Port**: 4000
- **Binding**: 0.0.0.0 (all network interfaces)
- **Status**: HTTP 200 OK
- **Process**: next dev -p 4000 -H 0.0.0.0

---

## 🌐 Access URLs

### Primary Access (Local Network)
```
http://192.168.10.226:4000
```

### Alternative Access Methods

1. **Localhost** (if on same machine)
   ```
   http://localhost:4000
   http://127.0.0.1:4000
   ```

2. **Tailscale VPN**
   ```
   http://100.85.198.106:4000
   ```

3. **Docker Network**
   ```
   http://172.17.0.1:4000
   ```

---

## 🔧 Troubleshooting

### Connection Refused Error

If you see "ERR_CONNECTION_REFUSED", try:

#### 1. Check Firewall
```bash
# Check firewall status
sudo ufw status

# Allow port 4000
sudo ufw allow 4000/tcp

# Reload firewall
sudo ufw reload
```

#### 2. Verify Server is Running
```bash
# Check process
ps aux | grep "next dev"

# Check port
ss -tulpn | grep 4000

# Test connection
curl http://localhost:4000
```

#### 3. Restart Server
```bash
# Stop server
kill $(ps aux | grep "next dev" | grep -v grep | awk '{print $2}')

# Start server
cd /home/rodrickmakore/projects/seitech/frontend
npm run dev -- -H 0.0.0.0
```

#### 4. SSH Port Forwarding (Remote Access)
```bash
# From your local machine
ssh -L 4000:localhost:4000 rodrickmakore@192.168.10.226

# Then open in browser
http://localhost:4000
```

---

## 📱 Available Routes

### Main Pages
- `/` - Homepage
- `/about` - About page
- `/courses` - Course catalog
- `/services` - Services page
- `/contact` - Contact form

### User Pages
- `/login` - Login page
- `/register` - Registration
- `/dashboard` - User dashboard
- `/profile` - User profile
- `/my-courses` - My courses
- `/my-learning` - Learning progress

### E-Learning
- `/e-learning` - E-learning portal
- `/courses/[slug]` - Individual courses
- `/schedule` - Class schedule
- `/schedule/[id]` - Specific schedule

### Other
- `/checkout` - Checkout process
- `/settings` - User settings
- `/leaderboard` - Gamification
- `/free-consultation` - Consultation booking

---

## 🔒 Network Access

### Same Machine
✅ Direct access via localhost

### Same Network (LAN)
✅ Access via 192.168.10.226:4000
- Both devices must be on same network
- Firewall must allow port 4000

### Remote Access
⚠️ Requires one of:
- SSH port forwarding
- VPN (Tailscale)
- Reverse proxy (nginx/Apache)
- Cloud deployment (Vercel/Netlify)

---

## 🚀 Production Deployment Options

### Option 1: Vercel (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd /home/rodrickmakore/projects/seitech/frontend
vercel

# Follow prompts
```

### Option 2: Docker + Nginx
```bash
# Build Docker image
docker build -t seitech-frontend .

# Run container
docker run -d -p 3000:3000 seitech-frontend

# Setup Nginx reverse proxy
# Map to public domain
```

### Option 3: PM2 + Nginx
```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start npm --name "seitech-frontend" -- start

# Setup Nginx
# Configure reverse proxy
```

---

## 📊 Current Configuration

### package.json
```json
{
  "scripts": {
    "dev": "next dev -p 4000",
    "build": "next build",
    "start": "next start -p 4000"
  }
}
```

### Server Binding
- Development: `0.0.0.0:4000` (all interfaces)
- Production: Should use reverse proxy

---

## 🎯 Quick Start

### For Developers (Local)
```bash
cd /home/rodrickmakore/projects/seitech/frontend
npm run dev -- -H 0.0.0.0
# Open: http://localhost:4000
```

### For Remote Access
```bash
# SSH tunnel from local machine
ssh -L 4000:localhost:4000 rodrickmakore@192.168.10.226
# Open: http://localhost:4000
```

### For Production
```bash
# Build
npm run build

# Start production server
npm start
# Or use PM2/Docker
```

---

## 🔍 Verification

### Test Locally
```bash
curl http://localhost:4000
```

### Test via Network
```bash
curl http://192.168.10.226:4000
```

### Check Process
```bash
ps aux | grep next
```

### Check Port
```bash
ss -tulpn | grep 4000
```

---

## 💡 Recommended Setup

### For Development
1. Run server: `npm run dev -- -H 0.0.0.0`
2. Access via: `http://192.168.10.226:4000`
3. Keep terminal open for logs

### For Production
1. Use PM2 for process management
2. Setup Nginx reverse proxy
3. Configure domain/SSL
4. Or deploy to Vercel/Netlify

---

## 🆘 Common Issues

### Issue 1: Connection Refused
**Cause**: Server not running or firewall blocking  
**Solution**: 
- Check server: `ps aux | grep next`
- Check firewall: `sudo ufw allow 4000`
- Restart server

### Issue 2: Can't Access from Browser
**Cause**: Wrong IP or network isolation  
**Solution**:
- Verify IP: `hostname -I`
- Check network: same WiFi/LAN
- Use SSH tunnel for remote

### Issue 3: Server Stops
**Cause**: Background process killed  
**Solution**:
- Use PM2: `pm2 start npm -- start`
- Or keep terminal open
- Or run in screen/tmux

---

## 📞 Need Help?

Server is running at:
- **Local**: http://localhost:4000
- **Network**: http://192.168.10.226:4000
- **VPN**: http://100.85.198.106:4000

Choose the appropriate URL based on your connection method!

---

**Last Updated**: December 24, 2024  
**Server Status**: ✅ RUNNING  
**Port**: 4000  
**Binding**: 0.0.0.0 (all interfaces)
