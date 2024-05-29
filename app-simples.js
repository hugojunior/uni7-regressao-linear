let X = [1, 2, 3, 4, 5];
let Y = [3, 7, 5, 11, 14];

function mean(array) {
  const sum = array.reduce((acc, val) => acc + val, 0);
  return sum / array.length;
}

function variance(array) {
  const arrayMean = mean(array);
  return array.reduce((acc, val) => acc + Math.pow(val - arrayMean, 2), 0);
}

function covariance(array1, array2) {
  const mean1 = mean(array1);
  const mean2 = mean(array2);
  return array1.reduce((acc, val, i) => acc + (val - mean1) * (array2[i] - mean2), 0);
}

function linearRegression(X, Y) {
  const b1 = covariance(X, Y) / variance(X); // Slope
  const b0 = mean(Y) - b1 * mean(X); // Intercept
  return { b0, b1 };
}

function predict(x, b0, b1) {
  return b0 + b1 * x;
}

const { b0, b1 } = linearRegression(X, Y);

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
    const { b0, b1 } = linearRegression(X, Y);
    const y = predict(px, b0, b1);
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

  const { b0, b1 } = linearRegression(X, Y);

  console.log("b0: " + b0);
  console.log("b1: " + b1);

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
  const { b0, b1 } = linearRegression(X, Y);

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