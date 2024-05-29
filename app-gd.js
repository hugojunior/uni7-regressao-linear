let X = [1980, 1985, 1990, 1995, 2000];
let Y = [2.1, 2.9, 3.2, 4.1, 4.9];
let b0, b1;

function mean(array) {
  const sum = array.reduce((acc, val) => acc + val, 0);
  return sum / array.length;
}

function standardDeviation(array) {
  const arrayMean = mean(array);
  const squaredDiffs = array.map(val => (val - arrayMean) ** 2);
  const meanSquaredDiff = mean(squaredDiffs);
  return Math.sqrt(meanSquaredDiff);
}

function normalize(array) {
  const arrayMean = mean(array);
  const arrayStdDev = standardDeviation(array);
  return array.map(val => (val - arrayMean) / arrayStdDev);
}

function gradientDescent(X, Y, learningRate = 0.05, tolerance = 0.001) {
  let b0 = mean(Y);
  let b1 = 0;
  const n = X.length;
  let prevMSE = Infinity;

  for (let i = 0; i < 1000; i++) {
    writeLog(`- [Coeficientes] atuais: b0 = ${b0}, b1 = ${b1}`);
    let db0 = 0;
    let db1 = 0;
    let mse = 0;

    for (let j = 0; j < n; j++) {
      const error = Y[j] - (b0 + b1 * X[j]);
      db0 += error;
      db1 += error * X[j];
      mse += error ** 2;
    }

    mse /= n; // Erro Quadrático Médio (MSE)

    if (Math.abs(mse - prevMSE) < tolerance) {
      writeLog(`- [Convergiu] após ${i} iterações com MSE = ${mse}`);
      break;
    }

    prevMSE = mse;

    db0 /= n;
    db1 /= n;

    b0 += learningRate * db0;
    b1 += learningRate * db1;
  }
  
  writeLog(`- [Coeficientes] finais: b0 = ${b0}, b1 = ${b1}`);
  return { b0, b1 };
}

function predict(x, b0, b1) {
  return b0 + b1 * x;
}

const XMean = mean(X);
const XStdDev = standardDeviation(X);
const normalizedX = normalize(X);

const { b0: normalizedB0, b1: normalizedB1 } = gradientDescent(normalizedX, Y);

b1 = normalizedB1 / XStdDev;
b0 = normalizedB0 - b1 * XMean;

const ctx = document.getElementById('regLinear').getContext('2d');

const minX = Math.min(...X);
const maxX = Math.max(...X);

const regressionLine = [];

for (let x = minX - 1; x <= maxX + 1; x += 0.1) {
  regressionLine.push({ x: x, y: predict(x, b0, b1) });
}

const data = {
  datasets: [
    {
      label: 'Dados de Treinamento',
      data: X.map((x, i) => ({ x, y: Y[i] })),
      backgroundColor: '#0d6efd',
      borderColor: '#0d6efd',
      showLine: false,
      pointRadius: 5
    },
    {
      label: 'Linha de Regressão',
      data: regressionLine,
      backgroundColor: '#dc3545',
      borderColor: '#dc3545',
      fill: false,
      pointRadius: 0,
      borderWidth: 4,
      showLine: true
    }
  ]
};

const config = {
  type: 'scatter',
  data: data,
  options: {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'point'
    },
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
        title: {
          display: false,
          text: 'X'
        }
      },
      y: {
        title: {
          display: false,
          text: 'Y',
        }
      }
    }
  }
};

const regLinear = new Chart(ctx, config);

function predictValue() {
  const px = parseFloat(document.getElementById('predict-x').value);
  if (px) {
    const y = predict(px, b0, b1); // Usando os valores globais de b0 e b1
    document.getElementById('previsao').innerHTML = "Previsão para X = " + px + ":<br><b class='text-success'>Y = " + y + "</b>";
  }
}

let zoomX = 0;
let zoomY = 0;

function updateChart() {
  const newX = [];
  const newY = [];
  document.querySelectorAll('.input-group.din').forEach(group => {
    const x = parseFloat(group.querySelector('.input-x').value);
    const y = parseFloat(group.querySelector('.input-y').value);

    if (!isNaN(x) && !isNaN(y)) {
      newX.push(x);
      newY.push(y);
    }
  });
  X = newX;
  Y = newY;

  const XMean = mean(X);
  const XStdDev = standardDeviation(X);
  const normalizedX = normalize(X);
  
  const { b0: normalizedB0, b1: normalizedB1 } = gradientDescent(normalizedX, Y);
  b1 = normalizedB1 / XStdDev; // Desnormalizando b1
  b0 = normalizedB0 - b1 * XMean; // Desnormalizando b0

  const minX = Math.min(...X);
  const maxX = Math.max(...X);

  const regressionLine = [];
  for (let x = minX - 1; x <= maxX + 1; x += 0.1) {
    regressionLine.push({ x: x, y: predict(x, b0, b1) });
  }

  regLinear.data.datasets[0].data = X.map((x, i) => ({ x, y: Y[i] }));
  regLinear.data.datasets[1].data = regressionLine;
  regLinear.update();
}

function addInput() {
  const container = document.getElementById('input-container');
  const inputGroup = document.createElement('div');
  inputGroup.className = 'input-group din mb-2';
  inputGroup.innerHTML = `
      <input type="number" class="form-control input-x" placeholder="X">
      <input type="number" class="form-control input-y" placeholder="Y">
      <button class="btn btn-danger" onclick="removeInput(this)">x</button>
  `;
  container.appendChild(inputGroup);
}

function removeInput(button) {
  const inputGroup = button.parentElement;
  inputGroup.remove();
}

function zoomIn() {
  zoomX += 10;
  zoomY += 10;
  updateChartWithZoom();
}

function zoomOut() {
  zoomX -= 10;
  zoomY -= 10;
  updateChartWithZoom();
}

function updateChartWithZoom() {
  const XMean = mean(X);
  const XStdDev = standardDeviation(X);
  const normalizedX = normalize(X);
  
  const { b0: normalizedB0, b1: normalizedB1 } = gradientDescent(normalizedX, Y);
  b1 = normalizedB1 / XStdDev; // Desnormalizando b1
  b0 = normalizedB0 - b1 * XMean; // Desnormalizando b0

  const minX = Math.min(...X);
  const maxX = Math.max(...X);
  const minY = Math.min(...Y);
  const maxY = Math.max(...Y);

  const scaledMinX = minX - (maxX - minX) * zoomX / 200;
  const scaledMaxX = maxX + (maxX - minX) * zoomX / 200;
  const scaledMinY = minY - (maxY - minY) * zoomY / 200;
  const scaledMaxY = maxY + (maxY - minY) * zoomY / 200;
  
  const regressionLine = [];
  for (let x = scaledMinX; x <= scaledMaxX; x += 0.1) {
  regressionLine.push({ x: x, y: predict(x, b0, b1) });
  }
  
  regLinear.options.scales.x.min = scaledMinX;
  regLinear.options.scales.x.max = scaledMaxX;
  regLinear.options.scales.y.min = scaledMinY;
  regLinear.options.scales.y.max = scaledMaxY;
  
  regLinear.data.datasets[1].data = regressionLine;
  regLinear.update();
  }
  
  function writeLog(text) {
  document.getElementById('logs').innerHTML += text + "\n";
  }
