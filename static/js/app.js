const es = new EventSource("/stream");

// store history per device
const history = {};

setInterval(() => {
    document.getElementById("current-time").textContent =
        new Date().toLocaleTimeString();
}, 1000);

function updateLastUpdated() {
    document.getElementById("last-updated").textContent = "Just now";
}

// draw mini graph
function drawGraph(canvas, data, color) {
    const ctx = canvas.getContext("2d");
    const w = canvas.width = canvas.offsetWidth;
    const h = canvas.height = canvas.offsetHeight;

    ctx.clearRect(0, 0, w, h);

    if (data.length < 2) return;

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    data.forEach((val, i) => {
        const x = (i / (data.length - 1)) * w;
        const y = h - (val / 100) * h;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });

    ctx.stroke();
}

es.onmessage = (e) => {
    const data = JSON.parse(e.data);
    updateLastUpdated();

    let html = "";

    let total = 0, online = 0, warning = 0, critical = 0;
    let cpuSum = 0, memSum = 0, diskSum = 0;

    for (let id in data) {
        const d = data[id];

        if (!history[id]) {
            history[id] = { cpu: [], memory: [], disk: [] };
        }

        // store last 20 values
        ["cpu", "memory", "disk"].forEach(key => {
            history[id][key].push(d[key]);
            if (history[id][key].length > 20)
                history[id][key].shift();
        });

        total++;
        cpuSum += d.cpu;
        memSum += d.memory;
        diskSum += d.disk;

        let status = "online";
        if (d.cpu > 80 || d.memory > 80 || d.disk > 80) {
            status = "warning";
            warning++;
        }
        if (d.cpu > 90 || d.memory > 90 || d.disk > 90) {
            status = "critical";
            critical++;
        }
        if (status === "online") online++;

        html += `
        <div class="card">
            <div class="card-header">
                <div class="card-title">
                    <div class="server-icon">💻</div>
                    <h2>${id}</h2>
                </div>
                <div class="card-status">
                    <span class="status-indicator"></span>
                    ${status}
                </div>
            </div>

            <div class="metrics">
                ${metricBlock("CPU", d.cpu, "cpu")}
                ${metricBlock("Memory", d.memory, "memory")}
                ${metricBlock("Disk", d.disk, "disk")}
            </div>

            <div class="card-graphs">
                ${graphBlock(id, "cpu")}
                ${graphBlock(id, "memory")}
                ${graphBlock(id, "disk")}
            </div>
        </div>
        `;
    }

    document.getElementById("data").innerHTML = html;

    // draw graphs after render
    for (let id in history) {
        drawGraph(
            document.getElementById(`cpu-${id}`),
            history[id].cpu,
            "#ef4444"
        );
        drawGraph(
            document.getElementById(`memory-${id}`),
            history[id].memory,
            "#3b82f6"
        );
        drawGraph(
            document.getElementById(`disk-${id}`),
            history[id].disk,
            "#f59e0b"
        );
    }

    // update stats
    document.getElementById("total-servers").textContent = total;
    document.getElementById("servers-online").textContent = online;
    document.getElementById("servers-warning").textContent = warning;
    document.getElementById("servers-critical").textContent = critical;

    if (total > 0) {
        document.getElementById("avg-cpu").textContent =
            (cpuSum / total).toFixed(1) + "%";
        document.getElementById("avg-memory").textContent =
            (memSum / total).toFixed(1) + "%";
        document.getElementById("avg-disk").textContent =
            (diskSum / total).toFixed(1) + "%";
    }

    updateHealthRing(cpuSum / total);
};

// metric block
function metricBlock(label, value, type) {
    return `
    <div class="metric">
        <div class="metric-header">
            <div class="metric-label">
                <div class="metric-icon ${type}"></div>
                ${label}
            </div>
            <div class="metric-value">${value}%</div>
        </div>
        <div class="progress-container">
            <div class="progress-bar ${type}" style="width:${value}%"></div>
        </div>
    </div>
    `;
}

// graph block
function graphBlock(id, type) {
    return `
    <div class="graph-item">
        <div class="graph-label">
            <div class="graph-label-left">
                <span class="graph-label-dot ${type}"></span>
                ${type.toUpperCase()}
            </div>
        </div>
        <div class="graph-canvas-container ${type}">
            <canvas id="${type}-${id}" class="graph-canvas"></canvas>
        </div>
    </div>
    `;
}

// health ring
function updateHealthRing(avgCpu) {
    const circle = document.getElementById("health-ring");
    const value = document.getElementById("health-value");

    const percent = 100 - avgCpu;
    const offset = 314 - (314 * percent) / 100;

    circle.style.strokeDashoffset = offset;
    value.textContent = Math.round(percent) + "%";
}

// download
function download() {
    fetch("/download")
        .then(res => res.json())
        .then(data => {
            const blob = new Blob([JSON.stringify(data, null, 2)]);
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = "data.json";
            a.click();
        });
}
// NAVIGATION TABS
document.querySelectorAll(".nav-tab").forEach((tab, index) => {
    tab.addEventListener("click", () => {
        
        // remove active from all
        document.querySelectorAll(".nav-tab").forEach(t => t.classList.remove("active"));
        
        // add active to clicked
        tab.classList.add("active");

        // simple behavior (for now)
        if (index === 0) {
            document.getElementById("data").style.display = "grid";
        } else if (index === 1) {
            document.getElementById("data").innerHTML =
                "<h2 style='color:white'>Analytics coming soon 📊</h2>";
        } else if (index === 2) {
            fetch("/alerts")
                .then(res => res.json())
                .then(alerts => {
                    let html = "<h2>Alerts</h2>";
                    alerts.forEach(a => {
                        html += `<div style="margin:10px 0; color:#f87171">${a}</div>`;
                    });
                    document.getElementById("data").innerHTML = html;
                });
        }
    });
});