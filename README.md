# StressLab

A full-stack, real-time stress testing and performance monitoring web application. Point it at any HTTP endpoint, define virtual user concurrency loops, and watch your server's breaking boundaries, database latencies, and error ceilings unfold live in high-fidelity dashboards.

---

## Technical Architecture

StressLab operates on a high-efficiency **Virtual User Loop** model rather than throwing unbounded threads at a server:
* **Fixed Thread Pools**: Spawns a dedicated thread pool corresponding exactly to your configured `concurrentUsers`.
* **Staggered Launch (Ramp-Up)**: Staggers thread activation dynamically over your defined `rampUpSeconds` using a clean, mathematical startup queue:
  $$\text{delay} = \frac{i \times R \times 1000}{U} \text{ milliseconds}$$
* **Sequential Loop Generation**: Active threads fetch and execute requests sequentially from a thread-safe atomic counter, preventing local client-side memory heap issues and creating an honest, predictable load profile.
* **WebSocket Streams (STOMP)**: Streams second-by-second live aggregation metrics directly from the Spring Boot backend to the React dashboard.

---

## Quick Local Setup

### 1. Database Configuration
1. Open your local MySQL CLI.
2. Run the following command (Spring Boot will auto-generate all required tables on startup):
   ```sql
   CREATE DATABASE stresslab_db;
   ```

### 2. Environment Configuration
Copy the `.env.example` file to create a local `.env` file at the project root:
```bash
cp .env.example .env
```
Open `.env` and fill in your local MySQL credentials:
```properties
DB_PASSWORD=your_actual_mysql_password
```

### 3. Running the App

* **Start the Spring Boot Backend (Port 8080):**
  ```bash
  cd backend
  mvn spring-boot:run
  ```
* **Start the React Frontend (Port 5173):**
  ```bash
  cd frontend
  npm run dev
  ```
Open your browser and navigate to **`http://localhost:5173`**!

---

## How to Use the Platform

### 1. Creating and Configuring a Test
Go to **New Test** and fill out the fields:
* **Target URL**: The target API URL (e.g. `https://your-api.com/api/v1/analytics`). *Avoid testing Vercel static frontends; target Render database-backed APIs directly.*
* **Concurrent Users**: Your virtual user pool size (simultaneous workers).
* **Total Requests**: The total load volume to generate.
* **Ramp-Up Seconds**: Gradually starts users over time. Highly recommended to observe the exact point at which the server begins to choke.

### 2. Bypassing Authentication gates (JWT & Cookies)
If your target API requires the user to be logged in:

#### A. Bearer Tokens (Authorization Header)
Add a custom header in your StressLab config:
* **Key**: `Authorization`
* **Value**: `Bearer <your_copied_jwt_token>`

#### B. Secure HttpOnly Cookies
Since `HttpOnly` cookies can't be read by JavaScript, grab the cookie value from your browser manually:
1. Log into your website, press **F12**, and navigate to **Application -> Cookies**.
2. Copy the auth cookie value (e.g., named `jwt` or `token`).
3. Add a custom header in StressLab:
   * **Key**: `Cookie`
   * **Value**: `token=<your_copied_value>`

---

## Interpreting Metrics Like a Pro

StressLab's results report breaks performance down into key metrics:

* **Success Rate (%)**: Must stay at `100%`. Any drop below this means the server is throwing database connection pool exceptions, thread starvation timeouts, or `500 Server Errors`.
* **Average Response Time**: Shows the normal user experience speed. Excellent is `<200ms`, standard is `200ms-800ms`.
* **95th Percentile (p95)**: The speed barrier for the slowest 5% of requests. Excellent for spotting slow database queries.
* **99th Percentile (p99)**: The speed barrier for the slowest 1% of requests. Excellent for spotting JVM garbage collection halts or thread starvation under peak pressure.
