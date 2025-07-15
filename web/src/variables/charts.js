const Chart = require('chart.js');

const mode = 'light'; //(themeMode) ? themeMode : 'light';
const fonts = {
  base: 'Open Sans',
};

// Colors
const colors = {
  gray: {
    100: '#f6f9fc',
    200: '#e9ecef',
    300: '#dee2e6',
    400: '#ced4da',
    500: '#adb5bd',
    600: '#8898aa',
    700: '#525f7f',
    800: '#32325d',
    900: '#212529',
  },
  purple: {
    100: '#f3d9f7',
    200: '#e2baf1',
    300: '#d099eb',
    400: '#bb7de6',
    500: '#a55de8',
    600: '#9333ea',
    700: '#7e0fbc',
    800: '#67009d',
    900: '#4e007d',
  },
  theme: {
    default: '#172b4d',
    primary: '#5e4387',
    secondary: '#f4f5f7',
    info: '#11cdef',
    success: '#2dce89',
    danger: '#f5365c',
    warning: '#fb6340',
  },
  black: '#12263F',
  white: '#FFFFFF',
  transparent: 'transparent',
};

// Methods

// Chart.js global options
const chartOptions = () => {
  // Options
  const options = {
    defaults: {
      global: {
        responsive: true,
        maintainAspectRatio: false,
        defaultColor: mode === 'dark' ? colors.gray[700] : colors.gray[600],
        defaultFontColor: mode === 'dark' ? colors.gray[700] : colors.gray[600],
        defaultFontFamily: fonts.base,
        defaultFontSize: 13,
        layout: {
          padding: 0,
        },
        legend: {
          display: false,
          position: 'bottom',
          labels: {
            usePointStyle: true,
            padding: 16,
          },
        },
        elements: {
          point: {
            radius: 0,
            backgroundColor: colors.theme['primary'],
          },
          line: {
            tension: 0,
            borderWidth: 4,
            borderColor: colors.theme['primary'],
            backgroundColor: colors.transparent,
            borderCapStyle: 'rounded',
          },
          rectangle: {
            backgroundColor: colors.theme['warning'],
          },
          arc: {
            backgroundColor: colors.theme['primary'],
            borderColor: mode === 'dark' ? colors.gray[800] : colors.white,
            borderWidth: 4,
          },
        },
        tooltips: {
          enabled: true,
          mode: 'index',
          intersect: false,
        },
      },
      doughnut: {
        cutoutPercentage: 83,
        legendCallback: function (chart) {
          const data = chart.data;
          let content = '';

          data.labels.forEach(function (label, index) {
            const bgColor = data.datasets[0].backgroundColor[index];

            content += '<span class="chart-legend-item">';
            content +=
              '<i class="chart-legend-indicator" style="background-color: ' +
              bgColor +
              '"></i>';
            content += label;
            content += '</span>';
          });

          return content;
        },
      },
    },
  };

  // yAxes
  Chart.scaleService.updateScaleDefaults('linear', {
    gridLines: {
      borderDash: [2],
      borderDashOffset: [2],
      color: mode === 'dark' ? colors.gray[900] : colors.gray[300],
      drawBorder: false,
      drawTicks: false,
      lineWidth: 1,
      zeroLineWidth: 1,
      zeroLineColor: mode === 'dark' ? colors.gray[900] : colors.gray[300],
      zeroLineBorderDash: [2],
      zeroLineBorderDashOffset: [2],
    },
    ticks: {
      beginAtZero: true,
      padding: 10,
      callback: function (value) {
        if (!(value % 10)) {
          return value;
        }
      },
    },
  });

  // xAxes
  Chart.scaleService.updateScaleDefaults('category', {
    gridLines: {
      drawBorder: false,
      drawOnChartArea: false,
      drawTicks: false,
    },
    ticks: {
      padding: 20,
    },
  });

  return options;
};

// Parse global options
function parseOptions(parent, options) {
  for (let item in options) {
    if (typeof options[item] !== 'object') {
      parent[item] = options[item];
    } else {
      parseOptions(parent[item], options[item]);
    }
  }
}

const burndownChartOptions = {
  tooltips: {
    callbacks: {
      label: function (tooltipItem, data) {
        let label = data.datasets[tooltipItem.datasetIndex].label || '';
        if (label) {
          label += ': ';
        }
        label += Math.round(tooltipItem.yLabel);
        return label;
      },
    },
  },
  scales: {
    yAxes: [
      {
        gridLines: {
          color: colors.gray[200],
          zeroLineColor: colors.gray[200],
        },
        ticks: {
          display: false,
          callback: function (value) {
            return value;
          },
        },
        scaleLabel: {
          display: true,
          labelString: 'Effort',
        },
      },
    ],
    xAxes: [
      {
        gridLines: {
          color: colors.gray[200],
          zeroLineColor: colors.gray[200],
        },
        ticks: {
          display: false,
        },
        scaleLabel: {
          display: true,
          labelString: 'Time',
        },
      },
    ],
  },
  animation: false,
};

const cumulativeIssuesChartOptions = {
  scales: {
    yAxes: [
      {
        gridLines: {
          color: colors.gray[200],
          zeroLineColor: colors.gray[200],
        },
        ticks: {
          callback: function (value) {
            if (!(value % 10)) {
              return value;
            }
          },
        },
        scaleLabel: {
          display: true,
          labelString: 'Number of Issues',
        },
      },
    ],
    xAxes: [
      {
        gridLines: {
          color: colors.gray[200],
          zeroLineColor: colors.gray[200],
        },
        ticks: {},
        scaleLabel: {
          display: true,
          labelString: 'Day',
        },
      },
    ],
  },
  animation: false,
};

const cycleTimeChartOptions = {
  scales: {
    yAxes: [
      {
        gridLines: {
          color: colors.gray[200],
          zeroLineColor: colors.gray[200],
        },
        ticks: {
          callback: (value) => Math.round(value) + 'd',
        },
        scaleLabel: {
          display: false,
        },
      },
    ],
    xAxes: [
      {
        gridLines: {
          color: colors.gray[200],
          zeroLineColor: colors.gray[200],
        },
        ticks: {},
      },
    ],
  },
  animation: false,
};
const averageMergeTimeChartOptions = {
  scales: {
    yAxes: [
      {
        gridLines: {
          color: colors.gray[200],
          zeroLineColor: colors.gray[200],
        },
        ticks: {
          callback: (value) => Math.round(value) + 'h',
        },
        scaleLabel: {
          display: false,
        },
      },
    ],
    xAxes: [
      {
        gridLines: {
          color: colors.gray[200],
          zeroLineColor: colors.gray[200],
        },
        ticks: {},
      },
    ],
  },
  animation: false,
};

module.exports = {
  chartOptions, // used alonside with the chartExamples variables
  parseOptions, // used alonside with the chartExamples variables
  colors,
  burndownChartOptions,
  cumulativeIssuesChartOptions,
  cycleTimeChartOptions,
  averageMergeTimeChartOptions,
};
