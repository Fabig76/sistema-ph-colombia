'use client'

import { useEffect, useRef } from 'react'

interface GraficoDistribucionProps {
  labels: string[]
  data: number[]
  colors: string[]
}

export default function GraficoDistribucion({
  labels,
  data,
  colors
}: GraficoDistribucionProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  
  useEffect(() => {
    // Importamos Chart.js dinámicamente para evitar problemas con SSR
    const loadChart = async () => {
      // Esperamos a que se cargue la biblioteca
      const { Chart, registerables } = await import('chart.js')
      Chart.register(...registerables)

      // Si el componente ya no está montado o no hay canvas, no hacer nada
      if (!chartRef.current) return
      
      // Verificar si ya existe un gráfico asociado al canvas y destruirlo
      const chartInstance = Chart.getChart(chartRef.current)
      if (chartInstance) {
        chartInstance.destroy()
      }
      
      // Crear nueva instancia de Chart
      new Chart(chartRef.current, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Distribución',
              data: data,
              backgroundColor: colors,
              borderColor: colors.map(color => color.replace(')', ', 1)')),
              borderWidth: 1,
              hoverOffset: 4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '60%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 15,
                usePointStyle: true,
                pointStyle: 'circle'
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.raw || 0;
                  const total = context.dataset.data.reduce((acc: number, data: number) => acc + data, 0);
                  const percentage = Math.round(value as number / total * 100);
                  return `${label}: ${percentage}% (${value})`;
                }
              }
            }
          }
        }
      })
    }

    loadChart()
    
    // Limpieza al desmontar el componente
    return () => {
      if (chartRef.current) {
        const chartInstance = Chart.getChart(chartRef.current)
        if (chartInstance) {
          chartInstance.destroy()
        }
      }
    }
  }, [labels, data, colors])

  return (
    <div className="relative h-60">
      <canvas ref={chartRef}></canvas>
    </div>
  )
}
